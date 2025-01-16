import { useState, useEffect } from 'react'
import { api } from './services/api'
import { Transaction, TransactionType, TransactionResult, PageResponse } from './types'
import './App.css'
import { BASE_URL } from './config'

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [transactionType, setTransactionType] = useState<TransactionType>('PAYMENT');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [result, setResult] = useState<TransactionResult>('SUCCESS');

  // Fetch transactions
  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/transactions?page=${page}&size=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data: PageResponse = await response.json();
      const sortedTransactions = [...(data.content || [])].sort((a, b) => {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      });
      setTransactions(sortedTransactions);
      setTotalPages(data.totalPages);
      setCurrentPage(data.number);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCurrency('USD');
    setTransactionType('PAYMENT');
    setResult('SUCCESS');
    setTransactionId('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseFloat(amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    try {
      if (editingId) {
        await api.updateTransaction(editingId, {
          amount,
          currency,
          transactionResult: result
        });
        
        fetchTransactions(currentPage);
        resetForm();
      } else {
        await api.createTransaction({
          transactionId,
          transactionType,
          amount: parseFloat(amount),
          currency,
          result
        });

        fetchTransactions(currentPage);
        resetForm();
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Transaction ID already exists') {
        alert('Transaction ID already exists');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to save transaction');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      fetchTransactions(currentPage);
    } catch (err) {
      setError('Failed to delete transaction');
      console.error(err);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    fetchTransactions(Number(pageNumber) - 1);
  };

  const editTransaction = (transaction: Transaction) => {
    setAmount(transaction.amount.toString());
    setCurrency(transaction.currency);
    setTransactionType(transaction.transactionType);
    setEditingId(transaction.transactionId);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container">Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>Banking Transaction Manager</h1>
      
      <form onSubmit={handleSubmit} className="transaction-form">
        {!editingId && (
          <>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Transaction ID"
              required
            />
            <select 
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as TransactionType)}
            >
              <option value="PAYMENT">Payment</option>
              <option value="REFUND">Refund</option>
            </select>
          </>
        )}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          step="0.01"
          required
        />
        <input
          type="text"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder="Currency"
          required
        />
        <select 
          value={result}
          onChange={(e) => setResult(e.target.value as TransactionResult)}
        >
          <option value="SUCCESS">Success</option>
          <option value="FAILURE">Failure</option>
          <option value="DECLINED">Declined</option>
        </select>
        <button type="submit">
          {editingId !== null ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </form>

      <div className="transactions-list">
        <div className="transactions-header">
          <span>Transaction ID</span>
          <span>Created Date</span>
          <span>Result</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Currency</span>
          <span>Actions</span>
        </div>
        
        {Array.isArray(transactions) && transactions.map((transaction) => (
          <div 
            key={transaction.transactionId} 
            className={`transaction-item ${transaction.transactionType.toLowerCase()}`}
          >
            <div className="transaction-info">
              <span className="transaction-id">{transaction.transactionId}</span>
              <span className="date">
                {new Date(transaction.created).toLocaleDateString()}
              </span>
              <span className={`status ${transaction.result.toLowerCase()}`}>
                {transaction.result}
              </span>
              <span className="type">{transaction.transactionType}</span>
              <span className="amount">
                {transaction.transactionType === 'REFUND' ? '+' : '-'}
                {transaction.amount.toFixed(2)}
              </span>
              <span className="currency">{transaction.currency}</span>
              <div className="transaction-actions">
                <button 
                  onClick={() => editTransaction(transaction)}
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteTransaction(transaction.transactionId)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {(!transactions || transactions.length === 0) && !loading && (
          <div className="no-transactions">
            No transactions found
          </div>
        )}
        
        {totalPages > 0 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 0}
              className="pagination-button"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`pagination-button ${currentPage + 1 === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 2)}
              disabled={currentPage + 1 === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
