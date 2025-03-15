'use client';
import { useState, useCallback, useEffect } from 'react';
import { usePlaid } from '../../hooks/usePlaid';
import { Transaction, TransactionSyncResponse } from '../../models/plaid';
import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { PlaidLinkWrapper } from './PlaidLinkWrapper';

const BATCH_SIZE = 5;

interface BankIntegrationProps {
  onDisconnect: () => void;
}

export default function BankIntegration({ onDisconnect }: BankIntegrationProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const {
    syncTransactions,
    plaidAccessToken,
    accounts,
    disconnectBank,
    setPlaidAccessToken,
    exchangePublicToken
  } = usePlaid();
  const userId = localStorage.getItem('userId');
  //const [userId] = useState('0cbdac70-4903-4a90-b08c-a117f33e2075');
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasLoadedTransactions, setHasLoadedTransactions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const storedToken = localStorage.getItem('plaid_access_token');
      if (storedToken && !plaidAccessToken) {
        setPlaidAccessToken(storedToken);
      }
    }
  }, [plaidAccessToken, setPlaidAccessToken, mounted]);

  const loadAllTransactions = useCallback(
    async (token: string) => {
      if (!mounted || isSyncing || hasLoadedTransactions) return;
      setIsSyncing(true);
      try {
        let hasMore = true;
        let cursor: string | undefined;
        let allTransactions: Transaction[] = [];
        while (hasMore) {
          const result: TransactionSyncResponse | null = userId ? await syncTransactions(
            userId,
            token,
            cursor,
            BATCH_SIZE
          ) : null;
          if (!result) break;
          if (result.added && result.added.length > 0) {
            allTransactions = [...allTransactions, ...result.added];
          }
          if (!result.hasMore) {
            hasMore = false;
            break;
          }
          cursor = result.nextCursor;
        }
        setTransactions(allTransactions);
        setHasLoadedTransactions(true);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsSyncing(false);
      }
    },
    [mounted, syncTransactions, userId, isSyncing, hasLoadedTransactions]
  );

  useEffect(() => {
    if (plaidAccessToken && mounted) {
      loadAllTransactions(plaidAccessToken);
    }
  }, [plaidAccessToken, mounted, loadAllTransactions]);

  const handlePlaidSuccess = useCallback(
    async (publicToken: string) => {
      console.log('Successfully connected bank account, public token:', publicToken);
      const token = await exchangePublicToken(publicToken);
      if (!token) {
        console.error('Failed to exchange public token for access token');
        return;
      }
      setHasLoadedTransactions(false);
    },
    [exchangePublicToken]
  );

  const handlePlaidExit = useCallback(() => {
    console.log('Plaid Link closed');
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }, []);

  return (
    <div className="max-w-5xl">
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
        {mounted && plaidAccessToken && (
          <button
            onClick={onDisconnect}
            className="w-full py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-md flex items-center justify-center"
          >
            <ArrowPathIcon className="w-6 h-6 mr-2" />
            Disconnect Bank
          </button>
        )}

        {mounted && plaidAccessToken && accounts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <BanknotesIcon className="w-6 h-6 mr-2 text-blue-500" />
              Connected Accounts
            </h3>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.accountId}
                  className="w-full p-5 bg-gray-50 rounded-lg border border-gray-100 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-800 flex items-center">
                      <WalletIcon className="w-6 h-6 mr-2 text-purple-500" />
                      {account.name}
                    </span>
                    <span className="text-sm text-gray-500">{account.type}</span>
                  </div>
                  <div className="mt-3 text-md text-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
                        Available:
                      </span>
                      <span className="text-green-600 font-semibold">
                        {account.availableBalance != null ? formatCurrency(account.availableBalance) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="flex items-center">
                        <CreditCardIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Current:
                      </span>
                      <span className="text-blue-600 font-semibold">
                        {account.currentBalance != null ? formatCurrency(account.currentBalance) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Render the PlaidLinkWrapper if there is no access token */}
        {mounted && !plaidAccessToken && (
          <PlaidLinkWrapper onSuccess={handlePlaidSuccess} onExit={handlePlaidExit} />
        )}
      </div>
    </div>

    
  );
}
