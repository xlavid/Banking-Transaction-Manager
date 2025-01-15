import { useState, useEffect } from 'react'
import { api } from './services/api'
import { Transaction } from './types'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const transactionsPerPage = 5;

  // Theme state (keeping this part unchanged)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Fetch transactions
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseFloat(amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    if (description.trim().length < 3) {
      alert('Description must be at least 3 characters long');
      return;
    }
    
    try {
      if (editingId !== null) {
        // Update existing transaction
        const updatedTransaction = await api.updateTransaction(editingId, {
          description,
          amount: parseFloat(amount),
          type
        });
        setTransactions(transactions.map(t => 
          t.id === editingId ? updatedTransaction : t
        ));
        setEditingId(null);
      } else {
        // Add new transaction
        const newTransaction = await api.createTransaction({
          description,
          amount: parseFloat(amount),
          type
        });
        setTransactions([...transactions, newTransaction]);
      }

      // Reset form
      setDescription('');
      setAmount('');
      setType('deposit');
    } catch (err) {
      setError('Failed to save transaction');
      console.error(err);
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await api.deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete transaction');
      console.error(err);
    }
  };

  // Sort transactions by date (latest first) and then paginate
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate pagination with sorted transactions
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = sortedTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const editTransaction = (transaction: Transaction) => {
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setEditingId(transaction.id);
  };

  const balance = transactions.reduce((sum, t) => 
    t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0
  );

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container">Error: {error}</div>;
  }

  return (
    <div className="container">
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="theme-toggle"
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      
      <h1>Banking Transaction Manager</h1>
      
      <div className="balance">
        <h2>Current Balance: ${balance.toFixed(2)}</h2>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Transaction description"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          step="0.01"
          required
        />
        <select 
          value={type}
          onChange={(e) => setType(e.target.value as 'deposit' | 'withdrawal')}
        >
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
        <button type="submit">
          {editingId !== null ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </form>

      <div className="transactions-list">
        <h2>Transactions</h2>
        {currentTransactions.map(transaction => (
          <div 
            key={transaction.id} 
            className="transaction-item"
            data-type={transaction.type}
          >
            <div className="transaction-info">
              <span className="date">{transaction.date}</span>
              <span className="description" title={transaction.description}>
                {transaction.description}
              </span>
              <span className="amount">
                {transaction.type === 'withdrawal' ? '-' : '+'}
                ${transaction.amount.toFixed(2)}
              </span>
            </div>
            <div className="transaction-actions">
              <button onClick={() => editTransaction(transaction)}>Edit</button>
              <button onClick={() => deleteTransaction(transaction.id)}>Delete</button>
            </div>
          </div>
        ))}
        
        {transactions.length > transactionsPerPage && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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
