import { useState, useEffect } from 'react'
import './App.css'

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdrawal';
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        description: "Initial Bank Account Opening Deposit",
        amount: 1000.00,
        date: "2024-03-20",
        type: "deposit"
      },
      {
        id: 2,
        description: "Walmart Grocery Shopping - Weekly Essentials",
        amount: 85.50,
        date: "2024-03-21",
        type: "withdrawal"
      },
      {
        id: 3,
        description: "Monthly Salary from Tech Corp Inc.",
        amount: 2500.00,
        date: "2024-03-22",
        type: "deposit"
      },
      {
        id: 4,
        description: "Rent Payment - March 2024",
        amount: 1200.00,
        date: "2024-03-23",
        type: "withdrawal"
      },
      {
        id: 5,
        description: "Car Insurance - Quarterly Premium",
        amount: 275.00,
        date: "2024-03-23",
        type: "withdrawal"
      },
      {
        id: 6,
        description: "Freelance Web Development Project",
        amount: 850.00,
        date: "2024-03-24",
        type: "deposit"
      }
    ];
  });
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  // Add theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a saved preference
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update theme and save preference
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add validation
    if (parseFloat(amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    if (description.trim().length < 3) {
      alert('Description must be at least 3 characters long');
      return;
    }
    
    if (editingId !== null) {
      // Update existing transaction
      setTransactions(transactions.map(t => 
        t.id === editingId 
          ? { ...t, description, amount: parseFloat(amount), type }
          : t
      ));
      setEditingId(null);
    } else {
      // Add new transaction
      const newTransaction: Transaction = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
        type
      };
      setTransactions([...transactions, newTransaction]);
    }

    // Reset form
    setDescription('');
    setAmount('');
    setType('deposit');
  };

  const deleteTransaction = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      setTransactions(transactions.filter(t => t.id !== id));
      setRemovingId(null);
    }, 300); // Match animation duration
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

  // Save to localStorage when transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Add new state for animation
  const [removingId, setRemovingId] = useState<number | null>(null);

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
        {currentTransactions.map((transaction, index) => (
          <div 
            key={transaction.id} 
            className={`transaction-item ${removingId === transaction.id ? 'removing' : ''}`}
            data-type={transaction.type}
            style={{ 
              '--index': index,
            } as React.CSSProperties}
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
