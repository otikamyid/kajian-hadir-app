
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger, trackError } from '@/utils/logger';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || 'unknown';
    
    // Log the error with enhanced context
    trackError(error, {
      errorId,
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    this.setState({
      errorInfo
    });
  }

  private handleRetry = () => {
    logger.info('User clicked retry button', { errorId: this.state.errorId });
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleGoHome = () => {
    logger.info('User clicked go home button', { errorId: this.state.errorId });
    window.location.href = '/';
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        logger.info('Error report copied to clipboard', { errorId });
        alert('Error report copied to clipboard. You can paste it when reporting the issue.');
      })
      .catch(() => {
        logger.warn('Failed to copy error report to clipboard', { errorId });
        // Fallback: show error report in a new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`<pre>${JSON.stringify(errorReport, null, 2)}</pre>`);
        }
      });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  We're sorry, but something unexpected happened. The error has been logged and our team will investigate.
                </AlertDescription>
              </Alert>

              {isDevelopment && this.state.error && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                    <pre className="text-sm text-red-700 whitespace-pre-wrap break-words">
                      {this.state.error.message}
                    </pre>
                  </div>

                  {this.state.error.stack && (
                    <details className="bg-gray-50 border rounded-lg p-4">
                      <summary className="font-semibold cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap break-words">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <details className="bg-gray-50 border rounded-lg p-4">
                      <summary className="font-semibold cursor-pointer">Component Stack</summary>
                      <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Go Home</span>
                </Button>

                <Button
                  onClick={this.handleReportError}
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <Bug className="h-4 w-4" />
                  <span>Report Issue</span>
                </Button>
              </div>

              {this.state.errorId && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Error ID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId}</code>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Please include this ID when reporting the issue
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default ErrorBoundary;
