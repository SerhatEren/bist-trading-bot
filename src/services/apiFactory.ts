import apiService from './api';
import mockApiService from './mockApiService';
import { apiConfig } from '../config/api';
import { logger } from '../config/api';
import { 
    ApiServiceInterface as CentralApiServiceInterface,
    CreateOrderRequest, 
    Order, 
    OrderSide, 
    OrderType, 
    BinanceAccountInfo,
    BinanceTicker24hr,
    StockQuote,
    AuthResponse
} from '../types/api';

// Re-define the local interface to match the central one
export interface ApiServiceInterface {
  createOrder(orderData: CreateOrderRequest): Promise<Order>;
  getPortfolio(): Promise<BinanceAccountInfo>;
  getOrders(symbol: string): Promise<Order[]>;
  buyStock?(symbol: string, quantity: number): Promise<Order>;
  sellStock?(symbol: string, quantity: number): Promise<Order>;
  getStockQuotes(symbols: string[]): Promise<StockQuote[]>;
  getStockDetails(symbol: string): Promise<BinanceTicker24hr>;
  logout(): void;
  login(username: string, password: string): Promise<AuthResponse>;
  register(username: string, email: string, password: string): Promise<AuthResponse>;
  isAuthenticated(): boolean;
}

// Test ortamında mockApiService, gerçek ortamda apiService döndürür
const getApiService = (): ApiServiceInterface => {
  if (apiConfig.isTestMode) {
    logger.info('Test ortamı tespit edildi, sahte API servisi kullanılıyor.');
    return mockApiService as unknown as ApiServiceInterface;
  } else {
    logger.info('Gerçek API servisi kullanılıyor.');
    return apiService;
  }
};

// API servisini ve proxy nesnesini oluştur
const apiServiceInstance = getApiService();

// Doğrudan çağırılabilir metot ekleyelim
const apiServiceProxy = new Proxy(apiServiceInstance, {
  get: (target, prop, receiver) => {
    // buyStock ve sellStock özel durumları için
    if (prop === 'buyStock' && !target.buyStock) {
      return (symbol: string, quantity: number) => {
        return target.createOrder({
          symbol,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          quantity
        });
      };
    }
    
    if (prop === 'sellStock' && !target.sellStock) {
      return (symbol: string, quantity: number) => {
        return target.createOrder({
          symbol,
          side: OrderSide.SELL,
          type: OrderType.MARKET,
          quantity
        });
      };
    }
    
    // Ensure methods are called with the correct 'this' context
    const value = target[prop as keyof ApiServiceInterface];
    if (typeof value === 'function') {
      // Bind the function to the original instance
      return value.bind(target);
    }
    // Return properties directly
    return Reflect.get(target, prop, receiver);
  }
});

export default apiServiceProxy; 