import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MarketOverviewData, 
  IndexData, 
  StockData, 
  SectorData,
  formatPercent, 
  formatMarketCap
} from '../../services/mockData';
import '../../styles/Dashboard.css';

interface MarketOverviewCardProps {
  marketData: MarketOverviewData | null;
  isLoading: boolean;
}

const MarketOverviewCard: React.FC<MarketOverviewCardProps> = ({ marketData, isLoading }) => {
  // Format currency consistently
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">
          <span className="card-icon">🌍</span>
          Market Overview
        </h3>
        <Link to="/markets" className="view-more">View Markets</Link>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading market data...</p>
          </div>
        ) : !marketData ? (
          <div className="no-data">No market data available</div>
        ) : (
          <div className="market-content">
            <h4 className="section-title">Indices</h4>
            <div className="indices-list">
              {marketData.indices.map((index) => (
                <div key={index.symbol} className="index-item">
                  <div className="index-info">
                    <div className="index-name">{index.name}</div>
                    <div className="index-value">{index.value.toLocaleString()}</div>
                  </div>
                  <div className={`index-change ${index.change >= 0 ? 'positive-change' : 'negative-change'}`}>
                    {index.change >= 0 ? '↑ ' : '↓ '}
                    {Math.abs(index.change).toLocaleString()} ({formatPercent(Math.abs(index.changePercent))})
                  </div>
                </div>
              ))}
            </div>
            
            <div className="market-row">
              <div className="market-column">
                <h4 className="section-title">Top Gainers</h4>
                <div className="movers-list">
                  {marketData.topGainers.slice(0, 3).map((stock) => (
                    <div key={stock.symbol} className="mover-item">
                      <div className="mover-symbol">{stock.symbol}</div>
                      <div className="mover-price">{formatCurrency(stock.price)}</div>
                      <div className="positive-change">
                        +{formatPercent(stock.changePercent)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="market-column">
                <h4 className="section-title">Top Losers</h4>
                <div className="movers-list">
                  {marketData.topLosers.slice(0, 3).map((stock) => (
                    <div key={stock.symbol} className="mover-item">
                      <div className="mover-symbol">{stock.symbol}</div>
                      <div className="mover-price">{formatCurrency(stock.price)}</div>
                      <div className="negative-change">
                        {formatPercent(stock.changePercent)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {marketData.lastUpdated && (
              <div className="market-footer">
                <span className="update-time">
                  Last updated: {formatDate(marketData.lastUpdated)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketOverviewCard; 