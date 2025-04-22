import axios, { AxiosInstance, AxiosError } from 'axios';
import config from '../config';
import logger from '../utils/logger';

interface MlApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class MlServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.mlService.baseUrl,
      timeout: 15000, // Increased timeout for potentially longer ML operations
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        logger.error(`Error calling ML service at ${error.config?.baseURL}${error.config?.url}: ${error.message}`, {
          status: error.response?.status,
          data: error.response?.data,
        });
        // Don't reject here, let the calling service handle the error structure
        return Promise.resolve(error.response); // Resolve with the error response
      }
    );
  }

  async post<T>(endpoint: string, data: any): Promise<MlApiResponse<T>> {
    try {
        const response = await this.client.post<MlApiResponse<T>>(endpoint, data);
        // Handle cases where axios interceptor resolved with an error response
        if (response.status >= 400) {
            return {
                success: false,
                error: (response.data as any)?.error || (response.data as any)?.message || `ML service error (status ${response.status})`,
            };
        }
        return response.data;
    } catch (error) {
        // This catch block might be redundant due to the interceptor,
        // but kept for safety for network errors etc.
        logger.error(`Network or unexpected error calling ML service endpoint ${endpoint}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error contacting ML service',
        };
    }
  }

  async get<T>(endpoint: string, params?: any): Promise<MlApiResponse<T>> {
    try {
        const response = await this.client.get<MlApiResponse<T>>(endpoint, { params });
        // Handle cases where axios interceptor resolved with an error response
        if (response.status >= 400) {
            return {
                success: false,
                error: (response.data as any)?.error || (response.data as any)?.message || `ML service error (status ${response.status})`,
            };
        }
        return response.data;
    } catch (error) {
        logger.error(`Network or unexpected error calling ML service endpoint ${endpoint}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error contacting ML service',
        };
    }
  }

}

export default new MlServiceClient(); 