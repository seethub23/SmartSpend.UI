export interface Category {
  categoryId: number;
  name: string;
  type: string;  // Income | Expense | Savings
  isDefault: boolean;
}

export interface AddCategory {
  name: string;
  type: string;
}