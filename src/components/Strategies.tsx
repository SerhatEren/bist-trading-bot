import React, { useState } from 'react'
import '../styles/Strategies.css'

interface Strategy {
    id: number
    name: string
    description: string
    type: string
    parameters: {
        [key: string]: number | string | boolean
    }
    isActive: boolean
    performance: {
        winRate: number
        profitFactor: number
        sharpeRatio: number
    }
}

const Strategies: React.FC = () => {
    const [strategies, setStrategies] = useState<Strategy[]>([
        {
            id: 1,
            name: 'Moving Average Crossover',
            description: 'Buy when fast MA crosses above slow MA, sell when it crosses below',
            type: 'Trend Following',
            parameters: {
                fastPeriod: 10,
                slowPeriod: 30,
                signalPeriod: 9,
            },
            isActive: true,
            performance: {
                winRate: 62.5,
                profitFactor: 1.8,
                sharpeRatio: 1.2
            }
        },
        {
            id: 2,
            name: 'RSI Reversal',
            description: 'Buy when RSI is oversold, sell when overbought',
            type: 'Mean Reversion',
            parameters: {
                rsiPeriod: 14,
                oversold: 30,
                overbought: 70,
            },
            isActive: false,
            performance: {
                winRate: 58.3,
                profitFactor: 1.5,
                sharpeRatio: 0.9
            }
        },
        {
            id: 3,
            name: 'MACD Strategy',
            description: 'Buy/sell signals based on MACD histogram and signal line crosses',
            type: 'Momentum',
            parameters: {
                fastEMA: 12,
                slowEMA: 26,
                signalPeriod: 9,
            },
            isActive: true,
            performance: {
                winRate: 65.0,
                profitFactor: 2.1,
                sharpeRatio: 1.4
            }
        }
    ])

    const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const toggleStrategyActive = (id: number) => {
        setStrategies(strategies.map(strategy =>
            strategy.id === id ? { ...strategy, isActive: !strategy.isActive } : strategy
        ))
    }

    const openEditModal = (strategy: Strategy) => {
        setEditingStrategy({ ...strategy })
        setIsModalOpen(true)
    }

    const saveStrategy = () => {
        if (!editingStrategy) return

        setStrategies(strategies.map(strategy =>
            strategy.id === editingStrategy.id ? editingStrategy : strategy
        ))
        setIsModalOpen(false)
        setEditingStrategy(null)
    }

    const createNewStrategy = () => {
        const newStrategy: Strategy = {
            id: strategies.length + 1,
            name: 'New Strategy',
            description: 'Description of the strategy',
            type: 'Custom',
            parameters: {},
            isActive: false,
            performance: {
                winRate: 0,
                profitFactor: 0,
                sharpeRatio: 0
            }
        }
        setEditingStrategy(newStrategy)
        setIsModalOpen(true)
    }

    const handleParameterChange = (key: string, value: string | number | boolean) => {
        if (!editingStrategy) return

        setEditingStrategy({
            ...editingStrategy,
            parameters: {
                ...editingStrategy.parameters,
                [key]: value
            }
        })
    }

    return (
        <div className="strategies-container">
            <div className="strategies-header">
                <h2>Trading Strategies</h2>
                <button className="create-strategy-btn" onClick={createNewStrategy}>
                    Create New Strategy
                </button>
            </div>

            <div className="strategies-list">
                {strategies.map(strategy => (
                    <div className="strategy-card" key={strategy.id}>
                        <div className="strategy-header">
                            <h3>{strategy.name}</h3>
                            <div className="strategy-controls">
                                <button
                                    className="edit-btn"
                                    onClick={() => openEditModal(strategy)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={`toggle-btn ${strategy.isActive ? 'active' : 'inactive'}`}
                                    onClick={() => toggleStrategyActive(strategy.id)}
                                >
                                    {strategy.isActive ? 'Active' : 'Inactive'}
                                </button>
                            </div>
                        </div>
                        <p className="strategy-type">{strategy.type}</p>
                        <p className="strategy-description">{strategy.description}</p>

                        <div className="strategy-parameters">
                            <h4>Parameters</h4>
                            <div className="parameters-grid">
                                {Object.entries(strategy.parameters).map(([key, value]) => (
                                    <div className="parameter" key={key}>
                                        <span className="parameter-name">{key}:</span>
                                        <span className="parameter-value">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="strategy-performance">
                            <h4>Performance</h4>
                            <div className="performance-metrics">
                                <div className="metric">
                                    <span className="metric-name">Win Rate:</span>
                                    <span className="metric-value">{strategy.performance.winRate}%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-name">Profit Factor:</span>
                                    <span className="metric-value">{strategy.performance.profitFactor}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-name">Sharpe Ratio:</span>
                                    <span className="metric-value">{strategy.performance.sharpeRatio}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingStrategy && (
                <div className="modal-overlay">
                    <div className="strategy-modal">
                        <h2>{editingStrategy.id ? 'Edit Strategy' : 'Create Strategy'}</h2>

                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={editingStrategy.name}
                                onChange={(e) => setEditingStrategy({ ...editingStrategy, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Type</label>
                            <select
                                value={editingStrategy.type}
                                onChange={(e) => setEditingStrategy({ ...editingStrategy, type: e.target.value })}
                            >
                                <option value="Trend Following">Trend Following</option>
                                <option value="Mean Reversion">Mean Reversion</option>
                                <option value="Momentum">Momentum</option>
                                <option value="Breakout">Breakout</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={editingStrategy.description}
                                onChange={(e) => setEditingStrategy({ ...editingStrategy, description: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <h3>Parameters</h3>
                            {Object.entries(editingStrategy.parameters).map(([key, value]) => (
                                <div className="parameter-input" key={key}>
                                    <label>{key}</label>
                                    <input
                                        type={typeof value === 'number' ? 'number' : 'text'}
                                        value={value.toString()}
                                        onChange={(e) => handleParameterChange(
                                            key,
                                            typeof value === 'number' ? Number(e.target.value) : e.target.value
                                        )}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="save-btn" onClick={saveStrategy}>Save Strategy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Strategies 