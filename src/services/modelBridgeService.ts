import { MLPrediction, NLPSentiment, TechnicalIndicators } from '../types/strategy';

// Base URL for the *main backend* API which will proxy requests to the model service
// Use environment variable or default to Node.js server port
const BACKEND_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Interface for backend API responses (assuming a consistent structure)
interface BackendAPIResponse<T> {
  success: boolean;
  data?: T;
  message?: string; // Or error property depending on backend implementation
  error?: string;
}

/**
 * Service to communicate with the main backend for ML-related operations.
 * The main backend will then communicate with the Python ML service.
 */
export class ModelBridgeService {
  private static instance: ModelBridgeService;
  private apiKey: string | null = null; // Might be JWT token for main backend

  private constructor() {
    // TODO: Initialize with JWT token from auth context/local storage if needed
    this.apiKey = null; // Example: localStorage.getItem('authToken');
  }

  /**
   * Get the singleton instance of the service
   */
  public static getInstance(): ModelBridgeService {
    if (!ModelBridgeService.instance) {
      ModelBridgeService.instance = new ModelBridgeService();
    }
    return ModelBridgeService.instance;
  }

  /**
   * Set the API key/token (e.g., JWT) for authentication with the main backend
   */
  public setAuthToken(token: string | null): void {
    this.apiKey = token;
  }

  /**
   * Make a request to the main backend API
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Use the token for Authorization header if available (standard JWT)
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const options: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };

      const response = await fetch(`${BACKEND_API_BASE_URL}${endpoint}`, options);
      const result: BackendAPIResponse<T> = await response.json();

      if (!response.ok || !result.success) {
          const errorMsg = result.error || result.message || 'Unknown backend error occurred';
          console.error(`Backend API error for ${method} ${endpoint}:`, errorMsg, result);
          throw new Error(errorMsg);
      }

      // Assuming successful responses have data
      if (result.data === undefined) {
          console.warn(`Backend API success for ${method} ${endpoint} but no data returned.`);
          // Return null or an empty object/array depending on expected type T
          // Throwing an error might be safer if data is always expected
          throw new Error('No data received from backend');
      }

      return result.data as T;

    } catch (error) {
      console.error(`Error making backend API request to ${endpoint}:`, error);
      // Re-throw the error so UI components can handle it
      throw error;
    }
  }

  /**
   * Get technical indicators for a symbol (proxied through backend)
   * @param symbol The stock symbol to get indicators for
   * @param timeframe The timeframe for the indicators (e.g. '1d', '1h')
   */
  public async getTechnicalIndicators(
    symbol: string,
    timeframe: string = '1d'
  ): Promise<TechnicalIndicators> {
    // Call the main backend endpoint, which will then call the ML service
    return this.makeRequest<TechnicalIndicators>(
      `/ml/indicators/${symbol}?timeframe=${timeframe}` // Prefixed endpoint
    );
  }

  /**
   * Get sentiment analysis for news related to a symbol (proxied through backend)
   * @param symbol The stock symbol to analyze
   * @param sources - NOTE: This parameter might be deprecated if backend fetches news
   */
  public async getSentimentAnalysis(
    symbol: string,
    sources?: string[] // Making sources optional as backend might decide
  ): Promise<NLPSentiment> {
     // Call the main backend endpoint. Backend will fetch news, call ML sentiment.
     // We might only need the symbol here if the backend handles news fetching.
    return this.makeRequest<NLPSentiment>(
      `/ml/sentiment/analyze`,
      'POST',
      { symbol } // Send only symbol, backend fetches news & text for this symbol
      // If backend expects text: { text: "some news text..." }
    );
  }

  /**
   * Get price prediction for a symbol (proxied through backend)
   * @param symbol The stock symbol to predict
   * @param timeframe The prediction timeframe
   * @param modelType The type of model to use (optional)
   */
  public async getPricePrediction(
    symbol: string,
    timeframe: string = '1d',
    modelType?: string
  ): Promise<MLPrediction> {
     // Call the main backend endpoint. Backend gets data, calls ML prediction.
    return this.makeRequest<MLPrediction>(
      `/ml/prediction/price`,
      'POST',
      // Send parameters the backend needs to prepare data for the ML service
      { symbol, timeframe, modelType }
    );
  }

  // --- Methods for unimplemented ML service endpoints ---
  // These will also need corresponding endpoints in the main backend

  /**
   * Execute a custom model (proxied through backend)
   */
  public async executeCustomModel(
    modelId: string,
    inputs: Record<string, any>
  ): Promise<any> {
    return this.makeRequest<any>(
      `/ml/models/execute/${modelId}`, // Prefixed endpoint
      'POST',
      inputs
    );
  }

  /**
   * Train a new model or retrain an existing one (proxied through backend)
   */
  public async trainModel(
    modelType: string,
    config: Record<string, any>,
    modelId?: string
  ): Promise<{ modelId: string; status: string }> {
    return this.makeRequest<{ modelId: string; status: string }>(
      `/ml/models/train`, // Prefixed endpoint
      'POST',
      { modelType, config, modelId }
    );
  }

  /**
   * Get the status of a model training job (proxied through backend)
   */
  public async getTrainingStatus(
    jobId: string
  ): Promise<{ status: string; progress: number; message?: string }> {
    return this.makeRequest<{ status: string; progress: number; message?: string }>(
      `/ml/models/train/status/${jobId}` // Prefixed endpoint
    );
  }

  /**
   * Get a list of available models (proxied through backend)
   */
  public async getAvailableModels(): Promise<{ id: string; name: string; type: string; accuracy: number }[]> {
    return this.makeRequest<{ id: string; name: string; type: string; accuracy: number }[]>(
      '/ml/models' // Prefixed endpoint
    );
  }
}

// Export the singleton instance
export default ModelBridgeService.getInstance(); 