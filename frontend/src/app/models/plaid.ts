import { useCallback } from "react";
import { usePlaid } from "../hooks/usePlaid";

export interface Transaction {
    id: string;
    name: string;
    amount: number;
    date: string;
    category: string[];
    merchant_name?: string;
  }
  
  export interface TransactionSyncResponse {
    added: Transaction[];
    modified: Transaction[];
    removed: Transaction[];
    hasMore: boolean;
    nextCursor: string;
  }
  
  export interface PlaidAccount {
    accountId: string;
    name: string;
    type: string;
    subType: string | null;
    currentBalance: number;
    availableBalance: number | null;
    isoCurrencyCode: string | null;
    unofficialCurrencyCode: string | null;
    verificationStatus: string | null;
    persistentAccountId: string;
  }
  
  export interface AccountsResponse {
    accounts: PlaidAccount[];
  }
