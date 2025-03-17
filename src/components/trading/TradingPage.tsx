import React, { useState, useEffect } from 'react';
import BuySellForm from './BuySellForm';
import apiService from '../../services/apiFactory';
import { Portfolio as ApiPortfolio } from '../../types/api';
import { 
  fromApiPortfolio, 
  formatCurrency, 
  formatPercent, 
  Portfolio 
} from '../../services/mockData';
import './TradingStyles.css';

const TradingPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First try to get data from sessionStorage (synced with Dashboard)
        const cachedData = sessionStorage.getItem('portfolioData');
        if (cachedData) {
          setPortfolio(fromApiPortfolio(JSON.parse(cachedData)));
          setLoading(false);
          return;
        }
        
        // If no cached data, fetch from API
        const response = await apiService.getPortfolio();
        const apiPortfolio = response.data as ApiPortfolio;
        
        // Convert API format to our app format
        const convertedPortfolio = fromApiPortfolio(apiPortfolio);
        setPortfolio(convertedPortfolio);
        
        // Cache for other components
        sessionStorage.setItem('portfolioData', JSON.stringify(apiPortfolio));
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred while loading portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [refreshKey]);

  const handleTradeSuccess = () => {
    // Clear cached portfolio data to force refresh
    sessionStorage.removeItem('portfolioData');
    // Refresh portfolio after successful trade
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="trading-page">
      <h1>Trading Platform</h1>
      
      <div className="trading-container">
        <div className="trading-form-container">
          <BuySellForm onSuccess={handleTradeSuccess} />
        </div>
        
        <div className="portfolio-status-container">
          <div className="portfolio-card">
            <h2>Portfolio Overview</h2>
            
            {loading ? (
              <div className="loading">Loading...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : portfolio ? (
              <>
                <div className="portfolio-balance">
                  <div className="balance-item">
                    <span className="balance-label">Total Equity</span>
                    <span className="balance-value">{formatCurrency(portfolio.totalValue)}</span>
                  </div>
                  <div className="balance-item">
                    <span className="balance-label">Available Cash</span>
                    <span className="balance-value">{formatCurrency(portfolio.cashBalance)}</span>
                  </div>
                </div>
                
                <h3>Current Positions</h3>
                {portfolio.positions.length === 0 ? (
                  <div className="no-data">No positions currently held</div>
                ) : (
                  <table className="positions-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Quantity</th>
                        <th>Avg. Cost</th>
                        <th>Market Value</th>
                        <th>P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.positions.map(position => (
                        <tr key={position.symbol}>
                          <td className="symbol">{position.symbol}</td>
                          <td>{position.quantity.toLocaleString()}</td>
                          <td>{formatCurrency(position.avgPrice)}</td>
                          <td>{formatCurrency(position.value)}</td>
                          <td className={position.change >= 0 ? 'positive' : 'negative'}>
                            {formatCurrency(position.change)} ({formatPercent(position.changePercent)})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}>Total</td>
                        <td>{formatCurrency(portfolio.positions.reduce((sum, p) => sum + p.value, 0))}</td>
                        <td className={portfolio.positions.reduce((sum, p) => sum + p.change, 0) >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(portfolio.positions.reduce((sum, p) => sum + p.change, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
                
                <div className="portfolio-metrics">
                  <div className="metrics-item">
                    <span className="metrics-label">Cash Allocation</span>
                    <span className="metrics-value">{formatPercent(portfolio.cashBalance / portfolio.totalValue * 100)}</span>
                  </div>
                  <div className="metrics-item">
                    <span className="metrics-label">Invested</span>
                    <span className="metrics-value">{formatPercent(portfolio.invested / portfolio.totalValue * 100)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data">No portfolio data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPage; 