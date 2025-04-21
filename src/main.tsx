import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { MarketDataProvider } from './contexts/MarketDataContext'

// Add error handling for script loading
window.addEventListener('error', (event) => {
  console.error('Script error:', event.message, 'at', event.filename, ':', event.lineno);
});

// Error boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error caught by boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#fff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#333'
        }}>
          <h1>Something went wrong</h1>
          <p>Error: {this.state.error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              marginTop: '20px',
              backgroundColor: '#646cff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

console.log('Root element found, rendering app...');

// Ensure the root element is visible
rootElement.style.display = 'flex';
rootElement.style.flexDirection = 'column';
rootElement.style.minHeight = '100vh';
rootElement.style.backgroundColor = '#ffffff';

const root = ReactDOM.createRoot(rootElement);

// Render the app with error boundary AND MarketDataProvider
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <MarketDataProvider>
        <App />
      </MarketDataProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
