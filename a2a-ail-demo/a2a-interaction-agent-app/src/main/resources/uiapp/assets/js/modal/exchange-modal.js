// Exchange Modal JavaScript
console.log('[Exchange Modal] Exchange modal script loaded');

// Function to render the exchange modal
window.renderExchangeModal = function() {
    console.log('[Exchange Modal] renderExchangeModal called');
    
    // Get the modal element
    const modalEl = document.getElementById('exchangeModal');
    if (!modalEl) {
        console.error('[Exchange Modal] Exchange modal element not found');
        return;
    }
    
    // Initialize Bootstrap modal if not already done
    if (!window.exchangeModal) {
        window.exchangeModal = new bootstrap.Modal(modalEl);
        console.log('[Exchange Modal] Bootstrap modal initialized');
    }
    
    // Show the modal
    if (window.exchangeModal) {
        window.exchangeModal.show();
        console.log('[Exchange Modal] Exchange modal shown');
    } else {
        console.error('[Exchange Modal] Exchange modal not initialized');
    }
};

// Function to setup modal focus management
function setupExchangeModalFocusManagement(modalEl) {
    const focusableElements = modalEl.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    // Trap focus within modal
    modalEl.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });
    
    // Focus first element when modal opens
    if (firstFocusableElement) {
        setTimeout(() => firstFocusableElement.focus(), 100);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Exchange Modal] DOM ready, setting up exchange modal');
    
    const modalEl = document.getElementById('exchangeModal');
    if (modalEl) {
        setupExchangeModalFocusManagement(modalEl);
    }
});

console.log('[Exchange Modal] Exchange modal script initialization complete');
