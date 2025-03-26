/*import { TransactionCategory } from "./TransactionCategory";*/
import { TransactionType } from "./TransactionType";

export interface Transaction {
    transactionId: string; //was id
    transactionDate: Date;
    amount: number; 
    payee: string; //was description
    type?: TransactionType; //type of transaction income or expense
    categories: string[]; // changed from single category to list of categories with subcategory
}
export interface AddEditTransaction{
    amount: number,
    transactionDate: Date | null;
    userId: string;
    categories: string[];
    payee: string;
    transactionType: string;
    transactionId?: string;
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