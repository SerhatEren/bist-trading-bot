import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { Order } from '../../types/api';
import './DashboardStyles.css';

interface Transaction {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
}

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Gerçekleşmiş emirleri al
        const response = await apiService.getOrders();
        const completedOrders = response.data || [];

        // Gerçekleşmiş emirleri işlemlere dönüştür
        const transactionList = completedOrders
          .filter(order => order.status === 'FILLED')
          .map(order => ({
            id: order.id,
            symbol: order.symbol,
            side: order.side,
            quantity: order.quantity,
            price: order.price || 0,
            total: order.quantity * (order.price || 0),
            timestamp: order.createdAt
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10); // Son 10 işlem

        setTransactions(transactionList);
      } catch (err: any) {
        setError(err.response?.data?.message || 'İşlemler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return <div className="loading">İşlemler yükleniyor...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (transactions.length === 0) {
    return <div className="no-data">Henüz işlem bulunmamaktadır</div>;
  }

  return (
    <div className="recent-transactions-card">
      <h2>Son İşlemler</h2>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Hisse</th>
            <th>İşlem</th>
            <th>Miktar</th>
            <th>Fiyat</th>
            <th>Toplam</th>
            <th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.symbol}</td>
              <td className={transaction.side === 'BUY' ? 'buy' : 'sell'}>
                {transaction.side === 'BUY' ? 'Alış' : 'Satış'}
              </td>
              <td>{transaction.quantity}</td>
              <td>{formatCurrency(transaction.price)}</td>
              <td>{formatCurrency(transaction.total)}</td>
              <td>{new Date(transaction.timestamp).toLocaleString('tr-TR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactions; 