import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { StockDetails as StockDetailsType } from '../../types/api';

interface StockDetailsProps {
  symbol: string;
}

const StockDetails: React.FC<StockDetailsProps> = ({ symbol }) => {
  const [details, setDetails] = useState<StockDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await apiService.getStockDetails(symbol);
        setDetails(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Hisse detayları alınamadı');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchDetails();
    }
  }, [symbol]);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!details) {
    return <div className="no-data">Hisse senedi detayları bulunamadı</div>;
  }

  return (
    <div className="stock-details">
      <h2>{details.name} ({details.symbol})</h2>
      <div className="details-grid">
        <div className="detail-item">
          <span className="label">Sektör:</span>
          <span className="value">{details.sector}</span>
        </div>
        <div className="detail-item">
          <span className="label">Piyasa Değeri:</span>
          <span className="value">{(details.marketCap / 1000000000).toFixed(2)} Milyar TL</span>
        </div>
        {details.peRatio && (
          <div className="detail-item">
            <span className="label">F/K Oranı:</span>
            <span className="value">{details.peRatio.toFixed(2)}</span>
          </div>
        )}
        {details.dividendYield && (
          <div className="detail-item">
            <span className="label">Temettü Verimi:</span>
            <span className="value">%{details.dividendYield.toFixed(2)}</span>
          </div>
        )}
        {details.highPrice52Week && (
          <div className="detail-item">
            <span className="label">52 Hafta Yüksek:</span>
            <span className="value">{details.highPrice52Week.toFixed(2)} TL</span>
          </div>
        )}
        {details.lowPrice52Week && (
          <div className="detail-item">
            <span className="label">52 Hafta Düşük:</span>
            <span className="value">{details.lowPrice52Week.toFixed(2)} TL</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDetails; 