import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiFactory';
import { OrderSide, OrderType, TickerPrice } from '../../types/api';
import './TradingStyles.css';

// Helper function (move to utils?)
const formatCurrency = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

interface BuySellFormProps {
  onSuccess?: () => void;
}

const BuySellForm: React.FC<BuySellFormProps> = ({ onSuccess }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [isBuy, setIsBuy] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET);
  const [limitPrice, setLimitPrice] = useState<string>('');

  // Load available stock symbols (replace with actual Binance symbols)
  useEffect(() => {
    // Example Binance Symbols - Fetch dynamically later if needed
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBBTC', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT']; 
    setAvailableSymbols(symbols);
    if (symbols.length > 0) {
        setSymbol(symbols[0]); // Default to first symbol
    }
  }, []);

  // Get price information when symbol changes (Using REST for now)
  useEffect(() => {
    setCurrentPrice(null); // Reset price on symbol change
    if (symbol) {
        setLoading(true); // Indicate loading price
        apiService.getStockQuotes([symbol])
            .then(response => {
                if (response.data.success && response.data.data.length > 0) {
                    const price = parseFloat(response.data.data[0].price);
                    setCurrentPrice(price);
                    // Set default limit price only if market type or empty
                    if (orderType === OrderType.MARKET || !limitPrice) {
                        setLimitPrice(price.toFixed(2)); // Default limit price to current market price
                    }
                } else {
                    setError(`Could not fetch price for ${symbol}`);
                }
            })
            .catch(err => {
                console.error("Price fetch error:", err);
                setError(`Could not fetch price for ${symbol}`);
            })
            .finally(() => setLoading(false));
    }
  }, [symbol]); // Re-fetch only when symbol changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Convert quantity and limitPrice from string to number for validation/API call
    const numQuantity = parseFloat(quantity);
    const numLimitPrice = orderType === OrderType.LIMIT ? parseFloat(limitPrice) : undefined;

    try {
      // Validation
      if (!symbol) throw new Error('Please select a symbol');
      if (isNaN(numQuantity) || numQuantity <= 0) throw new Error('Quantity must be a positive number');
      if (orderType === OrderType.LIMIT && (numLimitPrice === undefined || isNaN(numLimitPrice) || numLimitPrice <= 0)) {
        throw new Error('Please enter a valid limit price');
      }
      // TODO: Add balance validation using real portfolioData

      const orderData: CreateOrderRequest = {
        symbol,
        side: isBuy ? OrderSide.BUY : OrderSide.SELL,
        type: orderType,
        quantity: numQuantity,
        price: numLimitPrice 
      };

      console.log('Submitting Order:', orderData); // Log before sending
      const result = await apiService.createOrder(orderData);
      console.log('Order Result:', result); // Log result
      
      // Use result data if available, otherwise generic success
      const successMsg = result?.data?.data?.orderId 
          ? `Order ${result.data.data.orderId} placed successfully for ${numQuantity} ${symbol}`
          : `Successfully submitted order for ${numQuantity} ${symbol}`;
      setSuccess(successMsg);

      // Reset form
      // setSymbol(''); // Keep symbol selected?
      setQuantity('');
      setLimitPrice(currentPrice ? currentPrice.toFixed(2) : ''); // Reset limit price to current
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Order submission error:", err.response || err);
      setError(err.response?.data?.message || err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const numQuantity = parseFloat(quantity);
    const priceToUse = orderType === OrderType.LIMIT ? parseFloat(limitPrice) : currentPrice;
    if (!symbol || isNaN(numQuantity) || numQuantity <= 0 || !priceToUse) return null;
    
    const orderValue = numQuantity * priceToUse;
    // Use a more realistic commission or fetch from account info later
    const commission = orderValue * 0.001; // Example: 0.1% commission
    
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
        
        {symbol && currentPrice && (
          <div className="price-info">
            <span className="price-label">Current Price:</span>
            <span className="price-value">{formatCurrency(currentPrice, 4)}</span>
          </div>
        )}
        
        {orderType === OrderType.LIMIT && (
          <div className="form-group">
            <label htmlFor="limitPrice">Limit Price</label>
            <input
              type="number"
              id="limitPrice"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              required={orderType === OrderType.LIMIT}
              min="0.00000001"
              step="any"
              className="form-control"
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="0.00000001"
            step="any"
            className="form-control"
          />
        </div>
        
        <div className="order-summary">
          {symbol && currentPrice && (
            <>
              <div className="price-info">
                <span className="price-label">Current Price:</span>
                <span className="price-value">{formatCurrency(currentPrice, 4)}</span>
              </div>

              {parseFloat(quantity) > 0 && (
                <div className="transaction-summary">
                  <div className="summary-row">
                    <span>Transaction Value:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="summary-row">
                    <span>Commission (0.1%):</span>
                    <span>{formatCurrency(calculateTotal() * 0.001)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total {isBuy ? 'Cost' : 'Proceeds'}:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <button
          type="submit"
          className={`trade-btn ${isBuy ? 'buy-btn' : 'sell-btn'}`}
          disabled={loading || !symbol || !quantity || parseFloat(quantity) <= 0 || (orderType === OrderType.LIMIT && (!limitPrice || parseFloat(limitPrice) <= 0))}
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