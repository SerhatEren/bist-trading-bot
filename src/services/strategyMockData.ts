import { 
  Strategy, 
  StrategyType, 
  StrategyStatus, 
  ExecutionMode, 
  SignalStrength, 
  ParameterType,
  StrategySignal,
  ParameterDefinition,
  ParameterValue
} from '../types/strategy';
import { OrderSide } from '../types/api';

// Helper function to generate random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper function to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to generate random date within a range
const randomDate = (start: Date, end: Date = new Date()): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Helper to generate random float within a range, formatted to specified decimals
const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

// Create mock parameter definitions for each strategy type
const createTechnicalParameterDefinitions = (): ParameterDefinition[] => {
  return [
    {
      id: 'shortPeriod',
      name: 'Short Period',
      description: 'The short-term period for moving average calculation',
      type: ParameterType.NUMBER,
      defaultValue: 9,
      min: 2,
      max: 50,
      step: 1,
      required: true
    },
    {
      id: 'longPeriod',
      name: 'Long Period',
      description: 'The long-term period for moving average calculation',
      type: ParameterType.NUMBER,
      defaultValue: 20,
      min: 5,
      max: 200,
      step: 1,
      required: true
    },
    {
      id: 'signalPeriod',
      name: 'Signal Period',
      description: 'The signal period for MACD calculation',
      type: ParameterType.NUMBER,
      defaultValue: 9,
      min: 3,
      max: 50,
      step: 1,
      required: true
    },
    {
      id: 'overboughtLevel',
      name: 'Overbought Level',
      description: 'The RSI level considered overbought',
      type: ParameterType.NUMBER,
      defaultValue: 70,
      min: 50,
      max: 90,
      step: 1,
      required: true
    },
    {
      id: 'oversoldLevel',
      name: 'Oversold Level',
      description: 'The RSI level considered oversold',
      type: ParameterType.NUMBER,
      defaultValue: 30,
      min: 10,
      max: 50,
      step: 1,
      required: true
    },
    {
      id: 'useVolumeFilter',
      name: 'Use Volume Filter',
      description: 'Whether to use volume as an additional filter',
      type: ParameterType.BOOLEAN,
      defaultValue: true,
      required: false
    }
  ];
};

const createMLParameterDefinitions = (): ParameterDefinition[] => {
  return [
    {
      id: 'modelType',
      name: 'Model Type',
      description: 'The type of machine learning model to use',
      type: ParameterType.ENUM,
      defaultValue: 'LSTM',
      options: ['LSTM', 'GRU', 'RandomForest', 'XGBoost', 'CNN'],
      required: true
    },
    {
      id: 'predictionHorizon',
      name: 'Prediction Horizon',
      description: 'The timeframe to predict ahead',
      type: ParameterType.TIMEFRAME,
      defaultValue: '1d',
      options: ['1h', '4h', '1d', '3d', '1w'],
      required: true
    },
    {
      id: 'confidenceThreshold',
      name: 'Confidence Threshold',
      description: 'Minimum confidence level to generate signals',
      type: ParameterType.NUMBER,
      defaultValue: 0.7,
      min: 0.5,
      max: 0.95,
      step: 0.05,
      required: true
    },
    {
      id: 'featureWindow',
      name: 'Feature Window',
      description: 'Number of historical days to use for features',
      type: ParameterType.NUMBER,
      defaultValue: 30,
      min: 5,
      max: 90,
      step: 1,
      required: true
    }
  ];
};

const createNLPParameterDefinitions = (): ParameterDefinition[] => {
  return [
    {
      id: 'sentimentThreshold',
      name: 'Sentiment Threshold',
      description: 'Threshold for sentiment to trigger signals',
      type: ParameterType.NUMBER,
      defaultValue: 0.3,
      min: 0.1,
      max: 0.9,
      step: 0.1,
      required: true
    },
    {
      id: 'newsSources',
      name: 'News Sources',
      description: 'Sources to analyze for sentiment',
      type: ParameterType.ENUM,
      defaultValue: 'ALL',
      options: ['ALL', 'TWITTER', 'NEWS', 'REDDIT', 'CUSTOM'],
      required: true
    },
    {
      id: 'includeTechnicals',
      name: 'Include Technical Confirmation',
      description: 'Whether to require technical confirmation',
      type: ParameterType.BOOLEAN,
      defaultValue: true,
      required: false
    },
    {
      id: 'keywordWeight',
      name: 'Keyword Weight',
      description: 'Weight given to specific keywords',
      type: ParameterType.NUMBER,
      defaultValue: 1.5,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      required: false
    }
  ];
};

// Generate mock parameters based on the parameter definitions
const generateParameterValues = (definitions: ParameterDefinition[]): ParameterValue[] => {
  return definitions.map(def => ({
    definitionId: def.id,
    value: def.defaultValue
  }));
};

// Generate random signals for a strategy
const generateRandomSignals = (strategyId: string, count: number = 5): StrategySignal[] => {
  const signals: StrategySignal[] = [];
  const symbols = ['GARAN', 'THYAO', 'AKBNK', 'EREGL', 'TUPRS', 'ISCTR', 'BIMAS', 'ASELS'];
  
  for (let i = 0; i < count; i++) {
    const isExecuted = Math.random() > 0.3;
    const dateOffset = Math.floor(Math.random() * 30);
    const signalDate = new Date();
    signalDate.setDate(signalDate.getDate() - dateOffset);
    
    const price = randomFloat(10, 100, 2);
    const targetPrice = price * (1 + randomFloat(0.03, 0.15, 2));
    const stopPrice = price * (1 - randomFloat(0.03, 0.1, 2));
    
    const signal: StrategySignal = {
      id: generateId(),
      strategyId,
      timestamp: signalDate.toISOString(),
      symbol: getRandomItem(symbols),
      side: Math.random() > 0.5 ? OrderSide.BUY : OrderSide.SELL,
      strength: getRandomItem([SignalStrength.WEAK, SignalStrength.MODERATE, SignalStrength.STRONG, SignalStrength.VERY_STRONG]),
      price,
      targetPrice,
      stopPrice,
      confidence: randomFloat(0.6, 0.95, 2),
      executed: isExecuted,
      notes: isExecuted ? 'Signal executed automatically' : 'Pending execution'
    };
    
    // Add results for executed signals
    if (isExecuted && Math.random() > 0.3) {
      const exitDate = new Date(signalDate);
      exitDate.setDate(exitDate.getDate() + Math.floor(Math.random() * 5) + 1);
      
      const profitable = Math.random() > 0.4;
      const entryPrice = signal.price;
      
      let exitPrice;
      if (signal.side === OrderSide.BUY) {
        exitPrice = profitable ? randomFloat(entryPrice, targetPrice, 2) : randomFloat(stopPrice, entryPrice, 2);
      } else {
        exitPrice = profitable ? randomFloat(stopPrice, entryPrice, 2) : randomFloat(entryPrice, targetPrice, 2);
      }
      
      const profit = signal.side === OrderSide.BUY 
        ? exitPrice - entryPrice 
        : entryPrice - exitPrice;
      
      const profitPercent = (profit / entryPrice) * 100;
      
      signal.result = {
        profitable,
        profit: Math.abs(profit * 100), // Assuming 100 shares per trade
        profitPercent: Number(profitPercent.toFixed(2)),
        entryPrice,
        exitPrice,
        entryTime: signalDate.toISOString(),
        exitTime: exitDate.toISOString()
      };
    }
    
    signals.push(signal);
  }
  
  return signals;
};

// Generate mock strategy performance
const generateRandomPerformance = (winRate: number = 0.6) => {
  const totalTrades = Math.floor(Math.random() * 150) + 50;
  const successfulTrades = Math.floor(totalTrades * winRate);
  
  const avgWin = randomFloat(2, 5, 2);
  const avgLoss = randomFloat(1, 3, 2);
  
  const profitFactor = (successfulTrades * avgWin) / ((totalTrades - successfulTrades) * avgLoss);
  const totalReturns = (successfulTrades * avgWin) - ((totalTrades - successfulTrades) * avgLoss);
  
  return {
    totalReturns: randomFloat(totalReturns * 10, totalReturns * 20, 2),
    dailyReturns: randomFloat(0.05, 0.5, 2),
    weeklyReturns: randomFloat(0.2, 2.5, 2),
    monthlyReturns: randomFloat(0.8, 8, 2),
    yearlyReturns: randomFloat(8, 35, 2),
    annualizedReturns: randomFloat(10, 40, 2),
    winRate: winRate * 100,
    profitFactor: Number(profitFactor.toFixed(2)),
    maxDrawdown: randomFloat(5, 25, 2),
    sharpeRatio: randomFloat(0.8, 2.5, 2),
    volatility: randomFloat(5, 20, 2),
    averageWin: avgWin,
    averageLoss: avgLoss,
    averageHoldingPeriod: randomFloat(1, 5, 1),
    successfulTrades,
    totalTrades
  };
};

// Create mock strategies
export const createMockStrategies = (): Strategy[] => {
  // Create a Moving Average Crossover strategy
  const maCrossoverStrategy: Strategy = {
    id: 'strat-001',
    name: 'MA Crossover',
    description: 'A simple strategy that generates buy signals when the short-term moving average crosses above the long-term moving average, and sell signals when it crosses below.',
    type: StrategyType.TECHNICAL,
    status: StrategyStatus.ACTIVE,
    executionMode: ExecutionMode.SEMI_AUTO,
    author: 'System',
    created: randomDate(new Date(2022, 0, 1)),
    updated: randomDate(new Date(2023, 0, 1)),
    symbols: ['GARAN', 'THYAO', 'AKBNK', 'EREGL', 'TUPRS'],
    parameterDefinitions: createTechnicalParameterDefinitions(),
    parameters: generateParameterValues(createTechnicalParameterDefinitions()),
    performance: generateRandomPerformance(0.65),
    signals: [],
    lastExecuted: new Date().toISOString()
  };
  
  // Create an RSI Mean Reversion strategy
  const rsiStrategy: Strategy = {
    id: 'strat-002',
    name: 'RSI Mean Reversion',
    description: 'Generates buy signals when RSI falls below oversold level and sell signals when it rises above overbought level.',
    type: StrategyType.TECHNICAL,
    status: StrategyStatus.ACTIVE,
    executionMode: ExecutionMode.PAPER,
    author: 'System',
    created: randomDate(new Date(2022, 3, 1)),
    updated: randomDate(new Date(2023, 3, 1)),
    symbols: ['ISCTR', 'BIMAS', 'ASELS', 'KCHOL'],
    parameterDefinitions: createTechnicalParameterDefinitions(),
    parameters: generateParameterValues(createTechnicalParameterDefinitions()),
    performance: generateRandomPerformance(0.58),
    signals: [],
    lastExecuted: new Date().toISOString()
  };
  
  // Create an NLP Sentiment strategy
  const sentimentStrategy: Strategy = {
    id: 'strat-003',
    name: 'News Sentiment Trader',
    description: 'Analyzes news and social media sentiment to generate trading signals for stocks with significant sentiment shifts.',
    type: StrategyType.NLP,
    status: StrategyStatus.ACTIVE,
    executionMode: ExecutionMode.SEMI_AUTO,
    author: 'System',
    created: randomDate(new Date(2022, 6, 1)),
    updated: randomDate(new Date(2023, 6, 1)),
    symbols: ['GARAN', 'TUPRS', 'THYAO', 'ASELS'],
    parameterDefinitions: createNLPParameterDefinitions(),
    parameters: generateParameterValues(createNLPParameterDefinitions()),
    performance: generateRandomPerformance(0.52),
    signals: [],
    lastExecuted: new Date().toISOString()
  };
  
  // Create a Machine Learning prediction strategy
  const mlStrategy: Strategy = {
    id: 'strat-004',
    name: 'ML Price Predictor',
    description: 'Uses machine learning models to predict price movements and generate signals based on predicted direction and confidence.',
    type: StrategyType.MACHINE_LEARNING,
    status: StrategyStatus.ACTIVE,
    executionMode: ExecutionMode.PAPER,
    author: 'System',
    created: randomDate(new Date(2022, 9, 1)),
    updated: randomDate(new Date(2023, 9, 1)),
    symbols: ['ISCTR', 'EREGL', 'BIMAS', 'KCHOL', 'AKBNK'],
    parameterDefinitions: createMLParameterDefinitions(),
    parameters: generateParameterValues(createMLParameterDefinitions()),
    performance: generateRandomPerformance(0.72),
    signals: [],
    lastExecuted: new Date().toISOString()
  };
  
  // Create a Hybrid strategy
  const hybridStrategy: Strategy = {
    id: 'strat-005',
    name: 'Hybrid Sentiment-Technical',
    description: 'Combines technical analysis with sentiment analysis to generate high-confidence signals confirmed by multiple methods.',
    type: StrategyType.HYBRID,
    status: StrategyStatus.DRAFT,
    executionMode: ExecutionMode.PAPER,
    author: 'System',
    created: randomDate(new Date(2023, 0, 1)),
    updated: randomDate(new Date(2023, 11, 1)),
    symbols: ['GARAN', 'THYAO', 'AKBNK', 'BIMAS', 'ASELS'],
    parameterDefinitions: [
      ...createTechnicalParameterDefinitions(),
      ...createNLPParameterDefinitions()
    ],
    parameters: generateParameterValues([
      ...createTechnicalParameterDefinitions(),
      ...createNLPParameterDefinitions()
    ]),
    performance: generateRandomPerformance(0.68),
    signals: [],
    lastExecuted: undefined
  };
  
  // Add signals to each strategy
  maCrossoverStrategy.signals = generateRandomSignals(maCrossoverStrategy.id, 8);
  rsiStrategy.signals = generateRandomSignals(rsiStrategy.id, 6);
  sentimentStrategy.signals = generateRandomSignals(sentimentStrategy.id, 5);
  mlStrategy.signals = generateRandomSignals(mlStrategy.id, 10);
  hybridStrategy.signals = generateRandomSignals(hybridStrategy.id, 3);
  
  // Return the list of strategies
  return [
    maCrossoverStrategy,
    rsiStrategy,
    sentimentStrategy,
    mlStrategy,
    hybridStrategy
  ];
};

// Mock strategies data
export const mockStrategies = createMockStrategies();

// Mock strategy service functions
export const fetchAllStrategies = async (): Promise<Strategy[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [...mockStrategies];
};

export const fetchStrategyById = async (id: string): Promise<Strategy | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const strategy = mockStrategies.find(s => s.id === id);
  return strategy ? { ...strategy } : null;
};

export const fetchStrategySignals = async (strategyId: string): Promise<StrategySignal[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const strategy = mockStrategies.find(s => s.id === strategyId);
  return strategy ? [...strategy.signals] : [];
};

export const updateStrategy = async (strategy: Strategy): Promise<Strategy> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  const index = mockStrategies.findIndex(s => s.id === strategy.id);
  
  if (index !== -1) {
    mockStrategies[index] = {
      ...strategy,
      updated: new Date().toISOString()
    };
    return { ...mockStrategies[index] };
  }
  
  throw new Error('Strategy not found');
};

export const createStrategy = async (strategy: Omit<Strategy, 'id' | 'created' | 'updated'>): Promise<Strategy> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newStrategy: Strategy = {
    ...strategy,
    id: `strat-${mockStrategies.length + 1}`.padStart(8, '0'),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    signals: []
  };
  
  mockStrategies.push(newStrategy);
  return { ...newStrategy };
};

export const deleteStrategy = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockStrategies.findIndex(s => s.id === id);
  
  if (index !== -1) {
    mockStrategies.splice(index, 1);
    return true;
  }
  
  return false;
};

export const executeStrategyBacktest = async (
  strategyId: string, 
  startDate: string, 
  endDate: string
): Promise<Strategy> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const strategy = mockStrategies.find(s => s.id === strategyId);
  if (!strategy) {
    throw new Error('Strategy not found');
  }
  
  // Generate mock backtest results
  const backtestPerformance = generateRandomPerformance(Math.random() * 0.3 + 0.4);
  
  strategy.backtestResults = {
    startDate,
    endDate,
    performance: backtestPerformance
  };
  
  return { ...strategy };
};

export const executeStrategy = async (strategyId: string): Promise<StrategySignal[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const strategy = mockStrategies.find(s => s.id === strategyId);
  if (!strategy) {
    throw new Error('Strategy not found');
  }
  
  // Generate 1-3 new signals
  const newSignalCount = Math.floor(Math.random() * 3) + 1;
  const newSignals = generateRandomSignals(strategyId, newSignalCount);
  
  // Update strategy with new signals and lastExecuted timestamp
  strategy.signals = [...newSignals, ...strategy.signals];
  strategy.lastExecuted = new Date().toISOString();
  
  return newSignals;
}; 