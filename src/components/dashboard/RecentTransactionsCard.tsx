import React from 'react';
import { Link } from 'react-router-dom';
import { Transaction } from '../../services/mockData';
import '../../styles/Dashboard.css';

interface RecentTransactionsCardProps {
  transactions: Transaction[] | null;
  isLoading: boolean;
}

const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({ 
  transactions, 
  isLoading 
}) => {
  // Format date to show consistent time format
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">
          <span className="card-icon">💸</span>
          Recent Transactions
        </h3>
        <Link to="/transactions" className="view-more">View All</Link>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="no-data">No recent transactions</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="date-column">Date</th>
                <th className="symbol-column">Symbol</th>
                <th className="action-column">Type</th>
                <th className="price-column">Price</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((transaction) => (
                <tr key={`${transaction.id}`}>
                  <td className="date-column">
                    {formatDateTime(transaction.date)}
                  </td>
                  <td className="symbol-column">{transaction.symbol}</td>
                  <td className="action-column">
                    <span className={`badge ${transaction.side === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                      {transaction.side}
                    </span>
                  </td>
                  <td className="price-column">${transaction.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentTransactionsCard; 