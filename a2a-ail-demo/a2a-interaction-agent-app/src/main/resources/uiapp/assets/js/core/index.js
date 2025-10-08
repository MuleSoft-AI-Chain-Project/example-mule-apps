// ============================================================================
// INDEX.JS - Main application logic for the Host Agent interface
// ============================================================================

// ----------------------------------------------------------------------------
// COOKIE UTILITY FUNCTIONS
// ----------------------------------------------------------------------------

function setCookie(name, value, days = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// ----------------------------------------------------------------------------
// APPLICATION SETTINGS (Unified localStorage under key 'settings')
// ----------------------------------------------------------------------------

const SETTINGS_STORAGE_KEY = 'settings';

function getDefaultAppSettings() {
    return {
        reasoningEngine: 'inference',
        exchangeCredentials: {
            type: 'default',
            url: '',
            clientId: '',
            clientSecret: '',
            organizationId: '',
            environmentId: ''
        },
        themeSettings: {
            primaryColor: '#00a2ff',
            secondaryColor: '#e3f2fd',
            chatBackgroundUrl: '',
            logoUrl: ''
        }
    };
}

function getAppSettings() {
    try {
        let settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null');
        if (!settings) {
            settings = getDefaultAppSettings();
        } else {
            // ensure nested defaults exist
            const defaults = getDefaultAppSettings();
            settings.exchangeCredentials = { ...defaults.exchangeCredentials, ...(settings.exchangeCredentials || {}) };
            settings.themeSettings = { ...defaults.themeSettings, ...(settings.themeSettings || {}) };
            settings.reasoningEngine = settings.reasoningEngine || 'inference';
        }

        let migrated = false;

        // Migrate legacy cookie for reasoningEngine
        const legacyEngine = getCookie('reasoningEngine');
        if (legacyEngine && !settings.reasoningEngine) {
            settings.reasoningEngine = legacyEngine;
            migrated = true;
        }

        // Migrate legacy localStorage keys
        const legacyExchange = localStorage.getItem('exchange_credentials');
        if (legacyExchange) {
            try {
                const parsed = JSON.parse(legacyExchange);
                settings.exchangeCredentials = { ...settings.exchangeCredentials, ...parsed };
                migrated = true;
            } catch (e) {
                // ignore
            }
        }
        const legacyTheme = localStorage.getItem('themeSettings');
        if (legacyTheme) {
            try {
                const parsed = JSON.parse(legacyTheme);
                settings.themeSettings = { ...settings.themeSettings, ...parsed };
                migrated = true;
            } catch (e) {
                // ignore
            }
        }

        if (migrated) {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            deleteCookie('reasoningEngine');
            localStorage.removeItem('exchange_credentials');
            localStorage.removeItem('themeSettings');
        }

        return settings;
    } catch (e) {
        return getDefaultAppSettings();
    }
}

function saveAppSettings(settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return settings;
}

function updateAppSettings(partial) {
    const existing = getAppSettings();
    const merged = {
        ...existing,
        ...partial,
        exchangeCredentials: partial.exchangeCredentials ? { ...existing.exchangeCredentials, ...partial.exchangeCredentials } : existing.exchangeCredentials,
        themeSettings: partial.themeSettings ? { ...existing.themeSettings, ...partial.themeSettings } : existing.themeSettings
    };
    return saveAppSettings(merged);
}

// Expose globally for other modules
window.getAppSettings = getAppSettings;
window.updateAppSettings = updateAppSettings;

// ----------------------------------------------------------------------------
// SIDEBAR STATE MANAGEMENT
// ----------------------------------------------------------------------------

function saveSidebarState(collapsed) {
    setCookie('sidebarCollapsed', collapsed ? 'true' : 'false');
}

function loadSidebarState() {
    const collapsed = getCookie('sidebarCollapsed');
    return collapsed === 'true';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = sidebar.classList.contains('collapsed');
    sidebar.classList.toggle('collapsed');
    saveSidebarState(!isCollapsed);
}

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const wasCollapsed = loadSidebarState();
    if (wasCollapsed) {
        sidebar.classList.add('collapsed');
    }
}

// ----------------------------------------------------------------------------
// SESSION MANAGEMENT
// ----------------------------------------------------------------------------

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function initializeUserSession() {
    // Check for userSessionId cookie
    let userSessionId = getCookie('userSessionId');
    if (!userSessionId) {
        userSessionId = generateUUID();
        setCookie('userSessionId', userSessionId);
        console.log('Generated new user session ID:', userSessionId);
    } else {
        console.log('Found existing user session ID:', userSessionId);
    }
    return userSessionId;
}

// ----------------------------------------------------------------------------
// CONTENT LOADING MANAGEMENT
// ----------------------------------------------------------------------------

let conversationLoaded = false;
let agentsLoaded = false;
let sessionsLoaded = false;
let settingsLoaded = false;

function loadConversation(forceReload = false) {
    if (conversationLoaded && !forceReload) return;
    
    const conversationContent = document.getElementById('conversation-content');
    
    // Clean up existing conversation resources
    if (window.ConversationManager) {
        window.ConversationManager.cleanup();
    }
    
    fetch('conversation.html')
        .then(response => response.text())
        .then(html => {
            conversationContent.innerHTML = html;
            
            // Load the conversation manager script if not already loaded
            if (!window.ConversationManager) {
                const script = document.createElement('script');
                script.src = 'assets/js/conversation/conversation-manager.js';
                script.onload = function() {
                    // Wait a bit for the script to initialize, then call init
                    setTimeout(() => {
                        // Check if ENGINE_INFO is available, if not, initialize with defaults
                        if (!window.ENGINE_INFO) {
                            console.warn('ENGINE_INFO not available, using defaults');
                            window.ENGINE_INFO = {
                                inference: {
                                    name: 'Inference Connector',
                                    svg: `<svg class="engine-logo" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 512 512"><circle r="256" cx="256" cy="256" fill="#cfe9fe"/><g transform="matrix(0.97,0,0,0.97,7.68,22.68)"><path d="M335.2 279.9c21.2-21.2 32.8-49.3 32.8-79.3 0-29.9-11.7-58.1-32.8-79.3l-26.4 26.4c14.1 14.1 21.9 32.9 21.9 52.8 0 20-7.8 38.7-21.9 52.9zM176.7 279.9l26.4-26.4c-29.1-29.1-29.1-76.6 0-105.7l-26.4-26.4c-43.7 43.6-43.7 114.8 0 158.5z" fill="#0176d3"/><path d="m388.1 68.5-26.4 26.4c28.2 28.2 43.8 65.8 43.8 105.7s-15.5 77.5-43.8 105.7l26.4 26.4c35.3-35.3 54.7-82.2 54.7-132.1s-19.4-96.8-54.7-132.1zM150.3 94.9l-26.4-26.4c-72.9 72.8-72.9 191.4 0 264.2l26.4-26.4C92 248 92 153.2 150.3 94.9zM274.6 232.8c2.8-1.6 5.4-3.5 7.7-5.8 7.1-7.1 10.9-16.4 10.9-26.4s-3.9-19.4-10.9-26.4c-14.1-14.1-38.7-14.1-52.8 0-7.1 7.1-10.9 16.4-10.9 26.4s3.9 19.4 10.9 26.4c2.3 2.3 5 4.2 7.7 5.8v173.3h-74.7v37.4h186.8v-37.4h-74.7z" fill="#0176d3"/></g></svg>`
                                },
                                einstein: {
                                    name: 'Einstein Connector',
                                    svg: `<svg class="engine-logo" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_79_169)"><path d="M9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18Z" fill="#CFE9FE"/><path d="M7.59473 11.6145C7.86152 11.6145 8.07779 11.3013 8.07779 10.9149C8.07779 10.5286 7.86152 10.2154 7.59473 10.2154C7.32795 10.2154 7.11168 10.5286 7.11168 10.9149C7.11168 11.3013 7.32795 11.6145 7.59473 11.6145Z" fill="#0176D3"/><path d="M10.5569 11.6145C10.8237 11.6145 11.04 11.3013 11.04 10.9149C11.04 10.5286 10.8237 10.2154 10.5569 10.2154C10.2901 10.2154 10.0739 10.5286 10.0739 10.9149C10.0739 11.3013 10.2901 11.6145 10.5569 11.6145Z" fill="#0176D3"/><path d="M11.3908 13.0204C11.1571 12.8176 10.5863 12.3837 9.81067 12.1978C9.68474 12.3899 9.42723 12.5218 9.12963 12.5218C8.83203 12.5218 8.55886 12.3818 8.43732 12.1808C7.96303 12.2838 7.45492 12.5105 6.92926 12.9199C6.79832 13.0216 6.71186 13.1818 6.71248 13.3544C6.71248 14.4948 7.89349 13.573 9.07324 13.5918C10.2793 13.6113 11.5455 14.4062 11.5455 13.3739C11.553 13.2376 11.4904 13.1077 11.3908 13.021V13.0204Z" fill="#0176D3"/><path d="M7.16622 14.0251C7.02964 14.0251 6.91247 13.9962 6.81724 13.9227C6.67941 13.816 6.61299 13.6301 6.61299 13.3532C6.61237 13.1573 6.7076 12.9651 6.86862 12.8395C7.36608 12.4521 7.88673 12.1972 8.41677 12.0823C8.45812 12.0728 8.50135 12.0917 8.52328 12.1281C8.63104 12.3058 8.86913 12.4213 9.12976 12.4213C9.3904 12.4213 9.61657 12.3121 9.72747 12.1425C9.75065 12.1074 9.79325 12.0904 9.83398 12.1005C10.6428 12.2945 11.238 12.7554 11.4561 12.945C11.5832 13.0555 11.654 13.2175 11.6453 13.3789C11.6453 13.6131 11.5826 13.7802 11.4529 13.8844C11.1979 14.0891 10.7443 13.9868 10.2193 13.8687C9.86343 13.7883 9.45994 13.6979 9.07149 13.6916C8.67052 13.6854 8.26828 13.7915 7.91179 13.885C7.62359 13.9604 7.37235 14.0263 7.16559 14.0263L7.16622 14.0251ZM8.39359 12.2926C7.91555 12.4075 7.44377 12.6449 6.99079 12.9978C6.87864 13.0851 6.8116 13.2182 6.81223 13.3526C6.81223 13.5635 6.85358 13.6985 6.93879 13.7645C7.10043 13.8901 7.45317 13.7971 7.86104 13.6904C8.23007 13.5937 8.64671 13.4825 9.07463 13.4907C9.48375 13.4976 9.89789 13.5905 10.2632 13.6728C10.7381 13.7795 11.1478 13.8718 11.3283 13.7274C11.4072 13.664 11.446 13.5478 11.446 13.3726C11.4517 13.2672 11.4066 13.1661 11.3257 13.0957C11.124 12.9212 10.5846 12.5023 9.85152 12.3108C9.69301 12.5042 9.4236 12.6216 9.12976 12.6216C8.83592 12.6216 8.5496 12.4973 8.39359 12.2932V12.2926Z" fill="#0176D3"/><path d="M5.64745 13.3821C4.67257 13.951 3.78102 13.4668 3.44332 13.2175C4.01221 12.8257 4.20769 12.6882 4.23338 12.3962C3.46087 12.4251 2.89386 12.3598 2.14703 11.0939C2.92393 10.8647 2.74975 10.6908 4.02161 10.2789C3.98652 10.0572 2.9941 10.2016 2.64575 9.84809C2.94899 9.62518 3.27666 8.67764 3.62 8.5238C3.20273 8.52882 2.78547 8.53384 2.3682 8.53949C2.61129 7.70623 3.35498 6.96968 4.09241 6.51317C3.979 6.3631 3.65885 6.23061 3.50723 6.11946C4.0379 5.61587 5.33544 5.25795 5.87801 5.67112C5.79469 4.34369 6.89675 3.98514 6.88735 3.02943C7.45248 3.20274 8.28075 3.95374 8.40668 4.53269C8.77383 4.07493 9.94795 3.6178 10.6666 3.43633C10.9316 3.5638 11.1039 3.83632 11.181 4.12014C11.258 4.40397 11.2524 5.07271 11.2467 5.36721C13.1577 4.59046 14.2597 5.55684 14.645 6.0642C14.5373 6.26326 14.1889 6.57345 14.0003 6.70971C14.724 7.11284 15.1456 7.54611 15.3442 8.272C14.8787 8.40826 14.5836 8.45723 14.1119 8.64184C14.3293 8.91939 14.823 9.05063 15.1732 9.19254C14.9514 9.9203 14.4934 9.74888 14.152 9.81607C14.6494 10.7793 15.3179 10.8164 15.853 10.9149C15.5341 11.8267 14.65 12.5852 13.677 12.5651C13.7366 12.7366 13.9684 13.0656 14.1476 13.0907C13.6106 13.669 13.1545 13.627 12.491 13.4913C13.5793 11.4581 12.7003 9.30054 12.2955 8.7398C12.2323 8.97088 12.1295 9.18689 11.7862 9.22519C11.268 8.37372 9.84018 7.63716 8.86844 7.42241C8.78699 7.91722 8.9336 8.4453 9.25814 8.82771C8.73937 8.82143 7.56776 8.41579 7.17994 8.07043C5.77088 9.14356 4.49213 10.4051 5.64808 13.3821H5.64745Z" fill="#0176D3"/></g><defs><clipPath id="clip0_79_169"><rect width="18" height="18" fill="white"/></clipPath></defs></svg>`
                                }
                            };
                        }
                        
                        if (!window.getReasoningEngine) {
                            console.warn('getReasoningEngine not available, using default');
                            window.getReasoningEngine = function() {
                                return 'inference';
                            };
                        }
                        
                        if (window.ConversationManager && window.ConversationManager.init) {
                            window.ConversationManager.init();
                        }
                    }, 100);
                };
                document.head.appendChild(script);
            } else {
                // Script already loaded, just initialize
                if (window.ConversationManager.init) {
                    // Check if ENGINE_INFO is available, if not, initialize with defaults
                    if (!window.ENGINE_INFO) {
                        console.warn('ENGINE_INFO not available, using defaults');
                        window.ENGINE_INFO = {
                            inference: {
                                name: 'Inference Connector',
                                svg: `<svg class="engine-logo" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 512 512"><circle r="256" cx="256" cy="256" fill="#cfe9fe"/><g transform="matrix(0.97,0,0,0.97,7.68,22.68)"><path d="M335.2 279.9c21.2-21.2 32.8-49.3 32.8-79.3 0-29.9-11.7-58.1-32.8-79.3l-26.4 26.4c14.1 14.1 21.9 32.9 21.9 52.8 0 20-7.8 38.7-21.9 52.9zM176.7 279.9l26.4-26.4c-29.1-29.1-29.1-76.6 0-105.7l-26.4-26.4c-43.7 43.6-43.7 114.8 0 158.5z" fill="#0176d3"/><path d="m388.1 68.5-26.4 26.4c28.2 28.2 43.8 65.8 43.8 105.7s-15.5 77.5-43.8 105.7l26.4 26.4c35.3-35.3 54.7-82.2 54.7-132.1s-19.4-96.8-54.7-132.1zM150.3 94.9l-26.4-26.4c-72.9 72.8-72.9 191.4 0 264.2l26.4-26.4C92 248 92 153.2 150.3 94.9zM274.6 232.8c2.8-1.6 5.4-3.5 7.7-5.8 7.1-7.1 10.9-16.4 10.9-26.4s-3.9-19.4-10.9-26.4c-14.1-14.1-38.7-14.1-52.8 0-7.1 7.1-10.9 16.4-10.9 26.4s3.9 19.4 10.9 26.4c2.3 2.3 5 4.2 7.7 5.8v173.3h-74.7v37.4h186.8v-37.4h-74.7z" fill="#0176d3"/></g></svg>`
                            },
                            einstein: {
                                name: 'Einstein Connector',
                                svg: `<svg class="engine-logo" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_79_169)"><path d="M9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18Z" fill="#CFE9FE"/><path d="M7.59473 11.6145C7.86152 11.6145 8.07779 11.3013 8.07779 10.9149C8.07779 10.5286 7.86152 10.2154 7.59473 10.2154C7.32795 10.2154 7.11168 10.5286 7.11168 10.9149C7.11168 11.3013 7.32795 11.6145 7.59473 11.6145Z" fill="#0176D3"/><path d="M10.5569 11.6145C10.8237 11.6145 11.04 11.3013 11.04 10.9149C11.04 10.5286 10.8237 10.2154 10.5569 10.2154C10.2901 10.2154 10.0739 10.5286 10.0739 10.9149C10.0739 11.3013 10.2901 11.6145 10.5569 11.6145Z" fill="#0176D3"/><path d="M11.3908 13.0204C11.1571 12.8176 10.5863 12.3837 9.81067 12.1978C9.68474 12.3899 9.42723 12.5218 9.12963 12.5218C8.83203 12.5218 8.55886 12.3818 8.43732 12.1808C7.96303 12.2838 7.45492 12.5105 6.92926 12.9199C6.79832 13.0216 6.71186 13.1818 6.71248 13.3544C6.71248 14.4948 7.89349 13.573 9.07324 13.5918C10.2793 13.6113 11.5455 14.4062 11.5455 13.3739C11.553 13.2376 11.4904 13.1077 11.3908 13.021V13.0204Z" fill="#0176D3"/><path d="M7.16622 14.0251C7.02964 14.0251 6.91247 13.9962 6.81724 13.9227C6.67941 13.816 6.61299 13.6301 6.61299 13.3532C6.61237 13.1573 6.7076 12.9651 6.86862 12.8395C7.36608 12.4521 7.88673 12.1972 8.41677 12.0823C8.45812 12.0728 8.50135 12.0917 8.52328 12.1281C8.63104 12.3058 8.86913 12.4213 9.12976 12.4213C9.3904 12.4213 9.61657 12.3121 9.72747 12.1425C9.75065 12.1074 9.79325 12.0904 9.83398 12.1005C10.6428 12.2945 11.238 12.7554 11.4561 12.945C11.5832 13.0555 11.654 13.2175 11.6453 13.3789C11.6453 13.6131 11.5826 13.7802 11.4529 13.8844C11.1979 14.0891 10.7443 13.9868 10.2193 13.8687C9.86343 13.7883 9.45994 13.6979 9.07149 13.6916C8.67052 13.6854 8.26828 13.7915 7.91179 13.885C7.62359 13.9604 7.37235 14.0263 7.16559 14.0263L7.16622 14.0251ZM8.39359 12.2926C7.91555 12.4075 7.44377 12.6449 6.99079 12.9978C6.87864 13.0851 6.8116 13.2182 6.81223 13.3526C6.81223 13.5635 6.85358 13.6985 6.93879 13.7645C7.10043 13.8901 7.45317 13.7971 7.86104 13.6904C8.23007 13.5937 8.64671 13.4825 9.07463 13.4907C9.48375 13.4976 9.89789 13.5905 10.2632 13.6728C10.7381 13.7795 11.1478 13.8718 11.3283 13.7274C11.4072 13.664 11.446 13.5478 11.446 13.3726C11.4517 13.2672 11.4066 13.1661 11.3257 13.0957C11.124 12.9212 10.5846 12.5023 9.85152 12.3108C9.69301 12.5042 9.4236 12.6216 9.12976 12.6216C8.83592 12.6216 8.5496 12.4973 8.39359 12.2932V12.2926Z" fill="#0176D3"/><path d="M5.64745 13.3821C4.67257 13.951 3.78102 13.4668 3.44332 13.2175C4.01221 12.8257 4.20769 12.6882 4.23338 12.3962C3.46087 12.4251 2.89386 12.3598 2.14703 11.0939C2.92393 10.8647 2.74975 10.6908 4.02161 10.2789C3.98652 10.0572 2.9941 10.2016 2.64575 9.84809C2.94899 9.62518 3.27666 8.67764 3.62 8.5238C3.20273 8.52882 2.78547 8.53384 2.3682 8.53949C2.61129 7.70623 3.35498 6.96968 4.09241 6.51317C3.979 6.3631 3.65885 6.23061 3.50723 6.11946C4.0379 5.61587 5.33544 5.25795 5.87801 5.67112C5.79469 4.34369 6.89675 3.98514 6.88735 3.02943C7.45248 3.20274 8.28075 3.95374 8.40668 4.53269C8.77383 4.07493 9.94795 3.6178 10.6666 3.43633C10.9316 3.5638 11.1039 3.83632 11.181 4.12014C11.258 4.40397 11.2524 5.07271 11.2467 5.36721C13.1577 4.59046 14.2597 5.55684 14.645 6.0642C14.5373 6.26326 14.1889 6.57345 14.0003 6.70971C14.724 7.11284 15.1456 7.54611 15.3442 8.272C14.8787 8.40826 14.5836 8.45723 14.1119 8.64184C14.3293 8.91939 14.823 9.05063 15.1732 9.19254C14.9514 9.9203 14.4934 9.74888 14.152 9.81607C14.6494 10.7793 15.3179 10.8164 15.853 10.9149C15.5341 11.8267 14.65 12.5852 13.677 12.5651C13.7366 12.7366 13.9684 13.0656 14.1476 13.0907C13.6106 13.669 13.1545 13.627 12.491 13.4913C13.5793 11.4581 12.7003 9.30054 12.2955 8.7398C12.2323 8.97088 12.1295 9.18689 11.7862 9.22519C11.268 8.37372 9.84018 7.63716 8.86844 7.42241C8.78699 7.91722 8.9336 8.4453 9.25814 8.82771C8.73937 8.82143 7.56776 8.41579 7.17994 8.07043C5.77088 9.14356 4.49213 10.4051 5.64808 13.3821H5.64745Z" fill="#0176D3"/></g><defs><clipPath id="clip0_79_169"><rect width="18" height="18" fill="white"/></clipPath></defs></svg>`
                            }
                        };
                    }
                    
                    if (!window.getReasoningEngine) {
                        console.warn('getReasoningEngine not available, using default');
                        window.getReasoningEngine = function() {
                            return 'inference';
                        };
                    }
                    
                    window.ConversationManager.init();
                }
            }
            
            conversationLoaded = true;
        })
        .catch(error => {
            console.error('Error loading conversation:', error);
        });
}

function loadAgents(forceReload = false) {
    if (agentsLoaded && !forceReload) return;
    
    const agentsContent = document.getElementById('agents-content');
    
    // Clean up existing agents resources
    if (window.attachAgentsTab) {
        // Reset any existing state if needed
        if (window.resetAgentsTabState) {
            window.resetAgentsTabState();
        }
    }
    
    fetch('agents.html')
        .then(response => response.text())
        .then(html => {
            agentsContent.innerHTML = html;
            
            // Load the agents script if not already loaded
            if (!window.attachAgentsTab) {
                const script = document.createElement('script');
                script.src = 'assets/js/agents/agents.js';
                script.onload = function() {
                    // Wait a bit for the script to initialize, then call attachAgentsTab
                    setTimeout(() => {
                        if (window.attachAgentsTab) {
                            window.attachAgentsTab();
                        }
                    }, 100);
                };
                document.head.appendChild(script);
            } else {
                // Script already loaded, just call attachAgentsTab
                if (window.attachAgentsTab) {
                    window.attachAgentsTab();
                }
            }
            
            // Extract and execute any inline scripts from the HTML
            const scripts = agentsContent.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
                document.body.removeChild(newScript);
            });
            
            agentsLoaded = true;
        })
        .catch(error => {
            console.error('Error loading agents:', error);
        });
}

function loadSessions(forceReload = false) {
    console.log('[Index] loadSessions called, forceReload:', forceReload, 'sessionsLoaded:', sessionsLoaded);
    if (sessionsLoaded && !forceReload) return;
    
    const sessionsContent = document.getElementById('sessions-content');
    console.log('[Index] sessionsContent element:', sessionsContent);
    
    // Clean up existing sessions resources
    if (window.SessionsManager) {
        console.log('[Index] Cleaning up existing SessionsManager');
        window.SessionsManager.cleanup();
    }
    
    fetch('sessions.html')
        .then(response => response.text())
        .then(html => {
            console.log('[Index] Fetched sessions.html, length:', html.length);
            sessionsContent.innerHTML = html;
            
            // Load the sessions script if not already loaded
            if (!window.attachSessionsTab) {
                console.log('[Index] Loading sessions.js script');
                const script = document.createElement('script');
                script.src = 'assets/js/sessions/sessions.js';
                script.onload = function() {
                    console.log('[Index] sessions.js script loaded');
                    // Wait a bit for the script to initialize, then call attachSessionsTab
                    setTimeout(() => {
                        if (window.attachSessionsTab) {
                            console.log('[Index] Calling attachSessionsTab');
                            window.attachSessionsTab();
                        } else {
                            console.error('[Index] attachSessionsTab not available after script load');
                        }
                    }, 100);
                };
                script.onerror = function() {
                    console.error('[Index] Failed to load sessions.js script');
                };
                document.head.appendChild(script);
            } else {
                // Script already loaded, just call attachSessionsTab
                console.log('[Index] sessions.js already loaded, calling attachSessionsTab directly');
                if (window.attachSessionsTab) {
                    window.attachSessionsTab();
                }
            }
            
            // Extract and execute any inline scripts from the HTML
            const scripts = sessionsContent.querySelectorAll('script');
            console.log('[Index] Found', scripts.length, 'inline scripts in sessions.html');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
                document.body.removeChild(newScript);
            });
            
            sessionsLoaded = true;
            console.log('[Index] Sessions loaded successfully');
        })
        .catch(error => {
            console.error('Error loading sessions:', error);
        });
}

function loadSettings(forceReload = false) {
    console.log('[Index] loadSettings called, forceReload:', forceReload, 'settingsLoaded:', settingsLoaded);
    if (settingsLoaded && !forceReload) return;
    
    const settingsContent = document.getElementById('settings-content');
    console.log('[Index] settingsContent element:', settingsContent);
    
    // Clean up existing settings resources
    if (window.SettingsManager) {
        console.log('[Index] Cleaning up existing SettingsManager');
        window.SettingsManager.cleanup();
    }
    
    fetch('settings.html')
        .then(response => response.text())
        .then(html => {
            console.log('[Index] Fetched settings.html, length:', html.length);
            settingsContent.innerHTML = html;
            
            // Load the settings script if not already loaded
            if (!window.attachSettingsTab) {
                console.log('[Index] Loading settings.js script');
                const script = document.createElement('script');
                script.src = 'assets/js/settings/settings.js';
                script.onload = function() {
                    console.log('[Index] settings.js script loaded');
                    // Wait a bit for the script to initialize, then call attachSettingsTab
                    setTimeout(() => {
                        if (window.attachSettingsTab) {
                            console.log('[Index] Calling attachSettingsTab');
                            window.attachSettingsTab();
                        } else {
                            console.error('[Index] attachSettingsTab not available after script load');
                        }
                    }, 100);
                };
                script.onerror = function() {
                    console.error('[Index] Failed to load settings.js script');
                };
                document.head.appendChild(script);
            } else {
                // Script already loaded, just call attachSettingsTab
                console.log('[Index] settings.js already loaded, calling attachSettingsTab directly');
                if (window.attachSettingsTab) {
                    window.attachSettingsTab();
                }
            }
            
            // Extract and execute any inline scripts from the HTML
            const scripts = settingsContent.querySelectorAll('script');
            console.log('[Index] Found', scripts.length, 'inline scripts in settings.html');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
                document.body.removeChild(newScript);
            });
            
            settingsLoaded = true;
            console.log('[Index] Settings loaded successfully');
        })
        .catch(error => {
            console.error('Error loading settings:', error);
        });
}

// ----------------------------------------------------------------------------
// SIDEBAR NAVIGATION
// ----------------------------------------------------------------------------

function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const conversationContent = document.getElementById('conversation-content');
    const agentsContent = document.getElementById('agents-content');
    const sessionsContent = document.getElementById('sessions-content');
    const settingsContent = document.getElementById('settings-content');
    const refreshAgentsBtn = document.getElementById('refreshAgentsBtn');
    const agentsSidebarGroup = document.getElementById('agentsSidebarGroup');
    const conversationSidebarGroup = document.getElementById('conversationSidebarGroup');
    const sessionsSidebarGroup = document.getElementById('sessionsSidebarGroup');
    const settingsSidebarGroup = document.getElementById('settingsSidebarGroup');
    const newConversationBtn = document.getElementById('newConversationBtn');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // Update active state
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Clean up conversation if switching away from it
            if (window.ConversationManager && !this.getAttribute('data-content') === 'conversation') {
                window.ConversationManager.cleanup();
            }
            
            // Show/hide content using 'hidden' class
            const content = this.getAttribute('data-content');
            // Hide all content areas first
            conversationContent.classList.add('hidden');
            agentsContent.classList.add('hidden');
            sessionsContent.classList.add('hidden');
            settingsContent.classList.add('hidden');
            conversationSidebarGroup.classList.remove('active');
            agentsSidebarGroup.classList.remove('active');
            sessionsSidebarGroup.classList.remove('active');
            settingsSidebarGroup.classList.remove('active');
            
            if (content === 'conversation') {
                conversationContent.classList.remove('hidden');
                conversationSidebarGroup.classList.add('active');
                loadConversation();
            } else if (content === 'agents') {
                agentsContent.classList.remove('hidden');
                agentsSidebarGroup.classList.add('active');
                // Always refresh agents when switching to agents tab
                loadAgents(true);
            } else if (content === 'sessions') {
                sessionsContent.classList.remove('hidden');
                sessionsSidebarGroup.classList.add('active');
                loadSessions(true);
            } else if (content === 'settings') {
                settingsContent.classList.remove('hidden');
                settingsSidebarGroup.classList.add('active');
                loadSettings(true);
            }
            
            // Toggle button visibility
            if (this.getAttribute('data-content') === 'agents') {
                refreshAgentsBtn.style.display = 'inline-block';
                newConversationBtn.style.display = 'none';
            } else if (this.getAttribute('data-content') === 'conversation') {
                refreshAgentsBtn.style.display = 'none';
                newConversationBtn.style.display = 'inline-block';
            } else if (this.getAttribute('data-content') === 'sessions') {
                refreshAgentsBtn.style.display = 'none';
                newConversationBtn.style.display = 'none';
            } else if (this.getAttribute('data-content') === 'settings') {
                refreshAgentsBtn.style.display = 'none';
                newConversationBtn.style.display = 'none';
            }
        });
    });
}

// ----------------------------------------------------------------------------
// BUTTON EVENT HANDLERS
// ----------------------------------------------------------------------------

function setupButtonHandlers() {
    const refreshAgentsBtn = document.getElementById('refreshAgentsBtn');
    const newConversationBtn = document.getElementById('newConversationBtn');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const agentsContent = document.getElementById('agents-content');

    // Refresh agents
    if (refreshAgentsBtn) {
        refreshAgentsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!agentsContent.classList.contains('hidden')) {
                agentsLoaded = false;
                loadAgents(true);
            }
        });
    }

    // New conversation
    if (newConversationBtn) {
        newConversationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            conversationLoaded = false;
            loadConversation(true);
        });
    }

    // Sidebar collapse/expand logic
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', toggleSidebar);
        sidebarToggleBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSidebar();
            }
        });
    }
}

// ----------------------------------------------------------------------------
// INITIAL STATE SETUP
// ----------------------------------------------------------------------------

function setupInitialState() {
    const conversationContent = document.getElementById('conversation-content');
    const agentsContent = document.getElementById('agents-content');
    const sessionsContent = document.getElementById('sessions-content');
    const settingsContent = document.getElementById('settings-content');
    const refreshAgentsBtn = document.getElementById('refreshAgentsBtn');
    const agentsSidebarGroup = document.getElementById('agentsSidebarGroup');
    const conversationSidebarGroup = document.getElementById('conversationSidebarGroup');
    const sessionsSidebarGroup = document.getElementById('sessionsSidebarGroup');
    const settingsSidebarGroup = document.getElementById('settingsSidebarGroup');
    const newConversationBtn = document.getElementById('newConversationBtn');

    // Hide all content areas first
    conversationContent.classList.add('hidden');
    agentsContent.classList.add('hidden');
    sessionsContent.classList.add('hidden');
    settingsContent.classList.add('hidden');
    conversationSidebarGroup.classList.remove('active');
    agentsSidebarGroup.classList.remove('active');
    sessionsSidebarGroup.classList.remove('active');
    settingsSidebarGroup.classList.remove('active');
    
    if (document.querySelector('.sidebar-item.active')?.getAttribute('data-content') === 'agents') {
        agentsContent.classList.remove('hidden');
        agentsSidebarGroup.classList.add('active');
        loadAgents(true);
        refreshAgentsBtn.style.display = 'inline-block';
        newConversationBtn.style.display = 'none';
    } else if (document.querySelector('.sidebar-item.active')?.getAttribute('data-content') === 'sessions') {
        sessionsContent.classList.remove('hidden');
        sessionsSidebarGroup.classList.add('active');
        loadSessions();
        refreshAgentsBtn.style.display = 'none';
        newConversationBtn.style.display = 'none';
    } else if (document.querySelector('.sidebar-item.active')?.getAttribute('data-content') === 'settings') {
        settingsContent.classList.remove('hidden');
        settingsSidebarGroup.classList.add('active');
        loadSettings();
        refreshAgentsBtn.style.display = 'none';
        newConversationBtn.style.display = 'none';
    } else {
        conversationContent.classList.remove('hidden');
        conversationSidebarGroup.classList.add('active');
        loadConversation();
        refreshAgentsBtn.style.display = 'none';
        newConversationBtn.style.display = 'inline-block';
    }
}

// ----------------------------------------------------------------------------
// SESSION MODAL CLEANUP
// ----------------------------------------------------------------------------

function removeSessionsTabSessionModal() {
    if (window.SessionsManager && window.SessionsManager.removeSessionsTabSessionModal) {
        window.SessionsManager.removeSessionsTabSessionModal();
    } else {
        // Fallback for when SessionsManager is not available
        var modal = document.getElementById('sessionModal');
        var sessionsContent = document.getElementById('sessions-content');
        if (modal && sessionsContent && sessionsContent.contains(modal)) {
            modal.remove();
            console.log('[Index] Removed sessionModal from #sessions-content');
        }
        if (window.renderSessionModal) {
            delete window.renderSessionModal;
            console.log('[Index] Deleted window.renderSessionModal');
        }
    }
}

function patchTabSwitchCleanup() {
    var tabLinks = document.querySelectorAll('.sidebar .nav-link');
    tabLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            var target = this.getAttribute('data-bs-target') || this.getAttribute('href');
            // Clean up session modal from Conversation tab
            if (typeof window.removeConversationSessionModal === 'function') {
                window.removeConversationSessionModal();
                console.log('[Index] Called removeConversationSessionModal');
            }
            // Clean up session modal from Sessions tab (always, on any tab switch)
            removeSessionsTabSessionModal();
        });
    });
}

// ----------------------------------------------------------------------------
// REASONING ENGINE SELECTION LOGIC
// ----------------------------------------------------------------------------

window.ENGINE_INFO = {
    inference: {
        name: 'Inference Connector',
        svg: `<svg class="engine-logo" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 512 512"><circle r="256" cx="256" cy="256" fill="#cfe9fe"/><g transform="matrix(0.97,0,0,0.97,7.68,22.68)"><path d="M335.2 279.9c21.2-21.2 32.8-49.3 32.8-79.3 0-29.9-11.7-58.1-32.8-79.3l-26.4 26.4c14.1 14.1 21.9 32.9 21.9 52.8 0 20-7.8 38.7-21.9 52.9zM176.7 279.9l26.4-26.4c-29.1-29.1-29.1-76.6 0-105.7l-26.4-26.4c-43.7 43.6-43.7 114.8 0 158.5z" fill="#0176d3"/><path d="m388.1 68.5-26.4 26.4c28.2 28.2 43.8 65.8 43.8 105.7s-15.5 77.5-43.8 105.7l26.4 26.4c35.3-35.3 54.7-82.2 54.7-132.1s-19.4-96.8-54.7-132.1zM150.3 94.9l-26.4-26.4c-72.9 72.8-72.9 191.4 0 264.2l26.4-26.4C92 248 92 153.2 150.3 94.9zM274.6 232.8c2.8-1.6 5.4-3.5 7.7-5.8 7.1-7.1 10.9-16.4 10.9-26.4s-3.9-19.4-10.9-26.4c-14.1-14.1-38.7-14.1-52.8 0-7.1 7.1-10.9 16.4-10.9 26.4s3.9 19.4 10.9 26.4c2.3 2.3 5 4.2 7.7 5.8v173.3h-74.7v37.4h186.8v-37.4h-74.7z" fill="#0176d3"/></g></svg>`
    },
    einstein: {
        name: 'Einstein Connector',
        svg: `<svg class="engine-logo" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_79_169)"><path d="M9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18Z" fill="#CFE9FE"/><path d="M7.59473 11.6145C7.86152 11.6145 8.07779 11.3013 8.07779 10.9149C8.07779 10.5286 7.86152 10.2154 7.59473 10.2154C7.32795 10.2154 7.11168 10.5286 7.11168 10.9149C7.11168 11.3013 7.32795 11.6145 7.59473 11.6145Z" fill="#0176D3"/><path d="M10.5569 11.6145C10.8237 11.6145 11.04 11.3013 11.04 10.9149C11.04 10.5286 10.8237 10.2154 10.5569 10.2154C10.2901 10.2154 10.0739 10.5286 10.0739 10.9149C10.0739 11.3013 10.2901 11.6145 10.5569 11.6145Z" fill="#0176D3"/><path d="M11.3908 13.0204C11.1571 12.8176 10.5863 12.3837 9.81067 12.1978C9.68474 12.3899 9.42723 12.5218 9.12963 12.5218C8.83203 12.5218 8.55886 12.3818 8.43732 12.1808C7.96303 12.2838 7.45492 12.5105 6.92926 12.9199C6.79832 13.0216 6.71186 13.1818 6.71248 13.3544C6.71248 14.4948 7.89349 13.573 9.07324 13.5918C10.2793 13.6113 11.5455 14.4062 11.5455 13.3739C11.553 13.2376 11.4904 13.1077 11.3908 13.021V13.0204Z" fill="#0176D3"/><path d="M7.16622 14.0251C7.02964 14.0251 6.91247 13.9962 6.81724 13.9227C6.67941 13.816 6.61299 13.6301 6.61299 13.3532C6.61237 13.1573 6.7076 12.9651 6.86862 12.8395C7.36608 12.4521 7.88673 12.1972 8.41677 12.0823C8.45812 12.0728 8.50135 12.0917 8.52328 12.1281C8.63104 12.3058 8.86913 12.4213 9.12976 12.4213C9.3904 12.4213 9.61657 12.3121 9.72747 12.1425C9.75065 12.1074 9.79325 12.0904 9.83398 12.1005C10.6428 12.2945 11.238 12.7554 11.4561 12.945C11.5832 13.0555 11.654 13.2175 11.6453 13.3789C11.6453 13.6131 11.5826 13.7802 11.4529 13.8844C11.1979 14.0891 10.7443 13.9868 10.2193 13.8687C9.86343 13.7883 9.45994 13.6979 9.07149 13.6916C8.67052 13.6854 8.26828 13.7915 7.91179 13.885C7.62359 13.9604 7.37235 14.0263 7.16559 14.0263L7.16622 14.0251ZM8.39359 12.2926C7.91555 12.4075 7.44377 12.6449 6.99079 12.9978C6.87864 13.0851 6.8116 13.2182 6.81223 13.3526C6.81223 13.5635 6.85358 13.6985 6.93879 13.7645C7.10043 13.8901 7.45317 13.7971 7.86104 13.6904C8.23007 13.5937 8.64671 13.4825 9.07463 13.4907C9.48375 13.4976 9.89789 13.5905 10.2632 13.6728C10.7381 13.7795 11.1478 13.8718 11.3283 13.7274C11.4072 13.664 11.446 13.5478 11.446 13.3726C11.4517 13.2672 11.4066 13.1661 11.3257 13.0957C11.124 12.9212 10.5846 12.5023 9.85152 12.3108C9.69301 12.5042 9.4236 12.6216 9.12976 12.6216C8.83592 12.6216 8.5496 12.4973 8.39359 12.2932V12.2926Z" fill="#0176D3"/><path d="M5.64745 13.3821C4.67257 13.951 3.78102 13.4668 3.44332 13.2175C4.01221 12.8257 4.20769 12.6882 4.23338 12.3962C3.46087 12.4251 2.89386 12.3598 2.14703 11.0939C2.92393 10.8647 2.74975 10.6908 4.02161 10.2789C3.98652 10.0572 2.9941 10.2016 2.64575 9.84809C2.94899 9.62518 3.27666 8.67764 3.62 8.5238C3.20273 8.52882 2.78547 8.53384 2.3682 8.53949C2.61129 7.70623 3.35498 6.96968 4.09241 6.51317C3.979 6.3631 3.65885 6.23061 3.50723 6.11946C4.0379 5.61587 5.33544 5.25795 5.87801 5.67112C5.79469 4.34369 6.89675 3.98514 6.88735 3.02943C7.45248 3.20274 8.28075 3.95374 8.40668 4.53269C8.77383 4.07493 9.94795 3.6178 10.6666 3.43633C10.9316 3.5638 11.1039 3.83632 11.181 4.12014C11.258 4.40397 11.2524 5.07271 11.2467 5.36721C13.1577 4.59046 14.2597 5.55684 14.645 6.0642C14.5373 6.26326 14.1889 6.57345 14.0003 6.70971C14.724 7.11284 15.1456 7.54611 15.3442 8.272C14.8787 8.40826 14.5836 8.45723 14.1119 8.64184C14.3293 8.91939 14.823 9.05063 15.1732 9.19254C14.9514 9.9203 14.4934 9.74888 14.152 9.81607C14.6494 10.7793 15.3179 10.8164 15.853 10.9149C15.5341 11.8267 14.65 12.5852 13.677 12.5651C13.7366 12.7366 13.9684 13.0656 14.1476 13.0907C13.6106 13.669 13.1545 13.627 12.491 13.4913C13.5793 11.4581 12.7003 9.30054 12.2955 8.7398C12.2323 8.97088 12.1295 9.18689 11.7862 9.22519C11.268 8.37372 9.84018 7.63716 8.86844 7.42241C8.78699 7.91722 8.9336 8.4453 9.25814 8.82771C8.73937 8.82143 7.56776 8.41579 7.17994 8.07043C5.77088 9.14356 4.49213 10.4051 5.64808 13.3821H5.64745Z" fill="#0176D3"/></g><defs><clipPath id="clip0_79_169"><rect width="18" height="18" fill="white"/></clipPath></defs></svg>`
    }
};

window.getReasoningEngine = function() {
    const settings = getAppSettings();
    return settings.reasoningEngine || 'inference';
};

window.setReasoningEngine = function(engine) {
    updateAppSettings({ reasoningEngine: engine });
};

function updatePoweredByDisplay() {
    const engine = window.getReasoningEngine();
    const info = window.ENGINE_INFO[engine] || window.ENGINE_INFO['inference'];
    const poweredByText = document.getElementById('poweredByText');
    if (poweredByText) {
        poweredByText.innerHTML = ` (Powered by ${info.svg})`;
    }
}

function openReasoningEngineModal() {
    const modal = new bootstrap.Modal(document.getElementById('reasoningEngineModal'));
    const currentEngine = window.getReasoningEngine();
    // Update tile selection
    document.querySelectorAll('.reasoning-engine-tile').forEach(tile => {
        tile.classList.remove('selected');
        if (tile.getAttribute('data-engine') === currentEngine) {
            tile.classList.add('selected');
        }
    });
    modal.show();
}

function saveReasoningEngine() {
    const selectedTile = document.querySelector('.reasoning-engine-tile.selected');
    if (selectedTile) {
        const engine = selectedTile.getAttribute('data-engine');
        window.setReasoningEngine(engine);
        updatePoweredByDisplay();
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('reasoningEngineModal'));
        modal.hide();
    }
}

function setupReasoningEngineHandlers() {
    // Set default if not exists
    const current = window.getReasoningEngine();
    if (!current) window.setReasoningEngine('inference');
    updatePoweredByDisplay();
    
    // Modal event listeners
    const navbarBrand = document.getElementById('navbarBrand');
    const saveReasoningEngineBtn = document.getElementById('saveReasoningEngine');
    
    if (navbarBrand) {
        navbarBrand.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if settings page is active - if so, don't open the modal
            const settingsContent = document.getElementById('settings-content');
            if (settingsContent && !settingsContent.classList.contains('hidden')) {
                console.log('[Index] Settings page is active, preventing reasoning engine modal from opening');
                return;
            }
            
            openReasoningEngineModal();
        });
    }
    
    if (saveReasoningEngineBtn) {
        saveReasoningEngineBtn.addEventListener('click', saveReasoningEngine);
    }
    
    // Tile selection in modal
    document.querySelectorAll('.reasoning-engine-tile').forEach(tile => {
        tile.addEventListener('click', function() {
            document.querySelectorAll('.reasoning-engine-tile').forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// ----------------------------------------------------------------------------
// MAIN INITIALIZATION
// ----------------------------------------------------------------------------

function initializeIndex() {
    // Initialize sidebar state from cookie
    initializeSidebar();
    
    // Initialize user session
    initializeUserSession();
    
    // Setup navigation and event handlers
    setupSidebarNavigation();
    setupButtonHandlers();
    setupInitialState();
    setupReasoningEngineHandlers();
    
    // Setup tab switch cleanup
    patchTabSwitchCleanup();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeIndex); 