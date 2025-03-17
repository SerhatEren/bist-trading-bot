import React, { useState, useEffect } from 'react';
import { 
  Portfolio, 
  formatPercent, 
  formatDate,
  fetchHistoricalPerformance,
  HistoricalValue
} from '../../services/mockData';
import PortfolioChart from '../charts/PortfolioChart';
import PositionsGrid from './PositionsGrid';
import '../../styles/Dashboard.css';

interface PortfolioCardProps {
  portfolioData: Portfolio | null;
  isLoading: boolean;
}

const PortfolioCard = ({ portfolioData, isLoading }: PortfolioCardProps) => {
  const [activeTimeframe, setActiveTimeframe] = useState<string>('1M');
  const [historicalData, setHistoricalData] = useState<HistoricalValue[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  // Fetch historical data based on timeframe
  useEffect(() => {
    if (!portfolioData) return;

    const fetchHistoricalData = async () => {
      // Set loading state
      setChartLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock historical data based on timeframe
        const now = new Date();
        const data: HistoricalValue[] = [];
        
        // Number of data points and interval based on timeframe
        let days = 0;
        let interval = 1;
        
        switch (activeTimeframe) {
          case '1D':
            days = 1;
            interval = 1/24; // hourly
            break;
          case '1W':
            days = 7;
            interval = 1;
            break;
          case '1M':
            days = 30;
            interval = 1;
            break;
          case '3M':
            days = 90;
            interval = 3;
            break;
          case '1Y':
            days = 365;
            interval = 7;
            break;
        }
        
        // Generate data points
        for (let i = days; i >= 0; i -= interval) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          
          // Create some random variation around the current value
          const randomFactor = 0.98 + Math.random() * 0.04;
          const value = Math.round(portfolioData.totalValue * randomFactor);
          
          data.push({
            date: date.toISOString(),
            value
          });
        }
        
        setHistoricalData(data);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setChartLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [activeTimeframe, portfolioData]);

  if (isLoading) {
    return (
      <div className="dashboard-card portfolio-card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="card-icon">💼</span>
            Portfolio
          </h2>
        </div>
        <div className="card-body">
          <div className="loading">
            <div className="spinner"></div>
            <span>Loading portfolio data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="dashboard-card portfolio-card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="card-icon">💼</span>
            Portfolio
          </h2>
        </div>
        <div className="card-body">
          <div className="no-data">No portfolio data available</div>
        </div>
      </div>
    );
  }

  // Calculate day change percentage for display
  const dayChangePercentDisplay = portfolioData.dayChangePercent > 0 
    ? `+${portfolioData.dayChangePercent.toFixed(2)}%` 
    : `${portfolioData.dayChangePercent.toFixed(2)}%`;

  return (
    <div className="dashboard-card portfolio-card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-icon">💼</span>
          Portfolio
        </h2>
        <a href="/portfolio" className="view-more">View Details</a>
      </div>
      
      <div className="card-body">
        <div className="portfolio-overview">
          <div className="portfolio-metric">
            <div className="metric-value">
              {formatCurrency(portfolioData.totalValue)}
            </div>
            <div className="metric-label">Total Value</div>
            <div className={`metric-change ${portfolioData.dayChange >= 0 ? 'positive-change' : 'negative-change'}`}>
              {portfolioData.dayChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(portfolioData.dayChange))} ({dayChangePercentDisplay})
            </div>
          </div>
          
          <div className="portfolio-metric">
            <div className="metric-value">
              {formatCurrency(portfolioData.cashBalance)}
            </div>
            <div className="metric-label">Cash Balance</div>
          </div>
          
          <div className="portfolio-metric">
            <div className="metric-value">
              {formatCurrency(portfolioData.invested)}
            </div>
            <div className="metric-label">Invested</div>
          </div>
        </div>
        
        <div className="timeframe-controls">
          {['1D', '1W', '1M', '3M', '1Y'].map(timeframe => (
            <button 
              key={timeframe}
              className={`timeframe-button ${activeTimeframe === timeframe ? 'active' : ''}`}
              onClick={() => setActiveTimeframe(timeframe)}
            >
              {timeframe}
            </button>
          ))}
        </div>
        
        {/* Use our new chart component */}
        <PortfolioChart 
          data={historicalData} 
          isLoading={chartLoading} 
        />
        
        <h3 className="positions-heading">Current Positions</h3>
        <PositionsGrid 
          positions={portfolioData.positions} 
          isLoading={false} 
        />
      </div>
    </div>
  );
};

// Helper function to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default PortfolioCard; 