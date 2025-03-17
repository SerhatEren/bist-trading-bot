import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { AlgolabApiError, AlgolabApiResponse } from '../../types/algolab';
import config from '../../config/env';
import logger from '../../utils/logger';

/**
 * ALGOLAB API Client
 * Handles authentication, error handling, rate limiting, and retry logic
 */
export class AlgolabClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private apiKey: string;
  private apiSecret: string;
  private retryCount = 3;
  private retryDelay = 1000;

  constructor(apiKey = config.algolab.apiKey, apiSecret = config.algolab.apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    this.client = axios.create({
      baseURL: config.algolab.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      async (config) => {
        // Check if token is valid, if not authenticate
        if (!this.isTokenValid()) {
          await this.authenticate();
        }

        // Add token to request header
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle rate limiting (429 status code)
        if (error.response?.status === 429) {
          logger.warn('Rate limit exceeded for ALGOLAB API');
          const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10);
          await this.sleep(retryAfter * 1000);
          return this.client(originalRequest);
        }

        // Handle authentication errors (401 status code)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.token = null;
          this.tokenExpiresAt = null;
          await this.authenticate();
          return this.client(originalRequest);
        }

        // Handle retry logic for server errors (5xx status codes)
        if (error.response?.status && error.response.status >= 500 && !originalRequest._retry) {
          return this.retryRequest(originalRequest);
        }

        // Format error response
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Check if the current token is valid
   */
  private isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiresAt) {
      return false;
    }

    // Check if token has expired or will expire in the next 5 minutes
    const now = new Date();
    const expiresIn = this.tokenExpiresAt.getTime() - now.getTime();
    return expiresIn > 5 * 60 * 1000;
  }

  /**
   * Authenticate with the ALGOLAB API
   */
  private async authenticate(): Promise<void> {
    try {
      const response = await this.client.post<AlgolabApiResponse<{ token: string; expiresAt: string }>>(
        '/auth/login',
        {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
        }
      );

      if (response.data.success && response.data.data) {
        this.token = response.data.data.token;
        this.tokenExpiresAt = new Date(response.data.data.expiresAt);
        logger.info('Successfully authenticated with ALGOLAB API');
      } else {
        logger.error('Failed to authenticate with ALGOLAB API', response.data);
        throw new Error('Authentication failed');
      }
    } catch (error) {
      logger.error('Error authenticating with ALGOLAB API', error);
      throw error;
    }
  }

  /**
   * Retry a failed request
   */
  private async retryRequest(config: AxiosRequestConfig & { _retry?: boolean }): Promise<any> {
    return new Promise((resolve, reject) => {
      let retryCount = 0;

      const retry = async () => {
        try {
          if (retryCount < this.retryCount) {
            retryCount++;
            const delay = this.retryDelay * retryCount;
            logger.info(`Retrying request (${retryCount}/${this.retryCount}) after ${delay}ms`);
            await this.sleep(delay);
            const response = await this.client(config);
            resolve(response);
          } else {
            reject(new Error(`Failed after ${this.retryCount} retries`));
          }
        } catch (error) {
          if (retryCount < this.retryCount) {
            retry();
          } else {
            reject(error);
          }
        }
      };

      retry();
    });
  }

  /**
   * Format error response
   */
  private formatError(error: AxiosError): AlgolabApiError {
    const response = error.response?.data as any;
    
    if (response && response.errors && Array.isArray(response.errors)) {
      return {
        code: String(error.response?.status || 'UNKNOWN'),
        message: response.message || error.message,
        field: response.errors[0]?.field,
      };
    }

    return {
      code: String(error.response?.status || 'UNKNOWN'),
      message: error.message,
    };
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make a GET request to the ALGOLAB API
   */
  public async get<T>(path: string, params?: any): Promise<T> {
    try {
      const response = await this.client.get<AlgolabApiResponse<T>>(path, { params });
      if (!response.data.success) {
        throw new Error(response.data.message || 'API request failed');
      }
      return response.data.data as T;
    } catch (error) {
      logger.error(`Error in GET request to ${path}`, error);
      throw error;
    }
  }

  /**
   * Make a POST request to the ALGOLAB API
   */
  public async post<T>(path: string, data?: any): Promise<T> {
    try {
      const response = await this.client.post<AlgolabApiResponse<T>>(path, data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'API request failed');
      }
      return response.data.data as T;
    } catch (error) {
      logger.error(`Error in POST request to ${path}`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request to the ALGOLAB API
   */
  public async put<T>(path: string, data?: any): Promise<T> {
    try {
      const response = await this.client.put<AlgolabApiResponse<T>>(path, data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'API request failed');
      }
      return response.data.data as T;
    } catch (error) {
      logger.error(`Error in PUT request to ${path}`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request to the ALGOLAB API
   */
  public async delete<T>(path: string): Promise<T> {
    try {
      const response = await this.client.delete<AlgolabApiResponse<T>>(path);
      if (!response.data.success) {
        throw new Error(response.data.message || 'API request failed');
      }
      return response.data.data as T;
    } catch (error) {
      logger.error(`Error in DELETE request to ${path}`, error);
      throw error;
    }
  }
} 