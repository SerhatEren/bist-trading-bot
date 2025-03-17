import { AlgolabClient } from './client';
import { MarketDataRequest, Stock, StockPrice } from '../../types/algolab';
import logger from '../../utils/logger';

/**
 * Market Data Service
 * Provides methods to interact with ALGOLAB market data endpoints
 */
export class MarketDataService {
  private client: AlgolabClient;

  constructor(client: AlgolabClient) {
    this.client = client;
  }

  /**
   * Get list of available stocks
   */
  async getStocks(): Promise<Stock[]> {
    try {
      return await this.client.get<Stock[]>('/market/stocks');
    } catch (error) {
      logger.error('Error fetching stocks', error);
      throw error;
    }
  }

  /**
   * Get stock price for a specific symbol
   */
  async getStockPrice(symbol: string): Promise<StockPrice> {
    try {
      return await this.client.get<StockPrice>(`/market/price/${symbol}`);
    } catch (error) {
      logger.error(`Error fetching price for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Get stock prices for multiple symbols
   */
  async getStockPrices(symbols: string[]): Promise<StockPrice[]> {
    try {
      const params: MarketDataRequest = { symbols };
      return await this.client.get<StockPrice[]>('/market/prices', params);
    } catch (error) {
      logger.error('Error fetching prices for multiple symbols', error);
      throw error;
    }
  }

  /**
   * Get historical data for a stock
   */
  async getHistoricalData(
    symbol: string,
    startDate: string,
    endDate: string,
    interval: 'day' | 'hour' | 'minute' = 'day'
  ): Promise<StockPrice[]> {
    try {
      const params: MarketDataRequest = {
        symbol,
        startDate,
        endDate,
        interval,
      };
      return await this.client.get<StockPrice[]>('/market/historical', params);
    } catch (error) {
      logger.error(`Error fetching historical data for ${symbol}`, error);
      throw error;
    }
  }
} 