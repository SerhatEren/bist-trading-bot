import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Strategy, 
  StrategySignal,
  StrategyType,
  StrategyStatus,
  ExecutionMode,
  SignalStrength
} from '../types/strategy';
import { 
  fetchStrategyById, 
  executeStrategy, 
  executeStrategyBacktest,
  deleteStrategy
} from '../services/strategyMockData';
import '../styles/StrategyDetail.css';
import { OrderSide } from '../types/api';

const StrategyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [backtesting, setBacktesting] = useState<boolean>(false);
  const [newSignals, setNewSignals] = useState<StrategySignal[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'parameters' | 'backtest'>('overview');
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

  useEffect(() => {
    const fetchStrategyData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchStrategyById(id);
        if (!data) {
          setError('Strategy not found');
        } else {
          setStrategy(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch strategy');
      } finally {
        setLoading(false);
      }
    };

    fetchStrategyData();
  }, [id]);

  // Execute strategy
  const handleExecute = async () => {
    if (!strategy) return;
    
    setExecuting(true);
    setNewSignals([]);
    
    try {
      const signals = await executeStrategy(strategy.id);
      setNewSignals(signals);
      
      // Update strategy with new signals
      setStrategy(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          signals: [...signals, ...prev.signals],
          lastExecuted: new Date().toISOString()
        };
      });
    } catch (err: any) {
      setError(`Failed to execute strategy: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  // Run backtest
  const handleBacktest = async () => {
    if (!strategy) return;
    
    setBacktesting(true);
    
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const updatedStrategy = await executeStrategyBacktest(
        strategy.id,
        oneMonthAgo.toISOString(),
        new Date().toISOString()
      );
      
      setStrategy(updatedStrategy);
      setActiveTab('backtest');
    } catch (err: any) {
      setError(`Failed to run backtest: ${err.message}`);
    } finally {
      setBacktesting(false);
    }
  };

  // Delete strategy
  const handleDelete = async () => {
    if (!strategy) return;
    
    try {
      await deleteStrategy(strategy.id);
      navigate('/strategies');
    } catch (err: any) {
      setError(`Failed to delete strategy: ${err.message}`);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: StrategyStatus) => {
    const classMap = {
      [StrategyStatus.ACTIVE]: 'badge-active',
      [StrategyStatus.PAUSED]: 'badge-paused',
      [StrategyStatus.BACKTEST]: 'badge-backtest',
      [StrategyStatus.DRAFT]: 'badge-draft',
      [StrategyStatus.ARCHIVED]: 'badge-archived',
    };

    return <span className={`strategy-badge ${classMap[status]}`}>{status}</span>;
  };

  // Render execution mode badge
  const renderExecutionModeBadge = (mode: ExecutionMode) => {
    const classMap = {
      [ExecutionMode.PAPER]: 'badge-paper',
      [ExecutionMode.SEMI_AUTO]: 'badge-semi-auto',
      [ExecutionMode.FULLY_AUTO]: 'badge-auto',
    };

    return <span className={`strategy-badge ${classMap[mode]}`}>{mode}</span>;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format performance number
  const formatPerformance = (value: number, asPercent: boolean = false) => {
    return asPercent
      ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
      : value.toFixed(2);
  };

  // Render signal strength
  const renderSignalStrength = (strength: SignalStrength) => {
    const classMap = {
      [SignalStrength.WEAK]: 'strength-weak',
      [SignalStrength.MODERATE]: 'strength-moderate',
      [SignalStrength.STRONG]: 'strength-strong',
      [SignalStrength.VERY_STRONG]: 'strength-very-strong',
    };

    return <span className={`signal-strength ${classMap[strength]}`}>{strength}</span>;
  };

  // Loading state
  if (loading) {
    return (
      <div className="strategy-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading strategy...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="strategy-detail-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/strategies')}>Back to Strategies</button>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // No strategy found
  if (!strategy) {
    return (
      <div className="strategy-detail-container">
        <div className="error-container">
          <h2>Strategy Not Found</h2>
          <p>The requested strategy could not be found.</p>
          <button onClick={() => navigate('/strategies')}>Back to Strategies</button>
        </div>
      </div>
    );
  }

  return (
    <div className="strategy-detail-container">
      <div className="strategy-detail-header">
        <div className="header-left">
          <Link to="/strategies" className="back-link">
            &larr; Back to Strategies
          </Link>
          <h1>{strategy.name}</h1>
          <div className="strategy-badges">
            <span className={`strategy-badge badge-${strategy.type.toLowerCase()}`}>
              {strategy.type}
            </span>
            {renderStatusBadge(strategy.status)}
            {renderExecutionModeBadge(strategy.executionMode)}
          </div>
        </div>
        <div className="header-right">
          <Link to={`/strategies/${strategy.id}/edit`} className="button-secondary">
            Edit Strategy
          </Link>
          <button 
            className="button-primary"
            onClick={handleExecute}
            disabled={executing || strategy.status !== StrategyStatus.ACTIVE}
          >
            {executing ? 'Executing...' : 'Execute Strategy'}
          </button>
          <button 
            className="button-secondary"
            onClick={handleBacktest}
            disabled={backtesting}
          >
            {backtesting ? 'Running...' : 'Run Backtest'}
          </button>
          <button 
            className="button-danger"
            onClick={() => setDeleteConfirmation(true)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="strategy-description">
        <p>{strategy.description}</p>
      </div>

      <div className="strategy-detail-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'signals' ? 'active' : ''}`}
          onClick={() => setActiveTab('signals')}
        >
          Signals ({strategy.signals.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          Parameters
        </button>
        <button 
          className={`tab-button ${activeTab === 'backtest' ? 'active' : ''}`}
          onClick={() => setActiveTab('backtest')}
          disabled={!strategy.backtestResults}
        >
          Backtest Results
        </button>
      </div>

      <div className="strategy-detail-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-section">
              <div className="info-row">
                <span className="info-label">Author</span>
                <span className="info-value">{strategy.author}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Created</span>
                <span className="info-value">{formatDate(strategy.created)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Updated</span>
                <span className="info-value">{formatDate(strategy.updated)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Executed</span>
                <span className="info-value">
                  {strategy.lastExecuted ? formatDate(strategy.lastExecuted) : 'Never'}
                </span>
              </div>
            </div>

            <div className="performance-section">
              <h2>Performance Metrics</h2>
              <div className="performance-grid">
                <div className="performance-card">
                  <span className="metric-label">Win Rate</span>
                  <span className="metric-value">{strategy.performance.winRate.toFixed(1)}%</span>
                </div>
                <div className="performance-card">
                  <span className="metric-label">Profit Factor</span>
                  <span className="metric-value">{strategy.performance.profitFactor}</span>
                </div>
                <div className="performance-card">
                  <span className="metric-label">Daily Returns</span>
                  <span className={`metric-value ${strategy.performance.dailyReturns >= 0 ? 'positive' : 'negative'}`}>
                    {formatPerformance(strategy.performance.dailyReturns, true)}
                  </span>
                </div>
                <div className="performance-card">
                  <span className="metric-label">Weekly Returns</span>
                  <span className={`metric-value ${strategy.performance.weeklyReturns >= 0 ? 'positive' : 'negative'}`}>
                    {formatPerformance(strategy.performance.weeklyReturns, true)}
                  </span>
                </div>
                <div className="performance-card">
                  <span className="metric-label">Monthly Returns</span>
                  <span className={`metric-value ${strategy.performance.monthlyReturns >= 0 ? 'positive' : 'negative'}`}>
                    {formatPerformance(strategy.performance.monthlyReturns, true)}
                  </span>
                </div>
                <div className="performance-card">
                  <span className="metric-label">Yearly Returns</span>
                  <span className={`metric-value ${strategy.performance.yearlyReturns >= 0 ? 'positive' : 'negative'}`}>
                    {formatPerformance(strategy.performance.yearlyReturns, true)}
                  </span>
                </div>
                <div className="performance-card">
                  <span className="metric-label">Max Drawdown</span>
                  <span className="metric-value">{formatPerformance(strategy.performance.maxDrawdown, true)}</span>
                </div>
                <div className="performance-card">
                  <span className="metric-label">Sharpe Ratio</span>
                  <span className="metric-value">{strategy.performance.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="performance-card">
                  <span className="metric-label">Total Trades</span>
                  <span className="metric-value">{strategy.performance.totalTrades}</span>
                </div>
                <div className="performance-card">
                  <span className="metric-label">Successful Trades</span>
                  <span className="metric-value">{strategy.performance.successfulTrades}</span>
                </div>
              </div>
            </div>

            <div className="symbols-section">
              <h2>Trading Symbols</h2>
              <div className="symbols-list">
                {strategy.symbols.map(symbol => (
                  <span key={symbol} className="symbol-tag">{symbol}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="signals-tab">
            {newSignals.length > 0 && (
              <div className="new-signals-section">
                <h2>New Signals</h2>
                <div className="signals-grid">
                  {newSignals.map(signal => (
                    <div key={signal.id} className="signal-card new-signal">
                      <div className="signal-header">
                        <div className="signal-symbol-container">
                          <span className="signal-symbol">{signal.symbol}</span>
                          <span className={`signal-side ${signal.side.toLowerCase()}`}>
                            {signal.side}
                          </span>
                        </div>
                        {renderSignalStrength(signal.strength)}
                      </div>
                      <div className="signal-body">
                        <div className="signal-info">
                          <span className="info-label">Current Price</span>
                          <span className="info-value">${signal.price.toFixed(2)}</span>
                        </div>
                        <div className="signal-info">
                          <span className="info-label">Target Price</span>
                          <span className="info-value">${signal.targetPrice?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="signal-info">
                          <span className="info-label">Stop Price</span>
                          <span className="info-value">${signal.stopPrice?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="signal-info">
                          <span className="info-label">Confidence</span>
                          <span className="info-value">{(signal.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="signal-info">
                          <span className="info-label">Generated</span>
                          <span className="info-value">{formatDate(signal.timestamp)}</span>
                        </div>
                      </div>
                      <div className="signal-footer">
                        <button className="button-primary">Execute</button>
                        <button className="button-secondary">Ignore</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2>Signal History</h2>
            {strategy.signals.length === 0 ? (
              <div className="no-signals">
                <p>No signals have been generated by this strategy yet.</p>
                {strategy.status === StrategyStatus.ACTIVE && (
                  <button 
                    className="button-primary"
                    onClick={handleExecute}
                    disabled={executing}
                  >
                    {executing ? 'Executing...' : 'Execute Now'}
                  </button>
                )}
              </div>
            ) : (
              <div className="signals-table-container">
                <table className="signals-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Symbol</th>
                      <th>Side</th>
                      <th>Strength</th>
                      <th>Price</th>
                      <th>Target</th>
                      <th>Stop</th>
                      <th>Status</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategy.signals.map(signal => (
                      <tr key={signal.id}>
                        <td>{formatDate(signal.timestamp)}</td>
                        <td>{signal.symbol}</td>
                        <td className={`side-${signal.side.toLowerCase()}`}>{signal.side}</td>
                        <td>{signal.strength}</td>
                        <td>${signal.price.toFixed(2)}</td>
                        <td>${signal.targetPrice?.toFixed(2) || '-'}</td>
                        <td>${signal.stopPrice?.toFixed(2) || '-'}</td>
                        <td>
                          <span className={`status-badge ${signal.executed ? 'executed' : 'pending'}`}>
                            {signal.executed ? 'Executed' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          {signal.result ? (
                            <span className={`result-badge ${signal.result.profitable ? 'profit' : 'loss'}`}>
                              {signal.result.profitable ? '+' : '-'}${Math.abs(signal.result.profit).toFixed(2)}
                              <span className="result-percent">
                                ({signal.result.profitPercent > 0 ? '+' : ''}{signal.result.profitPercent.toFixed(2)}%)
                              </span>
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'parameters' && (
          <div className="parameters-tab">
            <h2>Strategy Parameters</h2>
            <div className="parameters-grid">
              {strategy.parameters.map((param, index) => {
                // Find the parameter definition
                const definition = strategy.parameterDefinitions.find(
                  def => def.id === param.definitionId
                );
                
                if (!definition) return null;
                
                return (
                  <div key={index} className="parameter-card">
                    <h3>{definition.name}</h3>
                    <p className="parameter-description">{definition.description}</p>
                    <div className="parameter-value-container">
                      <span className="parameter-label">Value:</span>
                      <span className="parameter-value">
                        {definition.type === 'BOOLEAN'
                          ? param.value ? 'Yes' : 'No'
                          : param.value.toString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'backtest' && (
          <div className="backtest-tab">
            {strategy.backtestResults ? (
              <>
                <div className="backtest-info">
                  <h2>Backtest Results</h2>
                  <div className="backtest-period">
                    <span className="info-label">Test Period:</span>
                    <span className="info-value">
                      {formatDate(strategy.backtestResults.startDate)} to {formatDate(strategy.backtestResults.endDate)}
                    </span>
                  </div>
                </div>

                <div className="backtest-performance">
                  <h3>Performance Metrics</h3>
                  <div className="performance-grid">
                    <div className="performance-card">
                      <span className="metric-label">Total Returns</span>
                      <span className={`metric-value ${strategy.backtestResults.performance.totalReturns >= 0 ? 'positive' : 'negative'}`}>
                        {formatPerformance(strategy.backtestResults.performance.totalReturns, true)}
                      </span>
                    </div>
                    <div className="performance-card">
                      <span className="metric-label">Win Rate</span>
                      <span className="metric-value">{strategy.backtestResults.performance.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="performance-card">
                      <span className="metric-label">Profit Factor</span>
                      <span className="metric-value">{strategy.backtestResults.performance.profitFactor}</span>
                    </div>
                    <div className="performance-card">
                      <span className="metric-label">Max Drawdown</span>
                      <span className="metric-value">{formatPerformance(strategy.backtestResults.performance.maxDrawdown, true)}</span>
                    </div>
                    <div className="performance-card">
                      <span className="metric-label">Sharpe Ratio</span>
                      <span className="metric-value">{strategy.backtestResults.performance.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div className="performance-card">
                      <span className="metric-label">Total Trades</span>
                      <span className="metric-value">{strategy.backtestResults.performance.totalTrades}</span>
                    </div>
                  </div>
                </div>

                <div className="backtest-comparison">
                  <h3>Comparison with Live Performance</h3>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Backtest</th>
                        <th>Live</th>
                        <th>Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Win Rate</td>
                        <td>{strategy.backtestResults.performance.winRate.toFixed(1)}%</td>
                        <td>{strategy.performance.winRate.toFixed(1)}%</td>
                        <td className={strategy.backtestResults.performance.winRate >= strategy.performance.winRate ? 'positive' : 'negative'}>
                          {(strategy.backtestResults.performance.winRate - strategy.performance.winRate).toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td>Profit Factor</td>
                        <td>{strategy.backtestResults.performance.profitFactor.toFixed(2)}</td>
                        <td>{strategy.performance.profitFactor.toFixed(2)}</td>
                        <td className={strategy.backtestResults.performance.profitFactor >= strategy.performance.profitFactor ? 'positive' : 'negative'}>
                          {(strategy.backtestResults.performance.profitFactor - strategy.performance.profitFactor).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>Max Drawdown</td>
                        <td>{strategy.backtestResults.performance.maxDrawdown.toFixed(2)}%</td>
                        <td>{strategy.performance.maxDrawdown.toFixed(2)}%</td>
                        <td className={strategy.backtestResults.performance.maxDrawdown <= strategy.performance.maxDrawdown ? 'positive' : 'negative'}>
                          {(strategy.backtestResults.performance.maxDrawdown - strategy.performance.maxDrawdown).toFixed(2)}%
                        </td>
                      </tr>
                      <tr>
                        <td>Sharpe Ratio</td>
                        <td>{strategy.backtestResults.performance.sharpeRatio.toFixed(2)}</td>
                        <td>{strategy.performance.sharpeRatio.toFixed(2)}</td>
                        <td className={strategy.backtestResults.performance.sharpeRatio >= strategy.performance.sharpeRatio ? 'positive' : 'negative'}>
                          {(strategy.backtestResults.performance.sharpeRatio - strategy.performance.sharpeRatio).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="no-backtest">
                <p>No backtest results available for this strategy.</p>
                <button 
                  className="button-primary"
                  onClick={handleBacktest}
                  disabled={backtesting}
                >
                  {backtesting ? 'Running Backtest...' : 'Run Backtest'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteConfirmation && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h2>Delete Strategy</h2>
            <p>Are you sure you want to delete "{strategy.name}"? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button 
                className="button-secondary"
                onClick={() => setDeleteConfirmation(false)}
              >
                Cancel
              </button>
              <button 
                className="button-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyDetail; 