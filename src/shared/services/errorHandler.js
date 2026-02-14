/**
 * Centralized Error Handling Service
 * Provides consistent error handling across the application
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Handle Firebase authentication errors
   */
  handleAuthError(error) {
    let userMessage = "An authentication error occurred.";
    
    switch (error.code) {
      case 'auth/user-not-found':
        userMessage = "No account found with this email address.";
        break;
      case 'auth/wrong-password':
        userMessage = "Incorrect password. Please try again.";
        break;
      case 'auth/email-already-in-use':
        userMessage = "An account with this email already exists.";
        break;
      case 'auth/weak-password':
        userMessage = "Password should be at least 6 characters long.";
        break;
      case 'auth/invalid-email':
        userMessage = "Please enter a valid email address.";
        break;
      case 'auth/user-disabled':
        userMessage = "This account has been disabled.";
        break;
      case 'auth/too-many-requests':
        userMessage = "Too many failed attempts. Please try again later.";
        break;
      case 'auth/network-request-failed':
        userMessage = "Network error. Please check your connection.";
        break;
      default:
        userMessage = "Authentication failed. Please try again.";
    }

    this.logError('AUTH_ERROR', error, userMessage);
    return userMessage;
  }

  /**
   * Handle Firestore database errors
   */
  handleDatabaseError(error) {
    let userMessage = "A database error occurred.";
    
    switch (error.code) {
      case 'permission-denied':
        userMessage = "You don't have permission to perform this action.";
        break;
      case 'unavailable':
        userMessage = "Service temporarily unavailable. Please try again.";
        break;
      case 'not-found':
        userMessage = "The requested data was not found.";
        break;
      case 'already-exists':
        userMessage = "This record already exists.";
        break;
      case 'resource-exhausted':
        userMessage = "Service quota exceeded. Please try again later.";
        break;
      default:
        userMessage = "Database operation failed. Please try again.";
    }

    this.logError('DATABASE_ERROR', error, userMessage);
    return userMessage;
  }

  /**
   * Handle general application errors
   */
  handleGeneralError(error, context = 'GENERAL') {
    const userMessage = "An unexpected error occurred. Please try again.";
    this.logError(context, error, userMessage);
    return userMessage;
  }

  /**
   * Handle validation errors
   */
  handleValidationError(field, message) {
    const error = new Error(`Validation failed for ${field}: ${message}`);
    this.logError('VALIDATION_ERROR', error, message);
    return message;
  }

  /**
   * Log error with timestamp and context
   */
  logError(type, error, userMessage) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      type,
      message: error.message,
      code: error.code,
      stack: error.stack,
      userMessage,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errorLog.push(errorEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${type}]`, errorEntry);
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(errorEntry);
    }
  }

  /**
   * Send error to external logging service
   */
  async sendToLoggingService(errorEntry) {
    try {
      // You can integrate with services like Sentry, LogRocket, etc.
      // For now, we'll just store in localStorage as backup
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorEntry);
      
      // Keep only last 50 errors in localStorage
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    localStorage.removeItem('errorLogs');
  }

  /**
   * Show user-friendly error message
   */
  showError(message, duration = 5000) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
        <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .error-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .error-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }

  /**
   * Show success message
   */
  showSuccess(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="success-content">
        <span class="success-icon">✅</span>
        <span class="success-message">${message}</span>
        <button class="success-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler; 