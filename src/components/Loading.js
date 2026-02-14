/**
 * Loading Component
 * Provides consistent loading states across the application
 */

class Loading {
  constructor() {
    this.loadingOverlay = null;
    this.spinner = null;
    this.init();
  }

  init() {
    this.createLoadingOverlay();
  }

  createLoadingOverlay() {
    const overlayHTML = `
      <div id="loading-overlay" class="loading-overlay" style="display: none;">
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="loading-text mt-3">Loading...</div>
        </div>
      </div>
    `;

    // Add styles
    const styles = `
      <style>
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(2px);
        }
        
        .loading-spinner {
          text-align: center;
          color: white;
        }
        
        .loading-text {
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
        
        .loading-overlay.fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        
        .loading-overlay.fade-out {
          animation: fadeOut 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    this.loadingOverlay = document.getElementById('loading-overlay');
    this.spinner = this.loadingOverlay.querySelector('.loading-spinner');
  }

  /**
   * Show loading overlay
   */
  show(message = 'Loading...') {
    if (this.loadingOverlay) {
      const textElement = this.spinner.querySelector('.loading-text');
      if (textElement) {
        textElement.textContent = message;
      }
      
      this.loadingOverlay.style.display = 'flex';
      this.loadingOverlay.classList.add('fade-in');
      this.loadingOverlay.classList.remove('fade-out');
    }
  }

  /**
   * Hide loading overlay
   */
  hide() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('fade-in');
      this.loadingOverlay.classList.add('fade-out');
      
      setTimeout(() => {
        this.loadingOverlay.style.display = 'none';
        this.loadingOverlay.classList.remove('fade-out');
      }, 300);
    }
  }

  /**
   * Show button loading state
   */
  showButtonLoading(button, text = 'Loading...') {
    if (!button) return;

    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      ${text}
    `;
  }

  /**
   * Hide button loading state
   */
  hideButtonLoading(button) {
    if (!button) return;

    button.disabled = false;
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }

  /**
   * Create a loading wrapper for async operations
   */
  async withLoading(asyncFunction, message = 'Loading...') {
    try {
      this.show(message);
      const result = await asyncFunction();
      return result;
    } finally {
      this.hide();
    }
  }

  /**
   * Create a button loading wrapper
   */
  async withButtonLoading(button, asyncFunction, loadingText = 'Loading...') {
    try {
      this.showButtonLoading(button, loadingText);
      const result = await asyncFunction();
      return result;
    } finally {
      this.hideButtonLoading(button);
    }
  }
}

// Create singleton instance
const loading = new Loading();

export default loading; 