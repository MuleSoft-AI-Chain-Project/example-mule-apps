// Add Agent Modal JavaScript
// This file contains all the functionality for the Add Agent modal

console.log('[Add Agent Modal] Script file loaded and executed');

// Function to initialize the Add Agent modal
function initializeAddAgentModal() {
    console.log('[Add Agent Modal] ===== INITIALIZATION START =====');
    console.log('[Add Agent Modal] Initializing modal');
    
    // Check what elements are available
    console.log('[Add Agent Modal] addAgentModal element exists:', !!document.getElementById('addAgentModal'));
    console.log('[Add Agent Modal] exchangeIconBtn element exists:', !!document.getElementById('exchangeIconBtn'));
    console.log('[Add Agent Modal] Exchange modal functions available - loadExchangeModal:', typeof window.loadExchangeModal, 'renderExchangeModal:', typeof window.renderExchangeModal);
    
    // Initialize agent type field to be disabled initially
    const agentTypeSelect = document.getElementById('agentTypeSelect');
    if (agentTypeSelect) {
        agentTypeSelect.disabled = true;
        agentTypeSelect.style.backgroundColor = '#f8f9fa';
    }
    
    // Initialize authentication field to be disabled initially (same behavior as agent type)
    const authenticationSelect = document.getElementById('authenticationSelect');
    if (authenticationSelect) {
        authenticationSelect.disabled = true;
        authenticationSelect.style.backgroundColor = '#f8f9fa';
    }
    
    // Add authentication select event listener
    if (authenticationSelect) {
        authenticationSelect.addEventListener('change', function() {
            const clientCredentialsFields = document.getElementById('clientCredentialsFields');
            if (this.value === 'client-credentials') {
                clientCredentialsFields.style.display = 'block';
            } else {
                clientCredentialsFields.style.display = 'none';
                // Clear the fields when hiding
                const clientIdInput = document.getElementById('clientIdInput');
                const clientSecretInput = document.getElementById('clientSecretInput');
                const tokenUrlInput = document.getElementById('tokenUrlInput');
                const encodeClientCredentialsInBodySelect = document.getElementById('encodeClientCredentialsInBodySelect');
                if (clientIdInput) clientIdInput.value = '';
                if (clientSecretInput) clientSecretInput.value = '';
                if (tokenUrlInput) clientIdInput.value = '';
                if (encodeClientCredentialsInBodySelect) encodeClientCredentialsInBodySelect.value = 'false';
            }
        });
    }
    
    // Add agent URL input event listener to handle authentication section visibility and agent type field state
    const agentUrlInput = document.getElementById('agentUrlInput');
    console.log('[Add Agent Modal] Agent URL input element:', agentUrlInput);
    if (agentUrlInput) {
        console.log('[Add Agent Modal] Adding input event listener to agent URL input');
        agentUrlInput.addEventListener('input', function() {
            console.log('[Add Agent Modal] URL input event triggered, value:', this.value);
            const authenticationSelect = document.getElementById('authenticationSelect');
            const authenticationSection = document.querySelector('.mb-3:has(#authenticationSelect)');
            const authenticationLabel = document.querySelector('label[for="authenticationSelect"]');
            const authenticationHelpText = document.getElementById('authenticationHelpText');
            const agentTypeSelect = document.getElementById('agentTypeSelect');
            
            const urlValue = this.value.trim();
            console.log('[Add Agent Modal] URL value:', urlValue);
            
            // Enable/disable agent type field based on URL presence
            if (agentTypeSelect) {
                if (urlValue) {
                    console.log('[Add Agent Modal] Enabling agent type select');
                    agentTypeSelect.disabled = false;
                    agentTypeSelect.style.backgroundColor = '';
                } else {
                    console.log('[Add Agent Modal] Disabling agent type select');
                    agentTypeSelect.disabled = true;
                    agentTypeSelect.style.backgroundColor = '#f8f9fa';
                    agentTypeSelect.value = ''; // Clear the selection when URL is empty
                }
            } else {
                console.log('[Add Agent Modal] Agent type select element not found');
            }
            
            console.log('[Add Agent Modal] Checking if URL is predefined:', urlValue);
            if (window.isPredefinedAgentUrl && window.isPredefinedAgentUrl(urlValue)) {
                console.log('[Add Agent Modal] URL is predefined, hiding authentication');
                // For predefined agents: hide authentication select, show help text, and keep disabled
                if (authenticationSelect) {
                    authenticationSelect.style.display = 'none';
                    authenticationSelect.disabled = true;
                    authenticationSelect.style.backgroundColor = '#f8f9fa';
                }
                if (authenticationHelpText) {
                    authenticationHelpText.style.display = 'block';
                }
                // Hide client credentials fields if they were visible
                const clientCredentialsFields = document.getElementById('clientCredentialsFields');
                if (clientCredentialsFields) {
                    clientCredentialsFields.style.display = 'none';
                }
                
                // Set default agent type for predefined URLs
                // Try both the original urlValue and normalized version
                const normalizedUrlValue = urlValue.replace(/\/$/, '');
                const defaultAgentType = window.DEFAULT_AGENT_TYPES && (
                    window.DEFAULT_AGENT_TYPES[urlValue] || 
                    window.DEFAULT_AGENT_TYPES[normalizedUrlValue]
                );
                
                if (defaultAgentType && agentTypeSelect) {
                    agentTypeSelect.value = defaultAgentType;
                    console.log('[Add Agent Modal] Default agent type set for predefined URL:', defaultAgentType);
                }
            } else {
                console.log('[Add Agent Modal] URL is custom, showing authentication');
                // For custom agents: show authentication select, hide help text, and enable if URL is present
                if (authenticationSelect) {
                    authenticationSelect.style.display = 'block';
                    if (urlValue) {
                        console.log('[Add Agent Modal] Enabling authentication select');
                        authenticationSelect.disabled = false;
                        authenticationSelect.style.backgroundColor = '';
                    } else {
                        console.log('[Add Agent Modal] Disabling authentication select');
                        authenticationSelect.disabled = true;
                        authenticationSelect.style.backgroundColor = '#f8f9fa';
                        authenticationSelect.value = 'none'; // Reset to default when URL is empty
                    }
                }
                
                // Hide help text for custom agents
                if (authenticationHelpText) {
                    authenticationHelpText.style.display = 'none';
                }
                
                // Show/hide client credentials fields based on authentication type
                const clientCredentialsFields = document.getElementById('clientCredentialsFields');
                if (clientCredentialsFields) {
                    if (authenticationSelect && authenticationSelect.value === 'client-credentials' && urlValue) {
                        clientCredentialsFields.style.display = 'block';
                    } else {
                        clientCredentialsFields.style.display = 'none';
                    }
                }
            }
        });
    }
    
    // Add exchange icon button event listener
    const exchangeIconBtn = document.getElementById('exchangeIconBtn');
    console.log('[Add Agent Modal] Looking for exchangeIconBtn:', exchangeIconBtn);
    
    if (exchangeIconBtn) {
        console.log('[Add Agent Modal] Exchange icon button found, adding event listener');
        exchangeIconBtn.addEventListener('click', function() {
            console.log('[Add Agent Modal] Exchange icon button clicked');
            
            // Close the Add New Agent modal
            if (window.addAgentModal) {
                console.log('[Add Agent Modal] Closing add agent modal');
                window.addAgentModal.hide();
            }
            
            // Load and show exchange modal
            console.log('[Add Agent Modal] Calling loadExchangeModal');
            window.loadExchangeModal(function() {
                console.log('[Add Agent Modal] loadExchangeModal callback executed');
                console.log('[Add Agent Modal] Calling renderExchangeModal');
                window.renderExchangeModal();
            });
        });
        console.log('[Add Agent Modal] Event listener added to exchange icon button');
    } else {
        console.error('[Add Agent Modal] Exchange icon button not found!');
        console.log('[Add Agent Modal] Attempting to retry after a short delay...');
        
        // Retry after a short delay in case the DOM is still being updated
        setTimeout(function() {
            console.log('[Add Agent Modal] Retrying to find exchangeIconBtn...');
            const retryExchangeIconBtn = document.getElementById('exchangeIconBtn');
            if (retryExchangeIconBtn) {
                console.log('[Add Agent Modal] Exchange icon button found on retry, adding event listener');
                retryExchangeIconBtn.addEventListener('click', function() {
                    console.log('[Add Agent Modal] Exchange icon button clicked (retry)');
                    
                    // Close the Add New Agent modal
                    if (window.addAgentModal) {
                        console.log('[Add Agent Modal] Closing add agent modal');
                        window.addAgentModal.hide();
                    }
                    
                    // Load and show exchange modal
                    console.log('[Add Agent Modal] Calling loadExchangeModal');
                    window.loadExchangeModal(function() {
                        console.log('[Add Agent Modal] loadExchangeModal callback executed');
                        console.log('[Add Agent Modal] Calling renderExchangeModal');
                        window.renderExchangeModal();
                    });
                });
                console.log('[Add Agent Modal] Event listener added to exchange icon button (retry)');
            } else {
                console.error('[Add Agent Modal] Exchange icon button still not found after retry!');
            }
        }, 100);
    }
    
    // Add event listener for the Save button (prevent duplicate handlers)
    const addAgentConfirmBtn = document.getElementById('saveAgentBtn');
    if (addAgentConfirmBtn) {
        // Remove any existing event listeners to prevent duplicates
        const newAddAgentConfirmBtn = addAgentConfirmBtn.cloneNode(true);
        addAgentConfirmBtn.parentNode.replaceChild(newAddAgentConfirmBtn, addAgentConfirmBtn);
        
        newAddAgentConfirmBtn.addEventListener('click', function() {
            const agentUrlInput = document.getElementById('agentUrlInput');
            const agentTypeSelect = document.getElementById('agentTypeSelect');
            const authenticationSelect = document.getElementById('authenticationSelect');
            const clientIdInput = document.getElementById('clientIdInput');
            const clientSecretInput = document.getElementById('clientSecretInput');
            const tokenUrlInput = document.getElementById('tokenUrlInput');
            const encodeClientCredentialsInBodySelect = document.getElementById('encodeClientCredentialsInBodySelect');
            
            const agentUrl = agentUrlInput.value.trim();
            const agentType = agentTypeSelect.value;
            const authenticationType = authenticationSelect.value;
            
            // Check if we're in edit mode
            if (window.currentEditingTile && window.currentEditingAgentUrl) {
                // In edit mode, only agentType is required since URL section is hidden
                if (!agentType) {
                    alert('Please select an agent type');
                    return;
                }
            } else {
                // In add mode, both URL and type are required
                if (!agentUrl || !agentType) {
                    alert('Please fill in all required fields');
                    return;
                }
            }
            
            // Validate client credentials if authentication type is client-credentials
            if (authenticationType === 'client-credentials') {
                const clientId = clientIdInput.value.trim();
                const clientSecret = clientSecretInput.value.trim();
                const tokenUrl = tokenUrlInput.value.trim();
                const encodeInBody = encodeClientCredentialsInBodySelect ? encodeClientCredentialsInBodySelect.value : 'false';
                if (!clientId || !clientSecret || !tokenUrl || !encodeInBody) {
                    alert('Please fill in Client ID, Client Secret, Token URL, and Encode Client Credentials In Body for Client Credentials authentication');
                    return;
                }
            }
            
            // Check if we're in edit mode
            if (window.currentEditingTile && window.currentEditingAgentUrl) {
                console.log('[Add Agent Modal] Processing edit mode for agent URL:', window.currentEditingAgentUrl);
                
                // Update the agent type in localStorage
                if (window.addAgentTypeToStorage) {
                    window.addAgentTypeToStorage(agentUrl, agentType);
                }
                
                // Update the icon in the tile
                const iconWrapper = window.currentEditingTile.querySelector('.agent-icon-wrapper');
                if (iconWrapper && window.getAgentIconHtml) {
                    const newIconHtml = window.getAgentIconHtml(agentUrl);
                    iconWrapper.innerHTML = newIconHtml;
                    console.log('[Add Agent Modal] Updated icon for agent:', agentUrl);
                }
                
                // Show success feedback
                // alert('Agent type updated successfully!');
                
                // Clear editing references BEFORE resetting modal
                window.currentEditingTile = null;
                window.currentEditingAgentUrl = null;
                
                // Reset modal to add mode after user acknowledges
                window.resetModalToAddMode();
                
                // Hide the modal
                if (window.addAgentModal) {
                    window.addAgentModal.hide();
                }
                
                // IMPORTANT: Return early to prevent further execution
                return;
            }
            
            // Process new agent addition
            console.log('[Add Agent Modal] Processing new agent addition');
            
            // Show loading backdrop
            if (typeof window.showLoadingBackdrop === 'function') {
                window.showLoadingBackdrop();
            }
            
            // Prepare the agent data
            const agentData = {
                agentUrl: agentUrl,
                agentType: agentType,
                authenticationType: authenticationType
            };
            
            // Add client credentials if authentication type is client-credentials
            if (authenticationType === 'client-credentials') {
                agentData.clientId = clientIdInput.value.trim();
                agentData.clientSecret = clientSecretInput.value.trim();
                agentData.tokenUrl = tokenUrlInput.value.trim();
                agentData.encodeClientCredentialsInBody = encodeClientCredentialsInBodySelect ? encodeClientCredentialsInBodySelect.value : 'false';
            }
            
            // Check if this is an exchange asset
            const exchangeAssetPill = document.getElementById('exchangeAssetPill');
            if (exchangeAssetPill && exchangeAssetPill.style.display !== 'none') {
                agentData.isExchangeAsset = true;
                const exchangeAssetName = document.getElementById('exchangeAssetName');
                if (exchangeAssetName) {
                    agentData.exchangeAssetName = exchangeAssetName.textContent;
                }
            }
            
            // Add the agent
            if (window.addAgent) {
                window.addAgent(agentData);
            } else {
                console.error('addAgent function not available');
                alert('Error: addAgent function not available');
            }
        });
    }
    
    // Add event listener for the remove exchange asset button
    const removeExchangeAssetBtn = document.getElementById('removeExchangeAssetBtn');
    if (removeExchangeAssetBtn) {
        removeExchangeAssetBtn.addEventListener('click', function() {
            // Hide the exchange asset pill
            const exchangeAssetPill = document.getElementById('exchangeAssetPill');
            if (exchangeAssetPill) {
                exchangeAssetPill.style.display = 'none';
            }
            
            // Show the URL input group
            const agentUrlInputGroup = document.getElementById('agentUrlInputGroup');
            if (agentUrlInputGroup) {
                agentUrlInputGroup.style.display = 'flex';
            }
        });
    }
    
    // Ensure the General tab is active by default
    try {
        const generalTabBtn = document.getElementById('general-tab');
        if (generalTabBtn) {
            if (window.bootstrap && window.bootstrap.Tab) {
                const tab = window.bootstrap.Tab.getOrCreateInstance(generalTabBtn);
                tab.show();
            } else {
                // Fallback: manually toggle classes
                const generalPane = document.getElementById('generalTab');
                const authPane = document.getElementById('authenticationTab');
                if (generalTabBtn) generalTabBtn.classList.add('active');
                const authTabBtn = document.getElementById('authentication-tab');
                if (authTabBtn) authTabBtn.classList.remove('active');
                if (generalPane) {
                    generalPane.classList.add('show');
                    generalPane.classList.add('active');
                }
                if (authPane) {
                    authPane.classList.remove('show');
                    authPane.classList.remove('active');
                }
            }
        }
    } catch (e) {
        console.warn('Failed to activate General tab:', e);
    }
    
    // Show the Authentication tab in add mode
    const authTabBtn = document.getElementById('authentication-tab');
    if (authTabBtn) {
        authTabBtn.style.display = 'block';
        console.log('[Add Mode] Authentication tab shown');
    }
    
    // Clear and disable the agent type select
    const agentTypeSelect2 = document.getElementById('agentTypeSelect');
    if (agentTypeSelect2) {
        agentTypeSelect2.value = '';
        agentTypeSelect2.disabled = true;
        agentTypeSelect2.style.backgroundColor = '#f8f9fa';
    }
    
    // Reset authentication fields
    const authenticationSelect2 = document.getElementById('authenticationSelect');
    if (authenticationSelect2) {
        authenticationSelect2.value = 'none';
        authenticationSelect2.style.display = 'block'; // Ensure it's visible
        authenticationSelect2.disabled = true; // Keep disabled initially (same behavior as agent type)
        authenticationSelect2.style.backgroundColor = '#f8f9fa'; // Set disabled background color
    }
    
    const authenticationHelpText = document.getElementById('authenticationHelpText');
    if (authenticationHelpText) {
        authenticationHelpText.style.display = 'none'; // Hide help text
    }
    
    const clientCredentialsFields = document.getElementById('clientCredentialsFields');
    if (clientCredentialsFields) {
        clientCredentialsFields.style.display = 'none';
    }
    
    const encodeClientCredentialsInBodySelect = document.getElementById('encodeClientCredentialsInBodySelect');
    const clientIdInput = document.getElementById('clientIdInput');
    const clientSecretInput = document.getElementById('clientSecretInput');
    const tokenUrlInput = document.getElementById('tokenUrlInput');
    if (encodeClientCredentialsInBodySelect) {
        encodeClientCredentialsInBodySelect.value = 'false';
        encodeClientCredentialsInBodySelect.disabled = false;
        encodeClientCredentialsInBodySelect.style.backgroundColor = '';
    }
    if (clientIdInput) {
        clientIdInput.value = '';
        clientIdInput.disabled = false; // Re-enable in add mode
        clientIdInput.style.backgroundColor = ''; // Reset background color
    }
    if (clientSecretInput) {
        clientSecretInput.value = '';
        clientSecretInput.disabled = false; // Re-enable in add mode
        clientSecretInput.style.backgroundColor = ''; // Reset background color
    }
    if (tokenUrlInput) {
        tokenUrlInput.value = '';
        tokenUrlInput.disabled = false; // Re-enable in add mode
        tokenUrlInput.style.backgroundColor = ''; // Reset background color
    }
    
    // Clear editing references
    window.currentEditingTile = null;
    window.currentEditingAgentUrl = null;
    
    console.log('[Add Agent Modal] ===== INITIALIZATION COMPLETE =====');
}

// Note: Both openEditAgentModal and resetModalToAddMode functions are handled by agents.js
// to ensure consistent behavior and proper field restoration

// Make functions globally available
window.initializeAddAgentModal = initializeAddAgentModal;
window.resetModalToAddMode = resetModalToAddMode;
