import React, { useState } from 'react';
import apiService from '../../services/api';
import { OrderSide, OrderType } from '../../types/api';
import './OrderStyles.css';

interface OrderFormProps {
  onSuccess?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSuccess }) => {
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const [type, setType] = useState<OrderType>(OrderType.MARKET);
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [stopPrice, setStopPrice] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Validasyon
    if (quantity <= 0) {
      setError('Miktar pozitif bir sayı olmalıdır');
      setLoading(false);
      return;
    }

    if ((type === OrderType.LIMIT || type === OrderType.STOP_LIMIT) && !price) {
      setError('Limit emirlerde fiyat belirtilmelidir');
      setLoading(false);
      return;
    }

    if ((type === OrderType.STOP || type === OrderType.STOP_LIMIT) && !stopPrice) {
      setError('Stop emirlerde stop fiyatı belirtilmelidir');
      setLoading(false);
      return;
    }

    try {
      await apiService.createOrder({
        symbol,
        side,
        type,
        quantity,
        price,
        stopPrice
      });
      
      setSuccess(true);
      
      // Form alanlarını sıfırla
      setSymbol('');
      setQuantity(0);
      setPrice(undefined);
      setStopPrice(undefined);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Emir oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form">
      <h2>Yeni Emir</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Emir başarıyla oluşturuldu</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="symbol">Hisse Senedi</label>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            required
            placeholder="Örn: GARAN"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="side">İşlem Yönü</label>
          <select
            id="side"
            value={side}
            onChange={(e) => setSide(e.target.value as OrderSide)}
            required
          >
            <option value={OrderSide.BUY}>Alış</option>
            <option value={OrderSide.SELL}>Satış</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="type">Emir Tipi</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as OrderType)}
            required
          >
            <option value={OrderType.MARKET}>Piyasa</option>
            <option value={OrderType.LIMIT}>Limit</option>
            <option value={OrderType.STOP}>Stop</option>
            <option value={OrderType.STOP_LIMIT}>Stop Limit</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="quantity">Miktar</label>
          <input
            type="number"
            id="quantity"
            value={quantity || ''}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            min="1"
            step="1"
          />
        </div>
        
        {(type === OrderType.LIMIT || type === OrderType.STOP_LIMIT) && (
          <div className="form-group">
            <label htmlFor="price">Limit Fiyat</label>
            <input
              type="number"
              id="price"
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              min="0.01"
              step="0.01"
            />
          </div>
        )}
        
        {(type === OrderType.STOP || type === OrderType.STOP_LIMIT) && (
          <div className="form-group">
            <label htmlFor="stopPrice">Stop Fiyat</label>
            <input
              type="number"
              id="stopPrice"
              value={stopPrice || ''}
              onChange={(e) => setStopPrice(Number(e.target.value))}
              required
              min="0.01"
              step="0.01"
            />
          </div>
        )}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Emir Oluşturuluyor...' : 'Emir Oluştur'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm; 