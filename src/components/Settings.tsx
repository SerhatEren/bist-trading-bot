import { useState } from 'react';
import '../styles/Settings.css';

function Settings() {
    const [riskProfile, setRiskProfile] = useState('moderate');
    const [maxDrawdown, setMaxDrawdown] = useState(15);
    const [tradingFrequency, setTradingFrequency] = useState('daily');
    const [allowedAssets, setAllowedAssets] = useState(['THYAO', 'SASA', 'GARAN', 'ASELS', 'KCHOL', 'TUPRS']);
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
        tradeConfirmation: true,
        dailySummary: true
    });

    const handleAssetToggle = (asset: string) => {
        if (allowedAssets.includes(asset)) {
            setAllowedAssets(allowedAssets.filter(a => a !== asset));
        } else {
            setAllowedAssets([...allowedAssets, asset]);
        }
    };

    const handleNotificationChange = (type: keyof typeof notifications) => {
        setNotifications({
            ...notifications,
            [type]: !notifications[type]
        });
    };

    return (
        <div className="settings-container">
            <h2>Algorithm Settings</h2>

            <div className="settings-section">
                <h3>Risk Profile</h3>
                <div className="risk-selector">
                    <button
                        className={riskProfile === 'conservative' ? 'active' : ''}
                        onClick={() => setRiskProfile('conservative')}
                    >
                        Conservative
                    </button>
                    <button
                        className={riskProfile === 'moderate' ? 'active' : ''}
                        onClick={() => setRiskProfile('moderate')}
                    >
                        Moderate
                    </button>
                    <button
                        className={riskProfile === 'aggressive' ? 'active' : ''}
                        onClick={() => setRiskProfile('aggressive')}
                    >
                        Aggressive
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h3>Maximum Drawdown Tolerance</h3>
                <div className="slider-container">
                    <input
                        type="range"
                        min="5"
                        max="30"
                        value={maxDrawdown}
                        onChange={(e) => setMaxDrawdown(parseInt(e.target.value))}
                        className="slider"
                    />
                    <span className="slider-value">{maxDrawdown}%</span>
                </div>
                <p className="setting-description">
                    Maximum acceptable decline from peak to trough before taking defensive action
                </p>
            </div>

            <div className="settings-section">
                <h3>Trading Frequency</h3>
                <div className="frequency-options">
                    <label>
                        <input
                            type="radio"
                            name="frequency"
                            checked={tradingFrequency === 'daily'}
                            onChange={() => setTradingFrequency('daily')}
                        />
                        Daily
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="frequency"
                            checked={tradingFrequency === 'weekly'}
                            onChange={() => setTradingFrequency('weekly')}
                        />
                        Weekly
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="frequency"
                            checked={tradingFrequency === 'auto'}
                            onChange={() => setTradingFrequency('auto')}
                        />
                        Auto (Algorithm Decides)
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h3>Allowed Assets</h3>
                <div className="asset-selection">
                    {['THYAO', 'SASA', 'GARAN', 'ASELS', 'KCHOL', 'TUPRS', 'EREGL', 'BIMAS', 'TCELL', 'PETKM'].map(asset => (
                        <label key={asset} className="asset-checkbox">
                            <input
                                type="checkbox"
                                checked={allowedAssets.includes(asset)}
                                onChange={() => handleAssetToggle(asset)}
                            />
                            {asset}
                        </label>
                    ))}
                </div>
            </div>

            <div className="settings-section">
                <h3>Notifications</h3>
                <div className="notification-settings">
                    <label>
                        <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={() => handleNotificationChange('email')}
                        />
                        Email Notifications
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={notifications.sms}
                            onChange={() => handleNotificationChange('sms')}
                        />
                        SMS Notifications
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={notifications.push}
                            onChange={() => handleNotificationChange('push')}
                        />
                        Push Notifications
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={notifications.tradeConfirmation}
                            onChange={() => handleNotificationChange('tradeConfirmation')}
                        />
                        Trade Confirmation
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={notifications.dailySummary}
                            onChange={() => handleNotificationChange('dailySummary')}
                        />
                        Daily Performance Summary
                    </label>
                </div>
            </div>

            <div className="settings-actions">
                <button className="save-button">Save Settings</button>
                <button className="reset-button">Reset to Default</button>
            </div>
        </div>
    );
}

export default Settings; 