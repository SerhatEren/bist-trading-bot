import React from 'react';
import '../styles/ChartPlaceholders.css';

interface LineChartProps {
    data?: number[];
    height?: number;
    positive?: boolean;
    xLabels?: string[];
    yLabels?: string[];
}

export const LineChartPlaceholder: React.FC<LineChartProps> = ({
    height = 200,
    positive = true,
    xLabels = ['09:30', '11:00', '12:30', '14:00', '15:30', '17:00'],
    yLabels = ['₺1.15M', '₺1.20M', '₺1.25M', '₺1.30M']
}) => {
    // Generate smoother curve for better visual appearance
    const generateSmoothPath = () => {
        const numPoints = 50;
        let pathData = '';

        // Start with a slightly randomized but controlled upward or downward trend
        const points = [];
        const trend = positive ? 0.4 : -0.4;

        for (let i = 0; i < numPoints; i++) {
            const x = (i / (numPoints - 1)) * 100;

            // Base value with slight sine wave
            let y = 50 - (15 * Math.sin(i / 8));

            // Add trending direction
            y -= trend * i;

            // Add some controlled randomness
            y += (Math.random() - 0.5) * 4;

            points.push({ x, y });
        }

        // Create SVG path command
        pathData = points.map((point, i) => {
            return i === 0 ? `M ${point.x},${point.y}` : `L ${point.x},${point.y}`;
        }).join(' ');

        return pathData;
    };

    const pathData = generateSmoothPath();

    // Create a closed polygon for the area fill
    const createFillPath = () => {
        return `${pathData} L 100,100 L 0,100 Z`;
    };

    return (
        <div className="chart-placeholder" style={{ height }}>
            <div className="y-axis">
                {yLabels.map((label, i) => (
                    <div key={i} className="axis-label">{label}</div>
                ))}
            </div>

            <div className="chart-area">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Horizontal grid lines */}
                    {[0, 25, 50, 75, 100].map((y) => (
                        <line
                            key={`h-${y}`}
                            x1="0"
                            y1={y}
                            x2="100"
                            y2={y}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="0.5"
                        />
                    ))}

                    {/* Vertical grid lines */}
                    {[0, 20, 40, 60, 80, 100].map((x) => (
                        <line
                            key={`v-${x}`}
                            x1={x}
                            y1="0"
                            x2={x}
                            y2="100"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="0.5"
                        />
                    ))}

                    {/* Area fill */}
                    <path
                        d={createFillPath()}
                        fill={`url(#gradient-${positive ? 'positive' : 'negative'})`}
                    />

                    {/* Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={positive ? '#38a169' : '#e53e3e'}
                        strokeWidth="1.5"
                    />

                    {/* Highlight dots at key points */}
                    <circle cx="0" cy="50" r="1.5" fill={positive ? '#38a169' : '#e53e3e'} />
                    <circle cx="100" cy={positive ? "30" : "70"} r="1.5" fill={positive ? '#38a169' : '#e53e3e'} />

                    <defs>
                        <linearGradient id="gradient-positive" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(56, 161, 105, 0.3)" />
                            <stop offset="100%" stopColor="rgba(56, 161, 105, 0)" />
                        </linearGradient>
                        <linearGradient id="gradient-negative" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(229, 62, 62, 0.3)" />
                            <stop offset="100%" stopColor="rgba(229, 62, 62, 0)" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="x-axis">
                {xLabels.map((label, i) => (
                    <div key={i} className="axis-label">{label}</div>
                ))}
            </div>
        </div>
    );
};

interface PieChartProps {
    data?: Array<{ name: string; value: number; color: string }>;
    size?: number;
}

export const PieChartPlaceholder: React.FC<PieChartProps> = ({
    size = 200,
    data = [
        { name: 'THYAO', value: 15.4, color: '#4299e1' },
        { name: 'SASA', value: 12.8, color: '#38a169' },
        { name: 'ASELS', value: 10.3, color: '#dd6b20' },
        { name: 'KCHOL', value: 9.7, color: '#e53e3e' },
        { name: 'Others', value: 20.7, color: '#9f7aea' },
        { name: 'Cash', value: 31.1, color: '#ebf8ff' }
    ]
}) => {
    // Calculate cumulative percentages for conic gradient
    let cumulativePercentage = 0;
    const segments = data.map(item => {
        const startPercentage = cumulativePercentage;
        cumulativePercentage += item.value;
        return {
            ...item,
            startPercentage,
            endPercentage: cumulativePercentage
        };
    });

    // Create conic gradient string
    const conicGradient = segments.map(segment =>
        `${segment.color} ${segment.startPercentage}% ${segment.endPercentage}%`
    ).join(', ');

    return (
        <div className="pie-placeholder" style={{ width: size, height: size }}>
            <div
                className="pie-chart"
                style={{
                    background: `conic-gradient(${conicGradient})`,
                    width: size,
                    height: size
                }}
            >
                <div className="pie-hole">
                    <div className="pie-label">Total</div>
                    <div className="pie-value">100%</div>
                </div>
            </div>
            <div className="pie-legend">
                {data.map((item, index) => (
                    <div key={index} className="legend-item">
                        <div className="color-indicator" style={{ backgroundColor: item.color }}></div>
                        <div className="item-name">{item.name}</div>
                        <div className="item-value">{item.value}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const BarChartPlaceholder: React.FC<{
    data?: Array<{ label: string; value: number }>;
    height?: number;
}> = ({
    height = 200,
    data = [
        { label: 'Jan', value: 65 },
        { label: 'Feb', value: 35 },
        { label: 'Mar', value: 85 },
        { label: 'Apr', value: 45 },
        { label: 'May', value: 65 },
        { label: 'Jun', value: 75 }
    ]
}) => {
        // Find max value for scaling
        const maxValue = Math.max(...data.map(item => Math.abs(item.value)));

        return (
            <div className="bar-placeholder" style={{ height }}>
                <div className="bars-container">
                    {data.map((item, index) => (
                        <div key={index} className="bar-item">
                            <div className="bar-wrapper">
                                <div
                                    className={`bar ${item.value >= 0 ? 'positive-bar' : 'negative-bar'}`}
                                    style={{
                                        height: `${Math.abs(item.value) / maxValue * 100}%`,
                                        bottom: item.value >= 0 ? '0' : 'auto',
                                        top: item.value < 0 ? '50%' : 'auto'
                                    }}
                                ></div>
                            </div>
                            <div className="bar-label">{item.label}</div>
                        </div>
                    ))}
                </div>
                <div className="bar-axis"></div>
            </div>
        );
    }; 