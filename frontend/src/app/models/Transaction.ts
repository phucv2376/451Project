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
    categories?: string[];
    payee: string;
    transactionType: string;
    transactionId?: string;
}
export interface AddTransaction{
    amount: number,
    transactionDate: Date | null;
    userId: string;
    categories: string[];
    payee: string;
    transactionType: string;
    transactionId?: string;
}
export interface EditTransaction{
    amount: number,
    transactionDate: Date | null;
    userId: string;
    payee: string;
    transactionType: string;
    transactionId?: string;
    category: string
}
export interface FilteredTransaction{
    MinAmount?: number | null;
    MaxAmount?: number | null;
    StartDate?: Date | null; 
    EndDate?: Date | null;   
    Category?: string | null;
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

export interface CategorySpendingResponse {
    success: boolean;
    data: CategorySpending[];
}

export interface CategorySpending {
    category: string;
    totalAmount: number;
}