// Comprehensive logging utility with different levels and structured output
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private sessionId = this.generateSessionId();
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message, context } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(prefix, message, context || '');
        }
        break;
      case 'info':
        console.info(prefix, message, context || '');
        break;
      case 'warn':
        console.warn(prefix, message, context || '');
        break;
      case 'error':
        console.error(prefix, message, context || '');
        break;
    }
  }

  private addToMemory(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', message, context);
    this.logToConsole(entry);
    this.addToMemory(entry);
  }

  info(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, context);
    this.logToConsole(entry);
    this.addToMemory(entry);
  }

  warn(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, context);
    this.logToConsole(entry);
    this.addToMemory(entry);
  }

  error(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('error', message, context);
    this.logToConsole(entry);
    this.addToMemory(entry);
  }

  // Performance monitoring
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    console.clear();
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Authentication specific logging
  logAuth(action: string, success: boolean, details?: Record<string, any>): void {
    this.info(`Auth: ${action}`, {
      success,
      action,
      ...details
    });
  }

  // Database operation logging
  logDatabase(operation: string, table: string, success: boolean, details?: Record<string, any>): void {
    const level = success ? 'info' : 'error';
    this[level](`Database: ${operation} on ${table}`, {
      operation,
      table,
      success,
      ...details
    });
  }

  // User action logging
  logUserAction(action: string, details?: Record<string, any>): void {
    this.info(`User Action: ${action}`, {
      action,
      ...details
    });
  }

  // Error boundary logging
  logError(error: Error, errorInfo?: Record<string, any>): void {
    this.error(`Application Error: ${error.message}`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo
    });
  }
}

// Create singleton instance
export const logger = new Logger();

// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static start(label: string): void {
    this.measurements.set(label, performance.now());
    logger.debug(`Performance: Started measuring ${label}`);
  }

  static end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      logger.warn(`Performance: No start time found for ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(label);
    
    logger.info(`Performance: ${label} took ${duration.toFixed(2)}ms`, {
      label,
      duration
    });

    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

// Error tracking utility
export function trackError(error: Error, context?: Record<string, any>): void {
  logger.logError(error, context);
  
  // In production, you might want to send this to an error tracking service
  if (!import.meta.env.DEV) {
    // Example: Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: context });
  }
}

export default logger;
