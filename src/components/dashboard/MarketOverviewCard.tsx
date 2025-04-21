import React, { useMemo } from 'react';
import '../../styles/Dashboard.css';
// Remove MiniTicker import
// import { MiniTicker } from '../../types/api';

// Define TickerItem structure based on map data
interface TickerItem {
    symbol: string;
    price: number;
}

interface MarketOverviewCardProps {
  // Expect tickerMap instead of tickers array
  tickerMap: Map<string, number>; 
  isLoading: boolean;
}

const MarketOverviewCard: React.FC<MarketOverviewCardProps> = ({ tickerMap, isLoading }) => {
  // Format currency consistently
  const formatCurrency = (value: string | number, precision: number = 2): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(num);
  };

  // Format date consistently
  const formatDate = (date: string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Convert map to array for rendering, handle potential undefined map
  const tickerArray: TickerItem[] = useMemo(() => {
      // Check if tickerMap exists and is a Map before converting
      if (!tickerMap || !(tickerMap instanceof Map) || tickerMap.size === 0) {
          return []; // Return empty array if map is not ready or empty
      } 
      return Array.from(tickerMap.entries()).map(([symbol, price]) => ({
          symbol,
          price: price // Keep price as number for formatting
      }));
  }, [tickerMap]); // Recalculate only when tickerMap changes

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">
          <span className="card-icon">📈</span>
          Watched Tickers
        </h3>
        {/* Keep or remove link */}
        {/* <Link to="/markets" className="view-more">View Markets</Link> */}
      </div>
      <div className="card-body">
        {/* Use tickerMap.size for loading check or a separate isLoading prop */}
        {isLoading || tickerMap.size === 0 ? ( 
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading market data...</p>
          </div>
        ) : (
          <div className="market-ticker-list">
            {tickerArray.map((ticker) => (
              <div key={ticker.symbol} className="ticker-item"> 
                <span className="ticker-symbol">{ticker.symbol}</span>
                <span className="ticker-price">{formatCurrency(ticker.price, 4)}</span> 
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketOverviewCard; 