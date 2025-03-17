import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import StockTable from './StockTable'
// Import from mockData.ts instead of api.js
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
import CandlestickChart from './CandlestickChart'
import { PieChartPlaceholder } from './ChartPlaceholders'
import PortfolioCard from './dashboard/PortfolioCard'
import StrategiesCard from './dashboard/StrategiesCard'
import ModelPerformanceCard from './dashboard/ModelPerformanceCard'
import TradingSignalsCard from './dashboard/TradingSignalsCard'
import RecentTransactionsCard from './dashboard/RecentTransactionsCard'
import MarketOverviewCard from './dashboard/MarketOverviewCard'
import SystemStatusCard from './dashboard/SystemStatusCard'
import '../styles/Dashboard.css'
// These imports would be used with real chart libraries
// import { LineChart, PieChart, BarChart } from 'your-chart-library'
import { OrderSide } from '../types/api'
import { StrategyStatus } from '../types/strategy'

const ResponsiveGridLayout = WidthProvider(Responsive)

function Dashboard() {
  // Portfolio data
  const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [dataUpdated, setDataUpdated] = useState(false)

  // Strategies data
  const [strategiesData, setStrategiesData] = useState<Strategy[] | null>(null)
  const [strategiesLoading, setStrategiesLoading] = useState(true)

  // Model performance data
  const [modelData, setModelData] = useState<ModelPerformanceData | null>(null)
  const [modelLoading, setModelLoading] = useState(true)

  // Trading signals data
  const [signalsData, setSignalsData] = useState<TradingSignal[] | null>(null)
  const [signalsLoading, setSignalsLoading] = useState(true)

  // Transactions data
  const [transactionsData, setTransactionsData] = useState<Transaction[] | null>(null)
  const [transactionsLoading, setTransactionsLoading] = useState(true)

  // Market overview data
  const [marketData, setMarketData] = useState<MarketOverviewData | null>(null)
  const [marketLoading, setMarketLoading] = useState(true)

  // System status data
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null)
  const [systemLoading, setSystemLoading] = useState(true)

  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  
  // Refresh key to trigger data refresh
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch all dashboard data
  useEffect(() => {
    const fetchAllData = async () => {
      // Set data updated to false when starting a new fetch
      setDataUpdated(false)
      
      // Portfolio data
      setPortfolioLoading(true)
      try {
        const portfolio = await fetchPortfolioData()
        
        // Save portfolio data centrally
        sessionStorage.setItem('portfolioData', JSON.stringify(toApiPortfolio(portfolio)))
        
        setPortfolioData(portfolio)
      } catch (error) {
        console.error('Error fetching portfolio data:', error)
        
        // Try to use cached portfolio data if available
        const cachedData = sessionStorage.getItem('portfolioData')
        if (cachedData) {
          const mockDataModule = await import('../services/mockData')
          setPortfolioData(mockDataModule.fromApiPortfolio(JSON.parse(cachedData)))
        }
      } finally {
        setPortfolioLoading(false)
      }

      // Strategies data
      setStrategiesLoading(true)
      try {
        const strategies = await fetchStrategies()
        setStrategiesData(strategies)
      } catch (error) {
        console.error('Error fetching strategies data:', error)
      } finally {
        setStrategiesLoading(false)
      }

      // Model performance data
      setModelLoading(true)
      try {
        const modelPerformance = await fetchModelPerformance()
        setModelData(modelPerformance)
      } catch (error) {
        console.error('Error fetching model performance data:', error)
      } finally {
        setModelLoading(false)
      }

      // Trading signals data
      setSignalsLoading(true)
      try {
        const signals = await fetchTradingSignals()
        setSignalsData(signals)
      } catch (error) {
        console.error('Error fetching trading signals data:', error)
      } finally {
        setSignalsLoading(false)
      }

      // Transactions data
      setTransactionsLoading(true)
      try {
        const transactions = await fetchRecentTrades()
        setTransactionsData(transactions)
      } catch (error) {
        console.error('Error fetching transactions data:', error)
      } finally {
        setTransactionsLoading(false)
      }

      // Market overview data
      setMarketLoading(true)
      try {
        const market = await fetchMarketOverview()
        setMarketData(market)
      } catch (error) {
        console.error('Error fetching market overview data:', error)
      } finally {
        setMarketLoading(false)
      }

      // System status data
      setSystemLoading(true)
      try {
        const status = await fetchSystemStatus()
        setSystemStatus(status)
      } catch (error) {
        console.error('Error fetching system status data:', error)
      } finally {
        setSystemLoading(false)
      }

      // Update last updated timestamp and trigger animation
      setLastUpdated(new Date().toISOString())
      setDataUpdated(true)
      
      // Reset the animation flag after a delay
      setTimeout(() => {
        setDataUpdated(false)
      }, 2000)
    }

    fetchAllData()

    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      setRefreshKey(prevKey => prevKey + 1)
    }, 60000)

    return () => clearInterval(intervalId)
  }, [refreshKey])

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1)
  }

  // Handle executing a signal
  const handleExecuteSignal = (signal: TradingSignal) => {
    // This would be implemented to execute the trade via API
    console.log('Executing signal:', signal)
    alert(`Signal execution would be implemented here: ${signal.symbol} ${signal.side}`)
  }

  // Define layouts for different screen sizes
  const layouts = {
    lg: [
      { i: 'portfolio', x: 0, y: 0, w: 8, h: 15, minW: 6, minH: 11 },
      { i: 'strategies', x: 0, y: 15, w: 4, h: 9, minW: 3, minH: 8 },
      { i: 'transactions', x: 4, y: 15, w: 4, h: 9, minW: 3, minH: 8 },
      { i: 'market', x: 0, y: 24, w: 8, h: 10, minW: 6, minH: 8 },
      { i: 'system-status', x: 8, y: 0, w: 4, h: 7, minW: 3, minH: 6 },
      { i: 'signals', x: 8, y: 7, w: 4, h: 12, minW: 3, minH: 8 },
      { i: 'performance', x: 8, y: 19, w: 4, h: 10, minW: 3, minH: 8 },
    ],
    md: [
      { i: 'portfolio', x: 0, y: 0, w: 6, h: 15, minW: 6, minH: 11 },
      { i: 'strategies', x: 0, y: 15, w: 3, h: 9, minW: 3, minH: 8 },
      { i: 'transactions', x: 3, y: 15, w: 3, h: 9, minW: 3, minH: 8 },
      { i: 'market', x: 0, y: 24, w: 6, h: 10, minW: 6, minH: 8 },
      { i: 'system-status', x: 6, y: 0, w: 3, h: 7, minW: 3, minH: 6 },
      { i: 'signals', x: 6, y: 7, w: 3, h: 12, minW: 3, minH: 8 },
      { i: 'performance', x: 6, y: 19, w: 3, h: 10, minW: 3, minH: 8 },
    ],
    sm: [
      { i: 'portfolio', x: 0, y: 0, w: 6, h: 15, minW: 6, minH: 11 },
      { i: 'strategies', x: 0, y: 15, w: 3, h: 9, minW: 3, minH: 8 },
      { i: 'transactions', x: 3, y: 15, w: 3, h: 9, minW: 3, minH: 8 },
      { i: 'market', x: 0, y: 24, w: 6, h: 10, minW: 6, minH: 8 },
      { i: 'system-status', x: 0, y: 34, w: 6, h: 7, minW: 3, minH: 6 },
      { i: 'signals', x: 0, y: 41, w: 3, h: 12, minW: 3, minH: 8 },
      { i: 'performance', x: 3, y: 41, w: 3, h: 10, minW: 3, minH: 8 },
    ],
    xs: [
      { i: 'portfolio', x: 0, y: 0, w: 4, h: 15, minW: 4, minH: 11 },
      { i: 'strategies', x: 0, y: 15, w: 4, h: 9, minW: 4, minH: 8 },
      { i: 'transactions', x: 0, y: 24, w: 4, h: 9, minW: 4, minH: 8 },
      { i: 'market', x: 0, y: 33, w: 4, h: 10, minW: 4, minH: 8 },
      { i: 'system-status', x: 0, y: 43, w: 4, h: 7, minW: 4, minH: 6 },
      { i: 'signals', x: 0, y: 50, w: 4, h: 12, minW: 4, minH: 8 },
      { i: 'performance', x: 0, y: 62, w: 4, h: 10, minW: 4, minH: 8 },
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
            disabled={portfolioLoading} 
            className="refresh-button"
          >
            <span className="refresh-icon">{portfolioLoading ? '⌛' : '↻'}</span>
            {portfolioLoading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className={`dashboard-summary ${dataUpdated ? 'data-update-animation' : ''}`}>
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-data">
            <span className={`summary-value ${dataUpdated ? 'data-highlight' : ''}`}>
              {portfolioData ? formatCurrency(portfolioData.totalValue) : '-'}
            </span>
            <span className="summary-label">Portfolio Value</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-data">
            <span className="summary-value">
              {strategiesData ? `${strategiesData.filter(s => s.active).length}/${strategiesData.length}` : '-'}
            </span>
            <span className="summary-label">Active Strategies</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🔔</div>
          <div className="summary-data">
            <span className="summary-value">
              {signalsData ? signalsData.length : '-'}
            </span>
            <span className="summary-label">Trading Signals</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-data">
            <span className="summary-value">
              {modelData ? `${modelData.overallAccuracy.toFixed(1)}%` : '-'}
            </span>
            <span className="summary-label">Model Accuracy</span>
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
          <PortfolioCard portfolioData={portfolioData} isLoading={portfolioLoading} />
        </div>
        
        <div key="strategies" className="dashboard-widget">
          <StrategiesCard strategies={strategiesData} isLoading={strategiesLoading} />
        </div>
        
        <div key="transactions" className="dashboard-widget">
          <RecentTransactionsCard transactions={transactionsData} isLoading={transactionsLoading} />
        </div>
        
        <div key="market" className="dashboard-widget">
          <MarketOverviewCard marketData={marketData} isLoading={marketLoading} />
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
        
        <div key="performance" className="dashboard-widget">
          <ModelPerformanceCard performanceData={modelData} isLoading={modelLoading} />
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}

// Helper function to format currency
function formatCurrency(value: number | undefined): string {
  if (value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default Dashboard 