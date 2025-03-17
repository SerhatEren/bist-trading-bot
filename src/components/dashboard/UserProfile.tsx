import React from 'react';
import { User } from '../../types/api';
import './DashboardStyles.css';

interface UserProfileProps {
  user: User | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  if (!user) {
    return <div className="no-data">Kullanıcı bilgileri bulunamadı</div>;
  }

  return (
    <div className="user-profile-card">
      <h2>Kullanıcı Profili</h2>
      
      <div className="profile-details">
        <div className="profile-info">
          <span className="info-label">Kullanıcı Adı:</span>
          <span className="info-value">{user.username}</span>
        </div>
        
        <div className="profile-info">
          <span className="info-label">E-posta:</span>
          <span className="info-value">{user.email}</span>
        </div>
        
        <div className="profile-info">
          <span className="info-label">Üyelik Tarihi:</span>
          <span className="info-value">
            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 