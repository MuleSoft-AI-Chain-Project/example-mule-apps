// Centralized default agent URLs for maintainability
window.PREDEFINED_AGENT_URL = window.PREDEFINED_AGENT_URL || [
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/a2a-0.3.0/erp-agent",
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/a2a-0.3.0/crm-agent",
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/a2a-0.3.0/agentforce-agent",
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/a2a-0.3.0/einstein-agent"
];

// Modal loading functions
// Function to load add agent modal
function loadAddAgentModal(callback) {
    console.log('[Agents] Loading add agent modal');
    // Check if modal is already loaded
    if (document.getElementById('addAgentModal')) {
        callback();
        return;
    }
    
    // Remove any existing modal to avoid stale state
    const existingModal = document.getElementById('addAgentModal');
    if (existingModal) { 
        existingModal.remove(); 
    }
    
    fetch('add-agent-modal.html')
        .then(resp => resp.text())
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Append modal to document.body for proper Bootstrap modal styling
            const modalEl = tempDiv.querySelector('#addAgentModal');
            if (modalEl) {
                document.body.appendChild(modalEl);
            } else {
                console.warn('[Agents] No add agent modal element found in fetched HTML');
            }
            
            // Load the external JavaScript file
            const scriptTag = tempDiv.querySelector('script');
            if (scriptTag && scriptTag.src) {
                const newScript = document.createElement('script');
                newScript.src = scriptTag.src;
                newScript.onload = function() {
                    // Also load the exchange modal to ensure it's available
                    loadExchangeModal(function() {
                        // Wait a bit more for the function to be available
                        setTimeout(function() {
                            if (typeof window.initializeAddAgentModal === 'function') {
                                callback();
                            } else {
                                console.error('[Agents] initializeAddAgentModal function still not available after script load');
                                callback(); // Call callback anyway to avoid hanging
                            }
                        }, 50);
                    });
                };
                newScript.onerror = function() {
                    console.error('[Agents] Failed to load add agent modal script:', scriptTag.src);
                    callback(); // Call callback anyway to avoid hanging
                };
                document.head.appendChild(newScript);
            } else {
                console.warn('[Agents] No script tag with src found in fetched HTML');
                callback(); // Call callback anyway to avoid hanging
            }
        })
        .catch(err => {
            console.error('[Agents] Failed to load add-agent-modal.html:', err);
            alert('Could not load add agent modal.');
        });
}

// Function to load skill description modal
function loadSkillDescriptionModal(callback) {
    console.log('[Agents] Loading skill description modal');
    // Check if modal is already loaded
    if (document.getElementById('skillDescModal')) {
        callback();
        return;
    }
    
    // Remove any existing modal to avoid stale state
    const existingModal = document.getElementById('skillDescModal');
    if (existingModal) { 
        existingModal.remove(); 
    }
    
    fetch('skill-description-modal.html')
        .then(resp => resp.text())
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Append modal to document.body for proper Bootstrap modal styling
            const modalEl = tempDiv.querySelector('#skillDescModal');
            if (modalEl) {
                document.body.appendChild(modalEl);
            } else {
                console.warn('[Agents] No skill description modal element found in fetched HTML');
            }
            
            // Load the external JavaScript file
            const scriptTag = tempDiv.querySelector('script');
            if (scriptTag && scriptTag.src) {
                const newScript = document.createElement('script');
                newScript.src = scriptTag.src;
                newScript.onload = function() {
                    // Wait a bit more for the function to be available
                    setTimeout(function() {
                        if (typeof window.initializeSkillDescriptionModal === 'function') {
                            callback();
                        } else {
                            console.error('[Agents] initializeSkillDescriptionModal function still not available after script load');
                            callback(); // Call callback anyway to avoid hanging
                        }
                    }, 50);
                };
                newScript.onerror = function() {
                    console.error('[Agents] Failed to load skill description modal script:', scriptTag.src);
                    callback(); // Call callback anyway to avoid hanging
                };
                document.body.appendChild(newScript);
            } else {
                console.warn('[Agents] No script tag with src found in fetched HTML');
                callback(); // Call callback anyway to avoid hanging
            }
        })
        .catch(err => {
            console.error('[Agents] Failed to load skill-description-modal.html:', err);
            alert('Could not load skill description modal.');
        });
}

// Function to load chat modal
function loadChatModal(callback) {
    console.log('[Agents] Loading chat modal');
    // Check if modal is already loaded
    if (document.getElementById('chatModal')) {
        callback();
        return;
    }
    
    // Remove any existing modal to avoid stale state
    const existingModal = document.getElementById('chatModal');
    if (existingModal) { 
        existingModal.remove(); 
    }
    
    fetch('chat-modal.html')
        .then(resp => resp.text())
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Append modal to document.body for proper Bootstrap modal styling
            const modalEl = tempDiv.querySelector('#chatModal');
            if (modalEl) {
                document.body.appendChild(modalEl);
            } else {
                console.warn('[Agents] No chat modal element found in fetched HTML');
            }
            
            // Load the external JavaScript file
            const scriptTag = tempDiv.querySelector('script');
            if (scriptTag && scriptTag.src) {
                const newScript = document.createElement('script');
                newScript.src = scriptTag.src;
                newScript.onload = function() {
                    // Wait a bit more for the function to be available
                    setTimeout(function() {
                        if (typeof window.initializeChatModal === 'function') {
                            callback();
                        } else {
                            console.error('[Agents] initializeChatModal function still not available after script load');
                            callback(); // Call callback anyway to avoid hanging
                        }
                    }, 50);
                };
                newScript.onerror = function() {
                    console.error('[Agents] Failed to load chat modal script:', scriptTag.src);
                    callback(); // Call callback anyway to avoid hanging
                };
                document.body.appendChild(newScript);
            } else {
                console.warn('[Agents] No script tag with src found in fetched HTML');
                callback(); // Call callback anyway to avoid hanging
            }
        })
        .catch(err => {
            console.error('[Agents] Failed to load chat-modal.html:', err);
            alert('Could not load chat modal.');
        });
}

// Make modal loading functions globally available
window.loadAddAgentModal = loadAddAgentModal;
window.loadSkillDescriptionModal = loadSkillDescriptionModal;
window.loadChatModal = loadChatModal;

// Default agent types mapped to URLs
window.DEFAULT_AGENT_TYPES = {
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/erp-agent": "MuleSoft AI Chain",
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/crm-agent": "MuleSoft AI Chain",
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/agentforce-agent": "Agentforce",
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/einstein-agent": "Einstein Models"
};

// Local storage key for agent function name-type pairs
var AGENT_TYPES_STORAGE_KEY = 'agent_function_types';

// Local storage management functions
function getAgentTypesFromStorage() {
    try {
        const stored = localStorage.getItem(AGENT_TYPES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Error reading agent types from storage:', error);
        return {};
    }
}

function saveAgentTypesToStorage(agentTypes) {
    try {
        localStorage.setItem(AGENT_TYPES_STORAGE_KEY, JSON.stringify(agentTypes));
    } catch (error) {
        console.error('Error saving agent types to storage:', error);
    }
}

function addAgentTypeToStorage(agentUrl, agentType) {
    console.log('[Agents] Adding agent type to storage:', agentType, 'for URL:', agentUrl);
    const agentTypes = getAgentTypesFromStorage();
    agentTypes[agentUrl] = agentType;
    saveAgentTypesToStorage(agentTypes);
}

function removeAgentTypeFromStorage(agentUrl) {
    const agentTypes = getAgentTypesFromStorage();
    delete agentTypes[agentUrl];
    saveAgentTypesToStorage(agentTypes);
}

function removeAgentTypesFromStorage(agentUrls) {
    const agentTypes = getAgentTypesFromStorage();
    agentUrls.forEach(url => delete agentTypes[url]);
    saveAgentTypesToStorage(agentTypes);
}

function clearAllAgentTypesFromStorage() {
    localStorage.removeItem(AGENT_TYPES_STORAGE_KEY);
}

function getAgentTypeForFunction(agentFunctionName) {
    // First try to get agent type by function name (for backward compatibility)
    const agentTypes = getAgentTypesFromStorage();
    if (agentTypes[agentFunctionName]) {
        return agentTypes[agentFunctionName];
    }
    
    // If not found by function name, try to find by URL
    // We need to get the agent URL from the current agents list
    const agentTiles = document.querySelectorAll('.agent-tile[data-agent-id]');
    for (const tile of agentTiles) {
        const functionName = tile.getAttribute('data-agent-id');
        if (functionName === agentFunctionName) {
            // Get the agent info from the tile's data or find it in the current tools
            // For now, we'll need to make a request to get the current agents and find the URL
            // This is a temporary solution - ideally we should store the URL in the tile data
            return null; // We'll implement this in the next step
        }
    }
    
    return null;
}

// Helper function to check if a URL is a predefined agent URL
function isPredefinedAgentUrl(agentUrl) {
    if (!agentUrl || agentUrl.trim() === '') return false;
    const normalizedUrl = agentUrl.trim().replace(/\/$/, ''); // Remove trailing slash
    return window.PREDEFINED_AGENT_URL.some(url => {
        const normalizedPredefinedUrl = url.replace(/\/$/, '');
        return normalizedPredefinedUrl === normalizedUrl;
    });
}

// Make functions globally available for modal use
window.isPredefinedAgentUrl = isPredefinedAgentUrl;
window.loadExchangeModal = loadExchangeModal;
window.getAgentIconHtml = getAgentIconHtml;
window.addAgentTypeToStorage = addAgentTypeToStorage;
window.getAgentTypeForUrl = getAgentTypeForUrl;

// Loading backdrop functions
function showLoadingBackdrop() {
    const loadingBackdrop = document.getElementById('loadingBackdrop');
    if (loadingBackdrop) {
        loadingBackdrop.style.display = 'flex';
    }
}

function hideLoadingBackdrop() {
    const loadingBackdrop = document.getElementById('loadingBackdrop');
    if (loadingBackdrop) {
        loadingBackdrop.style.display = 'none';
    }
}

// New function to get agent type by URL
function getAgentTypeForUrl(agentUrl) {
    const agentTypes = getAgentTypesFromStorage();
    
    // Try exact match first
    if (agentTypes[agentUrl]) {
        return agentTypes[agentUrl];
    }
    
    // Try normalized URL matching (remove trailing slashes)
    const normalizedUrl = agentUrl.replace(/\/$/, '');
    for (const [storedUrl, agentType] of Object.entries(agentTypes)) {
        const normalizedStoredUrl = storedUrl.replace(/\/$/, '');
        if (normalizedStoredUrl === normalizedUrl) {
            return agentType;
        }
    }
    
    // Try partial URL matching (in case of protocol differences)
    for (const [storedUrl, agentType] of Object.entries(agentTypes)) {
        if (agentUrl.includes(storedUrl) || storedUrl.includes(agentUrl)) {
            return agentType;
        }
    }
    
    console.log('[Agents] No agent type found for URL:', agentUrl);
    return null;
}

// Agent type icons mapping
window.AGENT_TYPE_ICONS = {
    "Agentforce": "assets/images/agentforceagent.png",
    "Amazon Bedrock": "assets/images/bedrockagent.png",
    "AutoGen": "assets/images/autogenagent.png",
    "CrewAI": "assets/images/crewaiagent.png",
    "GoogleADK": "assets/images/adkagent.png",
    "Einstein Models": "assets/images/einsteinagent.png",
    "Heroku" : "assets/images/heroku-icon.webp",
    "LangChain": "assets/images/langchainagent.webp",
    "LangChain4J": "assets/images/langchain4jagent.png",
    "LlamaIndex": "assets/images/llamaindexagent.jpeg",
    "MuleSoft AI Chain": "assets/images/muleaichainagent.webp",
    "OpenAI Swarm": "assets/images/openaiswarmagent.png",
    "Custom": "fas fa-robot" // Using existing FontAwesome icon
};

// Flag to track if event listeners have been initialized
window.agentsTabInitialized = false;

// Global modal instances
window.addAgentModal = null;
window.skillDescModal = null;
window.chatModal = null;
window.exchangeModal = null;
window.lastFocusedElement = null; // Store the element that had focus before modal opened

// Chat state variables
window.currentChatAgent = null;
window.chatMessages = [];

// Event listener references for cleanup
window.deleteAllBtnListener = null;
window.addDefaultBtnListener = null;
window.cancelBtnListener = null;
window.closeBtnListener = null;

// Function to load exchange modal
function loadExchangeModal(callback) {
    console.log('[Agents] Loading exchange modal');
    // Check if modal is already loaded
    if (document.getElementById('exchangeModal')) {
        callback();
        return;
    }
    
    // Remove any existing modal to avoid stale state
    const existingModal = document.getElementById('exchangeModal');
    if (existingModal) { 
        existingModal.remove(); 
    }
    
    fetch('exchange-modal.html')
        .then(resp => resp.text())
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Append modal to document.body for proper Bootstrap modal styling
            const modalEl = tempDiv.querySelector('#exchangeModal');
            if (modalEl) {
                document.body.appendChild(modalEl);
            } else {
                console.warn('[Agents] No exchange modal element found in fetched HTML');
            }
            
            // Load the external JavaScript file
            const scriptTag = tempDiv.querySelector('script');
            if (scriptTag && scriptTag.src) {
                const newScript = document.createElement('script');
                newScript.src = scriptTag.src;
                newScript.onload = function() {
                    // Wait a bit more for the function to be available
                    setTimeout(function() {
                        if (typeof window.renderExchangeModal === 'function') {
                            callback();
                        } else {
                            console.error('[Agents] renderExchangeModal function still not available after script load');
                            callback(); // Call callback anyway to avoid hanging
                        }
                    }, 50);
                };
                newScript.onerror = function() {
                    console.error('[Agents] Failed to load exchange modal script:', scriptTag.src);
                    callback(); // Call callback anyway to avoid hanging
                };
                document.body.appendChild(newScript);
            } else {
                console.warn('[Agents] No script tag with src found in fetched HTML');
                callback(); // Call callback anyway to avoid hanging
            }
        })
        .catch(err => {
            console.error('[Agents] Failed to load exchange-modal.html:', err);
            alert('Could not load exchange modal.');
        });
}

// Reset initialization state when content is reloaded
function resetAgentsTabState() {
    window.agentsTabInitialized = false;
    window.addAgentModal = null;
    window.skillDescModal = null;
    window.chatModal = null;
    window.exchangeModal = null;
    window.lastFocusedElement = null;
    
    // Note: Add button event listener is now handled in add-agent-modal.js
    
    // Remove all event listeners with proper cleanup
    if (window.deleteAllBtnListener) {
        const deleteAllBtn = document.getElementById('deleteAllAgentsBtn');
        if (deleteAllBtn) {
            deleteAllBtn.removeEventListener('click', window.deleteAllBtnListener);
        }
        window.deleteAllBtnListener = null;
    }
    
    if (window.addDefaultBtnListener) {
        const addDefaultBtn = document.getElementById('addDefaultAgentsBtn');
        if (addDefaultBtn) {
            addDefaultBtn.removeEventListener('click', window.addDefaultBtnListener);
        }
        window.addDefaultBtnListener = null;
    }
    
    if (window.cancelBtnListener) {
        const cancelBtn = document.querySelector('#addAgentModal .btn-secondary');
        if (cancelBtn) {
            cancelBtn.removeEventListener('click', window.cancelBtnListener);
        }
        window.cancelBtnListener = null;
    }
    
    if (window.closeBtnListener) {
        const closeBtn = document.querySelector('#addAgentModal .btn-close');
        if (closeBtn) {
            closeBtn.removeEventListener('click', window.closeBtnListener);
        }
        window.closeBtnListener = null;
    }
    
    if (window.chatModalCloseBtnListener) {
        const chatModalCloseBtn = document.querySelector('#chatModal .btn-close');
        if (chatModalCloseBtn) {
            chatModalCloseBtn.removeEventListener('click', window.chatModalCloseBtnListener);
        }
        window.chatModalCloseBtnListener = null;
    }
    
    // Clean up any existing agent tiles and their event listeners
    const existingTiles = document.querySelectorAll('.agent-tile');
    existingTiles.forEach(tile => {
        // Remove all event listeners by cloning the element
        const newTile = tile.cloneNode(true);
        tile.parentNode.replaceChild(newTile, tile);
    });
    
    // Clean up the add agent tile
    const addAgentTile = document.getElementById('addAgentBtn');
    if (addAgentTile) {
        const newAddTile = addAgentTile.cloneNode(true);
        addAgentTile.parentNode.replaceChild(newAddTile, addAgentTile);
    }
}

// Helper function to get user session ID from cookie
function getUserSessionId() {
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    return getCookie('userSessionId') || '';
}

// Make getUserSessionId globally available
window.getUserSessionId = getUserSessionId;

// Generate a UUID v4 string
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to get agent icon HTML
function getAgentIconHtml(agentUrl) {
    if (!agentUrl || agentUrl.trim() === '') {
        return `<i class='fas fa-robot tile-robot-icon'></i>`;
    }
    
    const agentType = getAgentTypeForUrl(agentUrl);
    const iconUrl = window.AGENT_TYPE_ICONS[agentType];
    
    if (!agentType || agentType === "Custom") {
        return `<i class='fas fa-robot tile-robot-icon'></i>`;
    } else if (iconUrl) {
        return `<img src="${iconUrl}" alt="${agentType}" class="agent-type-icon" style="width: clamp(32px, 2vw, 60px); height: auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                <i class='fas fa-robot tile-robot-icon' style="display:none;"></i>`;
    } else {
        return `<i class='fas fa-robot tile-robot-icon'></i>`;
    }
}

// Function to start a chat with a specific agent
function startChatWithAgent(agentId, agentName) {
    console.log('[Agents] Starting chat with agent:', agentName, 'ID:', agentId);
    // Store the currently focused element for later restoration
    window.lastFocusedElement = document.activeElement;
    
    // Set current chat agent
    window.currentChatAgent = agentId;
    window.chatMessages = [];
    // Create a new chat session id for this modal lifecycle
    window.currentChatSessionId = generateUUID();
    
    // Update modal title
    const chatModalLabel = document.getElementById('chatModalLabel');
    if (chatModalLabel) {
        chatModalLabel.textContent = `Chat with ${agentName}`;
    }
    
    // Clear chat container
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        // Remove only message elements, preserve the typing indicator
        const messageElements = chatContainer.querySelectorAll('.chat-message');
        messageElements.forEach(element => element.remove());
        
        // Ensure typing indicator exists and is hidden
        let typingIndicator = document.getElementById('typingIndicator');
        if (!typingIndicator) {
            // Create typing indicator if it doesn't exist
            typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.id = 'typingIndicator';
            typingIndicator.innerHTML = `
                <div class="typing-bubble">
                    <span class="typing-text">Agent is typing</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;
            chatContainer.appendChild(typingIndicator);
        }
        // Ensure it's hidden initially
        typingIndicator.style.display = 'none';
    }
    
    // Clear input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = '';
    }
    
    // Show the chat modal
    if (window.chatModal) {
        window.chatModal.show();
    } else {
        // Fallback: manually show the modal
        console.warn('Using fallback chat modal show method');
        const modalEl = document.getElementById('chatModal');
        if (modalEl) {
            modalEl.classList.add('show');
            modalEl.style.display = 'block';
            modalEl.removeAttribute('aria-hidden');
            modalEl.removeAttribute('inert');
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.id = 'chatModalBackdrop';
            document.body.appendChild(backdrop);
            
            // Add click handler to backdrop
            backdrop.addEventListener('click', function() {
                const modalEl = document.getElementById('chatModal');
                if (modalEl) {
                    // Clear chat history
                    window.chatMessages = [];
                    window.currentChatAgent = null;
                    window.currentChatSessionId = null;
                    
                    modalEl.classList.remove('show');
                    modalEl.style.display = 'none';
                    modalEl.setAttribute('inert', '');
                    backdrop.remove();
                    
                    // Restore focus
                    if (window.lastFocusedElement) {
                        window.lastFocusedElement.focus();
                    }
                }
            });
        }
    }
    
    // Focus the input field
    setTimeout(() => {
        if (chatInput) {
            chatInput.focus();
        }
    }, 100);
}

// Function to add a message to the chat
function addChatMessage(message, isUser = false) {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'agent'}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    if (isUser) {
        // User messages remain as plain text
        bubbleDiv.textContent = message;
    } else {
        // Agent messages are rendered as markdown
        if (window.marked) {
            bubbleDiv.innerHTML = marked.parse(message);
        } else {
            // Fallback to plain text if marked library is not available
            bubbleDiv.textContent = message;
        }
    }
    
    messageDiv.appendChild(bubbleDiv);
    chatContainer.appendChild(messageDiv);
    
    // Ensure typing indicator stays at the bottom
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator && typingIndicator.parentNode === chatContainer) {
        chatContainer.appendChild(typingIndicator);
    }
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Store message in chat history
    window.chatMessages.push({
        message: message,
        isUser: isUser,
        timestamp: new Date()
    });
}

// Function to send a message to the agent
async function sendMessageToAgent(message) {
    console.log('[Agents] Sending message to agent:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
    if (!window.currentChatAgent) {
        console.error('No agent selected for chat');
        return;
    }
    
    // Show typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        // Ensure it's visible and scroll to it
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
        }
    } else {
        console.error('Typing indicator not found');
    }
    
    try {
        const response = await fetch(`../prompt-agent?agentName=${encodeURIComponent(window.currentChatAgent)}&userSessionId=${getUserSessionId()}&sessionId=${encodeURIComponent(window.currentChatSessionId || '')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: message
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        // Add agent response to chat
        let agentResponse = 'No response received from agent';
        
        // Extract response from the correct path in the response structure
        if (data.agentTaskResponse && 
            data.agentTaskResponse.status && 
            data.agentTaskResponse.status.message && 
            data.agentTaskResponse.status.message.parts && 
            data.agentTaskResponse.status.message.parts.length > 0) {
            agentResponse = data.agentTaskResponse.status.message.parts[0].text;
        } else if (data.response) {
            agentResponse = data.response;
        } else if (data.message) {
            agentResponse = data.message;
        }
        
        addChatMessage(agentResponse, false);
        
    } catch (error) {
        console.error('Error sending message to agent:', error);
        
        // Hide typing indicator
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        // Add error message
        addChatMessage('Sorry, there was an error communicating with the agent. Please try again.', false);
    }
}

// Initialize modals using the new modal loading system
function initializeModals() {
    console.log('[Agents] Initializing modals');
    // Load all modals in parallel
    Promise.all([
        new Promise((resolve) => {
            if (typeof window.loadAddAgentModal === 'function') {
                window.loadAddAgentModal(() => {
                    // Actually call the initialization function
                    if (typeof window.initializeAddAgentModal === 'function') {
                        window.initializeAddAgentModal();
                    } else {
                        console.error('[Agents] initializeAddAgentModal function not available');
                    }
                    resolve();
                });
            } else {
                console.warn('[Agents] loadAddAgentModal function not available');
                resolve();
            }
        }),
        new Promise((resolve) => {
            if (typeof window.loadSkillDescriptionModal === 'function') {
                window.loadSkillDescriptionModal(() => {
                    resolve();
                });
            } else {
                console.warn('[Agents] loadSkillDescriptionModal function not available');
                resolve();
            }
        }),
        new Promise((resolve) => {
            if (typeof window.loadChatModal === 'function') {
                window.loadChatModal(() => {
                    resolve();
                });
            } else {
                console.warn('[Agents] loadChatModal function not available');
                resolve();
            }
        })
    ]).then(() => {
        // Initialize Bootstrap modal instances after all modals are loaded
        setTimeout(() => {
            try {
                const modalEl = document.getElementById('addAgentModal');
                const skillModalEl = document.getElementById('skillDescModal');
                const chatModalEl = document.getElementById('chatModal');
                
                if (modalEl && skillModalEl && chatModalEl) {
        // Hide modals if open before re-initializing
        if (modalEl.classList.contains('show')) {
            var existingModal = window.bootstrap ? window.bootstrap.Modal.getInstance(modalEl) : null;
            if (existingModal) existingModal.hide();
        }
        if (skillModalEl.classList.contains('show')) {
            var existingSkillModal = window.bootstrap ? window.bootstrap.Modal.getInstance(skillModalEl) : null;
            if (existingSkillModal) existingSkillModal.hide();
        }
        if (chatModalEl.classList.contains('show')) {
            var existingChatModal = window.bootstrap ? window.bootstrap.Modal.getInstance(chatModalEl) : null;
            if (existingChatModal) existingChatModal.hide();
        }
        
        // Wait for Bootstrap to be available
        var ModalClass = window.bootstrap ? window.bootstrap.Modal : (window.Modal || null);
        if (ModalClass) {
            try {
                        window.addAgentModal = new ModalClass(modalEl);
        window.skillDescModal = new ModalClass(skillModalEl);
        window.chatModal = new ModalClass(chatModalEl);
        
        // Add event listener for chat modal hidden event
        chatModalEl.addEventListener('hidden.bs.modal', function() {
            // Clear chat history when modal is hidden
            window.chatMessages = [];
            window.currentChatAgent = null;
            window.currentChatSessionId = null;
            
            // Clear chat container
            const chatContainer = document.getElementById('chatContainer');
            if (chatContainer) {
                chatContainer.innerHTML = '';
            }
            
            // Clear input
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = '';
                chatInput.style.height = 'auto';
            }
            
            // Restore focus
            if (window.lastFocusedElement) {
                window.lastFocusedElement.focus();
            }
        });
        
        // Add event listener for add agent modal hidden event
        modalEl.addEventListener('hidden.bs.modal', function() {
            // Restore focus
            if (window.lastFocusedElement) {
                window.lastFocusedElement.focus();
            }
        });
        
        // Add event listener for add agent modal shown event
        modalEl.addEventListener('shown.bs.modal', function() {
            // Focus the URL input field when modal opens for add mode
            const agentUrlInput = document.getElementById('agentUrlInput');
            if (agentUrlInput && !agentUrlInput.disabled) {
                setTimeout(() => agentUrlInput.focus(), 100);
            }
        });
        
        // Add ESC key handler for add agent modal
        modalEl.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                window.addAgentModal.hide();
            }
        });
        
                        } catch (error) {
                            console.error('[Agents] Error creating Bootstrap modal instances:', error);
                        }
                    } else {
                        console.warn('[Agents] Bootstrap Modal class not available');
                    }
                } else {
                    console.warn('[Agents] Some modal elements not found after loading');
                }
            } catch (error) {
                console.error('[Agents] Error in modal initialization:', error);
            }
        }, 100);
    }).catch((error) => {
        console.error('[Agents] Error loading modals:', error);
    });
}

window.attachAgentsTab = function() {
    // Prevent multiple simultaneous calls
    if (window.attachAgentsTab.isRunning) {
        return;
    }
    
    window.attachAgentsTab.isRunning = true;
    console.log('[Agents] Starting attachAgentsTab');
    
    // Reset state to ensure proper re-initialization
    resetAgentsTabState();
    
    // Debug agent types storage
    debugAgentTypesStorage();
    
    // Initialize modals first
    initializeModals();
    
    // Create the "Add Agent" tile
    var grid = document.getElementById('agentsGrid');
    if (grid) {
        // Create add agent tile
        const addAgentTile = document.createElement('div');
        addAgentTile.className = 'agent-tile add-agent-tile';
        addAgentTile.innerHTML = `
            <div class="add-agent-left-half">
                <i class="fas fa-plus-circle"></i>
            </div>
            <div class="add-agent-right-half">
                <span>Add Agent</span>
            </div>
        `;
        
        // Add click event to open add agent modal
        addAgentTile.addEventListener('click', function() {
            if (typeof window.loadAddAgentModal === 'function') {
                window.loadAddAgentModal(function() {
                    if (typeof window.initializeAddAgentModal === 'function') {
                        window.initializeAddAgentModal();
                        if (window.addAgentModal) {
                            window.addAgentModal.show();
                        }
                    }
                });
            } else {
                console.error('loadAddAgentModal function not available');
            }
        });
        
        grid.appendChild(addAgentTile);
    }

    var skillDescModalBody = document.getElementById('skillDescModalBody');
    var skillDescModalLabel = document.getElementById('skillDescModalLabel');

    // Render agent tiles
    var grid = document.getElementById('agentsGrid');
    grid.innerHTML = '';
    fetch(`../agents?userSessionId=${getUserSessionId()}`)
        .then(res => res.json())
        .then(data => {
            const tools = data.tools || [];
            
            // Sort tools by agent name in ascending order
            tools.sort((a, b) => {
                let agentInfoA, agentInfoB;
                try {
                    agentInfoA = JSON.parse(a.function.description);
                } catch (e) {
                    agentInfoA = { agentName: null };
                }
                try {
                    agentInfoB = JSON.parse(b.function.description);
                } catch (e) {
                    agentInfoB = { agentName: null };
                }
                
                // Use agentName from description if available, otherwise fall back to function name
                const nameA = (agentInfoA.agentName || a.function.name).toLowerCase();
                const nameB = (agentInfoB.agentName || b.function.name).toLowerCase();
                
                return nameA.localeCompare(nameB);
            });
            
            // Store existing agent URLs for exchange modal comparison
            window.existingAgentUrls = tools.map(tool => {
                let agentInfo;
                try {
                    agentInfo = JSON.parse(tool.function.description);
                } catch (e) {
                    agentInfo = { agentName: tool.function.name, agentDescription: '', agentSkills: [] };
                }
                return tool.agentUrl || agentInfo.agentUrl || '';
            }).filter(url => url); // Filter out empty URLs
            
            console.log('[Agents] Processing', tools.length, 'agents');
            tools.forEach(tool => {
                let agentInfo;
                try {
                    agentInfo = JSON.parse(tool.function.description);
                } catch (e) {
                    agentInfo = { agentName: tool.function.name, agentDescription: '', agentSkills: [] };
                }
                
                // Get agent URL from the tool object directly
                const agentUrl = tool.agentUrl || agentInfo.agentUrl || '';
                
                const tile = document.createElement('div');
                tile.className = 'agent-tile';
                tile.setAttribute('data-agent-id', tool.function.name);
                tile.setAttribute('data-agent-url', agentUrl);
                
                let skillsHtml = '';
                if (Array.isArray(agentInfo.agentSkills)) {
                    skillsHtml = `<div class="agent-skills">` +
                        agentInfo.agentSkills.map(skill => `<span class="skill-pill" data-skill-name="${encodeURIComponent(skill.name)}" data-skill-desc="${encodeURIComponent(skill.description)}">${skill.name}</span>`).join(' ') +
                        `</div>`;
                }
                
                // Generate icon HTML based on agent URL
                const iconHtml = getAgentIconHtml(agentUrl);
                
                tile.innerHTML = `
                    <button class="delete-agent-btn" title="Delete agent">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="chat-agent-btn" title="Chat with agent">
                        <i class="fas fa-comments"></i>
                    </button>
                    <div class="agent-title">
                        <span class="agent-icon-wrapper" title="Click to edit agent type" style="cursor: pointer;">${iconHtml}</span>
                        ${agentInfo.agentName || tool.function.name}
                    </div>
                    <div class="agent-desc">${agentInfo.agentDescription || ''}</div>
                    ${skillsHtml}
                `;
                grid.appendChild(tile);

                // Add delete button event listener
                const deleteBtn = tile.querySelector('.delete-agent-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const agentId = tile.getAttribute('data-agent-id');
                        
                        // Send DELETE request to remove agent
                        fetch(`../agents?userSessionId=${getUserSessionId()}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                agents: [agentId]
                            })
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to delete agent');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Remove agent type from local storage using URL
                            const agentUrl = tile.getAttribute('data-agent-url');
                            if (agentUrl) {
                                removeAgentTypeFromStorage(agentUrl);
                            }
                            // Refresh the agents list
                            window.attachAgentsTab();
                        })
                        .catch(error => {
                            console.error('Error deleting agent:', error);
                            alert('Failed to delete agent. Please try again.');
                        });
                    });
                }

                // Add chat button event listener
                const chatBtn = tile.querySelector('.chat-agent-btn');
                if (chatBtn) {
                    chatBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const agentId = tile.getAttribute('data-agent-id');
                        const agentName = agentInfo.agentName || tool.function.name;
                        startChatWithAgent(agentId, agentName);
                    });
                }

                // Add icon click event listener for editing agent type
                const iconWrapper = tile.querySelector('.agent-icon-wrapper');
                if (iconWrapper) {
                    iconWrapper.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openEditAgentModal(agentUrl, agentInfo.agentName || tool.function.name, tile, agentInfo, tool);
                    });
                }
            });
            // Add the split tile as the last tile
            const addTile = document.createElement('div');
            addTile.className = 'agent-tile add-agent-tile';
            addTile.id = 'addAgentBtn';
            addTile.title = 'Add new agent / Exchange';
            
            // Create left half (add agent)
            const leftHalf = document.createElement('div');
            leftHalf.className = 'add-agent-left-half';
            leftHalf.innerHTML = '+';
            leftHalf.title = 'Add new agent';
            leftHalf.addEventListener('click', function(e) {
                e.stopPropagation();
                // Store the currently focused element
                window.lastFocusedElement = document.activeElement;
                
                // Reset modal to add mode
                window.resetModalToAddMode();
                
                if (window.addAgentModal) {
                    window.addAgentModal.show();
                } else {
                    // Fallback: manually show the modal
                    console.warn('Using fallback modal show method');
                    const modalEl = document.getElementById('addAgentModal');
                    if (modalEl) {
                        modalEl.classList.add('show');
                        modalEl.style.display = 'block';
                        modalEl.removeAttribute('aria-hidden');
                        modalEl.removeAttribute('inert');
                        // Add backdrop
                        const backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        backdrop.id = 'modalBackdrop';
                        document.body.appendChild(backdrop);
                        
                        // Add click handler to backdrop
                        backdrop.addEventListener('click', function() {
                            const modalEl = document.getElementById('addAgentModal');
                            if (modalEl) {
                                modalEl.classList.remove('show');
                                modalEl.style.display = 'none';
                                modalEl.setAttribute('inert', '');
                                backdrop.remove();
                                // Restore focus
                                if (window.lastFocusedElement) {
                                    window.lastFocusedElement.focus();
                                }
                            }
                        });
                        
                        // Add ESC key handler for fallback modal
                        const handleEscape = function(e) {
                            if (e.key === 'Escape') {
                                const modalEl = document.getElementById('addAgentModal');
                                if (modalEl) {
                                    modalEl.classList.remove('show');
                                    modalEl.style.display = 'none';
                                    modalEl.setAttribute('inert', '');
                                    const backdrop = document.getElementById('modalBackdrop');
                                    if (backdrop) backdrop.remove();
                                    // Restore focus
                                    if (window.lastFocusedElement) {
                                        window.lastFocusedElement.focus();
                                    }
                                    document.removeEventListener('keydown', handleEscape);
                                }
                            }
                        };
                        document.addEventListener('keydown', handleEscape);
                        
                        // Focus the input field when modal opens
                        const inputField = document.getElementById('agentUrlInput');
                        if (inputField) {
                            setTimeout(() => inputField.focus(), 100);
                        }
                    } else {
                        console.error('Add agent modal element not found');
                    }
                }
            });
            
            // Create right half (exchange)
            const rightHalf = document.createElement('div');
            rightHalf.className = 'add-agent-right-half';
            rightHalf.title = 'Anypoint Exchange';
            rightHalf.innerHTML = '<svg width="48" height="48" viewBox="0 0 242 242" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M32.5764 121C32.5764 101.621 38.8152 83.7022 49.3869 69.1305L39.4072 59.1514C26.362 76.3351 18.6149 97.7615 18.6149 121C18.6149 144.239 26.362 165.665 39.4072 182.848L49.3869 172.868C38.8152 158.298 32.5764 140.379 32.5764 121ZM192.613 69.1305L202.593 59.1514C215.639 76.3351 223.385 97.7615 223.385 121C223.385 144.239 215.639 165.665 202.593 182.848L192.613 172.868C203.185 158.298 209.424 140.379 209.424 121C209.424 101.621 203.185 83.7022 192.613 69.1305Z" fill="#114459"></path><path d="M202.593 59.1513L59.1519 202.592C51.7065 196.941 45.0597 190.294 39.4072 182.848L182.849 39.4077C190.294 45.0591 196.941 51.7059 202.593 59.1513Z" fill="#00A3E0"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M107.837 88.0913L59.1514 39.4077C51.707 45.0591 45.0597 51.7059 39.4072 59.1513L88.093 107.836L107.837 88.0913ZM134.164 153.906L153.909 134.163L202.593 182.847C196.941 190.294 190.294 196.941 182.849 202.592L134.164 153.906Z" fill="#087299"></path></svg>';
            rightHalf.addEventListener('click', function(e) {
                e.stopPropagation();
                // Store the currently focused element
                window.lastFocusedElement = document.activeElement;
                
                // Load and show exchange modal
                loadExchangeModal(function() {
                    if (typeof window.renderExchangeModal === 'function') {
                        window.renderExchangeModal();
                    } else {
                        console.error('renderExchangeModal function not available');
                    }
                });
            });
            
            // Append both halves to the tile
            addTile.appendChild(leftHalf);
            addTile.appendChild(rightHalf);
            grid.appendChild(addTile);

            // Attach click listeners to skill pills
            grid.querySelectorAll('.skill-pill').forEach(function(pill) {
                pill.addEventListener('click', function(e) {
                    const skillName = decodeURIComponent(this.getAttribute('data-skill-name'));
                    const skillDesc = decodeURIComponent(this.getAttribute('data-skill-desc'));
                    if (skillDescModalLabel) skillDescModalLabel.textContent = skillName;
                    if (skillDescModalBody) skillDescModalBody.textContent = skillDesc;
                    if (window.skillDescModal) window.skillDescModal.show();
                    e.stopPropagation();
                });
            });

            // Note: The Add button event listener is now handled in add-agent-modal.js
            // to avoid duplication with the addAgent function logic

            // Always clean up existing event listeners first, then add new ones
            // Remove existing event listeners if they exist
            if (window.deleteAllBtnListener) {
                const deleteAllBtn = document.getElementById('deleteAllAgentsBtn');
                if (deleteAllBtn) {
                    deleteAllBtn.removeEventListener('click', window.deleteAllBtnListener);
                }
            }
            
            if (window.addDefaultBtnListener) {
                const addDefaultBtn = document.getElementById('addDefaultAgentsBtn');
                if (addDefaultBtn) {
                    addDefaultBtn.removeEventListener('click', window.addDefaultBtnListener);
                }
            }
            
            // Add event listener for the Delete All button
            const deleteAllBtn = document.getElementById('deleteAllAgentsBtn');
            if (deleteAllBtn) {
                window.deleteAllBtnListener = function() {
                    if (confirm('Are you sure you want to delete all agents? This action cannot be undone.')) {
                        // Get all agent IDs from the current tiles
                        const agentTiles = document.querySelectorAll('.agent-tile[data-agent-id]');
                        const agentIds = Array.from(agentTiles).map(tile => tile.getAttribute('data-agent-id'));
                        
                        if (agentIds.length === 0) {
                            alert('No agents to delete');
                            return;
                        }
                        
                        // Send DELETE request to remove all agents
                        fetch(`../agents?userSessionId=${getUserSessionId()}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                agents: agentIds
                            })
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to delete agents');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Clear all agent types from local storage
                            clearAllAgentTypesFromStorage();
                            // Refresh the agents list
                            window.attachAgentsTab();
                        })
                        .catch(error => {
                            console.error('Error deleting agents:', error);
                            alert('Failed to delete agents. Please try again.');
                        });
                    }
                };
                deleteAllBtn.addEventListener('click', window.deleteAllBtnListener);
            }

            // Add event listener for the Add Default Agents button
            const addDefaultBtn = document.getElementById('addDefaultAgentsBtn');
            if (addDefaultBtn) {
                window.addDefaultBtnListener = function() {
                    if (confirm('Add all default agents?')) {
                        // Prefill local storage with default agent type mappings using URLs
                        Object.entries(window.DEFAULT_AGENT_TYPES).forEach(([agentUrl, agentType]) => {
                            addAgentTypeToStorage(agentUrl, agentType);
                        });
                        
                        // Build agents array with default authentication (none)
                        const defaultAgents = window.PREDEFINED_AGENT_URL.map(url => {
                            const agentType = window.DEFAULT_AGENT_TYPES[url] || 'Custom';
                            return {
                                url: url,
                                agentType: agentType,
                                authentication: {
                                    type: 'none'
                                }
                            };
                        });
                        
                        // Show loading backdrop
                        showLoadingBackdrop();
                        
                        // Send POST request to add all default agents
                        fetch(`../agents?userSessionId=${getUserSessionId()}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                agents: defaultAgents
                            })
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to add default agents');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Hide loading backdrop
                            hideLoadingBackdrop();
                            
                            // Refresh the agents list
                            window.attachAgentsTab();
                        })
                        .catch(error => {
                            console.error('Error adding default agents:', error);
                            alert('Failed to add default agents. Please try again.');
                            // Hide loading backdrop on error
                            hideLoadingBackdrop();
                        });
                    }
                };
                addDefaultBtn.addEventListener('click', window.addDefaultBtnListener);
            }
            
            window.agentsTabInitialized = true;
            
            // Add event listeners for modal close buttons (fallback)
            const cancelBtn = document.querySelector('#addAgentModal .btn-secondary');
            const closeBtn = document.querySelector('#addAgentModal .btn-close');
            const chatModalCloseBtn = document.querySelector('#chatModal .btn-close');
            
            if (cancelBtn) {
                window.cancelBtnListener = function() {
                    // Reset modal to add mode
                    window.resetModalToAddMode();
                    
                    if (window.addAgentModal) {
                        window.addAgentModal.hide();
                    } else {
                        // Fallback: manually hide the modal
                        const modalEl = document.getElementById('addAgentModal');
                        if (modalEl) {
                            modalEl.classList.remove('show');
                            modalEl.style.display = 'none';
                            modalEl.setAttribute('inert', '');
                            // Remove backdrop
                            const backdrop = document.getElementById('modalBackdrop');
                            if (backdrop) {
                                backdrop.remove();
                            }
                        }
                    }
                    // Restore focus
                    if (window.lastFocusedElement) {
                        window.lastFocusedElement.focus();
                    }
                };
                cancelBtn.addEventListener('click', window.cancelBtnListener);
            }
            
            if (closeBtn) {
                window.closeBtnListener = function() {
                    // Reset modal to add mode
                    window.resetModalToAddMode();
                    
                    if (window.addAgentModal) {
                        window.addAgentModal.hide();
                    } else {
                        // Fallback: manually hide the modal
                        const modalEl = document.getElementById('addAgentModal');
                        if (modalEl) {
                            modalEl.classList.remove('show');
                            modalEl.style.display = 'none';
                            modalEl.setAttribute('inert', '');
                            // Remove backdrop
                            const backdrop = document.getElementById('modalBackdrop');
                            if (backdrop) {
                                backdrop.remove();
                            }
                        }
                    }
                    // Restore focus
                    if (window.lastFocusedElement) {
                        window.lastFocusedElement.focus();
                    }
                };
                closeBtn.addEventListener('click', window.closeBtnListener);
            }
            
            if (chatModalCloseBtn) {
                window.chatModalCloseBtnListener = function() {
                    // Clear chat history
                    window.chatMessages = [];
                    window.currentChatAgent = null;
                    window.currentChatSessionId = null;
                    
                    if (window.chatModal) {
                        window.chatModal.hide();
                    } else {
                        // Fallback: manually hide the modal
                        const modalEl = document.getElementById('chatModal');
                        if (modalEl) {
                            modalEl.classList.remove('show');
                            modalEl.style.display = 'none';
                            modalEl.setAttribute('inert', '');
                            // Remove backdrop
                            const backdrop = document.getElementById('chatModalBackdrop');
                            if (backdrop) {
                                backdrop.remove();
                            }
                        }
                    }
                    // Restore focus
                    if (window.lastFocusedElement) {
                        window.lastFocusedElement.focus();
                    }
                };
                chatModalCloseBtn.addEventListener('click', window.chatModalCloseBtnListener);
            }
            
            // Initialize chat functionality
            initializeChatFunctionality();
        });
        
        // Reset the running flag so it can be called again
        window.attachAgentsTab.isRunning = false;
        console.log('[Agents] attachAgentsTab completed');
}

// Initialize chat functionality
function initializeChatFunctionality() {
    const chatInputForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    // Add keyboard event listener for Escape key to close chat modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const chatModal = document.getElementById('chatModal');
            if (chatModal && chatModal.classList.contains('show')) {
                // Clear chat history
                window.chatMessages = [];
                window.currentChatAgent = null;
                window.currentChatSessionId = null;
                
                if (window.chatModal) {
                    window.chatModal.hide();
                } else {
                    // Fallback: manually hide the modal
                    chatModal.classList.remove('show');
                    chatModal.style.display = 'none';
                    chatModal.setAttribute('inert', '');
                    // Remove backdrop
                    const backdrop = document.getElementById('chatModalBackdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                }
                // Restore focus
                if (window.lastFocusedElement) {
                    window.lastFocusedElement.focus();
                }
            }
        }
    });
    
    if (chatInputForm) {
        chatInputForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleChatSubmit();
        });
    }
    
    if (chatInput) {
        // Auto-resize textarea
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
        
        // Handle Enter key (send on Enter, new line on Shift+Enter)
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmit();
            }
        });
    }
}

// Handle chat form submission
function handleChatSubmit() {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    if (!chatInput || !window.currentChatAgent) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Disable send button and input during sending
    if (chatSendBtn) chatSendBtn.disabled = true;
    if (chatInput) chatInput.disabled = true;
    
    // Add user message to chat
    addChatMessage(message, true);
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Send message to agent
    sendMessageToAgent(message).finally(() => {
        // Re-enable send button and input
        if (chatSendBtn) chatSendBtn.disabled = false;
        if (chatInput) {
            chatInput.disabled = false;
            chatInput.focus();
        }
    });
}

// Function to test typing indicator visibility
function testTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        setTimeout(() => {
            typingIndicator.style.display = 'none';
        }, 3000);
    } else {
        console.error('Typing indicator not found for testing');
    }
}

// Make it available globally for testing
window.testTypingIndicator = testTypingIndicator;

// Function to debug agent types storage
function debugAgentTypesStorage() {
    console.log('[Agents] Debug: Agent types in storage:', Object.keys(getAgentTypesFromStorage()).length);
}

// Function to open edit agent modal
function openEditAgentModal(agentUrl, agentName, tileElement, agentInfo, tool) {
    console.log('[Agents] Opening edit modal for agent:', agentName);
    // Store the currently focused element
    window.lastFocusedElement = document.activeElement;
    
    // Update modal title
    const modalTitle = document.getElementById('addAgentModalLabel');
    if (modalTitle) {
        modalTitle.textContent = `Edit Agent - ${agentName}`;
    }
    
    // Pre-fill the URL input and disable it
    const agentUrlInput = document.getElementById('agentUrlInput');
    if (agentUrlInput) {
        agentUrlInput.value = agentUrl;
        agentUrlInput.disabled = true;
        agentUrlInput.style.backgroundColor = '#f8f9fa';
    }
    
    // Hide the entire Agent URL section in edit mode since URL cannot be edited
    const agentUrlSection = document.getElementById('agentUrlSection');
    if (agentUrlSection) {
        agentUrlSection.style.display = 'none';
    }
    
    // Pre-fill the agent type select with current value and enable it since URL is present
    const agentTypeSelect = document.getElementById('agentTypeSelect');
    if (agentTypeSelect) {
        const currentAgentType = getAgentTypeForUrl(agentUrl);
        agentTypeSelect.value = currentAgentType || '';
        agentTypeSelect.disabled = false;
        agentTypeSelect.style.backgroundColor = '';
    }
    
    // Pre-fill authentication parameters with current values
    if (tool && tool.agentAuthentication) {
        const authenticationSelect = document.getElementById('authenticationSelect');
        const clientIdInput = document.getElementById('clientIdInput');
        const clientSecretInput = document.getElementById('clientSecretInput');
        const tokenUrlInput = document.getElementById('tokenUrlInput');
        const encodeClientCredentialsInBodySelect = document.getElementById('encodeClientCredentialsInBodySelect');
        const clientCredentialsFields = document.getElementById('clientCredentialsFields');
        
        if (authenticationSelect && tool.agentAuthentication.type) {
            authenticationSelect.value = tool.agentAuthentication.type;
        }
        if (clientIdInput && tool.agentAuthentication.clientId) {
            clientIdInput.value = tool.agentAuthentication.clientId;
        }
        if (clientSecretInput && tool.agentAuthentication.clientSecret) {
            clientSecretInput.value = tool.agentAuthentication.clientSecret;
        }
        if (tokenUrlInput && tool.agentAuthentication.tokenUrl) {
            tokenUrlInput.value = tool.agentAuthentication.tokenUrl;
        }
        if (encodeClientCredentialsInBodySelect && tool.agentAuthentication.encodeClientCredentialsInBody !== undefined) {
            encodeClientCredentialsInBodySelect.value = tool.agentAuthentication.encodeClientCredentialsInBody ? 'true' : 'false';
        }
        
        // Show/hide client credentials fields based on authentication type
        if (tool.agentAuthentication.type === 'client-credentials') {
            if (clientCredentialsFields) {
                clientCredentialsFields.style.display = 'block';
            }
        } else {
            if (clientCredentialsFields) {
                clientCredentialsFields.style.display = 'none';
            }
        }
    }
    
    // Disable authentication parameters in edit mode
    const authenticationSelect = document.getElementById('authenticationSelect');
    const clientIdInput = document.getElementById('clientIdInput');
    const clientSecretInput = document.getElementById('clientSecretInput');
    const tokenUrlInput = document.getElementById('tokenUrlInput');
    const encodeClientCredentialsInBodySelect = document.getElementById('encodeClientCredentialsInBodySelect');
    const authenticationHelpText = document.getElementById('authenticationHelpText');
    const clientCredentialsFields = document.getElementById('clientCredentialsFields');
    
    if (authenticationSelect) {
        authenticationSelect.disabled = true;
        authenticationSelect.style.backgroundColor = '#f8f9fa';
        // If this is a predefined (default) agent, hide the selector and show help text
        if (isPredefinedAgentUrl(agentUrl)) {
            authenticationSelect.style.display = 'none';
            if (authenticationHelpText) authenticationHelpText.style.display = 'block';
            if (clientCredentialsFields) clientCredentialsFields.style.display = 'none';
        } else {
            // Custom agents: ensure selector is visible and help text hidden
            authenticationSelect.style.display = 'block';
            if (authenticationHelpText) authenticationHelpText.style.display = 'none';
        }
    }
    if (clientIdInput) {
        clientIdInput.disabled = true;
        clientIdInput.style.backgroundColor = '#f8f9fa';
    }
    if (clientSecretInput) {
        clientSecretInput.disabled = true;
        clientSecretInput.style.backgroundColor = '#f8f9fa';
    }
    if (tokenUrlInput) {
        tokenUrlInput.disabled = true;
        tokenUrlInput.style.backgroundColor = '#f8f9fa';
    }
    if (encodeClientCredentialsInBodySelect) {
        encodeClientCredentialsInBodySelect.disabled = true;
        encodeClientCredentialsInBodySelect.style.backgroundColor = '#f8f9fa';
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
    
    // Hide the Authentication tab in edit mode since only agent type can be edited
    const authTabBtn = document.getElementById('authentication-tab');
    if (authTabBtn) {
        authTabBtn.style.display = 'none';
    }
    
    // Store reference to the tile element for updating later
    window.currentEditingTile = tileElement;
    window.currentEditingAgentUrl = agentUrl;
    
    // Show the modal
    if (window.addAgentModal) {
        window.addAgentModal.show();
    } else {
        // Fallback: manually show the modal
        console.warn('Using fallback modal show method for edit');
        const modalEl = document.getElementById('addAgentModal');
        if (modalEl) {
            modalEl.classList.add('show');
            modalEl.style.display = 'block';
            modalEl.removeAttribute('aria-hidden');
            modalEl.removeAttribute('inert');
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.id = 'modalBackdrop';
            document.body.appendChild(backdrop);
            
            // Add click handler to backdrop
            backdrop.addEventListener('click', function() {
                const modalEl = document.getElementById('addAgentModal');
                if (modalEl) {
                    modalEl.classList.remove('show');
                    modalEl.style.display = 'none';
                    modalEl.setAttribute('inert', '');
                    backdrop.remove();
                    // Restore focus
                    if (window.lastFocusedElement) {
                        window.lastFocusedElement.focus();
                    }
                }
            });
        }
    }
    
    // Focus the agent type select when modal opens
    if (agentTypeSelect) {
        setTimeout(() => agentTypeSelect.focus(), 100);
    }
}

// Function to reset modal to add mode
window.resetModalToAddMode = function() {
    // Update modal title back to add mode
    const modalTitle = document.getElementById('addAgentModalLabel');
    if (modalTitle) {
        modalTitle.textContent = 'Add New Agent';
    }
    
    // Enable and clear the URL input
    const agentUrlInput = document.getElementById('agentUrlInput');
    if (agentUrlInput) {
        agentUrlInput.value = '';
        agentUrlInput.disabled = false;
        agentUrlInput.style.backgroundColor = '';
    }
    
    // Show the entire Agent URL section in add mode
    const agentUrlSection = document.getElementById('agentUrlSection');
    if (agentUrlSection) {
        agentUrlSection.style.display = 'block';
    }
    
    // Reset exchange asset pill state
    const exchangeAssetPill = document.getElementById('exchangeAssetPill');
    const agentUrlInputGroup = document.getElementById('agentUrlInputGroup');
    if (exchangeAssetPill && agentUrlInputGroup) {
        exchangeAssetPill.style.display = 'none';
        agentUrlInputGroup.style.display = 'flex';
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
    }
    
    // Clear and disable the agent type select
    const agentTypeSelect = document.getElementById('agentTypeSelect');
    if (agentTypeSelect) {
        agentTypeSelect.value = '';
        agentTypeSelect.disabled = true;
        agentTypeSelect.style.backgroundColor = '#f8f9fa';
    }
    
    // Reset authentication fields
    const authenticationSelect = document.getElementById('authenticationSelect');
    if (authenticationSelect) {
        authenticationSelect.value = 'none';
        authenticationSelect.style.display = 'block'; // Ensure it's visible
        authenticationSelect.disabled = true; // Keep disabled initially (same behavior as agent type)
        authenticationSelect.style.backgroundColor = '#f8f9fa'; // Set disabled background color
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
}

// Function to add a new agent
function addAgent(agentData) {
    console.log('[Agents] Adding new agent:', agentData.agentUrl);
    // Prepare the agent data for the API call in the format expected by the backend
    const agentObject = {
        url: agentData.agentUrl,
        agentType: agentData.agentType,
        authentication: {
            type: agentData.authenticationType || 'none'
        }
    };
    
    // Add client credentials if authentication type is client-credentials
    if (agentData.authenticationType === 'client-credentials') {
        agentObject.authentication.clientId = agentData.clientId;
        agentObject.authentication.clientSecret = agentData.clientSecret;
        agentObject.authentication.tokenUrl = agentData.tokenUrl;
        agentObject.authentication.encodeClientCredentialsInBody = agentData.encodeClientCredentialsInBody || 'false';
    }
    
    // Add exchange asset information if this is an exchange asset
    if (agentData.isExchangeAsset) {
        agentObject.isExchangeAsset = true;
        agentObject.exchangeAssetName = agentData.exchangeAssetName;
    }
    
    // The backend expects an array of agents
    const requestData = {
        agents: [agentObject]
    };
    
    // Call the backend to add the agent using the correct endpoint pattern
    fetch(`../agents?userSessionId=${getUserSessionId()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Hide loading backdrop
        if (typeof window.hideLoadingBackdrop === 'function') {
            window.hideLoadingBackdrop();
        }
        
        // Store the agent type in localStorage if the function exists
        if (window.addAgentTypeToStorage) {
            window.addAgentTypeToStorage(agentData.agentUrl, agentData.agentType);
        }
        
        // Hide the modal if it exists
        if (window.addAgentModal) {
            window.addAgentModal.hide();
        }
        
        // Try to refresh the agents tab if the function exists
        if (typeof window.attachAgentsTab === 'function') {
            window.attachAgentsTab();
        }
    })
    .catch(error => {
        console.error('[Agents] Error adding agent:', error);
        
        // Hide loading backdrop on error too
        if (typeof window.hideLoadingBackdrop === 'function') {
            window.hideLoadingBackdrop();
        }
        
        alert('Error adding agent. Please try again.');
    });
}

// Make addAgent function globally available
window.addAgent = addAgent;

// Make openEditAgentModal function globally available
window.openEditAgentModal = openEditAgentModal;