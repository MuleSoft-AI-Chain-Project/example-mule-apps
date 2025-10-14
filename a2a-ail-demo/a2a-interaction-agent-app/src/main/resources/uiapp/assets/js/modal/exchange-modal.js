// Exchange Modal JavaScript
console.log('[Exchange Modal] Exchange modal script loaded');

// Use the global getUserSessionId function if available, otherwise define it locally
if (!window.getUserSessionId) {
    window.getUserSessionId = function() {
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        }
        return getCookie('userSessionId') || '';
    };
}



// Function to render the exchange modal
window.renderExchangeModal = function() {
    console.log('[Exchange Modal] renderExchangeModal called');
    console.log('[Exchange Modal] Bootstrap available:', typeof bootstrap);
    console.log('[Exchange Modal] bootstrap.Modal available:', typeof bootstrap?.Modal);
    
    // Get the modal element
    const modalEl = document.getElementById('exchangeModal');
    console.log('[Exchange Modal] Modal element found:', modalEl);
    if (!modalEl) {
        console.error('[Exchange Modal] Exchange modal element not found');
        return;
    }
    
    // Initialize Bootstrap modal if not already done
    if (!window.exchangeModal) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            window.exchangeModal = new bootstrap.Modal(modalEl);
            console.log('[Exchange Modal] Bootstrap modal initialized');
        } else {
            console.error('[Exchange Modal] Bootstrap not available, cannot initialize modal');
            return;
        }
    }
    
    // Show the modal
    if (window.exchangeModal) {
        console.log('[Exchange Modal] Attempting to show modal');
        window.exchangeModal.show();
        console.log('[Exchange Modal] Exchange modal shown');
        
        // Refresh the list of existing agent URLs before fetching exchange agents
        refreshExistingAgentUrls();
        
        // Fetch agents and populate the modal
        fetchAgentsAndPopulateModal();
    } else {
        console.error('[Exchange Modal] Exchange modal not initialized');
    }
};

// Function to refresh the list of existing agent URLs
function refreshExistingAgentUrls() {
    console.log('[Exchange Modal] Refreshing existing agent URLs');
    
    // If we're on the agents page, the existingAgentUrls should already be available
    if (window.existingAgentUrls) {
        console.log('[Exchange Modal] Existing agent URLs already available:', window.existingAgentUrls);
        return;
    }
    
    // If not available, fetch them from the agents endpoint
    fetch(`../agents?userSessionId=${window.getUserSessionId()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tools = data.tools || [];
            window.existingAgentUrls = tools.map(tool => {
                let agentInfo;
                try {
                    agentInfo = JSON.parse(tool.function.description);
                } catch (e) {
                    agentInfo = { agentName: tool.function.name, agentDescription: '', agentSkills: [] };
                }
                return tool.agentUrl || agentInfo.agentUrl || '';
            }).filter(url => url); // Filter out empty URLs
            
            console.log('[Exchange Modal] Existing agent URLs refreshed:', window.existingAgentUrls);
        })
        .catch(error => {
            console.error('[Exchange Modal] Error refreshing existing agent URLs:', error);
            // Initialize as empty array if fetch fails
            window.existingAgentUrls = [];
        });
}

// Function to fetch agents from the platform/a2a-agents endpoint
function fetchAgentsAndPopulateModal() {
    console.log('[Exchange Modal] Fetching agents from platform/a2a-agents');
    
    // Show loading spinner
    showExchangeLoadingSpinner();
    
    // Check for custom exchange credentials
    let fetchOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    try {
        const settings = (window.getAppSettings && window.getAppSettings()) || {};
        const config = settings.exchangeCredentials || null;
        if (config) {
            if (config.type === 'custom' && config.url && config.organizationId && config.environmentId) {
                // Build the URL with custom credentials as query parameters
                const customUrl = `/platform/a2a-agents?url=${encodeURIComponent(config.url)}&organizationId=${config.organizationId}&environmentId=${config.environmentId}`;
                
                // Add custom headers for authentication
                fetchOptions.headers['client_id'] = config.clientId || '';
                fetchOptions.headers['client_secret'] = config.clientSecret || '';
                
                console.log('[Exchange Modal] Using custom exchange credentials for:', customUrl);
                
                // Use custom URL instead of relative path
                fetch(customUrl, fetchOptions)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(agents => {
                        console.log('[Exchange Modal] Agents fetched successfully from custom endpoint:', agents);
                        hideExchangeLoadingSpinner();
                        populateModalWithAgents(agents);
                    })
                    .catch(error => {
                        console.error('[Exchange Modal] Error fetching agents from custom endpoint:', error);
                        hideExchangeLoadingSpinner();
                        // Show error message in modal
                        const modalBody = document.getElementById('exchangeModalBody');
                        if (modalBody) {
                            modalBody.innerHTML = `
                                <div class="alert alert-danger" role="alert">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    Failed to load a2a assets from custom endpoint. Please check your exchange credentials.
                                </div>
                            `;
                        }
                    });
                return; // Exit early since we're using custom endpoint
            }
        }
    } catch (error) {
        console.error('[Exchange Modal] Error parsing exchange credentials:', error);
    }
    
    // Fallback to default endpoint if no custom credentials or error
    console.log('[Exchange Modal] Using default endpoint');
    fetch('../platform/a2a-agents', fetchOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(agents => {
            console.log('[Exchange Modal] Agents fetched successfully from default endpoint:', agents);
            hideExchangeLoadingSpinner();
            populateModalWithAgents(agents);
        })
        .catch(error => {
            console.error('[Exchange Modal] Error fetching agents from default endpoint:', error);
            hideExchangeLoadingSpinner();
            // Show error message in modal
            const modalBody = document.getElementById('exchangeModalBody');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Failed to load a2a assets. Please try again later.
                    </div>
                `;
            }
        });
}

// Function to show loading spinner in exchange modal
function showExchangeLoadingSpinner() {
    const modalBody = document.getElementById('exchangeModalBody');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="exchange-loading-container">
                <div class="exchange-loading-spinner"></div>
                <div class="exchange-loading-text">Loading A2A assets...</div>
            </div>
        `;
    }
}

// Function to hide loading spinner in exchange modal
function hideExchangeLoadingSpinner() {
    // The spinner will be replaced when populateModalWithAgents is called
    // This function is mainly for consistency and future use
}

// Function to populate the modal with agent tiles
function populateModalWithAgents(agents) {
    const modalBody = document.getElementById('exchangeModalBody');
    if (!modalBody) {
        console.error('[Exchange Modal] Modal body element not found');
        return;
    }
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'exchange-assets-grid';
    
    // Create tiles for each agent
    agents.forEach(agent => {
        const agentTile = document.createElement('div');
        agentTile.className = 'exchange-assets-tile';
        
        // Store the endpoint URI and instance label as data attributes for later use
        if (agent.endpointUri) {
            agentTile.setAttribute('data-endpoint-uri', agent.endpointUri.replace(/\/$/, ''));
        }
        if (agent.instanceLabel) {
            agentTile.setAttribute('data-instance-label', agent.instanceLabel);
        }
        
        // Check if this agent is already added
        const isAlreadyAdded = window.existingAgentUrls && window.existingAgentUrls.some(existingUrl => {
            const normalizedExistingUrl = existingUrl.replace(/\/$/, '');
            const normalizedAgentUrl = agent.endpointUri ? agent.endpointUri.replace(/\/$/, '') : '';
            return normalizedExistingUrl === normalizedAgentUrl;
        });
        
        // Apply disabled styling if already added
        if (isAlreadyAdded) {
            agentTile.classList.add('exchange-assets-tile-disabled');
            agentTile.style.opacity = '0.5';
            agentTile.style.cursor = 'not-allowed';
            agentTile.title = `${agent.instanceLabel || 'Unnamed Agent'} is already added to your agents`;
        } else {
            agentTile.title = `Click to add ${agent.instanceLabel || 'Unnamed Agent'} to your agents`;
        }
        
        // Add the SVG icon in the middle of the tile
        agentTile.innerHTML = `
            <div class="exchange-assets-header">
                <span class="exchange-assets-label">
                    <svg aria-hidden="true" focusable="false" class="exchange-assets-icon-small">
                        <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#a)" fill="#0176D3">
                                <path d="M15.18 39.245c-5.015 0-9.265-4.082-9.47-9.093-.203-5.01 3.716-9.09 8.73-9.09l11.122.003c5.014 0 9.265 4.082 9.468 9.093.011.2-.018.4-.085.586a1.434 1.434 0 0 1-1.369.95c-.2 0-.401-.04-.59-.117a1.605 1.605 0 0 1-.856-.833 1.552 1.552 0 0 1-.133-.587 6.322 6.322 0 0 0-6.312-6.062l-11.121-.002c-3.387 0-5.958 2.676-5.82 6.06a6.322 6.322 0 0 0 6.312 6.062l11.121.002c.201-.003.402.035.592.11a1.602 1.602 0 0 1 1.008 1.406c.008.2-.024.4-.094.585a1.433 1.433 0 0 1-.8.82 1.483 1.483 0 0 1-.582.11l-11.122-.002Zm20.22.004c-5.015 0-9.265-4.082-9.469-9.093-.01-.2.018-.4.086-.586a1.433 1.433 0 0 1 .788-.832c.182-.078.38-.117.58-.117.201 0 .402.04.59.117a1.603 1.603 0 0 1 .99 1.419 6.322 6.322 0 0 0 6.311 6.062l11.122.002c3.386 0 5.957-2.676 5.82-6.06a6.322 6.322 0 0 0-6.313-6.062l-11.121-.002a1.55 1.55 0 0 1-.591-.11 1.603 1.603 0 0 1-1.009-1.405c-.008-.201.024-.4.094-.585a1.433 1.433 0 0 1 .8-.821c.184-.075.382-.112.583-.11l11.12.003c5.015 0 9.266 4.082 9.47 9.093.203 5.01-3.716 9.09-8.73 9.09L35.4 39.249Z"></path>
                                <circle cx="15.436" cy="30.511" r="1.725"></circle>
                                <ellipse cx="22.261" cy="30.511" rx="1.65" ry="1.725"></ellipse>
                                <circle cx="39.436" cy="30.511" r="1.725"></circle>
                                <circle cx="46.336" cy="30.511" r="1.725"></circle>
                            </g>
                            <defs>
                                <clipPath id="a">
                                    <path fill="#fff" d="M0 0h60v60H0z"></path>
                                </clipPath>
                            </defs>
                        </svg>
                    </svg>
                    A2A
                </span>
                ${isAlreadyAdded ? '<span class="exchange-assets-added-badge">Added</span>' : ''}
            </div>
            <div class="exchange-assets-icon-container">
                <svg aria-hidden="true" focusable="false" class="exchange-assets-icon-large">
                    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#a)" fill="#0176D3">
                            <path d="M15.18 39.245c-5.015 0-9.265-4.082-9.47-9.093-.203-5.01 3.716-9.09 8.73-9.09l11.122.003c5.014 0 9.265 4.082 9.468 9.093.011.2-.018.4-.085.586a1.434 1.434 0 0 1-1.369.95c-.2 0-.401-.04-.59-.117a1.605 1.605 0 0 1-.856-.833 1.552 1.552 0 0 1-.133-.587 6.322 6.322 0 0 0-6.312-6.062l-11.121-.002c-3.387 0-5.958 2.676-5.82 6.06a6.322 6.322 0 0 0 6.312 6.062l11.121.002c.201-.003.402.035.592.11a1.602 1.602 0 0 1 1.008 1.406c.008.2-.024.4-.094.585a1.433 1.433 0 0 1-.8.82 1.483 1.483 0 0 1-.582.11l-11.122-.002Zm20.22.004c-5.015 0-9.265-4.082-9.469-9.093-.01-.2.018-.4.086-.586a1.433 1.433 0 0 1 .788-.832c.182-.078.38-.117.58-.117.201 0 .402.04.59.117a1.603 1.603 0 0 1 .99 1.419 6.322 6.322 0 0 0 6.311 6.062l11.122.002c3.386 0 5.957-2.676 5.82-6.06a6.322 6.322 0 0 0-6.313-6.062l-11.121-.002a1.55 1.55 0 0 1-.591-.11 1.603 1.603 0 0 1-1.009-1.405c-.008-.201.024-.4.094-.585a1.433 1.433 0 0 1 .8-.821c.184-.075.382-.112.583-.11l11.12.003c5.015 0 9.266 4.082 9.47 9.093.203 5.01-3.716 9.09-8.73 9.09L35.4 39.249Z"></path>
                            <circle cx="15.436" cy="30.511" r="1.725"></circle>
                            <ellipse cx="22.261" cy="30.511" rx="1.65" ry="1.725"></ellipse>
                            <circle cx="39.436" cy="30.511" r="1.725"></circle>
                            <circle cx="46.336" cy="30.511" r="1.725"></circle>
                        </g>
                        <defs>
                            <clipPath id="a">
                                <path fill="#fff" d="M0 0h60v60H0z"></path>
                            </clipPath>
                        </defs>
                    </svg>
                </svg>
            </div>
            <div class="exchange-assets-name">
                ${agent.instanceLabel || 'Unnamed Agent'}
            </div>
        `;
        
        // Add title for better accessibility and user experience
        agentTile.title = `Click to add ${agent.instanceLabel || 'Unnamed Agent'} to your agents`;
        
        // Add click event listener to the agent tile
        agentTile.addEventListener('click', function() {
            // Prevent clicking on disabled tiles
            if (this.classList.contains('exchange-assets-tile-disabled')) {
                console.log('[Exchange Modal] Attempted to click on disabled tile');
                return;
            }
            
            const endpointUri = this.getAttribute('data-endpoint-uri');
            const instanceLabel = this.getAttribute('data-instance-label');
            console.log('[Exchange Modal] Agent tile clicked with endpoint URI:', endpointUri, 'and instance label:', instanceLabel);
            
            // Close the exchange modal
            if (window.exchangeModal) {
                window.exchangeModal.hide();
                console.log('[Exchange Modal] Exchange modal closed');
            }
            
            // Open the add agent modal and prefill the agent URL
            setTimeout(() => {
                // Ensure the add agent modal is initialized before proceeding
                if (typeof window.initializeAddAgentModal === 'function' && !window.addAgentModalInitialized) {
                    window.initializeAddAgentModal();
                }
                
                // Ensure the Bootstrap modal instance is created
                if (!window.addAgentModal) {
                    const modalEl = document.getElementById('addAgentModal');
                    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                        window.addAgentModal = new bootstrap.Modal(modalEl);
                        console.log('[Exchange Modal] Created Bootstrap modal instance');
                    }
                }
                
                // Reset modal to add mode first
                if (typeof window.resetModalToAddMode === 'function') {
                    window.resetModalToAddMode();
                }
                
                // Show the add agent modal first
                if (window.addAgentModal) {
                    window.addAgentModal.show();
                    console.log('[Exchange Modal] Add agent modal opened');
                } else {
                    console.error('[Exchange Modal] Add agent modal not available');
                }
                
                // Wait a bit for the modal to be fully shown, then show the exchange asset pill
                setTimeout(() => {
                    // Show the exchange asset pill and hide the URL input
                    const exchangeAssetPill = document.getElementById('exchangeAssetPill');
                    const agentUrlInputGroup = document.getElementById('agentUrlInputGroup');
                    const exchangeAssetName = document.getElementById('exchangeAssetName');
                    
                    if (exchangeAssetPill && agentUrlInputGroup && exchangeAssetName && endpointUri) {
                        // Set the asset name in the pill
                        exchangeAssetName.textContent = instanceLabel || 'Unnamed Agent';
                        
                        // Store the endpoint URI in the pill for later use
                        exchangeAssetPill.setAttribute('data-endpoint-uri', endpointUri);
                        
                        // Show the pill and hide the URL input
                        exchangeAssetPill.style.display = 'flex';
                        agentUrlInputGroup.style.display = 'none';
                        
                        console.log('[Exchange Modal] Exchange asset pill shown for:', instanceLabel);
                        
                        // Set the agent URL value in the hidden input for form submission
                        const agentUrlInput = document.getElementById('agentUrlInput');
                        if (agentUrlInput) {
                            agentUrlInput.value = endpointUri;
                            console.log('[Exchange Modal] Agent URL set in hidden input:', endpointUri);
                            
                            // Trigger the input event to enable the agent type field and handle authentication visibility
                            const inputEvent = new Event('input', { bubbles: true });
                            agentUrlInput.dispatchEvent(inputEvent);
                            console.log('[Exchange Modal] Input event triggered for agent URL');
                            
                            // Set default agent type if it's a predefined URL
                            // Try both the original endpointUri and normalized version
                            const normalizedEndpointUri = endpointUri.replace(/\/$/, '');
                            const defaultAgentType = window.DEFAULT_AGENT_TYPES && (
                                window.DEFAULT_AGENT_TYPES[endpointUri] || 
                                window.DEFAULT_AGENT_TYPES[normalizedEndpointUri]
                            );
                            
                            if (defaultAgentType) {
                                const agentTypeSelect = document.getElementById('agentTypeSelect');
                                if (agentTypeSelect) {
                                    agentTypeSelect.value = defaultAgentType;
                                    console.log('[Exchange Modal] Default agent type set:', defaultAgentType);
                                }
                            }
                        }
                    }
                }, 150); // Small delay to ensure modal is fully shown
            }, 100); // Small delay to ensure exchange modal is fully closed
        });
        
        gridContainer.appendChild(agentTile);
    });
    
    // Clear existing content and add the grid
    modalBody.innerHTML = '';
    modalBody.appendChild(gridContainer);
    
    console.log(`[Exchange Modal] Created ${agents.length} agent tiles`);
}

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
