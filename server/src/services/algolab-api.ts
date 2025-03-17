import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  AlgolabCredentials, 
  AlgolabAuthResponse, 
  AlgolabErrorResponse,
  OrderRequest,
  Order,
  StockQuote,
  StockDetails,
  Portfolio
} from '../types/algolab';
import { logger } from '../utils/logger';
import config from '../config';

class AlgolabApiClient {
  private apiKey: string;
  private apiSecret: string;
  private username: string;
  private password: string;
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private axiosInstance: AxiosInstance;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // ms

  constructor(credentials: AlgolabCredentials) {
    this.apiKey = credentials.apiKey;
    this.apiSecret = credentials.apiSecret;
    this.username = credentials.username;
    this.password = credentials.password;
    this.baseUrl = config.algolab.baseUrl;

    // Axios instance oluşturma
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      }
    });

    // İstek araya girmesi (interceptor)
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Token kontrolü ve yenileme
        if (this.isTokenExpired() && config.url !== '/auth/login') {
          await this.authenticate();
        }

        // Token varsa header'a ekle
        if (this.token && config.url !== '/auth/login') {
          config.headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Yanıt araya girmesi (interceptor)
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: number };
        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Yeniden deneme sayısını takip et
        originalRequest._retry = originalRequest._retry || 0;

        // 429 (Rate Limit) veya 5xx hataları için yeniden deneme
        if ((error.response?.status === 429 || (error.response?.status && error.response.status >= 500)) 
            && originalRequest._retry < this.maxRetries) {
          originalRequest._retry++;
          
          const delay = this.retryDelay * Math.pow(2, originalRequest._retry - 1);
          logger.info(`ALGOLAB API isteği başarısız. ${originalRequest._retry}/${this.maxRetries} yeniden deneniyor (${delay}ms sonra)...`);
          
          return new Promise(resolve => {
            setTimeout(() => resolve(this.axiosInstance(originalRequest)), delay);
          });
        }

        // 401 (Unauthorized) hatası için token yenileme ve yeniden deneme
        if (error.response?.status === 401 && originalRequest.url !== '/auth/login' && originalRequest._retry < 1) {
          originalRequest._retry++;
          
          try {
            await this.authenticate();
            return this.axiosInstance(originalRequest);
          } catch (authError) {
            logger.error('Yeniden kimlik doğrulama başarısız oldu:', authError);
            return Promise.reject(authError);
          }
        }

        // Hata dönüşümü
        const errorResponse: AlgolabErrorResponse = error.response?.data || {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'Bilinmeyen bir hata oluştu'
        };

        logger.error(`ALGOLAB API Hatası: ${errorResponse.code} - ${errorResponse.message}`);
        return Promise.reject(errorResponse);
      }
    );
  }

  private isTokenExpired(): boolean {
    if (!this.token || !this.tokenExpiry) {
      return true;
    }
    // 60 saniye marj ile süre kontrolü
    return Date.now() >= (this.tokenExpiry - 60000);
  }

  /**
   * ALGOLAB API'ye kimlik doğrulama yapar
   */
  public async authenticate(): Promise<void> {
    try {
      const response = await this.axiosInstance.post<AlgolabAuthResponse>('/auth/login', {
        username: this.username,
        password: this.password
      });

      this.token = response.data.token;
      this.tokenExpiry = response.data.expiresAt;
      logger.info('ALGOLAB API kimlik doğrulama başarılı');
    } catch (error) {
      logger.error('ALGOLAB API kimlik doğrulama başarısız', error);
      throw error;
    }
  }

  /**
   * Hisse senedi fiyat bilgilerini alır
   */
  public async getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
    try {
      const response = await this.axiosInstance.get<StockQuote[]>('/market/quotes', {
        params: { symbols: symbols.join(',') }
      });
      return response.data;
    } catch (error) {
      logger.error(`Hisse fiyat bilgisi alınamadı: ${symbols.join(',')}`, error);
      throw error;
    }
  }

  /**
   * Hisse senedi detaylarını alır
   */
  public async getStockDetails(symbol: string): Promise<StockDetails> {
    try {
      const response = await this.axiosInstance.get<StockDetails>(`/market/stocks/${symbol}`);
      return response.data;
    } catch (error) {
      logger.error(`Hisse detayları alınamadı: ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Kullanıcı portföyünü alır
   */
  public async getPortfolio(): Promise<Portfolio> {
    try {
      const response = await this.axiosInstance.get<Portfolio>('/portfolio');
      return response.data;
    } catch (error) {
      logger.error('Portföy bilgisi alınamadı', error);
      throw error;
    }
  }

  /**
   * Emir oluşturur
   */
  public async createOrder(orderRequest: OrderRequest): Promise<Order> {
    try {
      const response = await this.axiosInstance.post<Order>('/orders', orderRequest);
      return response.data;
    } catch (error) {
      logger.error(`Emir oluşturulamadı: ${JSON.stringify(orderRequest)}`, error);
      throw error;
    }
  }

  /**
   * Emir durumunu alır
   */
  public async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await this.axiosInstance.get<Order>(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      logger.error(`Emir bilgisi alınamadı: ${orderId}`, error);
      throw error;
    }
  }

  /**
   * Tüm emirleri alır
   */
  public async getOrders(): Promise<Order[]> {
    try {
      const response = await this.axiosInstance.get<Order[]>('/orders');
      return response.data;
    } catch (error) {
      logger.error('Emirler alınamadı', error);
      throw error;
    }
  }

  /**
   * Emri iptal eder
   */
  public async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await this.axiosInstance.delete<Order>(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      logger.error(`Emir iptal edilemedi: ${orderId}`, error);
      throw error;
    }
  }
}

export default AlgolabApiClient; 