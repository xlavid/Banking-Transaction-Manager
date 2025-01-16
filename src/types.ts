// Define the transaction types and result types as enums or string literals
export type TransactionType = 'PAYMENT' | 'REFUND';
export type TransactionResult = 'DECLINED' | 'SUCCESS' | 'FAILURE';

export interface Transaction {
  transactionId: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  result: TransactionResult;
  created: string;
}

export interface PageResponse {
  content: Transaction[];
  totalPages: number;
  number: number;
}