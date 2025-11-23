import { LogEntry } from '../types';

type LogListener = (logs: LogEntry[]) => void;

/**
 * LoggerService class
 *
 * Manages application logs, providing functionality to log messages, clear logs,
 * and subscribe to log updates. Can be enabled or disabled.
 */
class LoggerService {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private isEnabled: boolean = false;

  private getTimestamp(): string {
    // FIX: The 'fractionalSecondDigits' property can cause a TypeScript error with older
    // lib definitions. Casting the options object to 'any' bypasses the compile-time
    // check, as modern JS runtimes support this property for millisecond formatting.
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    } as any);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }
  
  /**
   * Enable or disable logging.
   * @param enabled - Whether logging should be enabled.
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
  
  /**
   * Clear all stored logs and notify listeners.
   */
  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  /**
   * Add a new log entry.
   * @param message - The log message.
   * @param type - The type of log ('info', 'error', or 'success'). Defaults to 'info'.
   */
  log(message: string, type: 'info' | 'error' | 'success' = 'info') {
    if (!this.isEnabled) {
      return;
    }

    const newLog: LogEntry = {
      timestamp: this.getTimestamp(),
      message,
      type,
    };
    this.logs.push(newLog);
    this.notifyListeners();
    // Also log to console for development
    switch(type) {
        case 'error': console.error(`[ArosLogger] ${message}`); break;
        case 'success': console.log(`%c[ArosLogger] ${message}`, 'color: #22c55e'); break;
        default: console.info(`[ArosLogger] ${message}`); break;
    }
  }

  /**
   * Subscribe to log updates.
   * @param listener - The function to call when logs change.
   */
  subscribe(listener: LogListener) {
    this.listeners.add(listener);
    listener([...this.logs]); // Immediately provide current logs
  }

  /**
   * Unsubscribe from log updates.
   * @param listener - The listener function to remove.
   */
  unsubscribe(listener: LogListener) {
    this.listeners.delete(listener);
  }
}

// Singleton instance
export const logger = new LoggerService();
