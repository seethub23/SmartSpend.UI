export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
}

export interface CategoryWiseSpending {
  category: string;
  totalAmount: number;
}

export interface MonthlyTrend {
  month: number;
  type: string;
  totalAmount: number;
}
