import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  AuthResponse,
  QuotesResponse,
  StockDetailsResponse,
  OrderRequest,
  OrderResponse,
  OrdersResponse,
  PortfolioResponse,
  OrderSide,
  OrderType,
  Order,
  CreateOrderRequest,
  ApiServiceInterface
} from '../types/api';

// API URL'ini ortam değişkeninden veya varsayılan değerden al
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API istemcisi ve tokenı yönetecek sınıf
class ApiService implements ApiServiceInterface {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // İstek interceptor'ı - token ekleme vb.
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Yanıt interceptor'ı - hata işleme vb.
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Oturum süresi dolmuşsa kullanıcıyı çıkış sayfasına yönlendir
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token ayarlama
  public setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Çıkış yapma
  public logout(): void {
    localStorage.removeItem('token');
  }

  // Kullanıcı Kaydı
  public async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', {
      username,
      email,
      password
    });
    return response.data;
  }

  // Kullanıcı Girişi
  public async login(username: string, password: string): Promise<AxiosResponse<{ token: string }>> {
    const response = await this.api.post('/auth/login', { username, password });
    const { data } = response;
    if (data.token) {
      this.setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return response;
  }

  // Mevcut Kullanıcı Bilgileri
  public async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Hisse Senedi Fiyatları
  public async getStockQuotes(symbols: string[]): Promise<QuotesResponse> {
    const response = await this.api.get<QuotesResponse>(`/market/quotes?symbols=${symbols.join(',')}`);
    return response.data;
  }

  // Hisse Senedi Detayları
  public async getStockDetails(symbol: string): Promise<StockDetailsResponse> {
    const response = await this.api.get<StockDetailsResponse>(`/market/stocks/${symbol}`);
    return response.data;
  }

  // Emir Oluşturma
  public async createOrder(orderData: CreateOrderRequest): Promise<AxiosResponse<Order>> {
    const response = await this.api.post('/orders', orderData);
    return response;
  }

  // Tüm Emirleri Listeleme
  public async getOrders(): Promise<AxiosResponse<Order[]>> {
    return this.api.get('/orders');
  }

  // Emir Detayı Görüntüleme
  public async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await this.api.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  }

  // Emir İptal Etme
  public async cancelOrder(orderId: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`/orders/${orderId}`);
  }

  // Portföy Görüntüleme
  public async getPortfolio(): Promise<AxiosResponse<any>> {
    return this.api.get('/portfolio');
  }

  // Piyasa verileri
  public async getMarketData(symbol: string): Promise<AxiosResponse<any>> {
    return this.api.get(`/market-data/${symbol}`);
  }

  // Hisse senedi al
  public async buyStock(symbol: string, quantity: number): Promise<AxiosResponse<Order>> {
    return this.createOrder({
      symbol,
      side: OrderSide.BUY,
      type: OrderType.MARKET,
      quantity
    });
  }

  // Hisse senedi sat
  public async sellStock(symbol: string, quantity: number): Promise<AxiosResponse<Order>> {
    return this.createOrder({
      symbol,
      side: OrderSide.SELL,
      type: OrderType.MARKET,
      quantity
    });
  }

  // Hisse senedi fiyatını getir
  public getStockPrice(symbol: string): number {
    // Gerçek API'da bu metod, ilgili hisse senedi için güncel fiyatı getiren bir endpoint'e istek yapacaktır
    // Test için sabit fiyatlar
    const mockPrices: Record<string, number> = {
      'GARAN': 16.5,
      'AKBNK': 12.5,
      'ISCTR': 11.2,
      'THYAO': 24.8,
      'ASELS': 30.2,
      'KCHOL': 42.6,
      'TUPRS': 92.4,
      'EREGL': 16.8,
      'BIMAS': 62.5,
      'TSKB': 2.7
    };
    
    return mockPrices[symbol] || 0;
  }
}

// Singleton instance
const apiService = new ApiService();
export default apiService; 