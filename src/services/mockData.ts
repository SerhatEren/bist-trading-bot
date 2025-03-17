// This is a mock implementation, replace with actual API calls
import { OrderSide, OrderStatus, OrderType } from '../types/api';

// Mock BIST30 stock data
export const fetchBist30Data = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Mock data for BIST30 stocks
  const mockBist30 = [
    { symbol: 'AKBNK', lastPrice: 145.20, change: 2.35, volume: 12500000, high: 146.50, low: 142.10 },
    { symbol: 'ARCLK', lastPrice: 237.80, change: -1.20, volume: 5600000, high: 241.30, low: 235.40 },
    { symbol: 'ASELS', lastPrice: 88.15, change: 0.45, volume: 8900000, high: 89.20, low: 87.30 },
    { symbol: 'BIMAS', lastPrice: 195.60, change: 1.75, volume: 6400000, high: 197.20, low: 192.10 },
    { symbol: 'EKGYO', lastPrice: 18.24, change: -0.65, volume: 22000000, high: 18.56, low: 18.10 },
    { symbol: 'EREGL', lastPrice: 44.78, change: 1.20, volume: 14000000, high: 45.12, low: 44.26 },
    { symbol: 'FROTO', lastPrice: 523.40, change: 2.85, volume: 4200000, high: 525.60, low: 512.30 },
    { symbol: 'GARAN', lastPrice: 28.16, change: 0.90, volume: 30000000, high: 28.42, low: 27.84 },
    { symbol: 'HALKB', lastPrice: 15.76, change: -1.40, volume: 18000000, high: 16.10, low: 15.62 },
    { symbol: 'ISCTR', lastPrice: 267.50, change: 1.30, volume: 9400000, high: 269.70, low: 264.20 },
    { symbol: 'KCHOL', lastPrice: 156.40, change: 0.75, volume: 7300000, high: 157.20, low: 155.10 },
    { symbol: 'KOZAA', lastPrice: 62.35, change: -2.10, volume: 6800000, high: 63.80, low: 62.05 },
    { symbol: 'KOZAL', lastPrice: 451.20, change: 1.65, volume: 3100000, high: 455.80, low: 446.40 },
    { symbol: 'PETKM', lastPrice: 12.84, change: -0.35, volume: 19500000, high: 12.96, low: 12.78 },
    { symbol: 'PGSUS', lastPrice: 338.70, change: 3.20, volume: 2400000, high: 342.50, low: 331.40 },
    { symbol: 'SAHOL', lastPrice: 44.26, change: 0.55, volume: 11600000, high: 44.68, low: 43.94 },
    { symbol: 'SASA', lastPrice: 84.15, change: -1.85, volume: 9200000, high: 85.70, low: 83.60 },
    { symbol: 'SISE', lastPrice: 32.48, change: 1.10, volume: 16800000, high: 32.76, low: 32.22 },
    { symbol: 'TAVHL', lastPrice: 178.30, change: 2.45, volume: 4900000, high: 180.20, low: 175.60 },
    { symbol: 'TCELL', lastPrice: 42.86, change: -0.70, volume: 13200000, high: 43.24, low: 42.58 },
    { symbol: 'THYAO', lastPrice: 187.20, change: 1.95, volume: 8700000, high: 189.40, low: 184.60 },
    { symbol: 'TOASO', lastPrice: 158.90, change: 0.65, volume: 5300000, high: 159.70, low: 157.80 },
    { symbol: 'TUPRS', lastPrice: 205.60, change: 2.10, volume: 6100000, high: 207.80, low: 202.40 },
    { symbol: 'VAKBN', lastPrice: 14.68, change: -0.85, volume: 24000000, high: 14.92, low: 14.56 },
    { symbol: 'YKBNK', lastPrice: 18.34, change: 1.15, volume: 20500000, high: 18.52, low: 18.12 },
    { symbol: 'MGROS', lastPrice: 122.40, change: -0.60, volume: 7800000, high: 123.80, low: 122.10 },
    { symbol: 'TTKOM', lastPrice: 28.72, change: 0.40, volume: 15400000, high: 28.94, low: 28.58 },
    { symbol: 'KRDMD', lastPrice: 16.84, change: 1.70, volume: 17600000, high: 17.10, low: 16.62 },
    { symbol: 'GUBRF', lastPrice: 94.55, change: -1.20, volume: 8400000, high: 95.80, low: 94.15 },
    { symbol: 'TSKB', lastPrice: 9.46, change: 0.85, volume: 22800000, high: 9.54, low: 9.38 }
  ];
  
  return mockBist30;
};

// Portfolio Data
export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;  // Matches the averageCost concept in api.ts
  currentPrice: number;
  value: number;     // Matches the marketValue concept in api.ts
  change: number;    // Matches the unrealizedPnl concept in api.ts
  changePercent: number; // Matches the unrealizedPnlPercentage concept in api.ts
}

export interface Portfolio {
  totalValue: number;    // Matches the totalEquity concept in api.ts
  cashBalance: number;   // Matches the cash concept in api.ts
  invested: number;      // Derived value from positions
  dayChange: number;     // Daily change in absolute value
  dayChangePercent: number; // Daily change in percentage
  positions: Position[];
}

// Extend the types to include API-compatible properties
export interface ApiCompatiblePosition extends Position {
  averageCost: number;   // Same as avgPrice but uses API naming
  marketValue: number;   // Same as value but uses API naming
  unrealizedPnl: number; // Same as change but uses API naming
  unrealizedPnlPercentage: number; // Same as changePercent but uses API naming
}

export interface ApiCompatiblePortfolio extends Portfolio {
  totalEquity: number;   // Same as totalValue but uses API naming
  cash: number;          // Same as cashBalance but uses API naming
}

// Helper functions to convert between formats
export const toApiPortfolio = (portfolio: Portfolio): ApiCompatiblePortfolio => {
  return {
    ...portfolio,
    totalEquity: portfolio.totalValue,
    cash: portfolio.cashBalance,
    positions: portfolio.positions.map(pos => ({
      ...pos,
      averageCost: pos.avgPrice,
      marketValue: pos.value,
      unrealizedPnl: pos.change,
      unrealizedPnlPercentage: pos.changePercent
    })) as ApiCompatiblePosition[]
  };
};

export const fromApiPortfolio = (apiPortfolio: any): Portfolio => {
  return {
    totalValue: apiPortfolio.totalEquity || 0,
    cashBalance: apiPortfolio.cash || 0,
    invested: apiPortfolio.totalEquity ? apiPortfolio.totalEquity - apiPortfolio.cash : 0,
    dayChange: 0, // Would need to be calculated based on previous day's value
    dayChangePercent: 0, // Would need to be calculated based on previous day's value
    positions: (apiPortfolio.positions || []).map((pos: any) => ({
      symbol: pos.symbol,
      quantity: pos.quantity,
      avgPrice: pos.averageCost,
      currentPrice: pos.marketValue / pos.quantity,
      value: pos.marketValue,
      change: pos.unrealizedPnl,
      changePercent: pos.unrealizedPnlPercentage
    }))
  };
};

export interface HistoricalValue {
  date: string;
  value: number;
}

export const fetchPortfolioData = async (): Promise<Portfolio> => {
  try {
    // Try to fetch from API first
    const apiService = await import('./apiFactory').then(module => module.default);
    const response = await apiService.getPortfolio();
    
    if (response && response.data) {
      return fromApiPortfolio(response.data);
    }
  } catch (error) {
    console.log('Using mock portfolio data instead of API:', error);
  }
  
  // Fallback to mock data if API fails
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    totalValue: 125750.42,
    cashBalance: 45250.18,
    invested: 80500.24,
    dayChange: 1250.42,
    dayChangePercent: 1.05,
    positions: [
      {
        symbol: 'AAPL',
        quantity: 15,
        avgPrice: 175.25,
        currentPrice: 182.63,
        value: 2739.45,
        change: 110.70,
        changePercent: 4.21
      },
      {
        symbol: 'MSFT',
        quantity: 10,
        avgPrice: 325.50,
        currentPrice: 338.11,
        value: 3381.10,
        change: 126.10,
        changePercent: 3.87
      },
      {
        symbol: 'AMZN',
        quantity: 8,
        avgPrice: 134.23,
        currentPrice: 127.74,
        value: 1021.92,
        change: -51.92,
        changePercent: -4.84
      },
      {
        symbol: 'GOOGL',
        quantity: 12,
        avgPrice: 124.45,
        currentPrice: 131.86,
        value: 1582.32,
        change: 88.92,
        changePercent: 5.95
      },
      {
        symbol: 'TSLA',
        quantity: 20,
        avgPrice: 224.75,
        currentPrice: 218.32,
        value: 4366.40,
        change: -128.60,
        changePercent: -2.86
      }
    ]
  };
};

// Get recent trades data
export const fetchRecentTrades = async (): Promise<Transaction[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 750));
  
  return [
    {
      id: 'ord-001',
      date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      symbol: 'AAPL',
      side: 'BUY',
      type: OrderType.MARKET,
      price: 180.25,
      quantity: 5,
      value: 901.25,
      status: OrderStatus.FILLED
    },
    {
      id: 'ord-002',
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      symbol: 'MSFT',
      side: 'BUY',
      type: OrderType.LIMIT,
      price: 330.50,
      quantity: 3,
      value: 991.50,
      status: OrderStatus.FILLED
    },
    {
      id: 'ord-003',
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      symbol: 'TSLA',
      side: 'SELL',
      type: OrderType.MARKET,
      price: 224.30,
      quantity: 4,
      value: 897.20,
      status: OrderStatus.FILLED
    },
    {
      id: 'ord-004',
      date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      symbol: 'AMZN',
      side: 'BUY',
      type: OrderType.LIMIT,
      price: 134.25,
      quantity: 8,
      value: 1074.00,
      status: OrderStatus.FILLED
    },
    {
      id: 'ord-005',
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      symbol: 'GOOGL',
      side: 'BUY',
      type: OrderType.MARKET,
      price: 124.45,
      quantity: 12,
      value: 1493.40,
      status: OrderStatus.FILLED
    },
    {
      id: 'ord-006',
      date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      symbol: 'NVDA',
      side: 'BUY',
      type: OrderType.LIMIT,
      price: 432.65,
      quantity: 2,
      value: 865.30,
      status: OrderStatus.NEW
    }
  ];
};

// Get strategy performance data
export const fetchStrategies = async (): Promise<Strategy[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return [
    {
      id: 'trend-following',
      name: 'Trend Following',
      description: 'A momentum-based strategy that follows medium to long-term market trends',
      active: true,
      performance: {
        returns1M: 2.8,
        returns3M: 6.5,
        returnsYTD: 12.7
      },
      stats: {
        winRate: 65.2,
        profitFactor: 1.85,
        drawdown: 8.4
      },
      lastSignal: {
        symbol: 'AAPL',
        type: 'BUY',
        date: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
      }
    },
    {
      id: 'mean-reversion',
      name: 'Mean Reversion',
      description: 'Identifies overbought/oversold conditions and trades counter to extreme price movements',
      active: true,
      performance: {
        returns1M: 1.6,
        returns3M: 4.2,
        returnsYTD: 9.5
      },
      stats: {
        winRate: 72.1,
        profitFactor: 1.62,
        drawdown: 6.2
      },
      lastSignal: {
        symbol: 'MSFT',
        type: 'BUY',
        date: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      }
    },
    {
      id: 'breakout',
      name: 'Breakout Detection',
      description: 'Identifies key support/resistance levels and trades breakouts with momentum',
      active: false,
      performance: {
        returns1M: 0.2,
        returns3M: 2.1,
        returnsYTD: 5.3
      },
      stats: {
        winRate: 48.5,
        profitFactor: 1.35,
        drawdown: 12.6
      },
      lastSignal: null
    }
  ];
};

// Get ML model performance data
export const fetchModelPerformance = async (): Promise<ModelPerformanceData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 900));
  
  return {
    overallAccuracy: 68.5,
    bullishAccuracy: 71.2,
    bearishAccuracy: 62.8,
    predictions: {
      total: 185,
      correct: 127,
      bullish: 125,
      bearish: 60,
      bullishCorrect: 89,
      bearishCorrect: 38
    },
    recentPredictions: [
      {
        symbol: 'AAPL',
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        direction: 'bullish',
        actual: 'up',
        confidence: 82.5,
        accurate: true
      },
      {
        symbol: 'MSFT',
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        direction: 'bullish',
        actual: 'up',
        confidence: 75.8,
        accurate: true
      },
      {
        symbol: 'AMZN',
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        direction: 'bearish',
        actual: 'down',
        confidence: 68.2,
        accurate: true
      },
      {
        symbol: 'GOOGL',
        date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        direction: 'bullish',
        actual: 'up',
        confidence: 72.4,
        accurate: true
      },
      {
        symbol: 'TSLA',
        date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        direction: 'bearish',
        actual: 'up',
        confidence: 65.9,
        accurate: false
      }
    ],
    topSymbols: [
      {
        symbol: 'AAPL',
        accuracy: 78.2,
        profitFactor: 2.15
      },
      {
        symbol: 'MSFT',
        accuracy: 72.6,
        profitFactor: 1.95
      },
      {
        symbol: 'GOOGL',
        accuracy: 70.8,
        profitFactor: 1.82
      }
    ]
  };
};

// Get trading signals data
export const fetchTradingSignals = async (): Promise<TradingSignal[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return [
    {
      id: 'sig-001',
      symbol: 'AAPL',
      side: 'BUY',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      currentPrice: 182.63,
      targetPrice: 195.40,
      stopPrice: 175.80,
      strength: 'strong',
      confidence: 82.5,
      indicators: {
        macd: 'bullish',
        rsi: 58.4,
        ema: 'above',
        volume: 'high'
      },
      model: 'trend-following'
    },
    {
      id: 'sig-002',
      symbol: 'MSFT',
      side: 'BUY',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      currentPrice: 338.11,
      targetPrice: 360.25,
      stopPrice: 325.50,
      strength: 'moderate',
      confidence: 75.8,
      indicators: {
        macd: 'bullish',
        rsi: 62.7,
        ema: 'above',
        volume: 'normal'
      },
      model: 'breakout'
    },
    {
      id: 'sig-003',
      symbol: 'AMZN',
      side: 'SELL',
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      currentPrice: 127.74,
      targetPrice: 118.30,
      stopPrice: 134.00,
      strength: 'moderate',
      confidence: 68.2,
      indicators: {
        macd: 'bearish',
        rsi: 72.5,
        ema: 'below',
        volume: 'high'
      },
      model: 'mean-reversion'
    }
  ];
};

// Get market overview and sector performance
export const fetchMarketOverview = async (): Promise<MarketOverviewData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 850));
  
  return {
    indices: [
      {
        symbol: 'SPY',
        name: 'S&P 500',
        value: 4583.25,
        change: 42.15,
        changePercent: 0.93
      },
      {
        symbol: 'QQQ',
        name: 'NASDAQ',
        value: 16265.38,
        change: 189.82,
        changePercent: 1.18
      },
      {
        symbol: 'DIA',
        name: 'Dow Jones',
        value: 36240.45,
        change: 152.33,
        changePercent: 0.42
      },
      {
        symbol: 'IWM',
        name: 'Russell 2000',
        value: 1935.62,
        change: -12.58,
        changePercent: -0.65
      }
    ],
    topGainers: [
      {
        symbol: 'NVDA',
        price: 432.65,
        change: 25.82,
        changePercent: 6.35
      },
      {
        symbol: 'AMD',
        price: 128.34,
        change: 5.48,
        changePercent: 4.46
      },
      {
        symbol: 'AAPL',
        price: 182.63,
        change: 6.12,
        changePercent: 3.47
      },
      {
        symbol: 'MSFT',
        price: 338.11,
        change: 8.27,
        changePercent: 2.51
      }
    ],
    topLosers: [
      {
        symbol: 'META',
        price: 325.18,
        change: -12.64,
        changePercent: -3.74
      },
      {
        symbol: 'AMZN',
        price: 127.74,
        change: -3.42,
        changePercent: -2.61
      },
      {
        symbol: 'TSLA',
        price: 218.32,
        change: -4.92,
        changePercent: -2.20
      },
      {
        symbol: 'NFLX',
        price: 482.95,
        change: -9.48,
        changePercent: -1.93
      }
    ],
    sectors: [
      {
        name: 'Technology',
        change: 2.35,
        marketCap: 12.8
      },
      {
        name: 'Healthcare',
        change: 0.82,
        marketCap: 8.4
      },
      {
        name: 'Consumer Cyclical',
        change: -1.24,
        marketCap: 5.2
      },
      {
        name: 'Financial Services',
        change: 0.53,
        marketCap: 7.1
      },
      {
        name: 'Energy',
        change: -0.86,
        marketCap: 4.5
      },
      {
        name: 'Communication',
        change: 1.12,
        marketCap: 6.3
      }
    ],
    lastUpdated: new Date().toISOString()
  };
};

// Get historical performance data
export const fetchHistoricalPerformance = async (timeframe = '1M') => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Generate sample historical data based on timeframe
  const dataPoints = timeframe === '1D' ? 24 : 
                     timeframe === '1W' ? 7 : 
                     timeframe === '1M' ? 30 :
                     timeframe === '3M' ? 90 :
                     timeframe === '6M' ? 180 : 365;
  
  const data = [];
  let value = 1000000; // Starting portfolio value
  
  for (let i = 0; i < dataPoints; i++) {
    // Generate a random daily change, slightly biased to positive
    const dailyChange = (Math.random() * 2 - 0.8) / 100;
    value = value * (1 + dailyChange);
    
    // Create a date for this data point
    const date = new Date();
    
    if (timeframe === '1D') {
      // For 1D, data points are hours
      date.setHours(date.getHours() - (24 - i));
    } else {
      // For other timeframes, data points are days
      date.setDate(date.getDate() - (dataPoints - i));
    }
    
    data.push({
      date: date.toISOString(),
      value: value
    });
  }
  
  return data;
};

// Get system status
export const fetchSystemStatus = async (): Promise<SystemStatusData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    status: 'online',
    lastUpdated: new Date().toISOString(),
    apiConnected: true,
    dbConnected: true,
    cpuLoad: 32,
    memoryUsage: 45,
    uptime: 86400 * 3.5, // 3.5 days in seconds
    errors: []
  };
};

// Strategy Data
export interface StrategyStats {
  winRate: number;
  profitFactor: number;
  drawdown: number;
}

export interface StrategyPerformance {
  returns1M: number;
  returns3M: number;
  returnsYTD: number;
}

export interface StrategySignal {
  symbol: string;
  type: 'BUY' | 'SELL';
  date: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  active: boolean;
  performance: StrategyPerformance;
  stats: StrategyStats;
  lastSignal: StrategySignal | null;
}

// Model Performance Data
export interface ModelPrediction {
  symbol: string;
  date: string;
  direction: 'bullish' | 'bearish';
  actual: 'up' | 'down';
  confidence: number;
  accurate: boolean;
}

export interface SymbolPerformance {
  symbol: string;
  accuracy: number;
  profitFactor: number;
}

export interface ModelPerformanceData {
  overallAccuracy: number;
  bullishAccuracy: number;
  bearishAccuracy: number;
  predictions: {
    total: number;
    correct: number;
    bullish: number;
    bearish: number;
    bullishCorrect: number;
    bearishCorrect: number;
  };
  recentPredictions: ModelPrediction[];
  topSymbols: SymbolPerformance[];
}

// Trading Signals Data
export interface SignalIndicators {
  macd: 'bullish' | 'bearish' | 'neutral';
  rsi: number;
  ema: 'above' | 'below';
  volume: 'high' | 'normal' | 'low';
}

export interface TradingSignal {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  timestamp: string;
  currentPrice: number;
  targetPrice: number;
  stopPrice: number;
  strength: 'strong' | 'moderate' | 'weak';
  confidence: number;
  indicators: SignalIndicators;
  model: string;
}

// Market Overview Data
export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface SectorData {
  name: string;
  change: number;
  marketCap: number;
}

export interface MarketOverviewData {
  indices: IndexData[];
  topGainers: StockData[];
  topLosers: StockData[];
  sectors: SectorData[];
  lastUpdated: string;
}

// Transaction History
export interface Transaction {
  id: string;
  date: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: OrderType;
  price: number;
  quantity: number;
  value: number;
  status: OrderStatus;
}

// System Status Data
export interface SystemStatusData {
  status: 'online' | 'offline' | 'warning';
  lastUpdated: string;
  apiConnected: boolean;
  dbConnected: boolean;
  cpuLoad: number;
  memoryUsage: number;
  uptime: number;
  errors: string[];
}

// Helper functions for formatting
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero'
  }).format(value / 100);
};

export const formatMarketCap = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}T`;
  }
  return `$${value.toFixed(1)}B`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    return `${diffHour}h ago`;
  } else if (diffDay < 7) {
    return `${diffDay}d ago`;
  } else {
    return formatDate(dateString);
  }
}; 