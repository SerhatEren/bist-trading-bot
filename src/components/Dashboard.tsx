import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
// import StockTable from './StockTable'
// Import the actual API service proxy
import apiServiceProxy from '../services/apiFactory'
// Remove Mock Data Imports
/*
import { 
  fetchBist30Data,
  fetchPortfolioData,
  fetchRecentTrades,
  fetchStrategies,
  fetchModelPerformance,
  fetchTradingSignals,
  fetchMarketOverview,
  fetchSystemStatus,
  Portfolio,
  Strategy,
  ModelPerformanceData,
  TradingSignal,
  Transaction,
  MarketOverviewData,
  SystemStatusData,
  formatTimeAgo,
  toApiPortfolio
} from '../services/mockData'
*/
import CandlestickChart from './CandlestickChart'
import { PieChartPlaceholder } from './ChartPlaceholders'
import PortfolioCard from './dashboard/PortfolioCard'
import StrategiesCard from './dashboard/StrategiesCard'
import ModelPerformanceCard from './dashboard/ModelPerformanceCard'
import TradingSignalsCard from './dashboard/TradingSignalsCard'
import RecentTransactionsCard from './dashboard/RecentTransactionsCard'
import MarketOverviewCard from './dashboard/MarketOverviewCard'
import SystemStatusCard from './dashboard/SystemStatusCard'
import TradingForm from './trading/TradingForm'
import '../styles/Dashboard.css'
// These imports would be used with real chart libraries
// import { LineChart, PieChart, BarChart } from 'your-chart-library'
import { OrderSide, OrderType, Order, BinanceAccountInfo as AccountInfo, BinanceBalance as Balance, MiniTicker, ApiResponse } from '../types/api'
import { StrategyStatus } from '../types/strategy'
import { useMarketData } from '../contexts/MarketDataContext'
import { calculatePortfolioMetrics } from '../utils/calculations'

const ResponsiveGridLayout = WidthProvider(Responsive)

// Define placeholder types based on likely backend API structure
// TODO: Define these properly, potentially in src/types/api.d.ts
interface Portfolio {
    totalValue: number;
    cashBalance: number;
    invested: number;
    dayChange: number;
    dayChangePercent: number;
    positions: any[]; // Define Position type later
}
interface Strategy { 
    id: string;
    name: string;
    active: boolean;
    // Add other fields from backend API
}
interface ModelPerformanceData { 
    overallAccuracy: number; 
    // Add other fields
}
interface TradingSignal { 
    id: string;
    symbol: string;
    side: string; 
    // Add other fields
}
interface Transaction { 
    id: string | number;
    date: string; // Or number (timestamp)
    symbol: string;
    side: 'BUY' | 'SELL';
    price: number;
    // Add other fields (quantity, value etc.)
}
interface MarketOverviewData { 
    indices: any[]; // Define index type
    topGainers: any[]; // Define stock type
    topLosers: any[];
    lastUpdated?: string;
    // Add other fields
}
interface SystemStatusData { 
    status: string;
    // Add other fields
}

// Helper function for formatting time (consider moving to utils)
function formatTimeAgo(isoString: string | null): string {
    if (!isoString) return 'never';
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Helper function to format currency (consider moving to utils)
function formatCurrency(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function Dashboard() {
  const [portfolioData, setPortfolioData] = useState<AccountInfo | null>(null)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [transactionsData, setTransactionsData] = useState<Order[] | null>(null)
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const { tickerMap, isConnected } = useMarketData()
  
  // --- State for currently unused sections (Keep for now, use imported types if available) ---
  const [strategiesData, setStrategiesData] = useState<any[] | null>(null)
  const [strategiesLoading, setStrategiesLoading] = useState(true)
  const [modelData, setModelData] = useState<any | null>(null)
  const [modelLoading, setModelLoading] = useState(true)
  const [signalsData, setSignalsData] = useState<any[] | null>(null)
  const [signalsLoading, setSignalsLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<any | null>(null)
  const [systemLoading, setSystemLoading] = useState(true)
  // --- End Unused Sections State ---

  const [dataUpdated, setDataUpdated] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState<string | null>(null) // Add error state

  // Refactored useEffect hook
  useEffect(() => {
    const fetchDashboardData = async () => {
        setDataUpdated(false)
        setError(null)
        setPortfolioLoading(true)
        setTransactionsLoading(true) 
        setStrategiesLoading(true)
        setModelLoading(true)
        setSignalsLoading(true)
        setSystemLoading(true)

        const portfolioPromise = apiServiceProxy.getPortfolio()
            .then(data => {
                setPortfolioData(data)
            })
            .catch(err => {
                console.error('Failed to fetch portfolio error:', err)
                setError(prev => `${prev ? prev + "; " : ""}Portfolio: ${err?.message || 'Error'}`)
            })
            .finally(() => setPortfolioLoading(false))

        const transactionsPromise = apiServiceProxy.getOrders('BTCUSDT')
            .then(fetchedOrders => {
                 if (Array.isArray(fetchedOrders)) {
                     setTransactionsData(fetchedOrders as Order[]); 
                 } else {
                      console.warn('Received non-array data for transactions:', fetchedOrders)
                      setTransactionsData([]); 
                 }
            })
            .catch(err => {
                 console.error('Failed to fetch transactions error:', err)
                 setError(prev => `${prev ? prev + "; " : ""}Orders: ${err?.message || 'Error'}`)
            })
            .finally(() => setTransactionsLoading(false))

        // Fetch placeholder data for other cards (can be removed later)
        const strategiesPromise = Promise.resolve().then(() => setStrategiesData([])).finally(() => setStrategiesLoading(false));
        const modelPromise = Promise.resolve().then(() => setModelData({})).finally(() => setModelLoading(false));
        const signalsPromise = Promise.resolve().then(() => setSignalsData([])).finally(() => setSignalsLoading(false));
        const systemStatusPromise = Promise.resolve().then(() => setSystemStatus({ status: isConnected ? 'Operational' : 'Offline' })).finally(() => setSystemLoading(false));
        
        // Wait for all essential data fetches
        await Promise.allSettled([
            portfolioPromise, 
            transactionsPromise, 
            strategiesPromise, 
            modelPromise, 
            signalsPromise, 
            systemStatusPromise
        ]);

        setLastUpdated(new Date().toISOString())
        setDataUpdated(true)
        setTimeout(() => setDataUpdated(false), 2000)
    }

    fetchDashboardData()
  }, [refreshKey, isConnected])

  const handleRefresh = useCallback(() => { 
    setError(null) 
    setRefreshKey(prevKey => prevKey + 1)
  }, [])

  // Placeholder - adapt based on backend capability
  const handleExecuteSignal = (signal: any) => {
    console.log('Executing signal:', signal)
    alert(`Signal execution for ${signal.symbol} would call the backend.`)
  }

  // --- Portfolio Value Calculation (Uses utility function) --- 
  const { 
      totalValue: portfolioValue, 
      cashBalance, 
      investedValue 
  } = useMemo(() => {
      // Call the utility function
      return calculatePortfolioMetrics(portfolioData, tickerMap)
  }, [portfolioData, tickerMap])

  // Define layouts for different screen sizes
  const layouts = {
    lg: [
      { i: 'portfolio', x: 0, y: 0, w: 4, h: 15, minW: 3, minH: 10 }, 
      { i: 'trading-form', x: 4, y: 0, w: 4, h: 9, minW: 3, minH: 9 }, 
      { i: 'transactions', x: 4, y: 9, w: 4, h: 6, minW: 3, minH: 6 }, 
      { i: 'market', x: 0, y: 15, w: 8, h: 10, minW: 6, minH: 8 }, 
      { i: 'system-status', x: 8, y: 0, w: 4, h: 7, minW: 3, minH: 6 },
      { i: 'signals', x: 8, y: 7, w: 4, h: 9, minW: 3, minH: 8 }, 
      { i: 'strategies', x: 8, y: 16, w: 4, h: 9, minW: 3, minH: 8 }, 
      { i: 'performance', x: 0, y: 25, w: 12, h: 10, minW: 6, minH: 8 }, 
    ],
    md: [
       { i: 'portfolio', x: 0, y: 0, w: 3, h: 15, minW: 3, minH: 10 }, 
       { i: 'trading-form', x: 3, y: 0, w: 3, h: 9, minW: 3, minH: 9 }, 
       { i: 'transactions', x: 3, y: 9, w: 3, h: 6, minW: 3, minH: 6 }, 
       { i: 'market', x: 0, y: 15, w: 6, h: 10, minW: 6, minH: 8 }, 
       { i: 'system-status', x: 6, y: 0, w: 3, h: 7, minW: 3, minH: 6 },
       { i: 'signals', x: 6, y: 7, w: 3, h: 9, minW: 3, minH: 8 }, 
       { i: 'strategies', x: 6, y: 16, w: 3, h: 9, minW: 3, minH: 8 }, 
       { i: 'performance', x: 0, y: 25, w: 9, h: 10, minW: 6, minH: 8 },
    ],
    sm: [
        { i: 'portfolio', x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 10 }, 
        { i: 'trading-form', x: 0, y: 12, w: 3, h: 9, minW: 3, minH: 9 }, 
        { i: 'transactions', x: 3, y: 12, w: 3, h: 9, minW: 3, minH: 8 }, 
        { i: 'market', x: 0, y: 21, w: 6, h: 9, minW: 4, minH: 8 }, 
        { i: 'system-status', x: 0, y: 30, w: 3, h: 7, minW: 3, minH: 6 },
        { i: 'signals', x: 3, y: 30, w: 3, h: 12, minW: 3, minH: 8 }, 
        { i: 'strategies', x: 0, y: 37, w: 3, h: 9, minW: 3, minH: 8 }, 
        { i: 'performance', x: 3, y: 37, w: 3, h: 10, minW: 3, minH: 8 },
    ],
     xs: [
        { i: 'portfolio', x: 0, y: 0, w: 4, h: 12, minW: 4, minH: 10 }, 
        { i: 'trading-form', x: 0, y: 12, w: 4, h: 9, minW: 4, minH: 9 }, 
        { i: 'transactions', x: 0, y: 21, w: 4, h: 9, minW: 4, minH: 8 }, 
        { i: 'market', x: 0, y: 30, w: 4, h: 9, minW: 4, minH: 8 }, 
        { i: 'system-status', x: 0, y: 39, w: 4, h: 7, minW: 4, minH: 6 },
        { i: 'signals', x: 0, y: 46, w: 4, h: 12, minW: 4, minH: 8 }, 
        { i: 'strategies', x: 0, y: 58, w: 4, h: 9, minW: 4, minH: 8 }, 
        { i: 'performance', x: 0, y: 67, w: 4, h: 10, minW: 4, minH: 8 },
    ]
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Trading Dashboard</h1>
          <p className="dashboard-subtitle">Real-time monitoring and trading management</p>
        </div>
        <div className="dashboard-controls">
          <div className="last-updated">
            {lastUpdated && (
              <>
                <span className={`update-icon ${dataUpdated ? 'data-highlight' : ''}`}>⟳</span> 
                <span>Updated {formatTimeAgo(lastUpdated)}</span>
              </>
            )}
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={portfolioLoading || transactionsLoading}
            className="refresh-button"
          >
            <span className="refresh-icon">{(portfolioLoading || transactionsLoading) ? '⌛' : '↻'}</span>
            {(portfolioLoading || transactionsLoading) ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Add error display */}
      {error && (
          <div style={{ color: 'red', textAlign: 'center', padding: '10px', border: '1px solid red', marginBottom: '15px' }}>
              API Error(s): {error}
          </div>
      )}

      <div className={`dashboard-summary ${dataUpdated ? 'data-update-animation' : ''}`}>
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-data">
            <span className={`summary-value ${dataUpdated ? 'data-highlight' : ''}`}>
              {portfolioLoading ? '...' : formatCurrency(portfolioValue)}
            </span>
            <span className="summary-label">Portfolio Value (est. USDT)</span>
          </div>
        </div>
         <div className="summary-card">
          <div className="summary-icon">💵</div>
          <div className="summary-data">
            <span className={`summary-value ${dataUpdated ? 'data-highlight' : ''}`}>
              {portfolioLoading ? '...' : formatCurrency(cashBalance)}
            </span>
            <span className="summary-label">Cash Balance (est. USDT)</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🏦</div>
          <div className="summary-data">
            <span className={`summary-value ${dataUpdated ? 'data-highlight' : ''}`}>
              {portfolioLoading ? '...' : formatCurrency(investedValue)}
            </span>
            <span className="summary-label">Invested Value (est. USDT)</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">{isConnected ? '🟢' : '🔴'}</div>
          <div className="summary-data">
            <span className="summary-value">{isConnected ? 'Live' : 'Offline'}</span>
            <span className="summary-label">Market Data</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📋</div>
          <div className="summary-data">
            <span className="summary-value">
              {transactionsLoading ? '...' : (transactionsData ? transactionsData.length : '-')}
            </span>
            <span className="summary-label">Recent Orders</span>
          </div>
        </div>
          <div className="summary-card">
            <div className="summary-icon">📈</div>
            <div className="summary-data">
              <span className="summary-value">
                {tickerMap ? tickerMap.size : '-'}
              </span>
              <span className="summary-label">Watched Tickers</span>
            </div>
          </div>
      </div>

      <ResponsiveGridLayout
        className="dashboard-grid"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 9, sm: 6, xs: 4 }}
        rowHeight={30}
        margin={[20, 20]}
        isDraggable={true}
        isResizable={true}
        containerPadding={[0, 0]}
      >
        <div key="portfolio" className="dashboard-widget">
          <PortfolioCard 
            accountInfo={portfolioData} 
            tickerMap={tickerMap} 
            isLoading={portfolioLoading}
          />
        </div>
        
        <div key="trading-form" className="dashboard-widget">
          <TradingForm onOrderPlaced={handleRefresh} />
        </div>
        
        <div key="transactions" className="dashboard-widget">
          <RecentTransactionsCard orders={transactionsData} isLoading={transactionsLoading} />
        </div>
        
        <div key="market" className="dashboard-widget">
          <MarketOverviewCard tickerMap={tickerMap} isLoading={tickerMap.size === 0} />
        </div>
        
        <div key="system-status" className="dashboard-widget">
          <SystemStatusCard 
            statusData={systemStatus} 
            isLoading={systemLoading} 
          />
        </div>
        
        <div key="signals" className="dashboard-widget">
          <TradingSignalsCard 
            signals={signalsData} 
            isLoading={signalsLoading} 
            onExecuteSignal={handleExecuteSignal} 
          />
        </div>
        
        <div key="strategies" className="dashboard-widget">
          <StrategiesCard strategies={strategiesData} isLoading={strategiesLoading} />
        </div>

        <div key="performance" className="dashboard-widget">
          <ModelPerformanceCard performanceData={modelData} isLoading={modelLoading} />
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}

export default Dashboard 