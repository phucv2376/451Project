import { useState, useCallback, useEffect, useMemo } from 'react';
import API_BASE_URL from "@/app/config";
import { usePlaidLink } from 'react-plaid-link';
import { TransactionSyncResponse, AccountsResponse, PlaidAccount } from './../models/plaid';
import { usePlaidContext } from '../contexts/PlaidContext';

// Interface for props that can be passed to the `usePlaid` hook
interface UsePlaidProps {
  onSuccess?: (publicToken: string) => void; // Callback when Plaid successfully links an account
  onExit?: () => void; // Callback when Plaid Link is closed without completing the process
}

// Interfaces for API responses
interface LinkTokenResponse {
  linkToken: string; // The link token required to open Plaid Link
  requestId: string;
  expiration: string;
}

interface ExchangeTokenResponse {
  accessToken: string; // The access token received after exchanging the public token
}

// Key to store Plaid access token in localStorage
const PLAID_ACCESS_TOKEN_KEY = 'plaid_access_token';

/**
 * Custom React hook to manage Plaid Link interactions, transactions, and account data.
 * It handles:
 * - Fetching and storing the Plaid access token
 * - Generating link tokens
 * - Syncing transactions
 * - Fetching linked accounts
 * - Managing Plaid Link UI interactions
 */
export const usePlaid = ({ onSuccess, onExit }: UsePlaidProps = {}) => {
  const { isPlaidInitialized } = usePlaidContext(); // Check if Plaid script is loaded

  // State for managing Plaid-related data
  const [linkToken, setLinkToken] = useState<string | null>(null); // Stores the generated link token
  const [plaidAccessToken, setPlaidAccessToken] = useState<string | null>(() => {
    // Retrieve access token from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PLAID_ACCESS_TOKEN_KEY);
    }
    return null;
  });

  const [accounts, setAccounts] = useState<PlaidAccount[]>([]); // Stores linked bank accounts
  const [error, setError] = useState<string | null>(null); // Tracks errors
  const [isLoading, setIsLoading] = useState(false); // Tracks loading state

  /**
   * Fetch the list of accounts linked to the Plaid access token.
   * This is called when the access token is available.
   */
  const fetchAccounts = useCallback(async (token: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/Plaid/accounts?accessToken=${token}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data: AccountsResponse = await response.json();
      setAccounts(data.accounts); // Store retrieved accounts in state
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate a new link token for initializing Plaid Link.
   */
  const generateLinkToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/Plaid/link-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientUserId: 'user-id' }), // Send a unique user ID to Plaid
      });
      if (!response.ok) {
        throw new Error('Failed to generate link token');
      }
      const data: LinkTokenResponse = await response.json();
      setLinkToken(data.linkToken);
    } catch (err) {
      setError('Failed to generate link token');
      console.error('Error generating link token:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Exchange a public token (returned from Plaid Link) for a long-lived access token.
   */
  const exchangePublicToken = useCallback(async (publicToken: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/Plaid/exchange-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken }),
      });
      if (!response.ok) {
        throw new Error('Failed to exchange public token');
      }
      const data: ExchangeTokenResponse = await response.json();
      setPlaidAccessToken(data.accessToken);
      return data.accessToken;
    } catch (err) {
      setError('Failed to exchange public token');
      console.error('Error exchanging public token:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sync transactions for a user, allowing pagination.
   */
  const syncTransactions = useCallback(async (
    userId: string,
    token: string,
    cursor?: string,
    count: number = 5
  ): Promise<TransactionSyncResponse | null> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/Plaid/transactions/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          accessToken: token,
          cursor,
          count: Math.min(5, Math.max(1, count)), // Ensures count stays within a reasonable range
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to sync transactions');
      }
      return await response.json();
    } catch (err) {
      setError('Failed to sync transactions');
      console.error('Error syncing transactions:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch all transactions in a paginated manner.
   */
  const syncAllTransactions = useCallback(async (userId: string, token: string) => {
    let cursor: string | undefined = undefined;
    let hasMore = true;
    const allTransactions: TransactionSyncResponse = {
      added: [],
      modified: [],
      removed: [],
      nextCursor: '',
      hasMore: false,
    };

    while (hasMore) {
      const response = await syncTransactions(userId, token, cursor, 5);
      if (!response) break;
      allTransactions.added.push(...response.added);
      allTransactions.modified.push(...response.modified);
      allTransactions.removed.push(...response.removed);
      cursor = response.nextCursor;
      hasMore = response.hasMore;
    }

    return allTransactions;
  }, [syncTransactions]);

  /**
   * Disconnect the bank by clearing stored access token and accounts.
   */
  const disconnectBank = useCallback(() => {
    setPlaidAccessToken(null);
    setLinkToken(null);
    setAccounts([]);
    localStorage.removeItem(PLAID_ACCESS_TOKEN_KEY);
  }, []);

  /**
   * Persist the Plaid access token in localStorage whenever it changes.
   */
  useEffect(() => {
    if (plaidAccessToken) {
      localStorage.setItem(PLAID_ACCESS_TOKEN_KEY, plaidAccessToken);
    } else {
      localStorage.removeItem(PLAID_ACCESS_TOKEN_KEY);
    }
  }, [plaidAccessToken]);

  /**
   * Fetch linked accounts when an access token becomes available.
   */
  useEffect(() => {
    if (plaidAccessToken) {
      fetchAccounts(plaidAccessToken);
    }
  }, [plaidAccessToken, fetchAccounts]);

  /**
   * Generate Plaid Link configuration only if it is initialized and link token is available.
   */
  const config = useMemo(() => {
    if (!linkToken || !isPlaidInitialized) {
      return null;
    }
    
    return {
      token: linkToken,
      onSuccess: (public_token: string) => {
        exchangePublicToken(public_token).then(token => {
          if (token && onSuccess) {
            onSuccess(public_token);
          }
        });
      },
      onExit,
      onEvent: (eventName: string, metadata: any) => {
        console.log('Plaid Link event:', eventName, metadata);
      },
    };
  }, [linkToken, isPlaidInitialized, exchangePublicToken, onSuccess, onExit]);

  const { open, ready } = usePlaidLink(config || { token: '', onSuccess: () => {}, onExit: () => {} });

  return {
    linkToken,
    plaidAccessToken,
    accounts,
    error,
    isLoading,
    generateLinkToken,
    exchangePublicToken,
    syncTransactions,
    syncAllTransactions,
    fetchAccounts,
    disconnectBank,
    setPlaidAccessToken,
    ready: ready && !!config,
    open: config ? open : () => {},
  };
};
