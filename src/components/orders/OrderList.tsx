import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { Order, OrderStatus } from '../../types/api';
import './OrderStyles.css';

interface OrderListProps {
  refreshTrigger?: number;
}

const OrderList: React.FC<OrderListProps> = ({ refreshTrigger = 0 }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getOrders();
        setOrders(response.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Emirler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshTrigger]);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Bu emri iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await apiService.cancelOrder(orderId);
      // Emir listesini güncelle
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: OrderStatus.CANCELLED } 
          : order
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Emir iptal edilirken bir hata oluştu');
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEW: return 'Yeni';
      case OrderStatus.PARTIALLY_FILLED: return 'Kısmi Gerçekleşen';
      case OrderStatus.FILLED: return 'Gerçekleşen';
      case OrderStatus.CANCELLED: return 'İptal Edildi';
      case OrderStatus.REJECTED: return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEW: return 'status-new';
      case OrderStatus.PARTIALLY_FILLED: return 'status-partial';
      case OrderStatus.FILLED: return 'status-filled';
      case OrderStatus.CANCELLED: return 'status-cancelled';
      case OrderStatus.REJECTED: return 'status-rejected';
      default: return '';
    }
  };

  if (loading && orders.length === 0) {
    return <div className="loading">Emirler yükleniyor...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="no-data">Henüz emir bulunmamaktadır.</div>;
  }

  return (
    <div className="order-list">
      <h2>Emirlerim</h2>
      <table>
        <thead>
          <tr>
            <th>Hisse</th>
            <th>Yön</th>
            <th>Tip</th>
            <th>Miktar</th>
            <th>Fiyat</th>
            <th>Stop Fiyat</th>
            <th>Durum</th>
            <th>Tarih</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.symbol}</td>
              <td>{order.side === 'BUY' ? 'Alış' : 'Satış'}</td>
              <td>{order.type}</td>
              <td>{order.quantity}</td>
              <td>{order.price || '-'}</td>
              <td>{order.stopPrice || '-'}</td>
              <td className={getStatusClass(order.status)}>
                {getStatusText(order.status)}
              </td>
              <td>{new Date(order.createdAt).toLocaleString('tr-TR')}</td>
              <td>
                {order.status === OrderStatus.NEW && (
                  <button 
                    className="cancel-button"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    İptal
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList; 