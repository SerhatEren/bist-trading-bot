import React from 'react';
import { Portfolio } from '../../types/api';
import './DashboardStyles.css';

interface PortfolioOverviewProps {
  portfolio: Portfolio | null;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolio }) => {
  if (!portfolio) {
    return <div className="no-data">Portföy bilgileri bulunamadı</div>;
  }

  const totalPositionValue = portfolio.positions.reduce(
    (total, position) => total + position.marketValue,
    0
  );

  const totalPnL = portfolio.positions.reduce(
    (total, position) => total + position.unrealizedPnl,
    0
  );

  const pnlPercentage = (totalPnL / (totalPositionValue - totalPnL)) * 100 || 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="portfolio-overview-card">
      <h2>Portföy Özeti</h2>
      
      <div className="portfolio-summary">
        <div className="summary-item">
          <span className="summary-label">Toplam Varlık:</span>
          <span className="summary-value">{formatCurrency(portfolio.totalEquity)}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">Nakit:</span>
          <span className="summary-value">{formatCurrency(portfolio.cash)}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">Pozisyon Değeri:</span>
          <span className="summary-value">{formatCurrency(totalPositionValue)}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">Kar/Zarar:</span>
          <span className={`summary-value ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(totalPnL)} ({pnlPercentage.toFixed(2)}%)
          </span>
        </div>
      </div>
      
      <h3>Pozisyonlar</h3>
      {portfolio.positions.length === 0 ? (
        <div className="no-data">Açık pozisyon bulunmamaktadır</div>
      ) : (
        <table className="positions-table">
          <thead>
            <tr>
              <th>Hisse</th>
              <th>Miktar</th>
              <th>Ortalama Maliyet</th>
              <th>Güncel Değer</th>
              <th>Kar/Zarar</th>
              <th>Kar/Zarar %</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.positions.map(position => (
              <tr key={position.symbol}>
                <td>{position.symbol}</td>
                <td>{position.quantity}</td>
                <td>{formatCurrency(position.averageCost)}</td>
                <td>{formatCurrency(position.marketValue)}</td>
                <td className={position.unrealizedPnl >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(position.unrealizedPnl)}
                </td>
                <td className={position.unrealizedPnlPercentage >= 0 ? 'positive' : 'negative'}>
                  {position.unrealizedPnlPercentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PortfolioOverview; 