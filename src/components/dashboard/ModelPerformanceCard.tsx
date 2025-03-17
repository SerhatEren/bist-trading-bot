import React from 'react';
import { Link } from 'react-router-dom';
import { ModelPerformanceData } from '../../services/mockData';
import '../../styles/Dashboard.css';

interface ModelPerformanceCardProps {
  performanceData: ModelPerformanceData | null;
  isLoading: boolean;
}

const ModelPerformanceCard: React.FC<ModelPerformanceCardProps> = ({ 
  performanceData, 
  isLoading 
}) => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">
          <span className="card-icon">📊</span>
          Model Performance
        </h3>
        <Link to="/models" className="view-more">View Details</Link>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading performance data...</p>
          </div>
        ) : !performanceData ? (
          <div className="no-data">No performance data available</div>
        ) : (
          <div className="performance-metrics">
            <div className="metric-row">
              <div className="metric-row-label">Accuracy</div>
              <div className="metric-row-value">
                {performanceData.overallAccuracy.toFixed(1)}%
              </div>
            </div>
            
            <div className="metric-row">
              <div className="metric-row-label">BULLISH ACCURACY</div>
              <div className="metric-row-value positive-value">
                {performanceData.bullishAccuracy.toFixed(1)}%
              </div>
            </div>
            
            <div className="metric-row">
              <div className="metric-row-label">BEARISH ACCURACY</div>
              <div className="metric-row-value negative-value">
                {performanceData.bearishAccuracy.toFixed(1)}%
              </div>
            </div>
            
            <div className="metric-row">
              <div className="metric-row-label">Total</div>
              <div className="metric-row-value">
                {performanceData.predictions.total}
              </div>
            </div>
            
            <div className="metric-row">
              <div className="metric-row-label">Correct</div>
              <div className="metric-row-value">
                {performanceData.predictions.correct}
              </div>
            </div>
            
            <div className="metric-row">
              <div className="metric-row-label">Accuracy Rate</div>
              <div className="metric-row-value">
                {(performanceData.predictions.correct / performanceData.predictions.total * 100).toFixed(1)}%
              </div>
            </div>
            
            <h4 className="section-title">Recent Predictions</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="symbol-column">Symbol</th>
                  <th className="action-column">Direction</th>
                  <th className="price-column">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.recentPredictions.slice(0, 3).map((prediction, index) => (
                  <tr key={index}>
                    <td className="symbol-column">{prediction.symbol}</td>
                    <td className="action-column">
                      <span className={`badge ${prediction.direction === 'bullish' ? 'badge-buy' : 'badge-sell'}`}>
                        {prediction.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="price-column">{prediction.confidence.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelPerformanceCard; 