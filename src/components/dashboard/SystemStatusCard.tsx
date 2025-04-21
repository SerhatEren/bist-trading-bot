import React from 'react';
import '../../styles/Dashboard.css';

// Helper function (assuming it's defined locally or imported)
// function formatTimeAgo(isoString: string | null): string { ... }

interface SystemStatusData {
    status: string;
    lastCheck?: string | null; // Make lastCheck optional
    // Add other expected fields
}

interface SystemStatusCardProps {
  statusData: SystemStatusData | null;
  isLoading: boolean;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ statusData, isLoading }) => {
  
  // Default values or checks
  const status = statusData?.status || 'Unknown';
  const lastCheckTime = statusData?.lastCheck || null;
  // Placeholder for other potential data
  const checksPassed = statusData ? 'N/A' : '-'; // Example
  const latency = statusData ? 'N/A' : '-'; // Example

  const getStatusClass = (currentStatus: string) => {
    switch (currentStatus?.toLowerCase()) {
      case 'operational':
      case 'connected':
      case 'live':
        return 'status-operational';
      case 'degraded':
      case 'warning':
        return 'status-warning';
      case 'offline':
      case 'disconnected':
      case 'error':
        return 'status-error';
      default:
        return 'status-unknown';
    }
  };

  // Replicate formatTimeAgo locally if not imported, ensure it handles null
  const formatTimeAgo = (isoString: string | null): string => {
      if (!isoString) return 'never';
      try {
          const date = new Date(isoString);
          if (isNaN(date.getTime())) return 'Invalid Date'; // Check for invalid date object
          const now = new Date();
          const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
          const minutes = Math.round(seconds / 60);
          const hours = Math.round(minutes / 60);

          if (seconds < 60) return `${seconds}s ago`;
          if (minutes < 60) return `${minutes}m ago`;
          if (hours < 24) return `${hours}h ago`;
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
          console.error("Error formatting time:", e);
          return "Error";
      }
  };


  return (
    <div className={`dashboard-card system-status-card ${getStatusClass(status)}`}>
      <div className="card-header">
        <h3 className="card-title">
          <span className="card-icon">📡</span>
          System Status
        </h3>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="loading">Loading Status...</div>
        ) : (
          <>
            <div className={`status-indicator ${getStatusClass(status)}`}>{status}</div>
            <div className="status-details">
              <p>Last Check: {formatTimeAgo(lastCheckTime)}</p>
              {/* <p>Checks Passed: {checksPassed}</p>
              <p>API Latency: {latency}</p> */}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SystemStatusCard; 