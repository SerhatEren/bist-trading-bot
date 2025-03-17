import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { StockQuote } from '../../types/api';

interface StockQuoteListProps {
  symbols: string[];
  refreshInterval?: number;
}

const StockQuoteList: React.FC<StockQuoteListProps> = ({ 
  symbols, 
  refreshInterval = 10000 // 10 saniye
}) => {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    try {
      const response = await apiService.getStockQuotes(symbols);
      setQuotes(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hisse fiyatları alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();

    // Belirli aralıklarla fiyatları güncelle
    const intervalId = setInterval(fetchQuotes, refreshInterval);

    return () => clearInterval(intervalId);
  }, [symbols.join(','), refreshInterval]);

  if (loading && quotes.length === 0) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error && quotes.length === 0) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="stock-quote-list">
      <h2>Hisse Senedi Fiyatları</h2>
      <table>
        <thead>
          <tr>
            <th>Sembol</th>
            <th>Son Fiyat</th>
            <th>Değişim</th>
            <th>Değişim %</th>
            <th>Alış</th>
            <th>Satış</th>
            <th>Hacim</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => (
            <tr key={quote.symbol}>
              <td>{quote.symbol}</td>
              <td>{quote.lastPrice.toFixed(2)}</td>
              <td className={quote.dailyChange >= 0 ? 'positive' : 'negative'}>
                {quote.dailyChange.toFixed(2)}
              </td>
              <td className={quote.dailyChangePercentage >= 0 ? 'positive' : 'negative'}>
                {quote.dailyChangePercentage.toFixed(2)}%
              </td>
              <td>{quote.bidPrice.toFixed(2)}</td>
              <td>{quote.askPrice.toFixed(2)}</td>
              <td>{quote.volume.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockQuoteList; 