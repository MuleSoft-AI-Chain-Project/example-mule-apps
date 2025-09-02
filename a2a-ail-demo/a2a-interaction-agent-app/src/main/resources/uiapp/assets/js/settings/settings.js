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
    let exchangeConfig = {
        type: 'default',
        url: '',
        clientId: '',
        clientSecret: '',
        organizationId: '',
        environmentId: ''
    };

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

    // Load exchange configuration from localStorage
    function loadExchangeConfig() {
        try {
            const stored = localStorage.getItem('exchange_credentials');
            if (stored) {
                const config = JSON.parse(stored);
                exchangeConfig = { ...exchangeConfig, ...config };
            }
            return exchangeConfig;
        } catch (error) {
            console.error('[Settings] Error loading exchange config:', error);
            return exchangeConfig;
        }
    }

    // Test Anypoint Exchange credentials (transparent - no user notifications)
    async function testExchangeCredentials() {
        try {
            if (exchangeConfig.type !== 'custom') {
                return true; // Default type doesn't need testing
            }

            // Show spinner
            showSpinner('Processing...');

            // Build the test URL
            const testUrl = `/platform/a2a-agents?url=${encodeURIComponent(exchangeConfig.url)}&organizationId=${exchangeConfig.organizationId}&environmentId=${exchangeConfig.environmentId}`;
            
            console.log('[Settings] Testing credentials with URL:', testUrl);
            
            // Make the API call
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'client_id': exchangeConfig.clientId,
                    'client_secret': exchangeConfig.clientSecret
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('[Settings] Credentials test successful:', data);
                return true;
            } else {
                const errorText = await response.text();
                console.error('[Settings] Credentials test failed:', response.status, errorText);
                return false;
            }
        } catch (error) {
            console.error('[Settings] Error testing credentials:', error);
            return false;
        } finally {
            // Hide spinner
            hideSpinner();
        }
    }

    // Save exchange configuration to localStorage
    async function saveExchangeConfig() {
        try {
            // For custom type, validate all required fields are filled
            if (exchangeConfig.type === 'custom') {
                const requiredFields = [
                    { field: 'url', name: 'URL' },
                    { field: 'clientId', name: 'Client ID' },
                    { field: 'clientSecret', name: 'Client Secret' },
                    { field: 'organizationId', name: 'Organization ID' },
                    { field: 'environmentId', name: 'Environment ID' }
                ];
                
                const missingFields = requiredFields.filter(req => !exchangeConfig[req.field] || exchangeConfig[req.field].trim() === '');
                
                if (missingFields.length > 0) {
                    const fieldNames = missingFields.map(req => req.name).join(', ');
                    showNotification(`Please fill in all required fields: ${fieldNames}`, 'error');
                    return false;
                }
                
                // Show spinner for credential testing
                showSpinner('Validating credentials...');
                
                // Test credentials before saving - abort if test fails
                const credentialsValid = await testExchangeCredentials();
                if (!credentialsValid) {
                    hideSpinner();
                    showNotification('Credentials validation failed. Please check your Anypoint Exchange configuration and try again.', 'error');
                    return false;
                }
                
                // Hide spinner after successful validation
                hideSpinner();
            }
            
            localStorage.setItem('exchange_credentials', JSON.stringify(exchangeConfig));
            console.log('[Settings] Exchange config saved:', exchangeConfig);
            return true;
        } catch (error) {
            console.error('[Settings] Error saving exchange config:', error);
            hideSpinner();
            return false;
        }
    }

    // Update exchange configuration UI
    function updateExchangeConfigUI() {
        // Update radio button selection
        const defaultRadio = document.getElementById('exchangeDefault');
        const customRadio = document.getElementById('exchangeCustom');
        
        if (defaultRadio && customRadio) {
            if (exchangeConfig.type === 'default') {
                defaultRadio.checked = true;
                customRadio.checked = false;
            } else {
                defaultRadio.checked = false;
                customRadio.checked = true;
            }
        }

        // Show/hide custom fields based on selection
        const customFields = document.getElementById('customExchangeFields');
        if (customFields) {
            customFields.style.display = exchangeConfig.type === 'custom' ? 'block' : 'none';
        }

        // Populate custom fields if they exist
        if (exchangeConfig.type === 'custom') {
            const urlField = document.getElementById('exchangeUrl');
            const clientIdField = document.getElementById('exchangeClientId');
            const clientSecretField = document.getElementById('exchangeClientSecret');
            const orgIdField = document.getElementById('exchangeOrgId');
            const envIdField = document.getElementById('exchangeEnvId');

            if (urlField) {
                // Remove https:// from the beginning if it exists for display
                let displayUrl = exchangeConfig.url || '';
                if (displayUrl.startsWith('https://')) {
                    displayUrl = displayUrl.substring(8);
                } else if (displayUrl.startsWith('http://')) {
                    displayUrl = displayUrl.substring(7);
                }
                urlField.value = displayUrl;
            }
            if (clientIdField) clientIdField.value = exchangeConfig.clientId || '';
            if (clientSecretField) clientSecretField.value = exchangeConfig.clientSecret || '';
            if (orgIdField) orgIdField.value = exchangeConfig.organizationId || '';
            if (envIdField) envIdField.value = exchangeConfig.environmentId || '';
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

    async function handleSaveButtonClick() {
        // Determine which section is currently active
        const activeNavItem = document.querySelector('.settings-nav-item.active');
        const settingType = activeNavItem ? activeNavItem.getAttribute('data-setting') : 'host-agent-engine';
        
        let success = false;
        let message = '';

        // Show spinner for save operation
        showSpinner('Saving...');

        try {
            if (settingType === 'host-agent-engine') {
                // Save only engine selection
                if (saveEngineSelection()) {
                    success = true;
                    message = 'Engine selection saved successfully!';
                    
                    // Dispatch custom event for other components
                    window.dispatchEvent(new CustomEvent('engineChanged', { 
                        detail: { engine: selectedEngine } 
                    }));
                } else {
                    message = 'Failed to save engine selection. Please try again.';
                }
            } else if (settingType === 'anypoint-exchange') {
                // Save only exchange configuration
                success = await saveExchangeConfig();
                if (success) {
                    message = 'Exchange configuration saved successfully!';
                } else {
                    message = 'Failed to save exchange configuration. Please try again.';
                }
            }
        } finally {
            // Hide spinner
            hideSpinner();
        }

        if (success) {
            showNotification(message, 'success');
        } else {
            showNotification(message, 'error');
        }
    }

    // Handle exchange type radio button changes
    function handleExchangeTypeChange(event) {
        const selectedType = event.target.value;
        exchangeConfig.type = selectedType;
        
        // Update UI to show/hide custom fields
        const customFields = document.getElementById('customExchangeFields');
        if (customFields) {
            customFields.style.display = selectedType === 'custom' ? 'block' : 'none';
        }
        
        console.log('[Settings] Exchange type changed to:', selectedType);
    }

    // Handle custom field input changes
    function handleCustomFieldChange(event) {
        const field = event.target;
        const value = field.value;
        
        switch (field.id) {
            case 'exchangeUrl':
                exchangeConfig.url = value;
                break;
            case 'exchangeClientId':
                exchangeConfig.clientId = value;
                break;
            case 'exchangeClientSecret':
                exchangeConfig.clientSecret = value;
                break;
            case 'exchangeOrgId':
                exchangeConfig.organizationId = value;
                break;
            case 'exchangeEnvId':
                exchangeConfig.environmentId = value;
                break;
        }
        
        console.log('[Settings] Custom field updated:', field.id, value);
    }

    // Handle test credentials button click
    async function handleTestCredentials() {
        // Update exchangeConfig with current field values before testing
        const urlField = document.getElementById('exchangeUrl');
        const clientIdField = document.getElementById('exchangeClientId');
        const clientSecretField = document.getElementById('exchangeClientSecret');
        const orgIdField = document.getElementById('exchangeOrgId');
        const envIdField = document.getElementById('exchangeEnvId');

        if (urlField) exchangeConfig.url = urlField.value;
        if (clientIdField) exchangeConfig.clientId = clientIdField.value;
        if (orgIdField) exchangeConfig.organizationId = orgIdField.value;
        if (envIdField) exchangeConfig.environmentId = envIdField.value;
        if (clientSecretField) exchangeConfig.clientSecret = clientSecretField.value;

        // Test the credentials and show result to user
        const credentialsValid = await testExchangeCredentials();
        if (credentialsValid) {
            showNotification('Credentials validated successfully!', 'success');
        } else {
            showNotification('Credentials validation failed. Please check your configuration.', 'error');
        }
    }

    // Handle settings navigation clicks
    function handleSettingsNavigation(event) {
        event.preventDefault();
        
        const clickedItem = event.currentTarget;
        const settingType = clickedItem.getAttribute('data-setting');
        
        // Remove active class from all nav items
        const allNavItems = document.querySelectorAll('.settings-nav-item');
        allNavItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked item
        clickedItem.classList.add('active');
        
        // Hide all content sections
        const allContentSections = document.querySelectorAll('.setting-content');
        allContentSections.forEach(section => section.classList.remove('active'));
        
        // Show the selected content section
        if (settingType === 'host-agent-engine') {
            const hostAgentContent = document.getElementById('host-agent-engine-content');
            if (hostAgentContent) hostAgentContent.classList.add('active');
        } else if (settingType === 'anypoint-exchange') {
            const exchangeContent = document.getElementById('anypoint-exchange-content');
            if (exchangeContent) exchangeContent.classList.add('active');
        }
        
        console.log('[Settings] Switched to:', settingType);
    }

    // ----------------------------------------------------------------------------
    // SPINNER UTILITIES
    // ----------------------------------------------------------------------------

    function showSpinner(message = 'Processing...') {
        const backdrop = document.getElementById('settingsLoadingBackdrop');
        const loadingText = backdrop ? backdrop.querySelector('.loading-text') : null;
        
        if (backdrop) {
            if (loadingText) {
                loadingText.textContent = message;
            }
            backdrop.style.display = 'flex';
        }
    }

    function hideSpinner() {
        const backdrop = document.getElementById('settingsLoadingBackdrop');
        if (backdrop) {
            backdrop.style.display = 'none';
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
        // Settings navigation clicks
        const settingsNavItems = document.querySelectorAll('.settings-nav-item');
        settingsNavItems.forEach(item => {
            addTrackedEventListener(item, 'click', handleSettingsNavigation);
        });
        
        // Engine option clicks
        const engineOptions = document.querySelectorAll('.engine-option');
        engineOptions.forEach(option => {
            addTrackedEventListener(option, 'click', handleEngineOptionClick);
        });
        
        // Exchange type radio buttons
        const exchangeTypeRadios = document.querySelectorAll('input[name="exchangeType"]');
        exchangeTypeRadios.forEach(radio => {
            addTrackedEventListener(radio, 'change', handleExchangeTypeChange);
        });
        
        // Custom exchange field inputs
        const customFields = document.querySelectorAll('#exchangeUrl, #exchangeClientId, #exchangeClientSecret, #exchangeOrgId, #exchangeEnvId');
        customFields.forEach(field => {
            addTrackedEventListener(field, 'input', handleCustomFieldChange);
        });
        
        // Test credentials button
        const testCredentialsBtn = document.getElementById('testCredentialsBtn');
        if (testCredentialsBtn) {
            addTrackedEventListener(testCredentialsBtn, 'click', handleTestCredentials);
        }
        
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
        
        // Load exchange configuration and update UI
        loadExchangeConfig();
        updateExchangeConfigUI();
        
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
