import React from 'react';
import { SystemStatusData, formatTimeAgo } from '../../services/mockData';

interface SystemStatusCardProps {
  statusData: SystemStatusData | null;
  isLoading: boolean;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ statusData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="dashboard-card system-status-card">
        <div className="card-header">
          <h2>System Status</h2>
        </div>
        <div className="loading">Loading system status...</div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="dashboard-card system-status-card">
        <div className="card-header">
          <h2>System Status</h2>
        </div>
        <div className="no-data">No system status data available</div>
      </div>
    );
  }

  // Format uptime in a human-readable way
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Determine load level class
  const getCpuLoadClass = (load: number): string => {
    if (load < 50) return 'low';
    if (load < 80) return 'medium';
    return 'high';
  };

  const getMemoryLoadClass = (usage: number): string => {
    if (usage < 60) return 'low';
    if (usage < 85) return 'medium';
    return 'high';
  };

  return (
    <div className="dashboard-card system-status-card">
      <div className="card-header">
        <h2>System Status</h2>
      </div>
      
      <div className="status-content">
        <div className="status-summary">
          <div className={`status-indicator ${statusData.status}`}>
            <div className="status-dot"></div>
            <div className="status-text">
              {statusData.status === 'online' ? 'System Online' : 
               statusData.status === 'warning' ? 'System Warning' : 'System Offline'}
            </div>
          </div>
          
          <div className="last-update">
            <div className="update-label">Last updated</div>
            <div className="update-time">{formatTimeAgo(statusData.lastUpdated)}</div>
          </div>
        </div>
        
        <div className="status-details">
          <div className="status-item">
            <div className="status-label">API Connection</div>
            <div className={`status-value ${statusData.apiConnected ? 'connected' : 'disconnected'}`}>
              {statusData.apiConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Database</div>
            <div className={`status-value ${statusData.dbConnected ? 'connected' : 'disconnected'}`}>
              {statusData.dbConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">CPU Load</div>
            <div className="load-bar">
              <div 
                className={`load-fill ${getCpuLoadClass(statusData.cpuLoad)}`}
                style={{ width: `${statusData.cpuLoad}%` }}
              ></div>
              <span>{statusData.cpuLoad}%</span>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Memory Usage</div>
            <div className="load-bar">
              <div 
                className={`load-fill ${getMemoryLoadClass(statusData.memoryUsage)}`}
                style={{ width: `${statusData.memoryUsage}%` }}
              ></div>
              <span>{statusData.memoryUsage}%</span>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Uptime</div>
            <div className="status-value">{formatUptime(statusData.uptime)}</div>
          </div>
        </div>
        
        {statusData.errors.length > 0 && (
          <div className="system-errors">
            <div className="status-label">System Errors</div>
            <ul className="error-list">
              {statusData.errors.map((error, index) => (
                <li key={index} className="error-item">{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="system-controls">
          <button className="system-button">Refresh Data</button>
          <button className="system-button secondary">Clear Cache</button>
          <button className="system-button warning">Reset System</button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusCard; 