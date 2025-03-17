import { 
  AlgolabAuthResponse, 
  OrderRequest, 
  Order,
  StockQuote,
  StockDetails,
  Portfolio,
  OrderStatus,
  OrderSide,
  OrderType,
  Position
} from '../types/algolab';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock ALGOLAB API İstemcisi
 * Gerçek ALGOLAB API olmadan geliştirme ve test için kullanılabilir
 */
class MockAlgolabApiClient {
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private mockOrders: Order[] = [];
  private mockPositions: Position[] = [];
  private mockCash: number = 100000; // 100,000 TL başlangıç bakiyesi

  // Örnek hisse senetleri
  private mockStocks: Map<string, StockDetails> = new Map([
    ['GARAN', {
      symbol: 'GARAN',
      name: 'Garanti Bankası',
      sector: 'Bankacılık',
      marketCap: 84500000000,
      peRatio: 5.8,
      dividendYield: 2.4,
      highPrice52Week: 36.42,
      lowPrice52Week: 18.76
    }],
    ['THYAO', {
      symbol: 'THYAO',
      name: 'Türk Hava Yolları',
      sector: 'Ulaştırma',
      marketCap: 124700000000,
      peRatio: 7.2,
      dividendYield: 1.8,
      highPrice52Week: 78.15,
      lowPrice52Week: 32.64
    }],
    ['KRDMD', {
      symbol: 'KRDMD',
      name: 'Kardemir (D)',
      sector: 'Demir Çelik',
      marketCap: 18400000000,
      peRatio: 4.3,
      dividendYield: 3.6,
      highPrice52Week: 12.84,
      lowPrice52Week: 4.26
    }],
    ['ISCTR', {
      symbol: 'ISCTR',
      name: 'İş Bankası (C)',
      sector: 'Bankacılık',
      marketCap: 72600000000,
      peRatio: 6.1,
      dividendYield: 2.8,
      highPrice52Week: 32.15,
      lowPrice52Week: 16.28
    }],
    ['EREGL', {
      symbol: 'EREGL',
      name: 'Ereğli Demir Çelik',
      sector: 'Demir Çelik',
      marketCap: 112500000000,
      peRatio: 8.4,
      dividendYield: 5.2,
      highPrice52Week: 42.76,
      lowPrice52Week: 18.35
    }]
  ]);

  // Örnek hisse fiyatları
  private mockQuotes: Map<string, StockQuote> = new Map([
    ['GARAN', {
      symbol: 'GARAN',
      lastPrice: 28.74,
      dailyChange: 0.48,
      dailyChangePercentage: 1.70,
      bidPrice: 28.72,
      askPrice: 28.76,
      volume: 24500000,
      timestamp: Date.now()
    }],
    ['THYAO', {
      symbol: 'THYAO',
      lastPrice: 64.85,
      dailyChange: -1.25,
      dailyChangePercentage: -1.89,
      bidPrice: 64.80,
      askPrice: 64.90,
      volume: 18700000,
      timestamp: Date.now()
    }],
    ['KRDMD', {
      symbol: 'KRDMD',
      lastPrice: 8.42,
      dailyChange: 0.36,
      dailyChangePercentage: 4.47,
      bidPrice: 8.40,
      askPrice: 8.44,
      volume: 42300000,
      timestamp: Date.now()
    }],
    ['ISCTR', {
      symbol: 'ISCTR',
      lastPrice: 24.68,
      dailyChange: 0.22,
      dailyChangePercentage: 0.90,
      bidPrice: 24.66,
      askPrice: 24.70,
      volume: 32100000,
      timestamp: Date.now()
    }],
    ['EREGL', {
      symbol: 'EREGL',
      lastPrice: 32.54,
      dailyChange: -0.86,
      dailyChangePercentage: -2.58,
      bidPrice: 32.52,
      askPrice: 32.56,
      volume: 15800000,
      timestamp: Date.now()
    }]
  ]);

  constructor() {
    logger.info('Mock ALGOLAB API istemcisi başlatıldı');
    logger.warn('Bu mock API sadece geliştirme ve test içindir, gerçek işlemler yapamaz!');
  }

  /**
   * Mock kimlik doğrulama
   */
  public async authenticate(): Promise<void> {
    try {
      // Mock token oluşturma
      this.token = uuidv4();
      // 24 saat geçerli token
      this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      
      logger.info('Mock ALGOLAB API kimlik doğrulama başarılı');
    } catch (error) {
      logger.error('Mock ALGOLAB API kimlik doğrulama başarısız', error);
      throw new Error('Kimlik doğrulama başarısız');
    }
  }

  /**
   * Mock hisse senedi fiyatlarını güncelleme (rastgele değişimler)
   */
  private updateMockQuotes(): void {
    this.mockQuotes.forEach((quote, symbol) => {
      // Rastgele fiyat değişimi (%2'ye kadar)
      const changePercent = (Math.random() * 4) - 2; // -2% ile +2% arası
      const change = quote.lastPrice * (changePercent / 100);
      
      const newPrice = quote.lastPrice + change;
      
      this.mockQuotes.set(symbol, {
        ...quote,
        lastPrice: parseFloat(newPrice.toFixed(2)),
        dailyChange: parseFloat(change.toFixed(2)),
        dailyChangePercentage: parseFloat(changePercent.toFixed(2)),
        bidPrice: parseFloat((newPrice - 0.02).toFixed(2)),
        askPrice: parseFloat((newPrice + 0.02).toFixed(2)),
        timestamp: Date.now()
      });
    });
  }

  /**
   * Mock hisse senedi fiyat bilgilerini alır
   */
  public async getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
    try {
      // Hisse fiyatlarını güncelle
      this.updateMockQuotes();
      
      const quotes: StockQuote[] = [];
      
      for (const symbol of symbols) {
        const quote = this.mockQuotes.get(symbol);
        if (quote) {
          quotes.push(quote);
        } else {
          // İstenilen hisse yoksa, rastgele veri oluştur
          const price = parseFloat((Math.random() * 100 + 10).toFixed(2));
          const change = parseFloat((Math.random() * 4 - 2).toFixed(2));
          const changePercent = parseFloat(((change / price) * 100).toFixed(2));
          
          quotes.push({
            symbol,
            lastPrice: price,
            dailyChange: change,
            dailyChangePercentage: changePercent,
            bidPrice: parseFloat((price - 0.02).toFixed(2)),
            askPrice: parseFloat((price + 0.02).toFixed(2)),
            volume: Math.round(Math.random() * 40000000 + 5000000),
            timestamp: Date.now()
          });
        }
      }
      
      return quotes;
    } catch (error) {
      logger.error(`Mock hisse fiyat bilgisi alınamadı: ${symbols.join(',')}`, error);
      throw error;
    }
  }

  /**
   * Mock hisse senedi detaylarını alır
   */
  public async getStockDetails(symbol: string): Promise<StockDetails> {
    try {
      const stockDetails = this.mockStocks.get(symbol);
      
      if (stockDetails) {
        return stockDetails;
      } else {
        // İstenilen hisse yoksa, rastgele veri oluştur
        return {
          symbol,
          name: `${symbol} Anonim Şirketi`,
          sector: 'Diğer',
          marketCap: Math.round(Math.random() * 100000000000 + 1000000000),
          peRatio: parseFloat((Math.random() * 15 + 3).toFixed(1)),
          dividendYield: parseFloat((Math.random() * 5).toFixed(1)),
          highPrice52Week: parseFloat((Math.random() * 100 + 20).toFixed(2)),
          lowPrice52Week: parseFloat((Math.random() * 20 + 5).toFixed(2))
        };
      }
    } catch (error) {
      logger.error(`Mock hisse detayları alınamadı: ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Mock kullanıcı portföyünü alır
   */
  public async getPortfolio(): Promise<Portfolio> {
    try {
      // Pozisyonların güncel değerlerini hesapla
      const positions = await Promise.all(this.mockPositions.map(async (position) => {
        const quotes = await this.getStockQuotes([position.symbol]);
        const quote = quotes[0];
        const marketValue = position.quantity * quote.lastPrice;
        const unrealizedPnl = marketValue - (position.quantity * position.averageCost);
        const unrealizedPnlPercentage = (unrealizedPnl / (position.quantity * position.averageCost)) * 100;
        
        return {
          ...position,
          marketValue,
          unrealizedPnl,
          unrealizedPnlPercentage
        };
      }));
      
      // Toplam değeri hesapla
      const totalPositionValue = positions.reduce((total, position) => total + position.marketValue, 0);
      const totalEquity = this.mockCash + totalPositionValue;
      
      return {
        totalEquity,
        cash: this.mockCash,
        positions
      };
    } catch (error) {
      logger.error('Mock portföy bilgisi alınamadı', error);
      throw error;
    }
  }

  /**
   * Mock emir oluşturur
   */
  public async createOrder(orderRequest: OrderRequest): Promise<Order> {
    try {
      const now = Date.now();
      const orderId = uuidv4();
      
      // Hisse fiyatını al
      const quotes = await this.getStockQuotes([orderRequest.symbol]);
      const quote = quotes[0];
      
      // Limit emirde fiyat kontrolü
      if (orderRequest.type === OrderType.LIMIT && !orderRequest.price) {
        throw new Error('Limit emirlerde fiyat belirtilmelidir');
      }
      
      // Stop emirde stop fiyatı kontrolü
      if ((orderRequest.type === OrderType.STOP || orderRequest.type === OrderType.STOP_LIMIT) && !orderRequest.stopPrice) {
        throw new Error('Stop emirlerde stop fiyatı belirtilmelidir');
      }
      
      // Limit veya stop limit emirlerde fiyat kontrolü
      if (orderRequest.type === OrderType.STOP_LIMIT && !orderRequest.price) {
        throw new Error('Stop limit emirlerde fiyat belirtilmelidir');
      }
      
      // Emir fiyatını belirle
      let executionPrice: number;
      let orderStatus: OrderStatus;
      
      if (orderRequest.type === OrderType.MARKET) {
        // Piyasa emri hemen gerçekleşir
        executionPrice = orderRequest.side === OrderSide.BUY ? quote.askPrice : quote.bidPrice;
        orderStatus = OrderStatus.FILLED;
      } else if (orderRequest.type === OrderType.LIMIT) {
        // Limit emirleri için
        if (orderRequest.side === OrderSide.BUY) {
          orderStatus = orderRequest.price! >= quote.askPrice ? OrderStatus.FILLED : OrderStatus.PENDING;
          executionPrice = orderStatus === OrderStatus.FILLED ? quote.askPrice : orderRequest.price!;
        } else {
          orderStatus = orderRequest.price! <= quote.bidPrice ? OrderStatus.FILLED : OrderStatus.PENDING;
          executionPrice = orderStatus === OrderStatus.FILLED ? quote.bidPrice : orderRequest.price!;
        }
      } else {
        // Stop ve Stop-Limit emirleri için
        orderStatus = OrderStatus.PENDING;
        executionPrice = orderRequest.price || quote.lastPrice;
      }
      
      // Yeni emir oluştur
      const newOrder: Order = {
        id: orderId,
        ...orderRequest,
        status: orderStatus,
        filledQuantity: orderStatus === OrderStatus.FILLED ? orderRequest.quantity : 0,
        averagePrice: orderStatus === OrderStatus.FILLED ? executionPrice : undefined,
        commission: orderStatus === OrderStatus.FILLED ? parseFloat((executionPrice * orderRequest.quantity * 0.0015).toFixed(2)) : undefined,
        createdAt: now,
        updatedAt: now
      };
      
      // Emri kaydet
      this.mockOrders.push(newOrder);
      
      // Emir gerçekleştiyse portföyü güncelle
      if (orderStatus === OrderStatus.FILLED) {
        this.updatePortfolio(newOrder, executionPrice);
      }
      
      return newOrder;
    } catch (error) {
      logger.error(`Mock emir oluşturulamadı: ${JSON.stringify(orderRequest)}`, error);
      throw error;
    }
  }

  /**
   * Portföyü güncelle
   */
  private updatePortfolio(order: Order, executionPrice: number): void {
    const totalCost = executionPrice * order.quantity;
    const commission = totalCost * 0.0015; // %0.15 komisyon
    
    if (order.side === OrderSide.BUY) {
      // Alış işlemi
      // Nakit bakiyeyi güncelle
      this.mockCash -= (totalCost + commission);
      
      // Pozisyonu güncelle
      const existingPosition = this.mockPositions.find(p => p.symbol === order.symbol);
      
      if (existingPosition) {
        // Mevcut pozisyonu güncelle (ortalama maliyeti yeniden hesapla)
        const totalShares = existingPosition.quantity + order.quantity;
        const totalCost = (existingPosition.quantity * existingPosition.averageCost) + (order.quantity * executionPrice);
        const newAverageCost = totalCost / totalShares;
        
        existingPosition.quantity = totalShares;
        existingPosition.averageCost = parseFloat(newAverageCost.toFixed(2));
      } else {
        // Yeni pozisyon oluştur
        this.mockPositions.push({
          symbol: order.symbol,
          quantity: order.quantity,
          averageCost: executionPrice,
          marketValue: totalCost,
          unrealizedPnl: 0,
          unrealizedPnlPercentage: 0
        });
      }
    } else {
      // Satış işlemi
      // Nakit bakiyeyi güncelle
      this.mockCash += (totalCost - commission);
      
      // Pozisyonu güncelle
      const existingPosition = this.mockPositions.find(p => p.symbol === order.symbol);
      
      if (existingPosition) {
        if (existingPosition.quantity <= order.quantity) {
          // Tüm pozisyonu kapat
          this.mockPositions = this.mockPositions.filter(p => p.symbol !== order.symbol);
        } else {
          // Pozisyonu azalt (ortalama maliyet değişmez)
          existingPosition.quantity -= order.quantity;
        }
      } else {
        // Pozisyon yok, hata
        logger.error(`Satış emrinde pozisyon bulunamadı: ${order.symbol}`);
      }
    }
  }

  /**
   * Mock emir durumunu alır
   */
  public async getOrder(orderId: string): Promise<Order> {
    try {
      const order = this.mockOrders.find(o => o.id === orderId);
      
      if (!order) {
        throw new Error(`${orderId} ID'li emir bulunamadı`);
      }
      
      return order;
    } catch (error) {
      logger.error(`Mock emir bilgisi alınamadı: ${orderId}`, error);
      throw error;
    }
  }

  /**
   * Mock tüm emirleri alır
   */
  public async getOrders(): Promise<Order[]> {
    try {
      return this.mockOrders;
    } catch (error) {
      logger.error('Mock emirler alınamadı', error);
      throw error;
    }
  }

  /**
   * Mock emri iptal eder
   */
  public async cancelOrder(orderId: string): Promise<Order> {
    try {
      const orderIndex = this.mockOrders.findIndex(o => o.id === orderId);
      
      if (orderIndex === -1) {
        throw new Error(`${orderId} ID'li emir bulunamadı`);
      }
      
      const order = this.mockOrders[orderIndex];
      
      if (order.status === OrderStatus.FILLED || order.status === OrderStatus.CANCELED) {
        throw new Error(`${orderId} ID'li emir iptal edilemez. Durum: ${order.status}`);
      }
      
      // Emri iptal et
      const updatedOrder = {
        ...order,
        status: OrderStatus.CANCELED,
        updatedAt: Date.now()
      };
      
      this.mockOrders[orderIndex] = updatedOrder;
      
      return updatedOrder;
    } catch (error) {
      logger.error(`Mock emir iptal edilemedi: ${orderId}`, error);
      throw error;
    }
  }
}

export default MockAlgolabApiClient; 