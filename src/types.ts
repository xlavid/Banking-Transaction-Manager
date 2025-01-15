export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdrawal';
} 