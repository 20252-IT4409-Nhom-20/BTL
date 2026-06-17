import React from 'react';

function DefaultFallback({ error, onRetry }) {
  return (
    <div className="status error" role="alert">
      <p>Something went wrong.</p>
      {error?.message ? <p>{error.message}</p> : null}
      <button type="button" onClick={onRetry}>Retry</button>
    </div>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <DefaultFallback error={this.state.error} onRetry={this.reset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
