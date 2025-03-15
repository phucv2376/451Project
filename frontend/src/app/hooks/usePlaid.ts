import { useState, useCallback, useEffect, useMemo } from 'react';
import API_BASE_URL from "@/app/config";
import { usePlaidLink } from 'react-plaid-link';
import { TransactionSyncResponse, AccountsResponse, PlaidAccount } from './../models/plaid';

interface UsePlaidProps {
  onSuccess?: (publicToken: string) => void;
  onExit?: () => void;
}

interface LinkTokenResponse {
  linkToken: string;
  requestId: string;
  expiration: string;
}

interface ExchangeTokenResponse {
  accessToken: string;
}

const PLAID_ACCESS_TOKEN_KEY = 'plaid_access_token';

export const usePlaid = ({ onSuccess, onExit }: UsePlaidProps = {}) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [plaidAccessToken, setPlaidAccessToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PLAID_ACCESS_TOKEN_KEY);
    }
    return null;
  });
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch linked accounts
  const fetchAccounts = useCallback(async (token: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/Plaid/accounts?accessToken=${token}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data: AccountsResponse = await response.json();
      setAccounts(data.accounts);
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate a link token for Plaid Link
  const generateLinkToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/Plaid/link-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clientUserId: 'user-id' }),
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

  // Exchange a public token for an access token
  const exchangePublicToken = useCallback(async (publicToken: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/Plaid/exchange-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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

  // Sync transactions
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          accessToken: token,
          cursor,
          count: Math.min(5, Math.max(1, count))
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to sync transactions');
      }
      const data: TransactionSyncResponse = await response.json();
      return data;
    } catch (err) {
      setError('Failed to sync transactions');
      console.error('Error syncing transactions:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync all transactions (paginated)
  const syncAllTransactions = useCallback(
    async (userId: string, token: string) => {
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
        if (!response) {
          break;
        }
        allTransactions.added.push(...response.added);
        allTransactions.modified.push(...response.modified);
        allTransactions.removed.push(...response.removed);
        cursor = response.nextCursor;
        hasMore = response.hasMore;
      }

      return allTransactions;
    },
    [syncTransactions]
  );

  // Disconnect the bank (clear access token and accounts)
  const disconnectBank = useCallback(() => {
    setPlaidAccessToken(null);
    setLinkToken(null);
    setAccounts([]);
    localStorage.removeItem(PLAID_ACCESS_TOKEN_KEY);
  }, []);

  // Update localStorage when plaidAccessToken changes
  useEffect(() => {
    if (plaidAccessToken) {
      localStorage.setItem(PLAID_ACCESS_TOKEN_KEY, plaidAccessToken);
    } else {
      localStorage.removeItem(PLAID_ACCESS_TOKEN_KEY);
    }
  }, [plaidAccessToken]);

  // Fetch accounts when plaidAccessToken changes
  useEffect(() => {
    if (plaidAccessToken) {
      fetchAccounts(plaidAccessToken);
    }
  }, [plaidAccessToken, fetchAccounts]);

  

  // Build Plaid Link configuration
  const config = useMemo(() => ({
    token: linkToken ?? '',
    onSuccess: (public_token: string) => {
      exchangePublicToken(public_token).then(token => {
        if (token && onSuccess) {
          onSuccess(public_token);
        }
      });
    },
    onExit: () => {
      if (onExit) {
        onExit();
      }
    },
    onEvent: (eventName: string, metadata: any) => {
      console.log('Plaid Link event:', eventName, metadata);
    },
  }), [linkToken, exchangePublicToken, onSuccess, onExit]);


  const { open, ready } = usePlaidLink(config);

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
    plaidConfig: config,
    ready,
    open,
  };
};