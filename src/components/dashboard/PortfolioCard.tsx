import React, { useState, useEffect, useMemo } from 'react';

// Import MiniTicker and other necessary types
import { 
    BinanceAccountInfo as AccountInfo, // Alias for clarity
    BinanceBalance as Balance, // Alias for clarity
    MiniTicker 
} from '../../types/api'; 

import PositionsGrid from './PositionsGrid';
import '../../styles/Dashboard.css';

// Define the expected structure for TickerPrice used by PositionsGrid
interface TickerPrice { 
  symbol: string; 
  price: string; // Change to string to match original expectation
}

interface PortfolioCardProps {
  accountInfo: AccountInfo | null;
  tickerMap: Map<string, number>;
  isLoading: boolean;
}

const PortfolioCard = ({ accountInfo, tickerMap, isLoading }: PortfolioCardProps) => {
  
  // Calculate metrics using useMemo for efficiency
  const { totalValue, cashBalance } = useMemo(() => {
      if (!accountInfo || tickerMap.size === 0) return { totalValue: 0, cashBalance: 0 };

      let tv = 0;
      let cb = 0;

      const cashAssets = ['USDT', 'BUSD', 'USDC', 'FDUSD', 'TUSD'];

      // Get conversion rates directly from the passed tickerMap
      const btcUsdtPrice = tickerMap.get('BTCUSDT');
      const ethUsdtPrice = tickerMap.get('ETHUSDT');
      const bnbUsdtPrice = tickerMap.get('BNBUSDT');

      accountInfo.balances.forEach((balance: Balance) => {
          const totalBalance = parseFloat(balance.free) + parseFloat(balance.locked);
          if (isNaN(totalBalance) || totalBalance <= 0) return; 
          
          let valueInUsdt = 0;
          const asset = balance.asset;

          if (cashAssets.includes(asset)) { 
              valueInUsdt = totalBalance;
              cb += valueInUsdt;
          } else {
              // Use the passed tickerMap for lookups
              let price = tickerMap.get(asset + 'USDT');
              if (price) {
                  valueInUsdt = totalBalance * price;
              } else {
                  price = tickerMap.get(asset + 'BTC');
                  if (price && btcUsdtPrice) {
                      valueInUsdt = totalBalance * price * btcUsdtPrice;
                  } else {
                       price = tickerMap.get(asset + 'ETH');
                       if (price && ethUsdtPrice) {
                           valueInUsdt = totalBalance * price * ethUsdtPrice;
                       } else {
                           price = tickerMap.get(asset + 'BNB');
                           if (price && bnbUsdtPrice) {
                               valueInUsdt = totalBalance * price * bnbUsdtPrice;
                           } else {
                               if (totalBalance > 0.0001) {
                                  // console.debug(`PortfolioCard: Could not find price route for ${asset} (balance: ${totalBalance})`);
                               }
                               valueInUsdt = 0; 
                           }
                       }
                  }
              }
          }
          tv += valueInUsdt; 
      });
      return { totalValue: tv, cashBalance: cb };
  }, [accountInfo]); 

  const investedValue = totalValue - cashBalance;

  if (isLoading) {
    // ... loading state ...
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

  if (!accountInfo) {
    // ... no data state ...
    return (
      <div className="dashboard-card portfolio-card">
         <div className="card-header">
          <h2 className="card-title">
            <span className="card-icon">💼</span>
            Portfolio
          </h2>
        </div>
        <div className="card-body">
          <div className="no-data">Portfolio data unavailable. Check API Keys?</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card portfolio-card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-icon">💼</span>
          Portfolio
        </h2>
      </div>
      
      <div className="card-body">
        <div className="portfolio-overview">
          <div className="portfolio-metric">
            <div className="metric-value">
              {formatCurrency(totalValue)}
            </div>
            <div className="metric-label">Total Value (est. USDT)</div>
          </div>
          
          <div className="portfolio-metric">
            <div className="metric-value">
              {formatCurrency(cashBalance)}
            </div>
            <div className="metric-label">Cash Balance (est. USDT)</div>
          </div>
          
          <div className="portfolio-metric">
            <div className="metric-value">
              {formatCurrency(investedValue)}
            </div>
            <div className="metric-label">Invested (est. USDT)</div>
          </div>
        </div>
                
        <h3 className="positions-heading">Current Positions</h3>
        <PositionsGrid 
          balances={accountInfo?.balances || []} 
          tickerMap={tickerMap} // Pass map directly
          isLoading={isLoading} 
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default PortfolioCard; 