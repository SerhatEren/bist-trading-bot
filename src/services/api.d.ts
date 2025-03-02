export interface StockData {
    // Add your stock data properties here, for example:
    symbol: string;
    price: number;
    change: number;
    // ... other properties
}

export function fetchBist30Data(): Promise<StockData[]>;
// Add other exported functions with their types 