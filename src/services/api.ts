import { Transaction } from '../types';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust this to your API URL

export const api = {
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  },

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  },

  async deleteTransaction(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
  },
}; 