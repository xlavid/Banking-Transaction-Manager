import { Transaction, TransactionResult } from '../types';
import { BASE_URL } from '../config';

export const api = {
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${BASE_URL}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async createTransaction(transaction: {
    transactionId: string;
    transactionType: string;
    amount: number;
    currency: string;
    result: TransactionResult;
  }): Promise<Transaction> {
    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    if (response.status === 409) throw new Error('Transaction ID already exists');
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  },

  async updateTransaction(id: string, params: {
    amount: string;
    currency: string;
    transactionResult: TransactionResult;
  }): Promise<Transaction> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}/transactions/${id}?${queryParams}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  },

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
  }
}; 