import { TransactionCategory } from "./TransactionCategory";

export interface Transaction {
    id: string;
    date: Date;
    amount: number;
    description: string;
    category: TransactionCategory;
}
