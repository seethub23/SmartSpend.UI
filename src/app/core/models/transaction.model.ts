export interface Transaction {
  transactionId: number;
  categoryName: string;
  type: string;
  amount: number;
  paymentMethod: string;
  transactionDate: Date;
  notes: string;
  isRecurring: boolean;
}

export interface AddTransaction {
  categoryId: number;
  amount: number;
  type: string;
  paymentMethod: string;
  transactionDate: Date;
  notes: string;
  isRecurring: boolean;
}
