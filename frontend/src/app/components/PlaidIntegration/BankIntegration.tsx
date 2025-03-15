'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
import { usePlaidContext } from '../../contexts/PlaidContext';

const BATCH_SIZE = 5;

interface BankIntegrationProps {
  onDisconnect: () => void;
  isConnected: boolean;
  onPlaidSuccess: (publicToken: string) => Promise<void>;
}

export default function BankIntegration({ 
  onDisconnect, 
  isConnected,
  onPlaidSuccess 
}: BankIntegrationProps) {
  const { isPlaidInitialized } = usePlaidContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const {
    syncTransactions,
    accounts,
    plaidAccessToken
  } = usePlaid();
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasLoadedTransactions, setHasLoadedTransactions] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
  }, []);

  const loadAllTransactions = useCallback(
    async (token: string) => {
      if (!mounted || isSyncing || !userId) return;
      setIsSyncing(true);
      setHasLoadedTransactions(false);
      try {
        let hasMore = true;
        let cursor: string | undefined;
        let allTransactions: Transaction[] = [];
        
        while (hasMore) {
          const result: TransactionSyncResponse | null = await syncTransactions(
            userId,
            token,
            cursor,
            BATCH_SIZE
          );
          
          if (!result) {
            console.error('No result from syncTransactions');
            break;
          }
          
          if (result.added && result.added.length > 0) {
            allTransactions = [...allTransactions, ...result.added];
          }
          
          // Handle modified transactions
          if (result.modified && result.modified.length > 0) {
            allTransactions = allTransactions.map(t => {
              const modified = result.modified.find(m => m.id === t.id);
              return modified || t;
            });
          }
          
          // Handle removed transactions
          if (result.removed && result.removed.length > 0) {
            const removedIds = result.removed.map(t => t.id);
            allTransactions = allTransactions.filter(t => !removedIds.includes(t.id));
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
    [mounted, syncTransactions, userId]
  );

  // Load transactions when access token is available
  useEffect(() => {
    if (plaidAccessToken && userId && !hasLoadedTransactions && !isSyncing) {
      loadAllTransactions(plaidAccessToken);
    }
  }, [plaidAccessToken, userId, hasLoadedTransactions, isSyncing, loadAllTransactions]);

  const formatCurrency = useCallback((amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }, []);

  if (!mounted || !isPlaidInitialized) {
    return null;
  }

  return (
    <div className="max-w-4xl w-full">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-3">
        {isConnected ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={onDisconnect}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm flex items-center justify-center font-medium"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Disconnect Bank
              </button>

              <button
                onClick={() => loadAllTransactions(plaidAccessToken!)}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Transactions'}
              </button>
            </div>
  
            {/* Connected Accounts Section */}
            {accounts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <BanknotesIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Linked Accounts
                </h3>
                
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div
                      key={account.accountId}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-800 flex items-center">
                          <WalletIcon className="w-5 h-5 mr-2 text-purple-500" />
                          {account.name}
                        </span>
                        <span className="text-xs text-gray-500">{account.type}</span>
                      </div>
  
                      <div className="mt-2">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center text-sm text-gray-600">
                            <CurrencyDollarIcon className="w-4 h-4 mr-2 text-green-500" />
                            Available:
                          </span>
                          <span className="text-green-600 font-semibold text-sm">
                            {account.availableBalance != null ? formatCurrency(account.availableBalance) : 'N/A'}
                          </span>
                        </div>
  
                        <div className="flex justify-between items-center mt-1">
                          <span className="flex items-center text-sm text-gray-600">
                            <CreditCardIcon className="w-4 h-4 mr-2 text-blue-500" />
                            Current:
                          </span>
                          <span className="text-blue-600 font-semibold text-sm">
                            {account.currentBalance != null ? formatCurrency(account.currentBalance) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </>
        ) : (
          <div className="py-3">
            <PlaidLinkWrapper onSuccess={onPlaidSuccess} onExit={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}