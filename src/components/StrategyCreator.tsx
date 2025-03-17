import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Strategy,
  StrategyType,
  StrategyStatus,
  ExecutionMode,
  ParameterDefinition,
  ParameterType,
  ParameterValue
} from '../types/strategy';
import { 
  fetchStrategyById, 
  createStrategy, 
  updateStrategy,
  mockStrategies
} from '../services/strategyMockData';
import '../styles/StrategyCreator.css';

// Default parameter values based on type
const getDefaultParameterValue = (type: ParameterType): any => {
  switch (type) {
    case ParameterType.NUMBER:
      return 0;
    case ParameterType.BOOLEAN:
      return false;
    case ParameterType.STRING:
      return '';
    case ParameterType.ARRAY:
      return [];
    case ParameterType.OBJECT:
      return {};
    case ParameterType.ENUM:
      return '';
    case ParameterType.TIMEFRAME:
      return '';
    default:
      return null;
  }
};

// Parameter templates for each strategy type
const getParameterTemplates = (type: StrategyType): ParameterDefinition[] => {
  switch (type) {
    case StrategyType.TECHNICAL:
      return [
        {
          id: 'shortPeriod',
          name: 'Short Period',
          description: 'Number of candles for short period calculation',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 9,
          min: 2,
          max: 50
        },
        {
          id: 'longPeriod',
          name: 'Long Period',
          description: 'Number of candles for long period calculation',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 21,
          min: 5,
          max: 200
        },
        {
          id: 'signalThreshold',
          name: 'Signal Threshold',
          description: 'Threshold for signal generation',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 0.5,
          min: 0,
          max: 5,
          step: 0.1
        },
        {
          id: 'useVolume',
          name: 'Use Volume',
          description: 'Include volume in calculations',
          type: ParameterType.BOOLEAN,
          required: false,
          defaultValue: false
        }
      ];
    
    case StrategyType.MACHINE_LEARNING:
      return [
        {
          id: 'modelType',
          name: 'Model Type',
          description: 'Type of ML model to use',
          type: ParameterType.STRING,
          required: true,
          defaultValue: 'lstm',
          options: ['lstm', 'regression', 'randomForest', 'xgboost']
        },
        {
          id: 'predictionHorizon',
          name: 'Prediction Horizon',
          description: 'Number of periods to predict ahead',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 1,
          min: 1,
          max: 30
        },
        {
          id: 'confidenceThreshold',
          name: 'Confidence Threshold',
          description: 'Minimum confidence level for signal generation',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 0.7,
          min: 0.5,
          max: 0.99,
          step: 0.01
        },
        {
          id: 'features',
          name: 'Features',
          description: 'List of features to include in the model',
          type: ParameterType.ARRAY,
          required: true,
          defaultValue: ['close', 'volume', 'rsi']
        }
      ];
    
    case StrategyType.NLP:
      return [
        {
          id: 'sources',
          name: 'News Sources',
          description: 'Sources to analyze for sentiment',
          type: ParameterType.ARRAY,
          required: true,
          defaultValue: ['twitter', 'news', 'reddit']
        },
        {
          id: 'sentimentThreshold',
          name: 'Sentiment Threshold',
          description: 'Threshold for positive/negative sentiment',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 0.6,
          min: 0.1,
          max: 0.9,
          step: 0.05
        },
        {
          id: 'lookbackPeriod',
          name: 'Lookback Period',
          description: 'Hours of historical data to analyze',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 24,
          min: 1,
          max: 168
        },
        {
          id: 'keywords',
          name: 'Keywords',
          description: 'Keywords to look for in sentiment analysis',
          type: ParameterType.ARRAY,
          required: false,
          defaultValue: []
        }
      ];
    
    case StrategyType.HYBRID:
      return [
        {
          id: 'technicalWeight',
          name: 'Technical Weight',
          description: 'Weight for technical analysis signals',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 0.5,
          min: 0,
          max: 1,
          step: 0.05
        },
        {
          id: 'sentimentWeight',
          name: 'Sentiment Weight',
          description: 'Weight for sentiment analysis signals',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 0.3,
          min: 0,
          max: 1,
          step: 0.05
        },
        {
          id: 'mlWeight',
          name: 'ML Weight',
          description: 'Weight for machine learning signals',
          type: ParameterType.NUMBER,
          required: true,
          defaultValue: 0.2,
          min: 0,
          max: 1,
          step: 0.05
        },
        {
          id: 'combinationMethod',
          name: 'Combination Method',
          description: 'Method to combine different signals',
          type: ParameterType.STRING,
          required: true,
          defaultValue: 'weighted',
          options: ['weighted', 'majority', 'threshold']
        }
      ];
    
    default:
      return [];
  }
};

// Initial state for a new strategy
const getInitialStrategy = (): Partial<Strategy> => ({
  name: '',
  description: '',
  type: StrategyType.TECHNICAL,
  status: StrategyStatus.DRAFT,
  executionMode: ExecutionMode.PAPER,
  symbols: ['AAPL'],
  parameterDefinitions: getParameterTemplates(StrategyType.TECHNICAL),
  parameters: []
});

const StrategyCreator: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [strategy, setStrategy] = useState<Partial<Strategy>>(getInitialStrategy());
  const [loading, setLoading] = useState<boolean>(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [symbolInput, setSymbolInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'basic' | 'parameters'>('basic');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Fetch strategy data if editing
  useEffect(() => {
    if (isEditing && id) {
      fetchStrategyById(id)
        .then(response => {
          if (response) {
            setStrategy(response);
          } else {
            setError('Strategy not found');
            setLoading(false);
          }
        })
        .catch(err => {
          setError(`Error loading strategy: ${err.message}`);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, isEditing]);
  
  // Update parameter definitions when strategy type changes
  useEffect(() => {
    if (!isEditing || !loading) {
      const newParamDefs = getParameterTemplates(strategy.type || StrategyType.TECHNICAL);
      
      // Initialize default parameter values
      const newParams: ParameterValue[] = newParamDefs.map(param => ({
        definitionId: param.id,
        value: param.defaultValue !== undefined 
          ? param.defaultValue 
          : getDefaultParameterValue(param.type)
      }));
      
      setStrategy(prev => ({
        ...prev,
        parameterDefinitions: newParamDefs,
        parameters: isEditing ? prev.parameters : newParams
      }));
    }
  }, [strategy.type, isEditing, loading]);
  
  // Handle basic info changes
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStrategy(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle parameter value changes
  const handleParameterChange = (id: string, value: any) => {
    setStrategy(prev => {
      const updatedParams = prev.parameters ? [...prev.parameters] : [];
      const paramIndex = updatedParams.findIndex(p => p.definitionId === id);
      
      if (paramIndex >= 0) {
        updatedParams[paramIndex] = { ...updatedParams[paramIndex], value };
      } else {
        updatedParams.push({ definitionId: id, value });
      }
      
      return {
        ...prev,
        parameters: updatedParams
      };
    });
    
    // Clear validation error when parameter is updated
    if (validationErrors[`param-${id}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`param-${id}`];
        return newErrors;
      });
    }
  };
  
  // Add symbol to strategy
  const handleAddSymbol = () => {
    if (!symbolInput.trim()) return;
    
    // Check if symbol already exists
    if (strategy.symbols?.includes(symbolInput.toUpperCase())) {
      return;
    }
    
    setStrategy(prev => ({
      ...prev,
      symbols: [...(prev.symbols || []), symbolInput.toUpperCase()]
    }));
    setSymbolInput('');
  };
  
  // Remove symbol from strategy
  const handleRemoveSymbol = (symbol: string) => {
    setStrategy(prev => ({
      ...prev,
      symbols: prev.symbols?.filter(s => s !== symbol) || []
    }));
  };
  
  // Validate strategy before saving
  const validateStrategy = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate basic info
    if (!strategy.name) {
      errors.name = 'Name is required';
    }
    
    if (!strategy.description) {
      errors.description = 'Description is required';
    }
    
    if (!strategy.symbols || strategy.symbols.length === 0) {
      errors.symbols = 'At least one symbol is required';
    }
    
    // Validate required parameters
    if (strategy.parameterDefinitions) {
      strategy.parameterDefinitions.forEach(param => {
        if (param.required) {
          const paramValue = strategy.parameters?.find(p => p.definitionId === param.id)?.value;
          if (paramValue === undefined || 
              paramValue === null || 
              (typeof paramValue === 'string' && !paramValue)) {
            errors[`param-${param.id}`] = `${param.name} is required`;
          }
        }
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle strategy save
  const handleSave = async () => {
    if (!validateStrategy()) {
      // Switch to the tab with errors
      const hasBasicErrors = Object.keys(validationErrors).some(key => 
        !key.startsWith('param-')
      );
      
      if (hasBasicErrors) {
        setActiveTab('basic');
      } else {
        setActiveTab('parameters');
      }
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      if (isEditing && id) {
        // Make sure we have a complete Strategy object for update
        const updatedStrategy = {
          ...strategy,
          id: id,
          // Add any missing required fields
          author: strategy.author || 'Current User',
          created: strategy.created || new Date().toISOString(),
          updated: new Date().toISOString()
        } as Strategy;
        
        await updateStrategy(updatedStrategy);
      } else {
        // Create a new strategy with all required fields
        const newStrategy = {
          name: strategy.name || '',
          description: strategy.description || '',
          type: strategy.type || StrategyType.TECHNICAL,
          status: strategy.status || StrategyStatus.DRAFT,
          executionMode: strategy.executionMode || ExecutionMode.PAPER,
          symbols: strategy.symbols || [],
          parameterDefinitions: strategy.parameterDefinitions || [],
          parameters: strategy.parameters || [],
          author: 'Current User',  // TODO: Get from authentication
          performance: {
            totalReturns: 0,
            dailyReturns: 0,
            weeklyReturns: 0,
            monthlyReturns: 0,
            yearlyReturns: 0,
            annualizedReturns: 0,
            winRate: 0,
            profitFactor: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            volatility: 0,
            averageWin: 0,
            averageLoss: 0,
            averageHoldingPeriod: 0,
            successfulTrades: 0,
            totalTrades: 0
          },
          signals: []
        };
        
        await createStrategy(newStrategy);
      }
      
      // Navigate back to strategies list
      navigate('/strategies');
    } catch (err: any) {
      setError(`Failed to save strategy: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle cancel and return to strategies list
  const handleCancel = () => {
    navigate('/strategies');
  };
  
  // Render parameter input based on parameter type
  const renderParameterInput = (param: ParameterDefinition) => {
    const paramValue = strategy.parameters?.find(p => p.definitionId === param.id)?.value;
    const value = paramValue !== undefined ? paramValue : param.defaultValue ?? getDefaultParameterValue(param.type);
    const error = validationErrors[`param-${param.id}`];
    
    switch (param.type) {
      case ParameterType.NUMBER:
        return (
          <div className={`parameter-input-container ${error ? 'has-error' : ''}`}>
            <input
              type="number"
              value={value}
              onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
              min={param.min}
              max={param.max}
              step={param.step || 1}
              className="parameter-input"
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        );
      
      case ParameterType.BOOLEAN:
        return (
          <div className="parameter-input-container">
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleParameterChange(param.id, e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        );
      
      case ParameterType.STRING:
        if (param.options) {
          return (
            <div className={`parameter-input-container ${error ? 'has-error' : ''}`}>
              <select
                value={value}
                onChange={(e) => handleParameterChange(param.id, e.target.value)}
                className="parameter-input"
              >
                {param.options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {error && <div className="error-message">{error}</div>}
            </div>
          );
        } else {
          return (
            <div className={`parameter-input-container ${error ? 'has-error' : ''}`}>
              <input
                type="text"
                value={value}
                onChange={(e) => handleParameterChange(param.id, e.target.value)}
                className="parameter-input"
              />
              {error && <div className="error-message">{error}</div>}
            </div>
          );
        }
      
      case ParameterType.ARRAY:
        return (
          <div className={`parameter-input-container ${error ? 'has-error' : ''}`}>
            <div className="array-input-container">
              <textarea
                value={Array.isArray(value) ? value.join(', ') : ''}
                onChange={(e) => {
                  const arrayValue = e.target.value
                    .split(',')
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
                  handleParameterChange(param.id, arrayValue);
                }}
                className="parameter-input textarea"
                placeholder="Enter comma-separated values"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        );
      
      // Add more cases for other parameter types as needed
      
      default:
        return <div>Unsupported parameter type</div>;
    }
  };
  
  if (loading) {
    return (
      <div className="strategy-creator-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading strategy...</p>
        </div>
      </div>
    );
  }
  
  if (error && !strategy) {
    return (
      <div className="strategy-creator-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/strategies')}>
              Back to Strategies
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="strategy-creator-container">
      <div className="strategy-creator-header">
        <div className="header-left">
          <a href="/strategies" className="back-link">
            &larr; Back to Strategies
          </a>
          <h1>{isEditing ? 'Edit Strategy' : 'Create New Strategy'}</h1>
        </div>
        <div className="header-right">
          <button
            className="button-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="button-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Strategy'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="creator-error-message">
          {error}
        </div>
      )}
      
      <div className="strategy-creator-tabs">
        <button
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Information
        </button>
        <button
          className={`tab-button ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          Parameters
        </button>
      </div>
      
      <div className="strategy-creator-content">
        {activeTab === 'basic' ? (
          <div className="basic-info-tab">
            <div className="form-group">
              <label htmlFor="name">Strategy Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={strategy.name || ''}
                onChange={handleBasicInfoChange}
                className={validationErrors.name ? 'input-error' : ''}
              />
              {validationErrors.name && (
                <div className="error-message">{validationErrors.name}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={strategy.description || ''}
                onChange={handleBasicInfoChange}
                className={validationErrors.description ? 'input-error' : ''}
              />
              {validationErrors.description && (
                <div className="error-message">{validationErrors.description}</div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="type">Strategy Type</label>
                <select
                  id="type"
                  name="type"
                  value={strategy.type}
                  onChange={handleBasicInfoChange}
                >
                  <option value={StrategyType.TECHNICAL}>Technical Analysis</option>
                  <option value={StrategyType.MACHINE_LEARNING}>Machine Learning</option>
                  <option value={StrategyType.NLP}>Natural Language Processing</option>
                  <option value={StrategyType.HYBRID}>Hybrid</option>
                </select>
              </div>
              
              <div className="form-group half-width">
                <label htmlFor="executionMode">Execution Mode</label>
                <select
                  id="executionMode"
                  name="executionMode"
                  value={strategy.executionMode}
                  onChange={handleBasicInfoChange}
                >
                  <option value={ExecutionMode.PAPER}>Paper Trading</option>
                  <option value={ExecutionMode.SEMI_AUTO}>Semi-Automatic</option>
                  <option value={ExecutionMode.FULLY_AUTO}>Fully Automatic</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Trading Symbols *</label>
              
              <div className={`symbols-input-container ${validationErrors.symbols ? 'input-error' : ''}`}>
                <div className="symbols-input-row">
                  <input
                    type="text"
                    value={symbolInput}
                    onChange={e => setSymbolInput(e.target.value.toUpperCase())}
                    placeholder="Enter symbol (e.g., AAPL)"
                    className="symbol-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddSymbol}
                    className="add-symbol-button"
                  >
                    Add
                  </button>
                </div>
                
                {validationErrors.symbols && (
                  <div className="error-message">{validationErrors.symbols}</div>
                )}
                
                <div className="symbols-list">
                  {strategy.symbols?.map(symbol => (
                    <div key={symbol} className="symbol-tag">
                      {symbol}
                      <button
                        type="button"
                        className="remove-symbol-button"
                        onClick={() => handleRemoveSymbol(symbol)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {!isEditing && (
              <div className="form-group">
                <label htmlFor="status">Initial Status</label>
                <select
                  id="status"
                  name="status"
                  value={strategy.status}
                  onChange={handleBasicInfoChange}
                >
                  <option value={StrategyStatus.DRAFT}>Draft</option>
                  <option value={StrategyStatus.ACTIVE}>Active</option>
                  <option value={StrategyStatus.PAUSED}>Paused</option>
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="parameters-tab">
            <div className="parameters-description">
              <p>Configure the parameters for your {strategy.type?.toLowerCase()} strategy. These parameters define how the strategy will generate trading signals.</p>
            </div>
            
            <div className="parameters-grid">
              {strategy.parameterDefinitions?.map((param) => (
                <div key={param.id} className="parameter-card">
                  <h3>{param.name} {param.required && <span className="required-badge">*</span>}</h3>
                  <p className="parameter-description">{param.description}</p>
                  {renderParameterInput(param)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyCreator; 