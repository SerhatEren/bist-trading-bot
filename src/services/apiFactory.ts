import apiService from './api';
import mockApiService from './mockApiService';
import { apiConfig } from '../config/api';
import { logger } from '../config/api';
import { CreateOrderRequest, Order, OrderSide, OrderType } from '../types/api';
import { AxiosResponse } from 'axios';

// Tüm API servislerinin ortak arayüzü
export interface ApiServiceInterface {
  getStockPrice(symbol: string): number;
  createOrder(orderData: CreateOrderRequest): Promise<AxiosResponse<Order>>;
  getPortfolio(): Promise<AxiosResponse<any>>;
  getOrders(): Promise<AxiosResponse<Order[]>>;
  buyStock?(symbol: string, quantity: number): Promise<AxiosResponse<Order>>;
  sellStock?(symbol: string, quantity: number): Promise<AxiosResponse<Order>>;
}

// Test ortamında mockApiService, gerçek ortamda apiService döndürür
const getApiService = (): ApiServiceInterface => {
  if (apiConfig.isTestMode) {
    logger.info('Test ortamı tespit edildi, sahte API servisi kullanılıyor.');
    return mockApiService as unknown as ApiServiceInterface;
  } else {
    logger.info('Gerçek API servisi kullanılıyor.');
    return apiService as unknown as ApiServiceInterface;
  }
};

// API servisini ve proxy nesnesini oluştur
const apiServiceInstance = getApiService();

// Doğrudan çağırılabilir metot ekleyelim
const apiServiceProxy = new Proxy(apiServiceInstance, {
  get: (target, prop) => {
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
    
    return target[prop as keyof ApiServiceInterface];
  }
});

export default apiServiceProxy; 