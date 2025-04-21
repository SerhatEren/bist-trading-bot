import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import socketService from '../services/socketService';
import { MiniTicker } from '../types/api'; // Assuming MiniTicker is defined here

interface MarketDataContextType {
  tickerMap: Map<string, number>;
  isConnected: boolean; // Add connection status
  marketData: MiniTicker[];
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const MarketDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickerMap, setTickerMap] = useState<Map<string, number>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<MiniTicker[]>([]);

  useEffect(() => {
    // Function to handle connection status changes
    const handleConnect = () => {
      console.log('MarketData Context: Socket Connected');
      setIsConnected(true);
    };
    const handleDisconnect = (reason: string) => {
      console.log('MarketData Context: Socket Disconnected', reason);
      setIsConnected(false);
    };

    // Attach connection listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    // Connect the socket - it will trigger handleConnect on success
    console.log('MarketData Context: Attempting socket connection...');
    socketService.connect();

    // Function to handle incoming ticker updates
    const handleMarketUpdate = (tickers: MiniTicker[]) => {
      // console.log(`MarketData Context: Received ${tickers?.length || 0} tickers`);
      setTickerMap(prevMap => {
        let changed = false;
        const newMap = new Map(prevMap);

        if (Array.isArray(tickers)) {
          tickers.forEach((ticker: MiniTicker) => {
            if (ticker?.s && ticker.c) {
                const newPrice = parseFloat(ticker.c);
                if (!isNaN(newPrice)) {
                    const currentPrice = newMap.get(ticker.s);
                    if (currentPrice !== newPrice) {
                        newMap.set(ticker.s, newPrice);
                        changed = true; 
                    }
                }
            }
          });
        }
        return changed ? newMap : prevMap;
      });
      // Also set raw marketData state for components that need the raw array
      setMarketData(tickers);
    };

    // Subscribe to market updates
    socketService.on('marketTickersUpdate', handleMarketUpdate);

    // Cleanup on unmount
    return () => {
      console.log('MarketData Context: Cleaning up listeners and disconnecting socket...');
      socketService.off('marketTickersUpdate', handleMarketUpdate);
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.disconnect();
      setIsConnected(false); // Ensure state reflects disconnection
    };
  }, []); // Run only once when the provider mounts

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
     tickerMap,
     isConnected,
     marketData
  }), [tickerMap, isConnected, marketData]);

  return (
    <MarketDataContext.Provider value={contextValue}>
      {children}
    </MarketDataContext.Provider>
  );
};

// Custom hook for easy context consumption
export const useMarketData = (): MarketDataContextType => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
}; 