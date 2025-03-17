import React from 'react';
import { Link } from 'react-router-dom';
import { TradingSignal } from '../../services/mockData';
import '../../styles/Dashboard.css';

interface TradingSignalsCardProps {
  signals: TradingSignal[] | null;
  isLoading: boolean;
  onExecuteSignal: (signal: TradingSignal) => void;
}

const TradingSignalsCard: React.FC<TradingSignalsCardProps> = ({ 
  signals, 
  isLoading, 
  onExecuteSignal 
}) => {
  // Format signal date
  const formatSignalTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">
          <span className="card-icon">🔔</span>
          Trading Signals
        </h3>
        <Link to="/signals" className="view-more">View All</Link>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading signals...</p>
          </div>
        ) : !signals || signals.length === 0 ? (
          <div className="no-data">No trading signals</div>
        ) : (
          <div className="signal-list">
            {signals.slice(0, 5).map((signal) => (
              <div key={`${signal.id}`} className="signal-item">
                <div className="signal-details">
                  <div className="signal-symbol">{signal.symbol}</div>
                  <div className="signal-strategy">{signal.model}</div>
                </div>
                <div className="signal-info">
                  <div className="signal-action">
                    <span className={`badge ${signal.side === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                      {signal.side}
                    </span>
                  </div>
                  <div className="signal-time">{formatSignalTime(signal.timestamp)}</div>
                </div>
                <button 
                  className="action-button"
                  onClick={() => onExecuteSignal(signal)}
                >
                  Execute
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingSignalsCard; 