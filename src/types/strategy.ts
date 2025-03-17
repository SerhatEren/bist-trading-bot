import { OrderSide } from './api';

// Strategy types
export enum StrategyType {
  TECHNICAL = 'TECHNICAL',
  MACHINE_LEARNING = 'MACHINE_LEARNING',
  NLP = 'NLP',
  HYBRID = 'HYBRID'
}

// Strategy status
export enum StrategyStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  BACKTEST = 'BACKTEST',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED'
}

// Strategy execution mode
export enum ExecutionMode {
  PAPER = 'PAPER',
  SEMI_AUTO = 'SEMI_AUTO',
  FULLY_AUTO = 'FULLY_AUTO'
}

// Signal strength
export enum SignalStrength {
  WEAK = 'WEAK',
  MODERATE = 'MODERATE',
  STRONG = 'STRONG',
  VERY_STRONG = 'VERY_STRONG'
}

// Strategy parameter types
export enum ParameterType {
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  ENUM = 'ENUM',
  TIMEFRAME = 'TIMEFRAME',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT'
}

// Strategy parameter definition
export interface ParameterDefinition {
  id: string;
  name: string;
  description: string;
  type: ParameterType;
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[] | number[];
  required: boolean;
}

// Strategy parameter value
export interface ParameterValue {
  definitionId: string;
  value: any;
}

// Strategy performance metrics
export interface StrategyPerformance {
  totalReturns: number;
  dailyReturns: number;
  weeklyReturns: number;
  monthlyReturns: number;
  yearlyReturns: number;
  annualizedReturns: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  averageWin: number;
  averageLoss: number;
  averageHoldingPeriod: number;
  successfulTrades: number;
  totalTrades: number;
}

// Strategy signal
export interface StrategySignal {
  id: string;
  strategyId: string;
  timestamp: string;
  symbol: string;
  side: OrderSide;
  strength: SignalStrength;
  price: number;
  targetPrice?: number;
  stopPrice?: number;
  expiresAt?: string;
  notes?: string;
  confidence: number;
  executed: boolean;
  result?: {
    profitable: boolean;
    profit: number;
    profitPercent: number;
    entryPrice: number;
    exitPrice: number;
    entryTime: string;
    exitTime: string;
  };
}

// Strategy definition
export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  status: StrategyStatus;
  executionMode: ExecutionMode;
  author: string;
  created: string;
  updated: string;
  symbols: string[];
  parameters: ParameterValue[];
  parameterDefinitions: ParameterDefinition[];
  performance: StrategyPerformance;
  signals: StrategySignal[];
  lastExecuted?: string;
  backtestResults?: {
    startDate: string;
    endDate: string;
    performance: StrategyPerformance;
  };
}

// Technical indicator data
export interface TechnicalIndicators {
  rsi?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  ema?: {
    ema9: number;
    ema20: number;
    ema50: number;
    ema200: number;
  };
  sma?: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  bbands?: {
    upper: number;
    middle: number;
    lower: number;
    width: number;
  };
  atr?: number;
  volume?: number;
  obv?: number;
  adx?: number;
}

// NLP Sentiment data
export interface NLPSentiment {
  overall: number; // -1 to 1
  sources: {
    twitter: number;
    news: number;
    reddit: number;
    other?: number;
  };
  entities: {
    [symbol: string]: number;
  };
  keywords: string[];
  recentEvents?: {
    headline: string;
    source: string;
    sentiment: number;
    timestamp: string;
  }[];
}

// Machine Learning Prediction
export interface MLPrediction {
  prediction: number; // predicted price or direction
  confidence: number;
  timeframe: string;
  features: {
    [key: string]: number;
  };
  modelType: string;
  modelVersion: string;
  accuracy: number;
}

// Strategy execution context
export interface ExecutionContext {
  strategyId: string;
  timestamp: string;
  symbols: string[];
  prices: {
    [symbol: string]: {
      current: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    };
  };
  indicators: {
    [symbol: string]: TechnicalIndicators;
  };
  sentiment?: {
    [symbol: string]: NLPSentiment;
  };
  predictions?: {
    [symbol: string]: MLPrediction;
  };
  portfolio: {
    cash: number;
    positions: {
      [symbol: string]: {
        quantity: number;
        averagePrice: number;
      };
    };
  };
} 