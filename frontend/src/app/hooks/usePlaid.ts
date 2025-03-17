import { useState, useCallback, useEffect, useMemo } from 'react';
import API_BASE_URL from "@/app/config";
import { usePlaidLink, PlaidLinkOnSuccessMetadata } from 'react-plaid-link';
import { TransactionSyncResponse, AccountsResponse, PlaidAccount } from './../models/plaid';
import { usePlaidContext } from '../contexts/PlaidContext';

// Interface for props that can be passed to the `usePlaid` hook
interface UsePlaidProps {
  onSuccess?: (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => void;
  onExit?: () => void;
  userIdOverride?: string; 
}

// Interfaces for API responses
interface LinkTokenResponse {
  linkToken: string;
  requestId: string;
  expiration: string;
}

interface ExchangeTokenResponse {
  accessToken: string;
  itemId: string;
  success: boolean;
  isDuplicate: boolean;
  error?: string;
}

// Key to store Plaid access token in localStorage
const PLAID_ACCESS_TOKEN_KEY = 'plaid_access_token';
const USER_ID_KEY = 'userId';

/**
 * Custom React hook to manage Plaid Link interactions, transactions, and account data.
 * It handles:
 * - Fetching and storing the Plaid access token
 * - Generating link tokens
 * - Syncing transactions
 * - Fetching linked accounts
 * - Managing Plaid Link UI interactions
 */
export const usePlaid = ({ onSuccess, onExit, userIdOverride }: UsePlaidProps = {}) => {
  const { isPlaidInitialized } = usePlaidContext();

  // Server-safe initializations
  const [userId, setUserId] = useState<string>('default-user-id');
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [plaidAccessToken, setPlaidAccessToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDuplicateConnection, setIsDuplicateConnection] = useState(false);

  // Client-side initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = userIdOverride || localStorage.getItem(USER_ID_KEY) || 'default-user-id';
      setUserId(storedUserId);
      
      const storedToken = localStorage.getItem(PLAID_ACCESS_TOKEN_KEY);
      if (storedToken) {
        setPlaidAccessToken(storedToken);
      }
    }
  }, [userIdOverride]);

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
      setAccounts(data.accounts);
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

/**
   * Exchange a public token (returned from Plaid Link) for a long-lived access token.
   */
  const exchangePublicToken = useCallback(async (publicToken: string, metadata?: any) => {
    try {
      setIsLoading(true);

      // Build request payload with metadata for duplicate detection
      const requestPayload = {
        publicToken,
        userId,
        metadata: metadata ? {
          institutionId: metadata.institution.institution_id,
          institutionName: metadata.institution.name,
          accounts: metadata.accounts.map((account: any) => ({
            id: account.id,
            name: account.name,
            mask: account.mask,
            type: account.type,
            subtype: account.subtype
          })),
          linkSessionId: metadata.link_session_id
        } : null
      };
      
      console.log('Sending request payload:', requestPayload);

      const response = await fetch(`${API_BASE_URL}/Plaid/exchange-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to exchange public token: ${errorText}`);
      }
      const data: ExchangeTokenResponse = await response.json();

      setIsDuplicateConnection(data.isDuplicate);
      
      if (data.isDuplicate) {
        console.log('This account is already connected. Using existing connection.');
      }

      setPlaidAccessToken(data.accessToken);
      
      // Client-side localStorage update
      if (typeof window !== 'undefined') {
        localStorage.setItem(PLAID_ACCESS_TOKEN_KEY, data.accessToken);
      }
      
      return data.accessToken;
    } catch (err) {
      setError('Failed to exchange public token');
      console.error('Error exchanging public token:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Sync transactions for a user, allowing pagination.
   */
  const syncTransactions = useCallback(async (
    userId: string,
    token: string,
    cursor?: string,
    count: number = 100
  ): Promise<TransactionSyncResponse | null> => {
    console.log('-------- SYNC TRANSACTIONS CALLED --------');
    console.log(`Request params:`);
    console.log(`- User ID: ${userId || 'undefined'}`);
    console.log(`- Access Token (masked): ${token ? `${token.substring(0, 100)}...${token.substring(token.length - 100)}` : 'undefined'}`);
    console.log(`- Cursor: ${cursor || 'null'}`);
    console.log(`- Count: ${count}`);
    
    try {
      setIsLoading(true);
      console.log('Making API request to /Plaid/transactions/sync...');
      
      const requestBody = {
        userId,
        accessToken: token,
        cursor,
        count: Math.min(100, Math.max(1, count)),
      };
      console.log('Request body:', JSON.stringify(requestBody));
      
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/Plaid/transactions/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const endTime = performance.now();
      console.log(`API request completed in ${(endTime - startTime).toFixed(2)}ms with status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`Error response: ${response.status} ${response.statusText}`);
        
        // Try to get error details
        try {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
        } catch (textError) {
          console.error('Could not read error response body');
        }
        
        throw new Error(`Failed to sync transactions: ${response.status} ${response.statusText}`);
      }
      
      console.log('Successfully received response, parsing JSON...');
      const data = await response.json();
      
      // Log response summary
      console.log('Response data summary:');
      console.log(`- Added transactions: ${data.added?.length || 0}`);
      console.log(`- Modified transactions: ${data.modified?.length || 0}`);
      console.log(`- Removed transactions: ${data.removed?.length || 0}`);
      console.log(`- Next cursor: ${data.nextCursor || 'null'}`);
      console.log(`- Has more: ${!!data.hasMore}`);
      
      if (data.added?.length > 0) {
        console.log('Sample transaction:', JSON.stringify(data.added[0]).substring(0, 100) + '...');
      }
      
      console.log('-------- SYNC TRANSACTIONS COMPLETED SUCCESSFULLY --------');
      return data;
    } catch (err) {
      console.error('-------- SYNC TRANSACTIONS FAILED --------');
      console.error('Error details:', err);
      setError('Failed to sync transactions');
      console.error('Error syncing transactions:', err);
      return null;
    } finally {
      setIsLoading(false);
      console.log('Loading state reset to false');
    }
  }, []);

  /**
   * Fetch all transactions in a paginated manner.
   */
const syncAllTransactions = useCallback(async (userId: string, token: string) => {
  console.log('======== SYNC ALL TRANSACTIONS STARTED ========');
  console.log(`User ID: ${userId}`);
  console.log(`Access Token (masked): ${token.substring(0, 100)}...${token.substring(token.length - 100)}`);
  
  let cursor: string | undefined = undefined;
  let hasMore = true;
  let batchCount = 0;
  const allTransactions: TransactionSyncResponse = {
    added: [],
    modified: [],
    removed: [],
    nextCursor: '',
    hasMore: false,
  };

  console.log('Initialized empty transaction collection, starting sync loop');

  while (hasMore) {
    batchCount++;
    console.log(`\n--- Processing Batch #${batchCount} ---`);
    console.log(`Current cursor: ${cursor || 'Initial (null)'}`);
    
    console.log('Calling syncTransactions...');
    const response = await syncTransactions(userId, token, cursor, 100);
    
    if (!response) {
      console.error('No response received from syncTransactions API call');
      console.log('Breaking sync loop due to null response');
      break;
    }
    
    // Log batch results
    console.log('Received transaction batch:');
    console.log(`- Added: ${response.added?.length || 0} transactions`);
    console.log(`- Modified: ${response.modified?.length || 0} transactions`);
    console.log(`- Removed: ${response.removed?.length || 0} transactions`);
    
    // Sample data (if available)
    if (response.added?.length > 0) {
      console.log('Sample added transaction:', JSON.stringify(response.added[0]).substring(0, 100) + '...');
    }
    
    // Accumulate results
    allTransactions.added.push(...(response.added || []));
    allTransactions.modified.push(...(response.modified || []));
    allTransactions.removed.push(...(response.removed || []));
    
    // Update cursor and hasMore flag
    cursor = response.nextCursor;
    hasMore = !!response.hasMore;
    
    console.log(`Next cursor: ${cursor || 'None'}`);
    console.log(`Has more: ${hasMore}`);
    
    // Safety check - break if cursor is empty but hasMore is true (inconsistent state)
    if (hasMore && !cursor) {
      console.warn('Inconsistent state: hasMore is true but cursor is empty');
      hasMore = false;
    }
  }

  console.log('\n======== SYNC ALL TRANSACTIONS COMPLETED ========');
  console.log(`Total batches processed: ${batchCount}`);
  console.log(`Final results:`);
  console.log(`- Total added: ${allTransactions.added.length} transactions`);
  console.log(`- Total modified: ${allTransactions.modified.length} transactions`);
  console.log(`- Total removed: ${allTransactions.removed.length} transactions`);
  
  return allTransactions;
}, [syncTransactions]);

  /**
   * Disconnect a bank account.
   */
  const disconnectBank = useCallback(() => {
    setPlaidAccessToken(null);
    setLinkToken(null);
    setAccounts([]);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PLAID_ACCESS_TOKEN_KEY);
    }
  }, []);

  // Fetch accounts when token is available
  useEffect(() => {
    if (plaidAccessToken) {
      fetchAccounts(plaidAccessToken);
    }
  }, [plaidAccessToken, fetchAccounts]);

  /**
   * Generate Plaid Link configuration.
   */
  const config = useMemo(() => {
    if (!linkToken || !isPlaidInitialized) {
      return null;
    }
    
    return {
      token: linkToken,
      onSuccess: (public_token: string, metadata: any) => {
        console.log('Plaid Link success metadata:', metadata);
        exchangePublicToken(public_token, metadata).then(token => {
          if (token && onSuccess) {
            onSuccess(public_token, metadata);
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
    userId,
    isDuplicateConnection,
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