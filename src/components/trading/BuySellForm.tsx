import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiFactory';
import { OrderSide, OrderType } from '../../types/api';
import { 
  formatCurrency, 
  fromApiPortfolio,
  Portfolio 
} from '../../services/mockData';
import './TradingStyles.css';

interface BuySellFormProps {
  onSuccess?: () => void;
}

const BuySellForm: React.FC<BuySellFormProps> = ({ onSuccess }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [isBuy, setIsBuy] = useState(true);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET);
  const [limitPrice, setLimitPrice] = useState<number | null>(null);
  const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null);

  // Load portfolio data from cache
  useEffect(() => {
    const cachedData = sessionStorage.getItem('portfolioData');
    if (cachedData) {
      try {
        setPortfolioData(fromApiPortfolio(JSON.parse(cachedData)));
      } catch (err) {
        console.error('Error parsing cached portfolio data:', err);
      }
    }
  }, []);

  // Get position for the current symbol
  const getCurrentPosition = () => {
    if (!portfolioData || !symbol) return null;
    return portfolioData.positions.find(p => p.symbol === symbol) || null;
  };

  const currentPosition = getCurrentPosition();

  // Load available stock symbols
  useEffect(() => {
    const symbols = ['GARAN', 'AKBNK', 'ISCTR', 'THYAO', 'ASELS', 'KCHOL', 'TUPRS', 'EREGL', 'BIMAS', 'TSKB'];
    setAvailableSymbols(symbols);
  }, []);

  // Get price information when symbol changes
  useEffect(() => {
    if (symbol) {
      try {
        const stockPrice = apiService.getStockPrice(symbol);
        setPrice(stockPrice);
        setLimitPrice(stockPrice);
      } catch (err) {
        setPrice(null);
        setLimitPrice(null);
      }
    } else {
      setPrice(null);
      setLimitPrice(null);
    }
  }, [symbol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Validation
      if (!symbol) {
        throw new Error('Please select a stock');
      }

      if (!quantity || quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }

      if (orderType === OrderType.LIMIT && (!limitPrice || limitPrice <= 0)) {
        throw new Error('Please enter a valid limit price');
      }

      // Execute buy or sell order
      const orderData = {
        symbol,
        side: isBuy ? OrderSide.BUY : OrderSide.SELL,
        type: orderType,
        quantity,
        price: orderType === OrderType.LIMIT && limitPrice ? limitPrice : undefined
      };

      const result = await apiService.createOrder(orderData);
      
      setSuccess(`Successfully ${isBuy ? 'purchased' : 'sold'} ${quantity} shares of ${symbol}`);

      // Reset form
      setSymbol('');
      setQuantity(0);
      setLimitPrice(null);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyOrNull = (value: number | null) => {
    if (value === null) return '-';
    return formatCurrency(value);
  };

  const calculateTotal = () => {
    if (!symbol || !quantity || quantity <= 0 || !price) return null;
    
    const orderValue = quantity * (orderType === OrderType.LIMIT && limitPrice ? limitPrice : price);
    const commission = orderValue * 0.002; // 0.2% commission fee
    
    return isBuy ? orderValue + commission : orderValue - commission;
  };

  return (
    <div className="trade-form">
      <h2>Trade Securities</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="trade-type-toggle">
        <button 
          className={`toggle-btn ${isBuy ? 'active' : ''}`}
          onClick={() => setIsBuy(true)}
          type="button"
        >
          Buy
        </button>
        <button 
          className={`toggle-btn ${!isBuy ? 'active' : ''}`}
          onClick={() => setIsBuy(false)}
          type="button"
        >
          Sell
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="symbol">Security</label>
          <select
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
            className="form-control"
          >
            <option value="">Select</option>
            {availableSymbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="orderType">Order Type</label>
          <select
            id="orderType"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="form-control"
          >
            <option value={OrderType.MARKET}>Market</option>
            <option value={OrderType.LIMIT}>Limit</option>
          </select>
        </div>
        
        {symbol && price && (
          <div className="price-info">
            <span className="price-label">Current Price:</span>
            <span className="price-value">{formatCurrencyOrNull(price)}</span>
          </div>
        )}
        
        {orderType === OrderType.LIMIT && (
          <div className="form-group">
            <label htmlFor="limitPrice">Limit Price</label>
            <input
              type="number"
              id="limitPrice"
              value={limitPrice || ''}
              onChange={(e) => setLimitPrice(Number(e.target.value))}
              required={orderType === OrderType.LIMIT}
              min="0.01"
              step="0.01"
              className="form-control"
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity || ''}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            min="1"
            step="1"
            className="form-control"
          />
        </div>
        
        <div className="order-summary">
          {symbol && price && (
            <>
              <div className="price-info">
                <span className="price-label">Current Price:</span>
                <span className="price-value">{formatCurrencyOrNull(price)}</span>
              </div>

              {portfolioData && (
                <div className="portfolio-info">
                  <div className="info-row">
                    <span>Available Cash:</span>
                    <span>{formatCurrency(portfolioData.cashBalance)}</span>
                  </div>
                  {currentPosition && (
                    <>
                      <div className="info-row">
                        <span>Current Position:</span>
                        <span>{currentPosition.quantity} shares</span>
                      </div>
                      <div className="info-row">
                        <span>Avg Price:</span>
                        <span>{formatCurrency(currentPosition.avgPrice)}</span>
                      </div>
                      <div className={`info-row ${currentPosition.change >= 0 ? 'positive' : 'negative'}`}>
                        <span>Unrealized P&L:</span>
                        <span>{formatCurrency(currentPosition.change)} ({(currentPosition.changePercent).toFixed(2)}%)</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {quantity > 0 && (
                <div className="transaction-summary">
                  <div className="summary-row">
                    <span>Transaction Value:</span>
                    <span>{formatCurrencyOrNull(
                      orderType === OrderType.LIMIT && limitPrice 
                        ? limitPrice * quantity 
                        : price * quantity
                    )}</span>
                  </div>
                  <div className="summary-row">
                    <span>Commission (0.2%):</span>
                    <span>{formatCurrencyOrNull(
                      orderType === OrderType.LIMIT && limitPrice
                        ? limitPrice * quantity * 0.002
                        : price * quantity * 0.002
                    )}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total {isBuy ? 'Cost' : 'Proceeds'}:</span>
                    <span>{formatCurrencyOrNull(calculateTotal())}</span>
                  </div>

                  {isBuy && portfolioData && calculateTotal() && calculateTotal()! > portfolioData.cashBalance && (
                    <div className="insufficient-funds">
                      Insufficient funds: Transaction cost exceeds available cash
                    </div>
                  )}

                  {!isBuy && currentPosition && quantity > currentPosition.quantity && (
                    <div className="insufficient-shares">
                      Insufficient shares: You only have {currentPosition.quantity} shares
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        <button
          type="submit"
          className={`trade-btn ${isBuy ? 'buy-btn' : 'sell-btn'}`}
          disabled={loading || !symbol || !quantity || quantity <= 0 || (orderType === OrderType.LIMIT && (!limitPrice || limitPrice <= 0))}
        >
          {loading 
            ? 'Processing...' 
            : isBuy 
              ? 'Buy' 
              : 'Sell'
          }
        </button>
      </form>
    </div>
  );
};

export default BuySellForm; 