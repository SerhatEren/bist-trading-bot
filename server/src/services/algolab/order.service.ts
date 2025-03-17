import { AlgolabClient } from './client';
import { Order, OrderRequest, OrderStatus } from '../../types/algolab';
import logger from '../../utils/logger';

/**
 * Order Service
 * Provides methods to interact with ALGOLAB order endpoints
 */
export class OrderService {
  private client: AlgolabClient;

  constructor(client: AlgolabClient) {
    this.client = client;
  }

  /**
   * Create a new order
   */
  async createOrder(orderRequest: OrderRequest): Promise<Order> {
    try {
      return await this.client.post<Order>('/orders', orderRequest);
    } catch (error) {
      logger.error('Error creating order', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      return await this.client.get<Order>(`/orders/${orderId}`);
    } catch (error) {
      logger.error(`Error fetching order ${orderId}`, error);
      throw error;
    }
  }

  /**
   * Get all orders
   */
  async getOrders(status?: OrderStatus): Promise<Order[]> {
    try {
      const params = status ? { status } : undefined;
      return await this.client.get<Order[]>('/orders', params);
    } catch (error) {
      logger.error('Error fetching orders', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      return await this.client.delete<Order>(`/orders/${orderId}`);
    } catch (error) {
      logger.error(`Error cancelling order ${orderId}`, error);
      throw error;
    }
  }

  /**
   * Update an existing order
   */
  async updateOrder(orderId: string, orderRequest: Partial<OrderRequest>): Promise<Order> {
    try {
      return await this.client.put<Order>(`/orders/${orderId}`, orderRequest);
    } catch (error) {
      logger.error(`Error updating order ${orderId}`, error);
      throw error;
    }
  }
} 