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
    
    let themeConfig = {
        primaryColor: '#00a2ff',
        primaryLightColor: '#e3f2fd',
        chatBackgroundUrl: '',
        logoUrl: ''
    };

    let hostAgentName = 'Host Agent';

    // ----------------------------------------------------------------------------
    // UTILITY FUNCTIONS
    // ----------------------------------------------------------------------------

    function updateBackgroundPreview(url) {
        try {
            const preview = document.getElementById('backgroundPreview');
            const previewImg = document.getElementById('backgroundPreviewImg');
            if (!preview) return;
            const applyStyles = function(valid) {
                if (!valid) {
                    preview.style.display = 'none';
                    preview.style.backgroundImage = '';
                    preview.style.backgroundPosition = '';
                    preview.style.backgroundSize = '';
                    preview.style.backgroundRepeat = '';
                    if (previewImg) {
                        previewImg.src = '';
                        previewImg.style.display = 'none';
                    }
                    return;
                }
                preview.style.display = 'flex';
                preview.style.height = '50px';
                preview.style.backgroundImage = 'url(' + url + ')';
                preview.style.backgroundPosition = 'center';
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundRepeat = 'no-repeat';
                if (previewImg) {
                    previewImg.style.display = 'none';
                }
            };
            if (!url || url.trim() === '') {
                applyStyles(false);
                return;
            }
            const img = new Image();
            img.onload = function() { applyStyles(true); };
            img.onerror = function() { applyStyles(false); };
            img.src = url;
        } catch (e) {}
    }

    function updateLogoPreview(url) {
        try {
            const preview = document.getElementById('logoPreview');
            const img = document.getElementById('logoPreviewImg');
            if (!preview || !img) return;
            const apply = function(valid) {
                if (!valid) {
                    preview.style.display = 'none';
                    img.src = '';
                    return;
                }
                preview.style.display = 'flex';
                preview.style.backgroundColor = '#fff';
                img.src = url;
            };
            if (!url || url.trim() === '') {
                apply(false);
                return;
            }
            const testImg = new Image();
            testImg.onload = function() { apply(true); };
            testImg.onerror = function() { apply(false); };
            testImg.src = url;
        } catch (e) {}
    }

    // Function to add and track event listeners
    function addTrackedEventListener(element, event, handler) {
        if (!element) return;
        element.addEventListener(event, handler);
        if (!eventListeners.has(element)) {
            eventListeners.set(element, []);
        }
        eventListeners.get(element).push({ event, handler });
    }

    // Load current engine from unified settings
    function loadCurrentEngine() {
        try {
            const settings = (window.getAppSettings && window.getAppSettings()) || {};
            const engine = settings.reasoningEngine || 'inference';
            selectedEngine = engine;
            return engine;
        } catch (error) {
            console.error('[Settings] Error loading current engine:', error);
            return 'inference';
        }
    }

    // Load host agent name from unified settings
    function loadHostAgentName() {
        try {
            const settings = (window.getAppSettings && window.getAppSettings()) || {};
            hostAgentName = settings.hostAgentName || 'Host Agent';
            return hostAgentName;
        } catch (e) {
            hostAgentName = 'Host Agent';
            return hostAgentName;
        }
    }

    function updateHostAgentNameUI() {
        const nameInput = document.getElementById('hostAgentName');
        if (nameInput) {
            nameInput.value = hostAgentName;
        }
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
            // Save to unified settings
            if (window.updateAppSettings) {
                window.updateAppSettings({ reasoningEngine: selectedEngine });
            }
            
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

    function saveHostAgentName() {
        try {
            if (window.updateAppSettings) {
                window.updateAppSettings({ hostAgentName: hostAgentName });
            }
            if (typeof window.updateHostAgentNameDisplay === 'function') {
                window.updateHostAgentNameDisplay();
            }
            return true;
        } catch (e) {
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

    // Load exchange configuration from unified settings
    function loadExchangeConfig() {
        try {
            const settings = (window.getAppSettings && window.getAppSettings()) || {};
            if (settings.exchangeCredentials) {
                exchangeConfig = { ...exchangeConfig, ...settings.exchangeCredentials };
            }
            return exchangeConfig;
        } catch (error) {
            console.error('[Settings] Error loading exchange config:', error);
            return exchangeConfig;
        }
    }

    // Load theme configuration from unified settings
    function loadThemeConfig() {
        try {
            const settings = (window.getAppSettings && window.getAppSettings()) || {};
            if (settings.themeSettings) {
                themeConfig = { ...themeConfig, ...settings.themeSettings };
            }
            return themeConfig;
        } catch (error) {
            console.error('[Settings] Error loading theme config:', error);
            return themeConfig;
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

    // Save exchange configuration to unified settings
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
            // Persist to unified settings
            if (window.updateAppSettings) {
                window.updateAppSettings({ exchangeCredentials: { ...exchangeConfig } });
            }
            console.log('[Settings] Exchange config saved:', exchangeConfig);
            return true;
        } catch (error) {
            console.error('[Settings] Error saving exchange config:', error);
            hideSpinner();
            return false;
        }
    }

    // Save theme configuration to unified settings
    function saveThemeConfig() {
        try {
            if (window.updateAppSettings) {
                window.updateAppSettings({ themeSettings: { ...themeConfig } });
            }
            console.log('[Settings] Theme config saved:', themeConfig);
            return true;
        } catch (error) {
            console.error('[Settings] Error saving theme config:', error);
            return false;
        }
    }

    // Update theme configuration UI
    function updateThemeConfigUI() {
        const primaryColorPicker = document.getElementById('primaryColorPicker');
        const primaryColorHex = document.getElementById('primaryColorHex');
        const primaryLightColorPicker = document.getElementById('primaryLightColorPicker');
        const primaryLightColorHex = document.getElementById('primaryLightColorHex');
        const chatBackgroundUrl = document.getElementById('chatBackgroundUrl');
        const logoUrl = document.getElementById('logoUrl');

        if (primaryColorPicker && primaryColorHex) {
            primaryColorPicker.value = themeConfig.primaryColor;
            primaryColorHex.value = themeConfig.primaryColor;
        }

        if (primaryLightColorPicker && primaryLightColorHex) {
            primaryLightColorPicker.value = themeConfig.primaryLightColor;
            primaryLightColorHex.value = themeConfig.primaryLightColor;
        }

        if (chatBackgroundUrl) {
            chatBackgroundUrl.value = themeConfig.chatBackgroundUrl;
        }

        if (logoUrl) {
            logoUrl.value = themeConfig.logoUrl;
        }

        // Update background preview
        updateBackgroundPreview(themeConfig.chatBackgroundUrl);
        // Update logo preview
        updateLogoPreview(themeConfig.logoUrl);
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

        // Show/hide custom fields and instructions based on selection
        const customFields = document.getElementById('customExchangeFields');
        const customInstructions = document.getElementById('customExchangeInstructions');
        
        if (customFields) {
            customFields.style.display = exchangeConfig.type === 'custom' ? 'block' : 'none';
        }
        
        if (customInstructions) {
            customInstructions.style.display = exchangeConfig.type === 'custom' ? 'block' : 'none';
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
            } else if (settingType === 'themes-brand') {
                // Save theme configuration and host agent name
                const themeSaved = saveThemeConfig();
                const nameSaved = saveHostAgentName();
                // Reflect saved logo in header after saving
                if (typeof window.updateNavbarLogoDisplay === 'function') {
                    window.updateNavbarLogoDisplay();
                }
                if (typeof window.updateThemeVariablesFromSettings === 'function') {
                    window.updateThemeVariablesFromSettings();
                }
                success = themeSaved && nameSaved;
                if (success) {
                    message = 'Theme and brand settings saved successfully!';
                } else {
                    message = 'Failed to save theme and brand settings. Please try again.';
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
        
        // Update UI to show/hide custom fields and instructions
        const customFields = document.getElementById('customExchangeFields');
        const customInstructions = document.getElementById('customExchangeInstructions');
        
        if (customFields) {
            customFields.style.display = selectedType === 'custom' ? 'block' : 'none';
        }
        
        if (customInstructions) {
            customInstructions.style.display = selectedType === 'custom' ? 'block' : 'none';
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

    // Handle theme color picker changes
    function handleThemeColorChange(event) {
        const field = event.target;
        const value = field.value;
        
        switch (field.id) {
            case 'primaryColorPicker':
            case 'primaryColorHex':
                themeConfig.primaryColor = value;
                // Sync the other field
                if (field.id === 'primaryColorPicker') {
                    const hexField = document.getElementById('primaryColorHex');
                    if (hexField) hexField.value = value;
                } else {
                    const pickerField = document.getElementById('primaryColorPicker');
                    if (pickerField) pickerField.value = value;
                }
                break;
            case 'primaryLightColorPicker':
            case 'primaryLightColorHex':
                themeConfig.primaryLightColor = value;
                // Sync the other field
                if (field.id === 'primaryLightColorPicker') {
                    const hexField = document.getElementById('primaryLightColorHex');
                    if (hexField) hexField.value = value;
                } else {
                    const pickerField = document.getElementById('primaryLightColorPicker');
                    if (pickerField) pickerField.value = value;
                }
                break;
        }
        // Do not persist or apply CSS variables until Save is clicked
        console.log('[Settings] Theme color changed:', field.id, value);
    }

    // Handle theme URL changes
    function handleThemeUrlChange(event) {
        const field = event.target;
        const value = field.value;
        
        switch (field.id) {
            case 'chatBackgroundUrl':
                themeConfig.chatBackgroundUrl = value;
                break;
            case 'logoUrl':
                themeConfig.logoUrl = value;
                break;
        }
        
        if (field.id === 'chatBackgroundUrl') {
            // Persist chat background changes immediately and show preview
            saveThemeConfig();
            updateBackgroundPreview(value);
        } else if (field.id === 'logoUrl') {
            // Only preview logo; do not save or update header until Save is clicked
            updateLogoPreview(value);
        }
        console.log('[Settings] Theme URL changed:', field.id, value);
    }

    function handleHostAgentNameChange(event) {
        const field = event.target;
        hostAgentName = field.value;
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
        } else if (settingType === 'themes-brand') {
            const themesBrandContent = document.getElementById('themes-brand-content');
            if (themesBrandContent) themesBrandContent.classList.add('active');
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
    // EXPORT / IMPORT SETTINGS
    // ----------------------------------------------------------------------------

    function exportSettings() {
        try {
            const settings = window.getAppSettings ? window.getAppSettings() : null;
            if (!settings) {
                showNotification('No settings to export.', 'error');
                return;
            }
            const data = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'settings.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            showNotification('Failed to export settings.', 'error');
        }
    }

    function importSettingsFromFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const parsed = JSON.parse(evt.target.result);
                if (typeof parsed !== 'object' || parsed === null) {
                    throw new Error('Invalid settings file');
                }
                // Persist imported settings
                if (window.updateAppSettings) {
                    // Overwrite completely
                    localStorage.setItem('settings', JSON.stringify(parsed));
                }
                // Refresh UI from imported settings
                loadCurrentEngine();
                updateEngineSelectionUI();
                loadExchangeConfig();
                updateExchangeConfigUI();
                loadThemeConfig();
                updateThemeConfigUI();
                loadHostAgentName();
                updateHostAgentNameUI();
                if (typeof window.updateNavbarLogoDisplay === 'function') window.updateNavbarLogoDisplay();
                if (typeof window.updateHostAgentNameDisplay === 'function') window.updateHostAgentNameDisplay();
                if (typeof window.updateThemeVariablesFromSettings === 'function') window.updateThemeVariablesFromSettings();
                showNotification('Settings imported successfully.', 'success');
            } catch (e) {
                showNotification('Failed to import settings. Ensure it is a valid JSON export.', 'error');
            }
        };
        reader.onerror = function() {
            showNotification('Failed to read the selected file.', 'error');
        };
        reader.readAsText(file);
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
        
        // Theme color pickers and hex inputs
        const themeColorFields = document.querySelectorAll('#primaryColorPicker, #primaryColorHex, #primaryLightColorPicker, #primaryLightColorHex');
        themeColorFields.forEach(field => {
            addTrackedEventListener(field, 'input', handleThemeColorChange);
        });
        
        // Theme URL inputs
        const themeUrlFields = document.querySelectorAll('#chatBackgroundUrl, #logoUrl');
        themeUrlFields.forEach(field => {
            addTrackedEventListener(field, 'input', handleThemeUrlChange);
        });

        // Host Agent Name input
        const nameField = document.getElementById('hostAgentName');
        if (nameField) {
            addTrackedEventListener(nameField, 'input', handleHostAgentNameChange);
        }

        // Export / Import buttons
        const exportBtn = document.getElementById('exportSettingsBtn');
        if (exportBtn) {
            addTrackedEventListener(exportBtn, 'click', function() {
                exportSettings();
            });
        }
        const importBtn = document.getElementById('importSettingsBtn');
        const importInput = document.getElementById('importSettingsFile');
        if (importBtn && importInput) {
            addTrackedEventListener(importBtn, 'click', function() {
                importInput.click();
            });
            addTrackedEventListener(importInput, 'change', function(e) {
                const file = e.target.files && e.target.files[0];
                importSettingsFromFile(file);
                importInput.value = '';
            });
        }

        // Reset settings button
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            addTrackedEventListener(resetBtn, 'click', function() {
                try {
                    // Clear unified settings and legacy keys
                    localStorage.removeItem('settings');
                    localStorage.removeItem('exchange_credentials');
                    localStorage.removeItem('themeSettings');
                    document.cookie = 'reasoningEngine=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';

                    // Reload defaults into UI
                    themeConfig = {
                        primaryColor: '#00a2ff',
                        primaryLightColor: '#e3f2fd',
                        chatBackgroundUrl: '',
                        logoUrl: ''
                    };
                    exchangeConfig = {
                        type: 'default',
                        url: '', clientId: '', clientSecret: '', organizationId: '', environmentId: ''
                    };
                    selectedEngine = 'inference';
                    hostAgentName = 'Host Agent';

                    updateThemeConfigUI();
                    updateExchangeConfigUI();
                    updateEngineSelectionUI();
                    updateHostAgentNameUI();
                    updateBackgroundPreview('');
                    updateLogoPreview('');

                    if (typeof window.updateThemeVariablesFromSettings === 'function') window.updateThemeVariablesFromSettings();
                    if (typeof window.updateNavbarLogoDisplay === 'function') window.updateNavbarLogoDisplay();
                    if (typeof window.updateHostAgentNameDisplay === 'function') window.updateHostAgentNameDisplay();

                    showNotification('Settings were reset to defaults.', 'success');
                } catch (e) {
                    showNotification('Failed to reset settings.', 'error');
                }
            });
        }

        // Remove background button
        const removeBgBtn = document.getElementById('removeBackgroundBtn');
        if (removeBgBtn) {
            addTrackedEventListener(removeBgBtn, 'click', function() {
                const urlField = document.getElementById('chatBackgroundUrl');
                if (urlField) urlField.value = '';
                themeConfig.chatBackgroundUrl = '';
                saveThemeConfig();
                updateBackgroundPreview('');
                if (window.ConversationManager && typeof window.ConversationManager.applyTheme === 'function') {
                    window.ConversationManager.applyTheme();
                }
            });
        }

        // Remove logo button
        const removeLogoBtn = document.getElementById('removeLogoBtn');
        if (removeLogoBtn) {
            addTrackedEventListener(removeLogoBtn, 'click', function() {
                const urlField = document.getElementById('logoUrl');
                if (urlField) urlField.value = '';
                themeConfig.logoUrl = '';
                // Only update preview; defer persistence and header update until Save
                updateLogoPreview('');
            });
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
        
        // Load theme configuration and update UI
        loadThemeConfig();
        updateThemeConfigUI();
        updateBackgroundPreview(themeConfig.chatBackgroundUrl);
        // Load Host Agent Name and update UI
        loadHostAgentName();
        updateHostAgentNameUI();
        
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
