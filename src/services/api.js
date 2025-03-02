// This is a mock implementation, replace with actual API calls
export const fetchBist30Data = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Mock data for BIST30 stocks
  const mockBist30 = [
    { symbol: 'AKBNK', lastPrice: 145.20, change: 2.35, volume: 12500000, high: 146.50, low: 142.10 },
    { symbol: 'ARCLK', lastPrice: 237.80, change: -1.20, volume: 5600000, high: 241.30, low: 235.40 },
    { symbol: 'ASELS', lastPrice: 88.15, change: 0.45, volume: 8900000, high: 89.20, low: 87.30 },
    { symbol: 'BIMAS', lastPrice: 195.60, change: 1.75, volume: 6400000, high: 197.20, low: 192.10 },
    { symbol: 'EKGYO', lastPrice: 18.24, change: -0.65, volume: 22000000, high: 18.56, low: 18.10 },
    { symbol: 'EREGL', lastPrice: 44.78, change: 1.20, volume: 14000000, high: 45.12, low: 44.26 },
    { symbol: 'FROTO', lastPrice: 523.40, change: 2.85, volume: 4200000, high: 525.60, low: 512.30 },
    { symbol: 'GARAN', lastPrice: 28.16, change: 0.90, volume: 30000000, high: 28.42, low: 27.84 },
    { symbol: 'HALKB', lastPrice: 15.76, change: -1.40, volume: 18000000, high: 16.10, low: 15.62 },
    { symbol: 'ISCTR', lastPrice: 267.50, change: 1.30, volume: 9400000, high: 269.70, low: 264.20 },
    { symbol: 'KCHOL', lastPrice: 156.40, change: 0.75, volume: 7300000, high: 157.20, low: 155.10 },
    { symbol: 'KOZAA', lastPrice: 62.35, change: -2.10, volume: 6800000, high: 63.80, low: 62.05 },
    { symbol: 'KOZAL', lastPrice: 451.20, change: 1.65, volume: 3100000, high: 455.80, low: 446.40 },
    { symbol: 'PETKM', lastPrice: 12.84, change: -0.35, volume: 19500000, high: 12.96, low: 12.78 },
    { symbol: 'PGSUS', lastPrice: 338.70, change: 3.20, volume: 2400000, high: 342.50, low: 331.40 },
    { symbol: 'SAHOL', lastPrice: 44.26, change: 0.55, volume: 11600000, high: 44.68, low: 43.94 },
    { symbol: 'SASA', lastPrice: 84.15, change: -1.85, volume: 9200000, high: 85.70, low: 83.60 },
    { symbol: 'SISE', lastPrice: 32.48, change: 1.10, volume: 16800000, high: 32.76, low: 32.22 },
    { symbol: 'TAVHL', lastPrice: 178.30, change: 2.45, volume: 4900000, high: 180.20, low: 175.60 },
    { symbol: 'TCELL', lastPrice: 42.86, change: -0.70, volume: 13200000, high: 43.24, low: 42.58 },
    { symbol: 'THYAO', lastPrice: 187.20, change: 1.95, volume: 8700000, high: 189.40, low: 184.60 },
    { symbol: 'TOASO', lastPrice: 158.90, change: 0.65, volume: 5300000, high: 159.70, low: 157.80 },
    { symbol: 'TUPRS', lastPrice: 205.60, change: 2.10, volume: 6100000, high: 207.80, low: 202.40 },
    { symbol: 'VAKBN', lastPrice: 14.68, change: -0.85, volume: 24000000, high: 14.92, low: 14.56 },
    { symbol: 'YKBNK', lastPrice: 18.34, change: 1.15, volume: 20500000, high: 18.52, low: 18.12 },
    { symbol: 'MGROS', lastPrice: 122.40, change: -0.60, volume: 7800000, high: 123.80, low: 122.10 },
    { symbol: 'TTKOM', lastPrice: 28.72, change: 0.40, volume: 15400000, high: 28.94, low: 28.58 },
    { symbol: 'KRDMD', lastPrice: 16.84, change: 1.70, volume: 17600000, high: 17.10, low: 16.62 },
    { symbol: 'GUBRF', lastPrice: 94.55, change: -1.20, volume: 8400000, high: 95.80, low: 94.15 },
    { symbol: 'TSKB', lastPrice: 9.46, change: 0.85, volume: 22800000, high: 9.54, low: 9.38 }
  ]
  
  return mockBist30
} 