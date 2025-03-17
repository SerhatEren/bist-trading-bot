import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { Portfolio, Position } from '../../types/api';
import UserProfile from './UserProfile';
import PortfolioOverview from './PortfolioOverview';
import RecentTransactions from './RecentTransactions';
import './DashboardStyles.css';

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Kullanıcı bilgilerini al
        const userResponse = await apiService.getCurrentUser();
        setUser(userResponse);
        
        // Portföy bilgilerini al
        const portfolioResponse = await apiService.getPortfolio();
        setPortfolio(portfolioResponse.data);

      } catch (err: any) {
        setError(err.response?.data?.message || 'Dashboard verileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Veriler yükleniyor...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-profile">
          <UserProfile user={user} />
        </div>
        
        <div className="dashboard-portfolio">
          <PortfolioOverview portfolio={portfolio} />
        </div>
        
        <div className="dashboard-transactions">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 