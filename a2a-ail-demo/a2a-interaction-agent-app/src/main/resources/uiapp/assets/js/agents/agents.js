// Centralized default agent URLs for maintainability
window.PREDEFINED_AGENT_URL = window.PREDEFINED_AGENT_URL || [
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/erp-agent",
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/crm-agent",
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/agentforce-agent",
    "https://mac-managed-fxgw-fjrr5q.zm3ejw.usa-e2.cloudhub.io/einstein-agent"
];

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
    console.log('addAgentTypeToStorage called with:', { agentUrl, agentType });
    const agentTypes = getAgentTypesFromStorage();
    console.log('Current agent types in storage:', agentTypes);
    agentTypes[agentUrl] = agentType;
    console.log('Updated agent types:', agentTypes);
    saveAgentTypesToStorage(agentTypes);
    console.log('Agent type saved to storage');
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
    console.log('Clearing all agent types from storage');
    localStorage.removeItem(AGENT_TYPES_STORAGE_KEY);
    console.log('All agent types cleared from storage');
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
    console.log('getAgentTypeForUrl called with:', agentUrl);
    const agentTypes = getAgentTypesFromStorage();
    console.log('All agent types in storage:', agentTypes);
    
    // Try exact match first
    if (agentTypes[agentUrl]) {
        console.log('Found exact match for URL:', agentUrl);
        return agentTypes[agentUrl];
    }
    
    // Try normalized URL matching (remove trailing slashes)
    const normalizedUrl = agentUrl.replace(/\/$/, '');
    for (const [storedUrl, agentType] of Object.entries(agentTypes)) {
        const normalizedStoredUrl = storedUrl.replace(/\/$/, '');
        if (normalizedStoredUrl === normalizedUrl) {
            console.log('Found normalized match for URL:', agentUrl, '->', storedUrl);
            return agentType;
        }
    }
    
    // Try partial URL matching (in case of protocol differences)
    for (const [storedUrl, agentType] of Object.entries(agentTypes)) {
        if (agentUrl.includes(storedUrl) || storedUrl.includes(agentUrl)) {
            console.log('Found partial match for URL:', agentUrl, '->', storedUrl);
            return agentType;
        }
    }
    
    console.log('No agent type found for URL:', agentUrl);
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
window.lastFocusedElement = null; // Store the element that had focus before modal opened

// Chat state variables
window.currentChatAgent = null;
window.chatMessages = [];

// Event listener references for cleanup
window.addAgentConfirmBtnListener = null;
window.deleteAllBtnListener = null;
window.addDefaultBtnListener = null;
window.cancelBtnListener = null;
window.closeBtnListener = null;

// Reset initialization state when content is reloaded
function resetAgentsTabState() {
    window.agentsTabInitialized = false;
    window.addAgentModal = null;
    window.skillDescModal = null;
    window.chatModal = null;
    window.lastFocusedElement = null;
    
    // Remove old event listeners if they exist
    if (window.addAgentConfirmBtnListener) {
        const addAgentConfirmBtn = document.getElementById('saveAgentBtn');
        if (addAgentConfirmBtn) {
            addAgentConfirmBtn.removeEventListener('click', window.addAgentConfirmBtnListener);
        }
        window.addAgentConfirmBtnListener = null;
    }
    
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

// Function to get agent icon HTML
function getAgentIconHtml(agentUrl) {
    console.log('getAgentIconHtml called with agentUrl:', agentUrl);
    
    if (!agentUrl || agentUrl.trim() === '') {
        console.log('No agent URL provided, using default robot icon');
        return `<i class='fas fa-robot tile-robot-icon'></i>`;
    }
    
    const agentType = getAgentTypeForUrl(agentUrl);
    console.log('Found agent type for URL:', agentType);
    
    const iconUrl = window.AGENT_TYPE_ICONS[agentType];
    console.log('Icon URL for agent type:', iconUrl);
    
    if (!agentType || agentType === "Custom") {
        console.log('Using default robot icon for agent type:', agentType);
        return `<i class='fas fa-robot tile-robot-icon'></i>`;
    } else if (iconUrl) {
        console.log('Using custom icon for agent type:', agentType);
        return `<img src="${iconUrl}" alt="${agentType}" class="agent-type-icon" style="width: clamp(32px, 2vw, 60px); height: auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                <i class='fas fa-robot tile-robot-icon' style="display:none;"></i>`;
    } else {
        console.log('No icon URL found, using default robot icon');
        return `<i class='fas fa-robot tile-robot-icon'></i>`;
    }
}

// Function to start a chat with a specific agent
function startChatWithAgent(agentId, agentName) {
    // Store the currently focused element for later restoration
    window.lastFocusedElement = document.activeElement;
    
    // Set current chat agent
    window.currentChatAgent = agentId;
    window.chatMessages = [];
    
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
    if (!window.currentChatAgent) {
        console.error('No agent selected for chat');
        return;
    }
    
    // Show typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        console.log('Showing typing indicator');
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
        const response = await fetch(`../prompt-agent?agentName=${encodeURIComponent(window.currentChatAgent)}&userSessionId=${getUserSessionId()}`, {
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

// Initialize modals
function initializeModals() {
    // Add retry counter to prevent infinite loops
    if (!window.modalInitRetryCount) {
        window.modalInitRetryCount = 0;
    }
    
    var modalEl = document.getElementById('addAgentModal');
    var skillModalEl = document.getElementById('skillDescModal');
    var chatModalEl = document.getElementById('chatModal');
    
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
        
        console.log('Modals initialized successfully');
        // Reset retry counter on success
        window.modalInitRetryCount = 0;
            } catch (error) {
                console.error('Error initializing modals:', error);
                // Don't retry on initialization error
            }
        } else {
            // Only retry if we haven't exceeded the limit
            if (window.modalInitRetryCount < 50) { // Max 5 seconds of retries
                console.warn('Bootstrap Modal class not available, retrying in 100ms... (attempt ' + (window.modalInitRetryCount + 1) + '/50)');
                window.modalInitRetryCount++;
                setTimeout(initializeModals, 100);
            } else {
                console.error('Failed to initialize modals after 50 attempts. Bootstrap may not be loaded.');
                window.modalInitRetryCount = 0; // Reset for next time
            }
        }
    } else {
        // Only retry if we haven't exceeded the limit
        if (window.modalInitRetryCount < 50) { // Max 5 seconds of retries
            console.warn('Modal elements not found, retrying in 100ms... (attempt ' + (window.modalInitRetryCount + 1) + '/50)');
            window.modalInitRetryCount++;
            setTimeout(initializeModals, 100);
        } else {
            console.error('Failed to find modal elements after 50 attempts. HTML may not be loaded.');
            window.modalInitRetryCount = 0; // Reset for next time
        }
    }
}

window.attachAgentsTab = function() {
    // Reset state to ensure proper re-initialization
    resetAgentsTabState();
    
    // Debug agent types storage
    debugAgentTypesStorage();
    
    // Initialize modals first
    initializeModals();
    
    // Add authentication select event listener
    const authenticationSelect = document.getElementById('authenticationSelect');
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
                if (tokenUrlInput) tokenUrlInput.value = '';
                if (encodeClientCredentialsInBodySelect) encodeClientCredentialsInBodySelect.value = 'false';
            }
        });
    }
    
    // Add agent URL input event listener to handle authentication section visibility
    const agentUrlInput = document.getElementById('agentUrlInput');
    if (agentUrlInput) {
        agentUrlInput.addEventListener('input', function() {
            const authenticationSection = document.querySelector('.mb-3:has(#authenticationSelect)');
            const authenticationLabel = document.querySelector('label[for="authenticationSelect"]');
            const authenticationHelpText = document.getElementById('authenticationHelpText');
            
            if (isPredefinedAgentUrl(this.value.trim())) {
                // Hide authentication select and show help text for predefined agents
                if (authenticationSelect) {
                    authenticationSelect.style.display = 'none';
                }
                if (authenticationHelpText) {
                    authenticationHelpText.style.display = 'block';
                }
                // Hide client credentials fields if they were visible
                const clientCredentialsFields = document.getElementById('clientCredentialsFields');
                if (clientCredentialsFields) {
                    clientCredentialsFields.style.display = 'none';
                }
            } else {
                // Show authentication select and hide help text for custom agents
                if (authenticationSelect) {
                    authenticationSelect.style.display = 'block';
                }
                if (authenticationHelpText) {
                    authenticationHelpText.style.display = 'none';
                }
            }
        });
    }
    
    // Populate datalist with default URLs
    const datalist = document.getElementById('agentUrlOptions');
    if (datalist) {
        datalist.innerHTML = '';
        window.PREDEFINED_AGENT_URL.forEach(url => {
            const option = document.createElement('option');
            option.value = url;
            datalist.appendChild(option);
        });
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
            
            tools.forEach(tool => {
                let agentInfo;
                try {
                    agentInfo = JSON.parse(tool.function.description);
                } catch (e) {
                    agentInfo = { agentName: tool.function.name, agentDescription: '', agentSkills: [] };
                }
                
                // Get agent URL from the tool object directly
                const agentUrl = tool.agentUrl || agentInfo.agentUrl || '';
                console.log('Processing agent:', tool.function.name, 'with URL:', agentUrl);
                
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
                        openEditAgentModal(agentUrl, agentInfo.agentName || tool.function.name, tile);
                    });
                }
            });
            // Add the + tile as the last tile
            const addTile = document.createElement('div');
            addTile.className = 'agent-tile add-agent-tile';
            addTile.id = 'addAgentBtn';
            addTile.title = 'Add new agent';
            addTile.innerHTML = '+';
            addTile.addEventListener('click', function() {
                // Store the currently focused element
                window.lastFocusedElement = document.activeElement;
                
                // Reset modal to add mode
                resetModalToAddMode();
                
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

            // Add event listener for the Add button only once
            if (!window.agentsTabInitialized) {
                const addAgentConfirmBtn = document.getElementById('saveAgentBtn');
                if (addAgentConfirmBtn) {
                    window.addAgentConfirmBtnListener = function() {
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
                        
                        if (!agentUrl || !agentType) {
                            alert('Please fill in all required fields');
                            return;
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
                            console.log('Processing edit mode for agent URL:', window.currentEditingAgentUrl);
                            
                            // Update the agent type in localStorage
                            addAgentTypeToStorage(agentUrl, agentType);
                            
                            // Update the icon in the tile
                            const iconWrapper = window.currentEditingTile.querySelector('.agent-icon-wrapper');
                            if (iconWrapper) {
                                const newIconHtml = getAgentIconHtml(agentUrl);
                                iconWrapper.innerHTML = newIconHtml;
                                console.log('Updated icon for agent:', agentUrl);
                            }
                            
                            // Reset modal to add mode
                            resetModalToAddMode();
                            
                            // Hide the modal
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
                            
                            return; // Exit early for edit mode
                        }
                        
                        // Original add mode logic
                        // Build authentication object
                        const authentication = {
                            type: authenticationType
                        };
                        
                        // Add client credentials if authentication type is client-credentials
                        if (authenticationType === 'client-credentials') {
                            authentication.clientId = clientIdInput.value.trim();
                            authentication.clientSecret = clientSecretInput.value.trim();
                            authentication.tokenUrl = tokenUrlInput.value.trim();
                            authentication.encodeClientCredentialsInBody = (encodeClientCredentialsInBodySelect && encodeClientCredentialsInBodySelect.value === 'true');
                        }
                        
                        // Build agent object
                        const agent = {
                            url: agentUrl,
                            agentType: agentType,
                            authentication: authentication
                        };
                        
                        // Show loading backdrop
                        showLoadingBackdrop();
                        
                        // Send POST request to add agent
                        fetch(`../agents?userSessionId=${getUserSessionId()}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                agents: [agent]
                            })
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to add agent');
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('POST response data:', data);
                            
                            // After successful POST, save the function name and selected type to storage
                            if (data.tools && data.tools.length > 0) {
                                console.log('Found tools in response:', data.tools.length);
                                
                                // Find the newly added agent by matching the URL
                                let agentFound = false;
                                data.tools.forEach(tool => {
                                    console.log('Checking tool:', tool.function.name);
                                    
                                    let agentInfo;
                                    try {
                                        agentInfo = JSON.parse(tool.function.description);
                                        console.log('Parsed agentInfo:', agentInfo);
                                    } catch (e) {
                                        agentInfo = { agentName: tool.function.name, agentDescription: '', agentSkills: [] };
                                        console.log('Failed to parse agentInfo, using default');
                                    }
                                    
                                    // Check if this agent matches the URL we just added
                                    const normalizedAgentUrl = agentUrl.replace(/\/$/, ''); // Remove trailing slash
                                    const normalizedInfoUrl = (agentInfo.agentUrl || '').replace(/\/$/, ''); // Remove trailing slash
                                    
                                    if (normalizedInfoUrl === normalizedAgentUrl) {
                                        console.log('Found matching agent by URL:', { functionName: tool.function.name, agentType: agentType });
                                        
                                        // Check if there's already a mapping for this function name
                                        const existingType = getAgentTypeForFunction(tool.function.name);
                                        if (existingType) {
                                            console.log('Updating existing agent type mapping:', { 
                                                functionName: tool.function.name, 
                                                oldType: existingType, 
                                                newType: agentType 
                                            });
                                        } else {
                                            console.log('Creating new agent type mapping:', { 
                                                functionName: tool.function.name, 
                                                agentType: agentType 
                                            });
                                        }
                                        
                                        addAgentTypeToStorage(agentUrl, agentType);
                                        agentFound = true;
                                    }
                                });
                                
                                // Fallback: if no agent found by URL, save the last tool (most likely the newly added one)
                                if (!agentFound && data.tools.length > 0) {
                                    const lastTool = data.tools[data.tools.length - 1];
                                    console.log('Fallback: saving agent type for last tool:', { functionName: lastTool.function.name, agentType: agentType });
                                    
                                    // Check if there's already a mapping for this function name
                                    const existingType = getAgentTypeForFunction(lastTool.function.name);
                                    if (existingType) {
                                        console.log('Fallback: Updating existing agent type mapping:', { 
                                            functionName: lastTool.function.name, 
                                            oldType: existingType, 
                                            newType: agentType 
                                        });
                                    }
                                    
                                    addAgentTypeToStorage(agentUrl, agentType);
                                }
                            } else {
                                console.warn('No tools found in response or response structure is unexpected');
                            }
                            
                            // Clear the input fields
                            agentUrlInput.value = '';
                            agentTypeSelect.value = '';
                            
                            // Clear authentication fields
                            if (authenticationSelect) {
                                authenticationSelect.value = 'none';
                            }
                            if (clientIdInput) {
                                clientIdInput.value = '';
                            }
                            if (clientSecretInput) {
                                clientSecretInput.value = '';
                            }
                            if (tokenUrlInput) {
                                tokenUrlInput.value = '';
                            }
                            if (encodeClientCredentialsInBodySelect) {
                                encodeClientCredentialsInBodySelect.value = 'false';
                            }
                            
                            // Hide client credentials fields
                            const clientCredentialsFields = document.getElementById('clientCredentialsFields');
                            if (clientCredentialsFields) {
                                clientCredentialsFields.style.display = 'none';
                            }
                            // Hide the modal
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
                            // Hide loading backdrop
                            hideLoadingBackdrop();
                            
                            // Refresh the agents list
                            window.attachAgentsTab();
                        })
                        .catch(error => {
                            console.error('Error adding agent:', error);
                            alert('Failed to add agent. Please try again.');
                            // Hide loading backdrop on error
                            hideLoadingBackdrop();
                        });
                    };
                    addAgentConfirmBtn.addEventListener('click', window.addAgentConfirmBtnListener);
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
            }
            
            // Add event listeners for modal close buttons (fallback)
            const cancelBtn = document.querySelector('#addAgentModal .btn-secondary');
            const closeBtn = document.querySelector('#addAgentModal .btn-close');
            const chatModalCloseBtn = document.querySelector('#chatModal .btn-close');
            
            if (cancelBtn) {
                window.cancelBtnListener = function() {
                    // Reset modal to add mode
                    resetModalToAddMode();
                    
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
                    resetModalToAddMode();
                    
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
        console.log('Testing typing indicator - showing it');
        typingIndicator.style.display = 'flex';
        setTimeout(() => {
            console.log('Hiding typing indicator');
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
    console.log('=== Agent Types Storage Debug ===');
    const agentTypes = getAgentTypesFromStorage();
    console.log('All stored agent types:', agentTypes);
    console.log('Default agent types mapping:', window.DEFAULT_AGENT_TYPES);
    console.log('Predefined agent URLs:', window.PREDEFINED_AGENT_URL);
    console.log('================================');
}

// Function to open edit agent modal
function openEditAgentModal(agentUrl, agentName, tileElement) {
    console.log('Opening edit modal for agent:', agentName, 'with URL:', agentUrl);
    
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
    
    // Pre-fill the agent type select with current value
    const agentTypeSelect = document.getElementById('agentTypeSelect');
    if (agentTypeSelect) {
        const currentAgentType = getAgentTypeForUrl(agentUrl);
        agentTypeSelect.value = currentAgentType || '';
        console.log('Pre-filled agent type:', currentAgentType);
    }
    
    // Disable authentication parameters in edit mode
    const authenticationSelect = document.getElementById('authenticationSelect');
    const clientIdInput = document.getElementById('clientIdInput');
    const clientSecretInput = document.getElementById('clientSecretInput');
    const tokenUrlInput = document.getElementById('tokenUrlInput');
    const encodeClientCredentialsInBodySelect = document.getElementById('encodeClientCredentialsInBodySelect');
    
    if (authenticationSelect) {
        authenticationSelect.disabled = true;
        authenticationSelect.style.backgroundColor = '#f8f9fa';
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
function resetModalToAddMode() {
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
    
    // Clear the agent type select
    const agentTypeSelect = document.getElementById('agentTypeSelect');
    if (agentTypeSelect) {
        agentTypeSelect.value = '';
    }
    
    // Reset authentication fields
    const authenticationSelect = document.getElementById('authenticationSelect');
    if (authenticationSelect) {
        authenticationSelect.value = 'none';
        authenticationSelect.style.display = 'block'; // Ensure it's visible
        authenticationSelect.disabled = false; // Re-enable in add mode
        authenticationSelect.style.backgroundColor = ''; // Reset background color
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