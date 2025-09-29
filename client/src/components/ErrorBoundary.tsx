import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

// Client-side error logging
const logClientError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
  const errorData = {
    errorId,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: 'anonymous' // Single user app
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 React Error Boundary - ${errorId}`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Full Error Data:', errorData);
    console.groupEnd();
  }

  // In production, you could send this to an error reporting service
  // Example: Sentry, LogRocket, or your own API endpoint
  if (process.env.NODE_ENV === 'production') {
    try {
      // Send error to API endpoint for logging
      fetch('/api/client-errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(err => {
        console.error('Failed to log error to server:', err);
      });
    } catch (logError) {
      console.error('Error logging failed:', logError);
    }
  }
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || 'unknown';
    logClientError(error, errorInfo, errorId);

    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. The error has been logged and will be investigated.
              </p>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error ID:</strong> {this.state.errorId}
                <br />
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <>
                    <strong>Message:</strong> {this.state.error.message}
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button
                onClick={this.handleReload}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>

              <Button
                onClick={this.handleGoHome}
                className="w-full"
                variant="ghost"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Developer Details
                </summary>
                <div className="mt-2 p-3 bg-muted rounded text-xs font-mono overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for manually reporting errors
export const useErrorReporting = () => {
  const reportError = React.useCallback((error: Error, context?: string) => {
    const errorId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const errorData = {
      errorId,
      message: error.message,
      stack: error.stack,
      context: context || 'Manual report',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: 'anonymous'
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('Manual Error Report:', errorData);
    }

    if (process.env.NODE_ENV === 'production') {
      fetch('/api/client-errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(err => {
        console.error('Failed to report error:', err);
      });
    }
  }, []);

  return { reportError };
};