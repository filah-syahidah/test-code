
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
}

export interface Summary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}
