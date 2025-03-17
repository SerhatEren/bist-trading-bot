/**
 * Central price service for consistent stock price management
 */
export class PriceService {
  private static instance: PriceService;
  private prices: Record<string, number>;
  private subscribers: ((symbol: string, price: number) => void)[] = [];

  private constructor() {
    this.prices = {
      'GARAN': 16.5,
      'AKBNK': 12.5,
      'ISCTR': 11.2,
      'THYAO': 24.8,
      'ASELS': 30.2,
      'KCHOL': 42.6,
      'TUPRS': 92.4,
      'EREGL': 16.8,
      'BIMAS': 62.5,
      'TSKB': 2.7
    };

    // Simulate price updates
    if (typeof window !== 'undefined') {
      setInterval(() => {
        Object.keys(this.prices).forEach(symbol => {
          const currentPrice = this.prices[symbol];
          const change = (Math.random() - 0.5) * 0.02; // ±1% change
          const newPrice = +(currentPrice * (1 + change)).toFixed(2);
          this.updatePrice(symbol, newPrice);
        });
      }, 5000); // Update every 5 seconds
    }
  }

  public static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  public getPrice(symbol: string): number {
    return this.prices[symbol] || 0;
  }

  public getAllPrices(): Record<string, number> {
    return { ...this.prices };
  }

  public getAvailableSymbols(): string[] {
    return Object.keys(this.prices);
  }

  private updatePrice(symbol: string, price: number): void {
    this.prices[symbol] = price;
    this.notifySubscribers(symbol, price);
  }

  public subscribe(callback: (symbol: string, price: number) => void): void {
    this.subscribers.push(callback);
  }

  public unsubscribe(callback: (symbol: string, price: number) => void): void {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  private notifySubscribers(symbol: string, price: number): void {
    this.subscribers.forEach(callback => callback(symbol, price));
  }
} 