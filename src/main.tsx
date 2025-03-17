import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import axios from 'axios'
import { environment } from './config/environment'

// Add global type declaration for test mode
declare global {
  interface Window {
    __TEST_MODE__?: boolean;
  }
}

// Force test mode for development
window.__TEST_MODE__ = true;

// Add console debugging to track rendering
console.log('App starting in environment:', 
  environment.isTestMode ? 'TEST MODE' : environment.env);

// Configure Axios defaults
axios.defaults.baseURL = environment.apiUrl

// Configure CORS
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
axios.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
axios.defaults.headers.common['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'

// Configure request interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

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

// Render the app with error boundary
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
