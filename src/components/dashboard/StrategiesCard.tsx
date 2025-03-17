import React from 'react';
import { Link } from 'react-router-dom';
import { Strategy } from '../../services/mockData';
import '../../styles/Dashboard.css';

interface StrategiesCardProps {
  strategies: Strategy[] | null;
  isLoading: boolean;
}

const StrategiesCard: React.FC<StrategiesCardProps> = ({ strategies, isLoading }) => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">
          <span className="card-icon">📈</span>
          Trading Strategies
        </h3>
        <Link to="/strategies" className="view-more">Manage Strategies</Link>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading strategies...</p>
          </div>
        ) : !strategies || strategies.length === 0 ? (
          <div className="no-data">No active strategies</div>
        ) : (
          <div className="strategy-list">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="strategy-item">
                <div className="strategy-info">
                  <div className="strategy-name">{strategy.name}</div>
                  <div className="strategy-status">
                    <span className={`badge ${strategy.active ? 'badge-active' : 'badge-paused'}`}>
                      {strategy.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
                <div className="strategy-returns">
                  <div className="return-label">1M RETURN</div>
                  <div className="return-value">+{strategy.performance.returns1M.toFixed(2)}%</div>
                  <div className="return-label">3M RETURN</div>
                  <div className="return-value">+{strategy.performance.returns3M.toFixed(2)}%</div>
                  <div className="return-label">YTD RETURN</div>
                  <div className="return-value">+{strategy.performance.returnsYTD.toFixed(2)}%</div>
                </div>
                
                <div className="strategy-tooltip">
                  <p>{strategy.description}</p>
                  <div className="strategy-tooltip-stats">
                    <div className="tooltip-stat">
                      <span className="tooltip-label">Win Rate:</span>
                      <span className="tooltip-value">{strategy.stats.winRate}%</span>
                    </div>
                    <div className="tooltip-stat">
                      <span className="tooltip-label">Profit Factor:</span>
                      <span className="tooltip-value">{strategy.stats.profitFactor}</span>
                    </div>
                    <div className="tooltip-stat">
                      <span className="tooltip-label">Max Drawdown:</span>
                      <span className="tooltip-value">{strategy.stats.drawdown}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategiesCard; 