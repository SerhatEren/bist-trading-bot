import { useState } from 'react';
import Statistics from '../components/Statistics';
import '../styles/StatisticsPage.css';

function StatisticsPage() {
    const [activeStrategy, setActiveStrategy] = useState('BIST30 Momentum');

    const strategies = [
        'BIST30 Momentum',
        'Sector Rotation',
        'Mean Reversion',
        'Breakout Strategy',
        'Dividend Focus'
    ];

    return (
        <div className="statistics-page">
            <h1>Strategy Performance Analytics</h1>

            <div className="strategy-selector">
                <label>Select Strategy:</label>
                <select
                    value={activeStrategy}
                    onChange={(e) => setActiveStrategy(e.target.value)}
                >
                    {strategies.map(strategy => (
                        <option key={strategy} value={strategy}>{strategy}</option>
                    ))}
                </select>
            </div>

            <h2>{activeStrategy}</h2>
            <Statistics />

            <div className="advanced-analytics">
                <h2>Advanced Analytics</h2>
                <div className="analytics-cards">
                    <div className="analytics-card">
                        <h3>Monte Carlo Simulation</h3>
                        <p>Run simulations to project potential future outcomes</p>
                        <button>Run Simulation</button>
                    </div>
                    <div className="analytics-card">
                        <h3>Risk Analysis</h3>
                        <p>Analyze volatility and potential downside risks</p>
                        <button>View Analysis</button>
                    </div>
                    <div className="analytics-card">
                        <h3>Export Reports</h3>
                        <p>Download detailed performance reports</p>
                        <button>Export PDF</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatisticsPage; 