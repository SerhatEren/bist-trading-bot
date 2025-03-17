/**
 * Trading API type definitions
 */

// User
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication
export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

// Stock Quote
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

// Stock Details
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

// Order Types
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP = 'STOP',
  STOP_LIMIT = 'STOP_LIMIT',
  TRAILING_STOP = 'TRAILING_STOP'
}

export enum OrderStatus {
  NEW = 'NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

// Time in Force
export enum TimeInForce {
  GTC = 'GTC', // Good Till Cancelled
  IOC = 'IOC', // Immediate or Cancel
  FOK = 'FOK', // Fill or Kill
  DAY = 'DAY'  // Day Order
}

// Position Side
export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

// User Account Types
export enum AccountType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  DEMO = 'DEMO'
}

// Account Status
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING'
}

// Risk Levels
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

// API Response Status
export enum ResponseStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  PARTIAL = 'PARTIAL'
}

// API Error Codes
export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_ORDER = 'INVALID_ORDER',
  MARKET_CLOSED = 'MARKET_CLOSED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

// Message Types
export enum MessageType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
  POSITION_UPDATE = 'POSITION_UPDATE',
  MARKET_DATA = 'MARKET_DATA',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION'
}

// Notification Severity
export enum NotificationSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Market Status
export enum MarketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PRE_MARKET = 'PRE_MARKET',
  AFTER_HOURS = 'AFTER_HOURS',
  HOLIDAY = 'HOLIDAY'
}

// Indicator Signals
export enum IndicatorSignal {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL'
}

// Strategy Types
export enum StrategyType {
  TREND_FOLLOWING = 'TREND_FOLLOWING',
  MEAN_REVERSION = 'MEAN_REVERSION',
  BREAKOUT = 'BREAKOUT',
  MOMENTUM = 'MOMENTUM',
  ARBITRAGE = 'ARBITRAGE',
  STATISTICAL = 'STATISTICAL'
}

// Time Periods
export enum TimePeriod {
  M1 = '1m',
  M5 = '5m',
  M15 = '15m',
  M30 = '30m',
  H1 = '1h',
  H4 = '4h',
  D1 = '1d',
  W1 = '1w',
  MN = '1mo'
}

// Chart Types
export enum ChartType {
  CANDLESTICK = 'CANDLESTICK',
  LINE = 'LINE',
  AREA = 'AREA',
  BAR = 'BAR',
  HEIKIN_ASHI = 'HEIKIN_ASHI'
}

// Report Types
export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

// Order Request
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

// Order
export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// Position
export interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercentage: number;
}

// Portfolio
export interface Portfolio {
  totalEquity: number;
  cash: number;
  positions: Position[];
}

// API Responses
export interface ApiResponse<T> {
  data: T;
  status?: number;
  message?: string;
}

export type QuotesResponse = ApiResponse<StockQuote[]>;
export type StockDetailsResponse = ApiResponse<StockDetails>;
export type OrderResponse = ApiResponse<Order>;
export type OrdersResponse = ApiResponse<Order[]>;
export type PortfolioResponse = ApiResponse<Portfolio>;

export interface CreateOrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
}

export interface ApiServiceInterface {
  getStockPrice(symbol: string): number;
  createOrder(orderData: CreateOrderRequest): Promise<any>;
  getPortfolio(): Promise<any>;
  getOrders(): Promise<any>;
  buyStock?(symbol: string, quantity: number): Promise<any>;
  sellStock?(symbol: string, quantity: number): Promise<any>;
}

export interface ApiError {
  response?: {
    data: {
      message: string;
      code?: string;
    };
    status?: number;
  };
  message: string;
} 