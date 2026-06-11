import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, info);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary" role="alert">
                    <h2>Something went wrong.</h2>
                    <p>Please try again or reload the page.</p>
                    <button type="button" onClick={this.handleRetry}>
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
