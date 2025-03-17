import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchAllStrategies, 
  executeStrategy,
  executeStrategyBacktest
} from '../services/strategyMockData';
import { 
  Strategy, 
  StrategyStatus, 
  StrategyType, 
  ExecutionMode,
  StrategySignal
} from '../types/strategy';
import '../styles/Strategies.css';

const Strategies: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    type: StrategyType | 'ALL';
    status: StrategyStatus | 'ALL';
    search: string;
  }>({
    type: 'ALL',
    status: 'ALL',
    search: '',
  });
  const [executingStrategy, setExecutingStrategy] = useState<string | null>(null);
  const [backtestingStrategy, setBacktestingStrategy] = useState<string | null>(null);
  const [newSignals, setNewSignals] = useState<{[key: string]: StrategySignal[]}>({});

  // Fetch strategies from API
  useEffect(() => {
    const getStrategies = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllStrategies();
        setStrategies(data);
        setFilteredStrategies(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch strategies');
      } finally {
        setLoading(false);
      }
    };

    getStrategies();
  }, []);

  // Filter strategies based on active filters
  useEffect(() => {
    let filtered = [...strategies];

    // Filter by type
    if (activeFilters.type !== 'ALL') {
      filtered = filtered.filter((s) => s.type === activeFilters.type);
    }

    // Filter by status
    if (activeFilters.status !== 'ALL') {
      filtered = filtered.filter((s) => s.status === activeFilters.status);
    }

    // Filter by search term
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm) ||
          s.description.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredStrategies(filtered);
  }, [activeFilters, strategies]);

  // Handle filter changes
  const handleFilterChange = (filter: 'type' | 'status', value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filter]: value,
    }));
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  // Execute a strategy
  const handleExecuteStrategy = async (strategyId: string) => {
    setExecutingStrategy(strategyId);
    setNewSignals({});
    
    try {
      const signals = await executeStrategy(strategyId);
      setNewSignals({ [strategyId]: signals });
      
      // Update the strategy in the state with new signals
      setStrategies(prev => 
        prev.map(s => {
          if (s.id === strategyId) {
            return {
              ...s,
              signals: [...signals, ...s.signals],
              lastExecuted: new Date().toISOString()
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      setError(`Failed to execute strategy: ${err.message}`);
    } finally {
      setExecutingStrategy(null);
    }
  };

  // Run a backtest for a strategy
  const handleBacktest = async (strategyId: string) => {
    setBacktestingStrategy(strategyId);
    
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const updatedStrategy = await executeStrategyBacktest(
        strategyId,
        oneMonthAgo.toISOString(),
        new Date().toISOString()
      );
      
      // Update the strategy in the state with backtest results
      setStrategies(prev => 
        prev.map(s => s.id === strategyId ? updatedStrategy : s)
      );
    } catch (err: any) {
      setError(`Failed to run backtest: ${err.message}`);
    } finally {
      setBacktestingStrategy(null);
    }
  };

  // Render the strategy type badge
  const renderTypeBadge = (type: StrategyType) => {
    const classMap = {
      [StrategyType.TECHNICAL]: 'badge-technical',
      [StrategyType.MACHINE_LEARNING]: 'badge-ml',
      [StrategyType.NLP]: 'badge-nlp',
      [StrategyType.HYBRID]: 'badge-hybrid',
    };

    return <span className={`strategy-badge ${classMap[type]}`}>{type}</span>;
  };

  // Render the strategy status badge
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

  // Format performance metric
  const formatPerformance = (value: number, asPercent: boolean = false) => {
    return asPercent
      ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
      : value.toFixed(2);
  };

  // Loading state
  if (loading) {
    return (
      <div className="strategies-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading strategies...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="strategies-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="strategies-container">
      <div className="strategies-header">
        <h1>Trading Strategies</h1>
        <div className="strategies-actions">
          <Link to="/strategies/new" className="button-primary">
            Create New Strategy
          </Link>
        </div>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Type:</label>
          <select
            value={activeFilters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="ALL">All Types</option>
            {Object.values(StrategyType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={activeFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(StrategyStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group search-group">
          <input
            type="text"
            placeholder="Search strategies..."
            value={activeFilters.search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {filteredStrategies.length === 0 ? (
        <div className="no-strategies">
          <p>No strategies found matching your filters.</p>
          {activeFilters.type !== 'ALL' || activeFilters.status !== 'ALL' || activeFilters.search ? (
            <button
              onClick={() =>
                setActiveFilters({ type: 'ALL', status: 'ALL', search: '' })
              }
            >
              Clear Filters
            </button>
          ) : (
            <Link to="/strategies/new" className="button-primary">
              Create Your First Strategy
            </Link>
          )}
        </div>
      ) : (
        <div className="strategies-list">
          {filteredStrategies.map((strategy) => (
            <div key={strategy.id} className="strategy-card">
              <div className="strategy-header">
                <div className="strategy-badges">
                  {renderTypeBadge(strategy.type)}
                  {renderStatusBadge(strategy.status)}
                  {renderExecutionModeBadge(strategy.executionMode)}
                </div>
                <h2 className="strategy-name">{strategy.name}</h2>
                <p className="strategy-description">{strategy.description}</p>
              </div>

              <div className="strategy-performance">
                <div className="performance-metric">
                  <span className="metric-label">Win Rate</span>
                  <span className="metric-value">{strategy.performance.winRate.toFixed(1)}%</span>
                </div>
                <div className="performance-metric">
                  <span className="metric-label">Profit Factor</span>
                  <span className="metric-value">{strategy.performance.profitFactor}</span>
                </div>
                <div className="performance-metric">
                  <span className="metric-label">Monthly</span>
                  <span className={`metric-value ${strategy.performance.monthlyReturns >= 0 ? 'positive' : 'negative'}`}>
                    {formatPerformance(strategy.performance.monthlyReturns, true)}
                  </span>
                </div>
                <div className="performance-metric">
                  <span className="metric-label">Yearly</span>
                  <span className={`metric-value ${strategy.performance.yearlyReturns >= 0 ? 'positive' : 'negative'}`}>
                    {formatPerformance(strategy.performance.yearlyReturns, true)}
                  </span>
                </div>
              </div>

              {newSignals[strategy.id] && newSignals[strategy.id].length > 0 && (
                <div className="new-signals-container">
                  <h3>New Signals Generated</h3>
                  <div className="signals-list">
                    {newSignals[strategy.id].map(signal => (
                      <div key={signal.id} className="signal-item">
                        <div className="signal-details">
                          <span className={`signal-side ${signal.side.toLowerCase()}`}>
                            {signal.side}
                          </span>
                          <span className="signal-symbol">{signal.symbol}</span>
                          <span className="signal-price">${signal.price.toFixed(2)}</span>
                        </div>
                        <div className="signal-confidence">
                          Confidence: {(signal.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="strategy-actions">
                <Link to={`/strategies/${strategy.id}`} className="button-secondary">
                  View Details
                </Link>
                <Link to={`/strategies/${strategy.id}/edit`} className="button-secondary">
                  Edit
                </Link>
                <button
                  className="button-primary"
                  onClick={() => handleExecuteStrategy(strategy.id)}
                  disabled={executingStrategy === strategy.id || strategy.status !== StrategyStatus.ACTIVE}
                >
                  {executingStrategy === strategy.id ? 'Executing...' : 'Execute'}
                </button>
                <button
                  className="button-secondary"
                  onClick={() => handleBacktest(strategy.id)}
                  disabled={backtestingStrategy === strategy.id}
                >
                  {backtestingStrategy === strategy.id ? 'Running...' : 'Backtest'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Strategies; 