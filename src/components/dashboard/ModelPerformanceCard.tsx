import React from 'react';
import { Link } from 'react-router-dom';
import { ModelPerformanceData } from '../../services/mockData';
import '../../styles/Dashboard.css';
import { PieChartPlaceholder, LineChartPlaceholder } from '../ChartPlaceholders';

interface ModelPerformanceCardProps {
  performanceData: ModelPerformanceData | null;
  isLoading: boolean;
}

const ModelPerformanceCard: React.FC<ModelPerformanceCardProps> = ({ 
  performanceData, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Model Performance</h2>
        </div>
        <div className="loading">Loading performance data...</div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Model Performance</h2>
        </div>
        <div className="no-data">Performance data unavailable.</div>
      </div>
    );
  }

  const accuracy = performanceData.overallAccuracy ?? 0;
  const winRate = performanceData.winRate ?? 0;
  const profitFactor = performanceData.profitFactor ?? 0;
  const avgGain = performanceData.averageGain ?? 0;
  const avgLoss = performanceData.averageLoss ?? 0;

  return (
    <div className="dashboard-card model-performance-card">
      <div className="card-header">
        <h3 className="card-title">
          <span className="card-icon">🎯</span>
          Model Performance
        </h3>
        <Link to="/models" className="view-more">View Details</Link>
      </div>
      <div className="card-body">
        <div className="chart-area" style={{ height: '100px', marginBottom: '15px' }}>
          <PieChartPlaceholder />
        </div>
        <div className="performance-metrics">
          <div className="metric-item">
            <span className="metric-label">Accuracy:</span>
            <span className="metric-value">{accuracy.toFixed(2)}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Win Rate:</span>
            <span className="metric-value">{(winRate * 100).toFixed(2)}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Profit Factor:</span>
            <span className="metric-value">{profitFactor.toFixed(2)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg Gain:</span>
            <span className="metric-value">{avgGain.toFixed(2)}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg Loss:</span>
            <span className="metric-value">{avgLoss.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceCard; 