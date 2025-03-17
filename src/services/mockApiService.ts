import { 
  ApiResponse, 
  ApiServiceInterface,
  User, 
  Portfolio, 
  Position,
  Order,
  OrderSide,
  OrderType,
  OrderStatus,
  CreateOrderRequest
} from '../types/api';
import { PriceService } from './priceService';

// Simple implementation of MockApiService
class MockApiService implements ApiServiceInterface {
  private priceService: PriceService;
  private user: User;
  private portfolio: Portfolio;
  private orders: Order[];

  constructor() {
    this.priceService = PriceService.getInstance();
    
    // Initialize mock user
    this.user = {
      id: 'mock-user-1',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Initialize mock portfolio
    this.portfolio = {
      totalEquity: 100000,
      cash: 50000,
      positions: [
        {
          symbol: 'GARAN',
          quantity: 1000,
          averageCost: 15.5,
          marketValue: 16500,
          unrealizedPnl: 1000,
          unrealizedPnlPercentage: 6.45
        },
        {
          symbol: 'AKBNK',
          quantity: 500,
          averageCost: 11.8,
          marketValue: 6250,
          unrealizedPnl: 350,
          unrealizedPnlPercentage: 5.93
        }
      ]
    };

    // Initialize mock orders
    this.orders = [];

    // Subscribe to price updates
    this.priceService.subscribe(this.updatePortfolioOnPriceChange.bind(this));
  }

  private generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private updatePortfolioOnPriceChange(symbol: string, price: number): void {
    this.portfolio.positions = this.portfolio.positions.map(position => {
      if (position.symbol === symbol) {
        const marketValue = position.quantity * price;
        const unrealizedPnl = marketValue - (position.quantity * position.averageCost);
        return {
          ...position,
          marketValue,
          unrealizedPnl,
          unrealizedPnlPercentage: (unrealizedPnl / (position.quantity * position.averageCost)) * 100
        };
      }
      return position;
    });

    // Update total equity
    this.portfolio.totalEquity = this.portfolio.cash + 
      this.portfolio.positions.reduce((sum, pos) => sum + pos.marketValue, 0);
  }

  public getStockPrice(symbol: string): number {
    return this.priceService.getPrice(symbol);
  }

  public async getCurrentUser(): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: { ...this.user }
    };
  }

  public async getPortfolio(): Promise<ApiResponse<Portfolio>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: { ...this.portfolio },
      status: 200
    };
  }

  public async getOrders(): Promise<ApiResponse<Order[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [...this.orders],
      status: 200
    };
  }

  public async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const { symbol, side, type, quantity, price, stopPrice } = orderData;
    
    // Validate symbol
    if (!this.priceService.getPrice(symbol)) {
      throw {
        response: {
          data: {
            message: `Invalid symbol: ${symbol}`
          },
          status: 400
        }
      };
    }
    
    // Validate quantity
    if (quantity <= 0) {
      throw {
        response: {
          data: {
            message: 'Quantity must be positive'
          },
          status: 400
        }
      };
    }

    // Check balance for buy orders
    if (side === OrderSide.BUY) {
      const orderPrice = price || this.priceService.getPrice(symbol);
      const orderValue = quantity * orderPrice;
      const fees = orderValue * 0.002; // 0.2% commission
      const totalCost = orderValue + fees;
      
      if (totalCost > this.portfolio.cash) {
        throw {
          response: {
            data: {
              message: 'Insufficient funds'
            },
            status: 400
          }
        };
      }
    }
    
    // Check position for sell orders
    if (side === OrderSide.SELL) {
      const position = this.portfolio.positions.find(p => p.symbol === symbol);
      
      if (!position) {
        throw {
          response: {
            data: {
              message: `No position found for ${symbol}`
            },
            status: 400
          }
        };
      }
      
      if (position.quantity < quantity) {
        throw {
          response: {
            data: {
              message: `Insufficient ${symbol} shares: have ${position.quantity}, trying to sell ${quantity}`
            },
            status: 400
          }
        };
      }
    }
    
    // Create new order
    const newOrder: Order = {
      id: this.generateOrderId(),
      symbol,
      side,
      type,
      quantity,
      price,
      stopPrice,
      status: OrderStatus.FILLED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to orders list
    this.orders.unshift(newOrder);
    
    // Update portfolio
    const currentPrice = this.priceService.getPrice(symbol);
    const orderValue = quantity * currentPrice;
    const fees = orderValue * 0.002;

    if (side === OrderSide.BUY) {
      // Update cash
      this.portfolio.cash -= (orderValue + fees);
      
      // Update or add position
      const existingPosition = this.portfolio.positions.find(p => p.symbol === symbol);
      if (existingPosition) {
        const totalQuantity = existingPosition.quantity + quantity;
        const totalCost = (existingPosition.quantity * existingPosition.averageCost) + orderValue;
        existingPosition.quantity = totalQuantity;
        existingPosition.averageCost = totalCost / totalQuantity;
        existingPosition.marketValue = totalQuantity * currentPrice;
        existingPosition.unrealizedPnl = existingPosition.marketValue - (totalQuantity * existingPosition.averageCost);
        existingPosition.unrealizedPnlPercentage = (existingPosition.unrealizedPnl / (totalQuantity * existingPosition.averageCost)) * 100;
      } else {
        this.portfolio.positions.push({
          symbol,
          quantity,
          averageCost: currentPrice,
          marketValue: orderValue,
          unrealizedPnl: 0,
          unrealizedPnlPercentage: 0
        });
      }
    } else {
      // Update cash
      this.portfolio.cash += (orderValue - fees);
      
      // Update position
      const position = this.portfolio.positions.find(p => p.symbol === symbol)!;
      position.quantity -= quantity;
      
      if (position.quantity === 0) {
        this.portfolio.positions = this.portfolio.positions.filter(p => p.symbol !== symbol);
      } else {
        position.marketValue = position.quantity * currentPrice;
        position.unrealizedPnl = position.marketValue - (position.quantity * position.averageCost);
        position.unrealizedPnlPercentage = (position.unrealizedPnl / (position.quantity * position.averageCost)) * 100;
      }
    }

    // Update total equity
    this.portfolio.totalEquity = this.portfolio.cash + 
      this.portfolio.positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    
    return {
      data: newOrder,
      status: 200,
      message: `Order ${newOrder.id} has been filled`
    };
  }

  public async buyStock(symbol: string, quantity: number): Promise<ApiResponse<Order>> {
    return this.createOrder({
      symbol,
      side: OrderSide.BUY,
      type: OrderType.MARKET,
      quantity
    });
  }

  public async sellStock(symbol: string, quantity: number): Promise<ApiResponse<Order>> {
    return this.createOrder({
      symbol,
      side: OrderSide.SELL,
      type: OrderType.MARKET,
      quantity
    });
  }
}

// Export singleton instance
export default new MockApiService(); 