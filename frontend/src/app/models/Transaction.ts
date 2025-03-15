/*import { TransactionCategory } from "./TransactionCategory";*/
import { TransactionType } from "./TransactionType";

export interface Transaction {
    transactionId: string; //was id
    transactionDate: Date;
    amount: number; 
    payee: string; //was description
    type?: TransactionType; //type of transaction income or expense
    category: string; //was category
}

export interface TransactionListResponse {
    paging: {
        totalRows: number;
        totalPages: number;
        curPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        nextPageURL: string;
        prevPageURL: string;
    }
    data: Transaction[]
}