import { AlgolabClient } from './client';
import { Portfolio, Position } from '../../types/algolab';
import logger from '../../utils/logger';

/**
 * Portfolio Service
 * Provides methods to interact with ALGOLAB portfolio endpoints
 */
export class PortfolioService {
  private client: AlgolabClient;

  constructor(client: AlgolabClient) {
    this.client = client;
  }

  /**
   * Get current portfolio
   */
  async getPortfolio(): Promise<Portfolio> {
    try {
      return await this.client.get<Portfolio>('/portfolio');
    } catch (error) {
      logger.error('Error fetching portfolio', error);
      throw error;
    }
  }

  /**
   * Get all positions
   */
  async getPositions(): Promise<Position[]> {
    try {
      return await this.client.get<Position[]>('/portfolio/positions');
    } catch (error) {
      logger.error('Error fetching positions', error);
      throw error;
    }
  }

  /**
   * Get position for a specific symbol
   */
  async getPosition(symbol: string): Promise<Position> {
    try {
      return await this.client.get<Position>(`/portfolio/positions/${symbol}`);
    } catch (error) {
      logger.error(`Error fetching position for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Get historical portfolio performance
   */
  async getPortfolioHistory(startDate: string, endDate: string): Promise<any[]> {
    try {
      const params = { startDate, endDate };
      return await this.client.get<any[]>('/portfolio/history', params);
    } catch (error) {
      logger.error('Error fetching portfolio history', error);
      throw error;
    }
  }
} 