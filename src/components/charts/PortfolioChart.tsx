import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { HistoricalValue } from '../../services/mockData';

interface PortfolioChartProps {
  data: HistoricalValue[];
  isLoading: boolean;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="chart-container loading">
        <div className="spinner"></div>
        <span>Loading chart data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container no-data">
        No historical data available
      </div>
    );
  }

  // Extract and format data for the chart
  const chartData = data.map(item => ({
    x: new Date(item.date).getTime(),
    y: item.value
  }));

  // Determine if the portfolio trend is positive
  const isPositive = data.length > 1 && data[data.length - 1].value >= data[0].value;
  
  // Calculate min and max values with padding
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  
  // Add 5% padding to the y-axis range
  const yAxisMin = Math.max(0, minValue - valueRange * 0.05);
  const yAxisMax = maxValue + valueRange * 0.05;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 250,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: [isPositive ? 'var(--chart-up)' : 'var(--chart-down)']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: isPositive ? 'var(--chart-up)' : 'var(--chart-down)',
            opacity: 0.3
          },
          {
            offset: 100,
            color: isPositive ? 'var(--chart-up)' : 'var(--chart-down)',
            opacity: 0.0
          }
        ]
      }
    },
    grid: {
      borderColor: 'var(--border-color)',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: 'var(--text-secondary)',
          fontSize: '10px'
        },
        datetimeUTC: false,
        format: data.length > 7 ? 'MMM dd' : 'HH:mm'
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'var(--text-secondary)',
          fontSize: '10px'
        },
        formatter: (value) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(value);
        }
      },
      min: yAxisMin,
      max: yAxisMax,
      tickAmount: 4
    },
    tooltip: {
      x: {
        format: data.length > 7 ? 'MMM dd, yyyy' : 'MMM dd, HH:mm'
      },
      y: {
        formatter: function(value) {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(value);
        }
      },
      theme: 'dark',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      }
    },
    markers: {
      size: 0,
      strokeWidth: 0,
      hover: {
        size: 4
      }
    }
  };

  const series = [{
    name: 'Portfolio Value',
    data: chartData
  }];

  return (
    <div className="chart-container">
      <ReactApexChart 
        options={options} 
        series={series} 
        type="area" 
        height={250} 
      />
    </div>
  );
};

export default PortfolioChart; 