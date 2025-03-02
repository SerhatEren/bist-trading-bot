import { useState } from 'react';
import '../styles/Statistics.css';

interface PerformanceMetrics {
    dailyReturn: number;
    monthlyReturn: number;
    yearlyReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
    averageProfit: number;
    successfulTrades: number;
}

interface AssetAllocation {
    name: string;
    allocation: number;
}

function Statistics() {
    const [activeTab, setActiveTab] = useState('performance');
    const [timeframe, setTimeframe] = useState('1M');

    const metrics: PerformanceMetrics = {
        dailyReturn: 0.87,
        monthlyReturn: 4.32,
        yearlyReturn: 18.65,
        sharpeRatio: 1.92,
        maxDrawdown: -12.3,
        winRate: 68.4,
        totalTrades: 426,
        profitFactor: 2.8,
        averageProfit: 1.24,
        successfulTrades: 291
    };

    const allocation: AssetAllocation[] = [
        { name: 'THYAO', allocation: 15.4 },
        { name: 'SASA', allocation: 12.8 },
        { name: 'ASELS', allocation: 10.3 },
        { name: 'KCHOL', allocation: 9.7 },
        { name: 'TUPRS', allocation: 8.2 },
        { name: 'EREGL', allocation: 7.5 },
        { name: 'Cash', allocation: 36.1 }
    ];

    const recentTrades = [
        { date: '2023-08-15', symbol: 'THYAO', type: 'BUY', price: 246.8, shares: 150, profit: null },
        { date: '2023-08-14', symbol: 'GARAN', type: 'SELL', price: 89.2, shares: 200, profit: 3.5 },
        { date: '2023-08-12', symbol: 'SASA', type: 'BUY', price: 146.2, shares: 100, profit: null },
        { date: '2023-08-10', symbol: 'BIMAS', type: 'SELL', price: 312.4, shares: 75, profit: -1.2 },
        { date: '2023-08-08', symbol: 'ASELS', type: 'BUY', price: 179.8, shares: 120, profit: null }
    ];

    return (
        <div className="statistics-container">
            <div className="stats-header">
                <h2>Strategy Analytics</h2>
                <div className="timeframe-selector">
                    <button className={timeframe === '1W' ? 'active' : ''} onClick={() => setTimeframe('1W')}>1W</button>
                    <button className={timeframe === '1M' ? 'active' : ''} onClick={() => setTimeframe('1M')}>1M</button>
                    <button className={timeframe === '3M' ? 'active' : ''} onClick={() => setTimeframe('3M')}>3M</button>
                    <button className={timeframe === '1Y' ? 'active' : ''} onClick={() => setTimeframe('1Y')}>1Y</button>
                    <button className={timeframe === 'ALL' ? 'active' : ''} onClick={() => setTimeframe('ALL')}>ALL</button>
                </div>
            </div>

            <div className="stats-tabs">
                <button
                    className={activeTab === 'performance' ? 'active' : ''}
                    onClick={() => setActiveTab('performance')}
                >
                    Performance
                </button>
                <button
                    className={activeTab === 'allocation' ? 'active' : ''}
                    onClick={() => setActiveTab('allocation')}
                >
                    Allocation
                </button>
                <button
                    className={activeTab === 'trades' ? 'active' : ''}
                    onClick={() => setActiveTab('trades')}
                >
                    Recent Trades
                </button>
            </div>

            {activeTab === 'performance' && (
                <>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <h3>Daily Return</h3>
                            <p className={metrics.dailyReturn >= 0 ? 'positive' : 'negative'}>
                                {metrics.dailyReturn.toFixed(2)}%
                            </p>
                        </div>
                        <div className="metric-card">
                            <h3>Monthly Return</h3>
                            <p className={metrics.monthlyReturn >= 0 ? 'positive' : 'negative'}>
                                {metrics.monthlyReturn.toFixed(2)}%
                            </p>
                        </div>
                        <div className="metric-card">
                            <h3>Yearly Return</h3>
                            <p className={metrics.yearlyReturn >= 0 ? 'positive' : 'negative'}>
                                {metrics.yearlyReturn.toFixed(2)}%
                            </p>
                        </div>
                        <div className="metric-card">
                            <h3>Sharpe Ratio</h3>
                            <p>{metrics.sharpeRatio.toFixed(2)}</p>
                        </div>
                        <div className="metric-card">
                            <h3>Max Drawdown</h3>
                            <p className="negative">{metrics.maxDrawdown.toFixed(2)}%</p>
                        </div>
                        <div className="metric-card">
                            <h3>Win Rate</h3>
                            <p>{metrics.winRate.toFixed(1)}%</p>
                        </div>
                        <div className="metric-card">
                            <h3>Total Trades</h3>
                            <p>{metrics.totalTrades}</p>
                        </div>
                        <div className="metric-card">
                            <h3>Profit Factor</h3>
                            <p>{metrics.profitFactor.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="chart-placeholder">
                        <p>Performance Chart - {timeframe}</p>
                        {/* In a real app, you would include a chart library component here */}
                    </div>
                </>
            )}

            {activeTab === 'allocation' && (
                <div className="allocation-container">
                    <div className="allocation-chart-placeholder">
                        <p>Portfolio Allocation Chart</p>
                        {/* In a real app, you would include a pie chart here */}
                    </div>

                    <div className="allocation-table">
                        <h3>Current Asset Allocation</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Allocation (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allocation.map((asset) => (
                                    <tr key={asset.name}>
                                        <td>{asset.name}</td>
                                        <td>{asset.allocation.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'trades' && (
                <div className="trades-container">
                    <h3>Recent Trading Activity</h3>
                    <table className="trades-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Symbol</th>
                                <th>Type</th>
                                <th>Price (₺)</th>
                                <th>Shares</th>
                                <th>P/L (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTrades.map((trade, index) => (
                                <tr key={index} className={trade.profit ? (trade.profit > 0 ? 'positive-row' : 'negative-row') : ''}>
                                    <td>{trade.date}</td>
                                    <td>{trade.symbol}</td>
                                    <td className={trade.type === 'BUY' ? 'buy-type' : 'sell-type'}>{trade.type}</td>
                                    <td>{trade.price.toFixed(2)}</td>
                                    <td>{trade.shares}</td>
                                    <td>
                                        {trade.profit !== null ? (
                                            <span className={trade.profit > 0 ? 'positive' : 'negative'}>
                                                {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}%
                                            </span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Statistics; 