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
    let selectedEngine = 'inference'; // Default engine

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

    // Load current engine from cookie
    function loadCurrentEngine() {
        try {
            const engine = getCookie('reasoningEngine') || 'inference';
            selectedEngine = engine;
            return engine;
        } catch (error) {
            console.error('[Settings] Error loading current engine:', error);
            return 'inference';
        }
    }

    // Get cookie value
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Set cookie value
    function setCookie(name, value, days = 30) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    // Update engine selection UI
    function updateEngineSelectionUI() {
        const engineOptions = document.querySelectorAll('.engine-option');
        engineOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-engine') === selectedEngine) {
                option.classList.add('selected');
            }
        });
    }

    // Save engine selection
    function saveEngineSelection() {
        try {
            // Save to cookie
            setCookie('reasoningEngine', selectedEngine, 365);
            
            // Update the main interface if available
            if (window.setReasoningEngine) {
                window.setReasoningEngine(selectedEngine);
            }
            
            // Update the powered by text in the main navbar
            updatePoweredByDisplay();
            
            console.log('[Settings] Engine selection saved:', selectedEngine);
            return true;
        } catch (error) {
            console.error('[Settings] Error saving engine selection:', error);
            return false;
        }
    }

    // Update the powered by display in the main navbar
    function updatePoweredByDisplay() {
        const engine = selectedEngine;
        const info = window.ENGINE_INFO ? window.ENGINE_INFO[engine] : null;
        const poweredByText = document.getElementById('poweredByText');
        
        if (poweredByText && info) {
            poweredByText.innerHTML = ` (Powered by ${info.svg})`;
        }
    }

    // ----------------------------------------------------------------------------
    // EVENT HANDLERS
    // ----------------------------------------------------------------------------

    function handleEngineOptionClick(event) {
        const engineOption = event.currentTarget;
        const engine = engineOption.getAttribute('data-engine');
        
        if (engine && engine !== selectedEngine) {
            selectedEngine = engine;
            updateEngineSelectionUI();
            console.log('[Settings] Engine selected:', engine);
        }
    }

    function handleSaveButtonClick() {
        if (saveEngineSelection()) {
            showNotification('Engine selection saved successfully!', 'success');
            
            // Dispatch custom event for other components
            window.dispatchEvent(new CustomEvent('engineChanged', { 
                detail: { engine: selectedEngine } 
            }));
        } else {
            showNotification('Failed to save engine selection. Please try again.', 'error');
        }
    }

    // ----------------------------------------------------------------------------
    // NOTIFICATION SYSTEM
    // ----------------------------------------------------------------------------

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show settings-notification`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to page
        const container = document.querySelector('.settings-container');
        if (container) {
            container.insertBefore(notification, container.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    // ----------------------------------------------------------------------------
    // SETUP FUNCTIONS
    // ----------------------------------------------------------------------------

    function setupEventListeners() {
        // Engine option clicks
        const engineOptions = document.querySelectorAll('.engine-option');
        engineOptions.forEach(option => {
            addTrackedEventListener(option, 'click', handleEngineOptionClick);
        });
        
        // Save button
        const saveBtn = document.getElementById('saveEngineSettingsBtn');
        if (saveBtn) {
            addTrackedEventListener(saveBtn, 'click', handleSaveButtonClick);
        }
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
        
        // Load current engine and update UI
        loadCurrentEngine();
        updateEngineSelectionUI();
        
        // Setup event listeners
        setupEventListeners();
        
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
        cleanup: cleanup,
        getSelectedEngine: () => selectedEngine,
        setSelectedEngine: (engine) => {
            selectedEngine = engine;
            updateEngineSelectionUI();
        }
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
