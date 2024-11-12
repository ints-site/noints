import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Add global error handler
window.onerror = function(msg, url, line, col, error) {
  console.warn('Global error:', { msg, url, line, col, error });
  return false;
};

// Add promise rejection handler
window.onunhandledrejection = function(event) {
  console.warn('Unhandled promise rejection:', event.reason);
  event.preventDefault();
};

// Add error boundary for entire app
class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('App error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h2>Something went wrong</h2>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
); 