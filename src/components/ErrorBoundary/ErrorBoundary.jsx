import React from 'react';
import './ErrorBoundary.css';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('[ErrorBoundary] Caught render error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <AlertTriangle className="error-boundary-icon" size={48} />
            <h2>CodeLens Encountered an Issue</h2>
            <p>We're sorry, but the application ran into an unexpected error.</p>
            <button className="error-boundary-reload-btn glow-btn" onClick={this.handleReload}>
              <RefreshCw size={16} />
              <span>Reload CodeLens</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}
