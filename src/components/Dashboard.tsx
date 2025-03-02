import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StockTable from './StockTable'
// @ts-ignore
import { fetchBist30Data } from '../services/api'
import CandlestickChart from './CandlestickChart'
import { PieChartPlaceholder } from './ChartPlaceholders'
import '../styles/Dashboard.css'
// These imports would be used with real chart libraries
// import { LineChart, PieChart, BarChart } from 'your-chart-library'

function Dashboard() {
  const [stockData, setStockData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [activeTimeframe, setActiveTimeframe] = useState('1M')

  // Sample data for the dashboard summary
  const portfolioSummary = {
    value: 1235840,
    change: 2.3,
    changeAmount: 27846,
    dailyReturn: 0.87,
    monthlyReturn: 4.32,
    openPositions: 7,
    cashAvailable: 384932,
  }

  const assetAllocation = [
    { name: 'THYAO', allocation: 15.4, value: 190316 },
    { name: 'SASA', allocation: 12.8, value: 158187 },
    { name: 'ASELS', allocation: 10.3, value: 127291 },
    { name: 'Other Stocks', allocation: 30.4, value: 375114 },
    { name: 'Cash', allocation: 31.1, value: 384932 }
  ]

  const recentTrades = [
    { date: '2023-08-15', symbol: 'THYAO', type: 'BUY', price: 246.8, shares: 150, value: 37020 },
    { date: '2023-08-14', symbol: 'GARAN', type: 'SELL', price: 89.2, shares: 200, value: 17840 },
    { date: '2023-08-12', symbol: 'SASA', type: 'BUY', price: 146.2, shares: 100, value: 14620 }
  ]

  const getColorForAsset = (assetName: string) => {
    const colors = {
      'THYAO': '#4299e1',
      'SASA': '#38a169',
      'ASELS': '#dd6b20',
      'Other Stocks': '#9f7aea',
      'Cash': '#e2e8f0'
    };
    return colors[assetName as keyof typeof colors] || '#cbd5e0';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchBist30Data()
        setStockData(data)
        setLastUpdated(new Date().toLocaleTimeString())
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch stock data')
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data every minute
    const intervalId = setInterval(fetchData, 60000)

    return () => clearInterval(intervalId)
  }, [])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const data = await fetchBist30Data()
      setStockData(data)
      setLastUpdated(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch stock data')
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Portfolio</h1>
        <div className="last-updated">
          <span>Updated: {lastUpdated || 'Never'}</span>
          <button onClick={handleRefresh} disabled={loading} className="refresh-button">
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Portfolio Value Section */}
      <div className="main-section-grid">
        <div className="portfolio-value-card">
          <div className="card-header">
            <h2>Portfolio Value</h2>
            <div className="portfolio-value">
              <div className="value">₺{portfolioSummary.value.toLocaleString()}</div>
              <div className={`change ${portfolioSummary.change >= 0 ? 'positive' : 'negative'}`}>
                {portfolioSummary.change >= 0 ? '▲' : '▼'}
                {Math.abs(portfolioSummary.change).toFixed(2)}%
                (₺{portfolioSummary.changeAmount.toLocaleString()})
              </div>
            </div>
          </div>

          <div className="timeframe-selector">
            {['1D', '1W', '1M', '3M', '6M', '1Y'].map((tf) => (
              <button
                key={tf}
                className={activeTimeframe === tf ? 'active' : ''}
                onClick={() => setActiveTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="chart-container">
            <CandlestickChart height={300} />
          </div>

          <div className="quick-stats">
            <div className="stat-item">
              <div className="stat-label">Cash Available</div>
              <div className="stat-value">₺{portfolioSummary.cashAvailable.toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Open Positions</div>
              <div className="stat-value">{portfolioSummary.openPositions}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Daily Change</div>
              <div className={`stat-value ${portfolioSummary.dailyReturn >= 0 ? 'positive' : 'negative'}`}>
                {portfolioSummary.dailyReturn >= 0 ? '+' : ''}
                {portfolioSummary.dailyReturn.toFixed(2)}%
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Monthly Change</div>
              <div className={`stat-value ${portfolioSummary.monthlyReturn >= 0 ? 'positive' : 'negative'}`}>
                {portfolioSummary.monthlyReturn >= 0 ? '+' : ''}
                {portfolioSummary.monthlyReturn.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="asset-allocation-card">
          <div className="card-header">
            <h2>Asset Allocation</h2>
            <Link to="/statistics" className="view-more">Details →</Link>
          </div>

          <div className="allocation-chart">
            <PieChartPlaceholder
              data={assetAllocation.map((asset) => ({
                name: asset.name,
                value: asset.allocation,
                color: getColorForAsset(asset.name)
              }))}
              size={220}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-card">
        <div className="card-header">
          <h2>Recent Trades</h2>
          <Link to="/statistics" className="view-more">View All →</Link>
        </div>

        <table className="trades-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Type</th>
              <th>Price</th>
              <th>Shares</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {recentTrades.map((trade, index) => (
              <tr key={index}>
                <td>{trade.date}</td>
                <td className="symbol">{trade.symbol}</td>
                <td className={trade.type === 'BUY' ? 'buy-type' : 'sell-type'}>{trade.type}</td>
                <td>₺{trade.price.toFixed(2)}</td>
                <td>{trade.shares}</td>
                <td>₺{trade.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Market Overview - Simplified */}
      <div className="market-overview-card">
        <div className="card-header">
          <h2>Market Overview</h2>
          <div className="last-updated">
            <span>Last updated: {lastUpdated || 'Never'}</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && !stockData.length ? (
          <div className="loading">Loading market data...</div>
        ) : (
          <div className="market-table-container">
            <StockTable data={stockData} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 