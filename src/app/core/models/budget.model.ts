export interface Budget {
  budgetId: number;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  month: number;
  year: number;
  spentPercentage: number;
}

export interface AddBudget {
  categoryId: number;
  limitAmount: number;
  month: number;
  year: number;
}
