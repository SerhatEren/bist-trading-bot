import { useState } from 'react'
import '../styles/StockTable.css'

interface StockItem {
  symbol: string;
  lastPrice: number;
  change: number;
  volume: number;
  high: number;
  low: number;
}

type StockItemKey = keyof StockItem;

function StockTable({ data }: { data: StockItem[] }) {
  const [sortConfig, setSortConfig] = useState<{
    key: StockItemKey,
    direction: 'ascending' | 'descending'
  }>({
    key: 'symbol',
    direction: 'ascending'
  })

  // Handle sorting
  const requestSort = (key: StockItemKey) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  // Sort the data
  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1
    }
    return 0
  })

  // Get the className for the sort direction indicator
  const getSortDirectionIndicator = (key: string) => {
    if (sortConfig.key !== key) return ''
    return sortConfig.direction === 'ascending' ? '▲' : '▼'
  }

  return (
    <div className="stock-table-container">
      {data.length === 0 ? (
        <p className="no-data">No stock data available</p>
      ) : (
        <table className="stock-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('symbol')}>
                Symbol {getSortDirectionIndicator('symbol')}
              </th>
              <th onClick={() => requestSort('lastPrice')}>
                Last Price {getSortDirectionIndicator('lastPrice')}
              </th>
              <th onClick={() => requestSort('change')}>
                Change (%) {getSortDirectionIndicator('change')}
              </th>
              <th onClick={() => requestSort('volume')}>
                Volume {getSortDirectionIndicator('volume')}
              </th>
              <th onClick={() => requestSort('high')}>
                High {getSortDirectionIndicator('high')}
              </th>
              <th onClick={() => requestSort('low')}>
                Low {getSortDirectionIndicator('low')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((stock) => (
              <tr key={stock.symbol} className={stock.change >= 0 ? 'positive' : 'negative'}>
                <td>{stock.symbol}</td>
                <td>{stock.lastPrice.toFixed(2)}</td>
                <td>{stock.change.toFixed(2)}%</td>
                <td>{stock.volume.toLocaleString()}</td>
                <td>{stock.high.toFixed(2)}</td>
                <td>{stock.low.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default StockTable 