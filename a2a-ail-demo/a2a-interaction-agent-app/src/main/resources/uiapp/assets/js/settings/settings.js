// ============================================================================
// SETTINGS.JS - Settings management functionality for the Host Agent interface
// ============================================================================

// Create a namespace for settings functionality
window.SettingsManager = (function() {
    // ----------------------------------------------------------------------------
    // PRIVATE VARIABLES
    // ----------------------------------------------------------------------------
    
    let settingsLoaded = false;
    let eventListeners = new Map(); // Track event listeners for cleanup

    // ----------------------------------------------------------------------------
    // UTILITY FUNCTIONS
    // ----------------------------------------------------------------------------

    // Function to add and track event listeners
    function addTrackedEventListener(element, event, handler) {
        if (!element) return;
        element.addEventListener(event, handler);
        if (!eventListeners.has(element)) {
            eventListeners.set(element, []);
        }
        eventListeners.get(element).push({ event, handler });
    }

    // ----------------------------------------------------------------------------
    // INITIALIZATION AND CLEANUP
    // ----------------------------------------------------------------------------

    // Initialize function
    function init() {
        console.log('[Settings] SettingsManager.init() called');
        
        // Prevent multiple initializations
        if (window.SettingsManager._initialized) {
            console.log('[Settings] SettingsManager already initialized, skipping...');
            return;
        }

        // Mark as initialized
        window.SettingsManager._initialized = true;
        console.log('[Settings] SettingsManager initialized successfully');
    }

    // Cleanup function
    function cleanup() {
        // Remove all tracked event listeners
        eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        eventListeners.clear();
        
        // Reset initialization flag
        window.SettingsManager._initialized = false;
        
        console.log('[Settings] SettingsManager cleaned up');
    }

    // ----------------------------------------------------------------------------
    // PUBLIC API
    // ----------------------------------------------------------------------------

    return {
        init: init,
        cleanup: cleanup
    };
})();

// ----------------------------------------------------------------------------
// GLOBAL INITIALIZATION
// ----------------------------------------------------------------------------

// Expose the settings attachment function globally
window.attachSettingsTab = function() {
    console.log('[Settings] attachSettingsTab called');
    
    // Wait for DOM elements to be available
    const checkElements = () => {
        const settingsContainer = document.querySelector('.settings-container');
        
        console.log('[Settings] Checking elements - settingsContainer:', settingsContainer);
        
        if (settingsContainer) {
            console.log('[Settings] Elements found, initializing SettingsManager');
            window.SettingsManager.init();
        } else {
            // DOM elements not ready yet, retry
            console.log('[Settings] Elements not ready, retrying in 100ms');
            setTimeout(checkElements, 100);
        }
    };
    
    checkElements();
};
