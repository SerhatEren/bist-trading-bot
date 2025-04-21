import React, { useState } from 'react';
import { OrderSide, OrderType } from '../../types/api';
import apiServiceProxy from '../../services/apiFactory';
import '../../styles/TradingForm.css'; // We'll create this CSS file next

interface TradingFormProps {
  // Prop to notify parent (Dashboard) to refresh data after order
  onOrderPlaced: () => void; 
}

const TradingForm: React.FC<TradingFormProps> = ({ onOrderPlaced }) => {
  const [symbol, setSymbol] = useState('BTCUSDT'); // Default or allow selection
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET);
  const [price, setPrice] = useState(''); // For LIMIT orders later
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOrderSubmit = async (side: OrderSide) => {
    // Basic validation
    if (!symbol || !quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid symbol and quantity.');
      return;
    }
    // Add price validation for LIMIT orders later

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const orderData = {
        symbol: symbol.toUpperCase(),
        side: side,
        type: orderType,
        quantity: parseFloat(quantity),
        // Add price/stopPrice later for other order types
      };

      console.log('Submitting order:', orderData);
      const createdOrder = await apiServiceProxy.createOrder(orderData);
      console.log('Order creation response:', createdOrder);

      setSuccessMessage(`Successfully placed ${side} ${orderType} order for ${quantity} ${symbol}. Order ID: ${createdOrder.id}`);
      setQuantity(''); // Clear quantity field
      onOrderPlaced(); // Notify parent to refresh data

    } catch (err: any) { // Catch specific API errors if defined
      console.error('Order submission error:', err);
      setError(err?.message || 'Failed to place order.');
    } finally {
      setIsLoading(false);
      // Clear success/error messages after a delay
      setTimeout(() => {
          setError(null);
          setSuccessMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="trading-form-card dashboard-card">
      <h3 className="card-title">Place Order</h3>
      <div className="trading-form">
        {/* Symbol Input (can be dropdown later) */}
        <div className="form-group">
          <label htmlFor="symbol">Symbol:</label>
          <input 
            type="text" 
            id="symbol" 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)} 
            placeholder="e.g., BTCUSDT"
            disabled={isLoading}
          />
        </div>

        {/* Quantity Input */}
        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <input 
            type="number" 
            id="quantity" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            placeholder="Amount"
            min="0" // Basic HTML5 validation
            step="any" // Allow decimals
            disabled={isLoading}
          />
        </div>

        {/* Order Type (Add dropdown later) */}
        {/* <p>Type: {orderType}</p> */}

        {/* Price (Show conditionally for LIMIT later) */}

        {/* Action Buttons */}
        <div className="form-actions">
          <button 
            className="buy-button" 
            onClick={() => handleOrderSubmit(OrderSide.BUY)}
            disabled={isLoading}
          >
            {isLoading ? 'Buying...' : 'Buy'}
          </button>
          <button 
            className="sell-button" 
            onClick={() => handleOrderSubmit(OrderSide.SELL)}
            disabled={isLoading}
          >
            {isLoading ? 'Selling...' : 'Sell'}
          </button>
        </div>

        {/* Feedback Messages */}
        {error && <p className="error-message">Error: {error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </div>
  );
};

export default TradingForm; 