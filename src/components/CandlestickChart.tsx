import React from 'react';
import '../styles/CandlestickChart.css';

interface CandleData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

interface CandlestickChartProps {
    data?: CandleData[];
    height?: number;
    showVolume?: boolean;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
    height = 300,
    showVolume = false
}) => {
    // Generate sample candlestick data for the placeholder
    const generateSampleData = (): CandleData[] => {
        const candles: CandleData[] = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        let previousClose = 100;

        for (let i = 0; i < 15; i++) {
            const change = (Math.random() - 0.5) * 4;
            const volatility = Math.random() * 3 + 1;

            const open = previousClose;
            const close = open + change;
            const high = Math.max(open, close) + Math.random() * volatility;
            const low = Math.min(open, close) - Math.random() * volatility;
            const volume = Math.floor(Math.random() * 1000) + 500;

            candles.push({
                date: days[i % days.length],
                open,
                high,
                low,
                close,
                volume
            });

            previousClose = close;
        }

        return candles;
    };

    const sampleData = generateSampleData();

    // Find min and max values for scaling
    const minValue = Math.min(...sampleData.map(candle => candle.low));
    const maxValue = Math.max(...sampleData.map(candle => candle.high));
    const valueRange = maxValue - minValue;
    const paddedMin = minValue - (valueRange * 0.1);
    const paddedMax = maxValue + (valueRange * 0.1);
    const adjustedRange = paddedMax - paddedMin;

    // Scale y value to chart height (inverted, as SVG y increases downward)
    const scaleY = (value: number): number => {
        return 100 - ((value - paddedMin) / adjustedRange * 100);
    };

    // Scale candle to chart width
    const candleWidth = 90 / sampleData.length;
    const getX = (index: number): number => 5 + (index * candleWidth);

    return (
        <div className="candlestick-chart" style={{ height }}>
            <div className="price-axis">
                {[0, 1, 2, 3, 4].map((i) => {
                    const value = paddedMin + (adjustedRange * (i / 4));
                    return (
                        <div key={i} className="price-label">
                            {value.toFixed(2)}
                        </div>
                    );
                })}
            </div>

            <div className="chart-content">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Grid lines */}
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

                    {/* Candles */}
                    {sampleData.map((candle, i) => {
                        const x = getX(i);
                        const isGreen = candle.close >= candle.open;
                        const color = isGreen ? '#38A169' : '#E53E3E';
                        const bodyTop = scaleY(Math.max(candle.open, candle.close));
                        const bodyBottom = scaleY(Math.min(candle.open, candle.close));
                        const bodyHeight = Math.max(0.5, bodyBottom - bodyTop);

                        return (
                            <g key={i}>
                                {/* Wick */}
                                <line
                                    x1={x + (candleWidth / 2)}
                                    y1={scaleY(candle.high)}
                                    x2={x + (candleWidth / 2)}
                                    y2={scaleY(candle.low)}
                                    stroke={color}
                                    strokeWidth="0.5"
                                />

                                {/* Body */}
                                <rect
                                    x={x + (candleWidth * 0.1)}
                                    y={bodyTop}
                                    width={candleWidth * 0.8}
                                    height={bodyHeight}
                                    fill={color}
                                    fillOpacity={0.8}
                                    stroke={color}
                                    strokeWidth="0.5"
                                />
                            </g>
                        );
                    })}
                </svg>

                <div className="time-axis">
                    {sampleData.filter((_, i) => i % 3 === 0).map((candle, i) => (
                        <div key={i} className="time-label">
                            {candle.date}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CandlestickChart; 