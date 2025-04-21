import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  AuthResponse,
  OrderSide,
  OrderType,
  Order,
  CreateOrderRequest,
  ApiServiceInterface,
  BinanceAccountInfo,
  BinanceTicker24hr,
  StockQuote,
  ApiError
} from '../types/api';

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API Client - Add implements
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

    // ---- Add Interceptors ----

    // Request interceptor - add auth token if available (Example: using localStorage)
    this.api.interceptors.request.use(
      (config) => {
        // Assuming token is stored in localStorage after login
        const token = localStorage.getItem('authToken'); 
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and extract data
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Check for success field from backend wrapper if present
        // if (response.data && response.data.success === false) {
        //   return Promise.reject(response.data); 
        // }
        // Return only the data part of the response on success
        return response.data.data; // Assuming backend wraps actual data in a `data` field
      },
      (error: AxiosError<ApiError>) => {
        // Handle different kinds of errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('API Error Response:', error.response.data);
          console.error('Status:', error.response.status);
          console.error('Headers:', error.response.headers);
          // Return a structured error or throw a custom error
          return Promise.reject({
            message: error.response.data?.message || 'An error occurred',
            status: error.response.status
          });
        } else if (error.request) {
          // The request was made but no response was received
          console.error('API No Response:', error.request);
          return Promise.reject({ message: 'No response received from server.' });
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('API Request Setup Error:', error.message);
          return Promise.reject({ message: error.message });
        }
      }
    );
  }

  // ---- Implement ApiServiceInterface Methods ----

  // Authentication methods (implement if needed, otherwise keep as stubs/remove)
  async login(username: string, password: string): Promise<AuthResponse> {
    // Example implementation:
    // const response = await this.api.post<AuthResponse>('/auth/login', { username, password });
    // localStorage.setItem('authToken', response.data.token); // Assuming AuthResponse includes token
    // return response; // Interceptor will extract data
    throw new Error('Login method not implemented.');
  }

  logout(): void {
    localStorage.removeItem('authToken');
    // Optionally: Call a backend logout endpoint
    console.log('Logged out');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    // Example implementation:
    // const response = await this.api.post<AuthResponse>('/auth/register', { username, email, password });
    // localStorage.setItem('authToken', response.data.token);
    // return response;
    throw new Error('Register method not implemented.');
  }

  // Market Data Methods
  // Note: Return types now reflect the data extracted by the interceptor
  
  // Assumes backend transforms Binance response to StockQuote[]
  public async getStockQuotes(symbols: string[]): Promise<StockQuote[]> { 
    const response = await this.api.get<{ data: StockQuote[] }>(`/market/quotes?symbols=${symbols.join(',')}`);
    return response as unknown as StockQuote[]; // Interceptor extracts .data.data
  }
  
  // Returns raw BinanceTicker24hr data
  public async getStockDetails(symbol: string): Promise<BinanceTicker24hr> {
    const response = await this.api.get<{ data: BinanceTicker24hr }>(`/market/stocks/${symbol}`);
    return response as unknown as BinanceTicker24hr; // Interceptor extracts .data.data
  }

  // Order Methods
  public async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await this.api.post<{ data: Order }>('/orders', orderData);
    return response as unknown as Order; // Interceptor extracts .data.data
  }

  public async getOrders(symbol: string): Promise<Order[]> {
    const response = await this.api.get<{ data: Order[] }>(`/orders?symbol=${symbol}`);
    return response as unknown as Order[]; // Interceptor extracts .data.data
  }

  // Needs adjustment based on how getOrder is implemented (query params?)
  public async getOrder(orderId: string): Promise<Order> {
    // Assuming getOrder backend endpoint expects symbol and orderId/origClientOrderId as query params
    // The actual parameters needed depend on your backend implementation
    // This method signature might need changing in ApiServiceInterface too.
    // Example: getOrder(symbol: string, params: { orderId?: number; origClientOrderId?: string })
    const response = await this.api.get<{ data: Order }>(`/orders/detail?orderId=${orderId}`); // Adjust endpoint/params as needed
    return response as unknown as Order; // Interceptor extracts .data.data
  }

  public async cancelOrder(orderId: string): Promise<any> {
    // Assuming cancelOrder backend expects symbol and orderId/origClientOrderId in body or params?
    // Let's assume body based on controller validation logic.
    // This method signature might need changing too.
    // Example: cancelOrder(symbol: string, params: { orderId?: number; origClientOrderId?: string })
    const response = await this.api.delete<{ data: any }>(`/orders`, { data: { orderId } }); // Sending orderId in body for DELETE
    return response; // Interceptor extracts .data.data
  }

  // Portfolio Method
  public async getPortfolio(): Promise<BinanceAccountInfo> {
    const response = await this.api.get<{ data: BinanceAccountInfo }>('/portfolio');
    return response as unknown as BinanceAccountInfo; // Interceptor extracts .data.data
  }

  // getMarketData - same as getStockDetails
  public async getMarketData(symbol: string): Promise<BinanceTicker24hr> {
    // Assuming a dedicated market-data endpoint exists, or reuse getStockDetails
    // const response = await this.api.get<{ data: BinanceTicker24hr }>(`/market-data/${symbol}`);
    // return response as unknown as BinanceTicker24hr;
    // OR simply reuse getStockDetails if they are the same:
    return this.getStockDetails(symbol);
  }

  // Convenience Methods (Optional)
  public async buyStock(symbol: string, quantity: number): Promise<Order> {
    return this.createOrder({
      symbol,
      side: OrderSide.BUY,
      type: OrderType.MARKET,
      quantity
    });
  }

  public async sellStock(symbol: string, quantity: number): Promise<Order> {
    return this.createOrder({
      symbol,
      side: OrderSide.SELL,
      type: OrderType.MARKET,
      quantity
    });
  }

  // REMOVED MOCK FUNCTION getStockPrice

}

// Singleton instance
const apiService = new ApiService();
export default apiService; 