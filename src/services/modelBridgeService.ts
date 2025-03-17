import { MLPrediction, NLPSentiment, TechnicalIndicators } from '../types/strategy';

// Base URL for the model service API
const MODEL_API_BASE_URL = 'http://localhost:5000/api';

// Interface for model API responses
interface ModelAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Service to communicate with Python-based machine learning and NLP models
 * This is a placeholder implementation that will be replaced with actual API calls
 * when the Python backend is implemented.
 */
export class ModelBridgeService {
  private static instance: ModelBridgeService;
  private apiKey: string | null = null;

  private constructor() {
    // Initialize with API key from environment if available
    this.apiKey = null;
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
   * Set the API key for authentication
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Make a request to the model API
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

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const options: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };

      const response = await fetch(`${MODEL_API_BASE_URL}${endpoint}`, options);
      const result: ModelAPIResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      return result.data as T;
    } catch (error) {
      console.error('Error making model API request:', error);
      throw error;
    }
  }

  /**
   * Get technical indicators for a symbol
   * @param symbol The stock symbol to get indicators for
   * @param timeframe The timeframe for the indicators (e.g. '1d', '1h')
   */
  public async getTechnicalIndicators(
    symbol: string,
    timeframe: string = '1d'
  ): Promise<TechnicalIndicators> {
    // In a real implementation, this would call the Python API
    // For now, we'll return mock data
    return this.makeRequest<TechnicalIndicators>(
      `/indicators/${symbol}?timeframe=${timeframe}`
    );
  }

  /**
   * Get sentiment analysis for a symbol
   * @param symbol The stock symbol to analyze
   * @param sources The sources to include (default: all)
   */
  public async getSentimentAnalysis(
    symbol: string,
    sources: string[] = ['twitter', 'news', 'reddit']
  ): Promise<NLPSentiment> {
    return this.makeRequest<NLPSentiment>(
      `/sentiment/analyze`,
      'POST',
      { symbol, sources }
    );
  }

  /**
   * Get price prediction for a symbol
   * @param symbol The stock symbol to predict
   * @param timeframe The prediction timeframe
   * @param modelType The type of model to use (optional)
   */
  public async getPricePrediction(
    symbol: string,
    timeframe: string = '1d',
    modelType?: string
  ): Promise<MLPrediction> {
    return this.makeRequest<MLPrediction>(
      `/prediction/price`,
      'POST',
      { symbol, timeframe, modelType }
    );
  }

  /**
   * Execute a custom model
   * @param modelId The ID of the custom model to execute
   * @param inputs The inputs for the model
   */
  public async executeCustomModel(
    modelId: string,
    inputs: Record<string, any>
  ): Promise<any> {
    return this.makeRequest<any>(
      `/models/execute/${modelId}`,
      'POST',
      inputs
    );
  }

  /**
   * Train a new model or retrain an existing one
   * @param modelType The type of model to train
   * @param config The configuration for training
   * @param modelId Optional ID of an existing model to retrain
   */
  public async trainModel(
    modelType: string,
    config: Record<string, any>,
    modelId?: string
  ): Promise<{ modelId: string; status: string }> {
    return this.makeRequest<{ modelId: string; status: string }>(
      `/models/train`,
      'POST',
      { modelType, config, modelId }
    );
  }

  /**
   * Get the status of a model training job
   * @param jobId The ID of the training job
   */
  public async getTrainingStatus(
    jobId: string
  ): Promise<{ status: string; progress: number; message?: string }> {
    return this.makeRequest<{ status: string; progress: number; message?: string }>(
      `/models/train/status/${jobId}`
    );
  }

  /**
   * Get a list of available models
   */
  public async getAvailableModels(): Promise<{ id: string; name: string; type: string; accuracy: number }[]> {
    return this.makeRequest<{ id: string; name: string; type: string; accuracy: number }[]>(
      '/models'
    );
  }
}

// Export the singleton instance
export default ModelBridgeService.getInstance(); 