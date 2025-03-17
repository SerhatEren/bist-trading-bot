// ALGOLAB API Response Interfaces
export interface AlgolabApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: AlgolabApiError[];
}

export interface AlgolabApiError {
  code: string;
  message: string;
  field?: string;
}

// Authentication Interfaces
export interface AlgolabAuthRequest {
  apiKey: string;
  apiSecret: string;
}

export interface AlgolabAuthResponse {
  token: string;
  expiresAt: number;
}

// Market Data Interfaces
export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: string;
}

export interface MarketDataRequest {
  symbol?: string;
  symbols?: string[];
  startDate?: string;
  endDate?: string;
  interval?: 'day' | 'hour' | 'minute';
}

// Order Interfaces
export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP = 'STOP',
  STOP_LIMIT = 'STOP_LIMIT',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  FILLED = 'FILLED',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
}

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: string;
  clientOrderId?: string;
}

export interface Order extends OrderRequest {
  id: string;
  status: OrderStatus;
  filledQuantity: number;
  averagePrice?: number;
  commission?: number;
  createdAt: number;
  updatedAt: number;
}

// Portfolio Interfaces
export interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercentage: number;
}

export interface Portfolio {
  totalEquity: number;
  cash: number;
  positions: Position[];
}

// ALGOLAB API için TypeScript arayüzleri
export interface AlgolabCredentials {
  apiKey: string;
  apiSecret: string;
  username: string;
  password: string;
}

export interface AlgolabErrorResponse {
  code: string;
  message: string;
  details?: string;
}

// Piyasa Verileri
export interface StockQuote {
  symbol: string;
  lastPrice: number;
  dailyChange: number;
  dailyChangePercentage: number;
  bidPrice: number;
  askPrice: number;
  volume: number;
  timestamp: number;
}

export interface StockDetails {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number;
  peRatio?: number;
  dividendYield?: number;
  highPrice52Week?: number;
  lowPrice52Week?: number;
}

// Kullanıcı Kimlik Doğrulama
export interface UserAuthRequest {
  username: string;
  password: string;
}

export interface UserAuthResponse {
  token: string;
  expiresAt: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
} 