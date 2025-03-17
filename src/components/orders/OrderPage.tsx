import React, { useState } from 'react';
import OrderForm from './OrderForm';
import OrderList from './OrderList';
import './OrderStyles.css';

const OrderPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOrderSuccess = () => {
    // Emir listesini yenilemek için tetikleyiciyi artır
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="order-page">
      <h1>Emir İşlemleri</h1>
      
      <div className="order-page-content">
        <div className="order-form-container">
          <OrderForm onSuccess={handleOrderSuccess} />
        </div>
        
        <div className="order-list-container">
          <OrderList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default OrderPage; 