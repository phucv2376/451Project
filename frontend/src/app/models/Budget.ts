export interface Budget {
    budgetId?: string;
    userId?: string;
    title?: string;
    totalAmount?: number;
    spentAmount?: number;
    category?: string;
    isActive?: boolean;
    createdDate?: string;
  }

  export interface MonthSummary{
    month: string;
    total: number
  }