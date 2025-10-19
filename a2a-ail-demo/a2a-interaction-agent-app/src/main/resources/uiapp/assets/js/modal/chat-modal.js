// Chat Modal JavaScript
// This file contains all the functionality for the Chat modal

// Chat state variables
window.currentChatAgent = null;
window.chatMessages = [];

// Function to initialize the Chat modal
function initializeChatModal() {
    console.log('[Chat Modal] Initializing modal');
    
    // Initialize chat functionality
    initializeChatFunctionality();
    
    console.log('[Chat Modal] Modal initialized successfully');
}

// Function to start a chat with a specific agent
function startChatWithAgent(agentId, agentName) {
    console.log('[Chat Modal] Starting chat with agent:', agentId, agentName);
    
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
        console.warn('[Chat Modal] Using fallback chat modal show method');
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
        console.error('[Chat Modal] No agent selected for chat');
        return;
    }
    
    // Show typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        console.log('[Chat Modal] Showing typing indicator');
        typingIndicator.style.display = 'flex';
        // Ensure it's visible and scroll to it
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
        }
    } else {
        console.error('[Chat Modal] Typing indicator not found');
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
        } else if (data.agentTaskResponse &&
            data.agentTaskResponse.artifacts &&
            Array.isArray(data.agentTaskResponse.artifacts) &&
            data.agentTaskResponse.artifacts.length > 0 &&
            data.agentTaskResponse.artifacts[0] &&
            data.agentTaskResponse.artifacts[0].parts &&
            Array.isArray(data.agentTaskResponse.artifacts[0].parts) &&
            data.agentTaskResponse.artifacts[0].parts.length > 0 &&
            data.agentTaskResponse.artifacts[0].parts[0] &&
            typeof data.agentTaskResponse.artifacts[0].parts[0].text === 'string') {
            agentResponse = data.agentTaskResponse.artifacts[0].parts[0].text;
        } else if (data.response) {
            agentResponse = data.response;
        } else if (data.message) {
            agentResponse = data.message;
        }
        
        addChatMessage(agentResponse, false);
        
    } catch (error) {
        console.error('[Chat Modal] Error sending message to agent:', error);
        
        // Hide typing indicator
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        // Add error message
        addChatMessage('Sorry, there was an error communicating with the agent. Please try again.', false);
    }
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
        console.log('[Chat Modal] Testing typing indicator - showing it');
        typingIndicator.style.display = 'flex';
        setTimeout(() => {
            console.log('[Chat Modal] Hiding typing indicator');
            typingIndicator.style.display = 'none';
        }, 3000);
    } else {
        console.error('[Chat Modal] Typing indicator not found for testing');
    }
}

// Make functions globally available
window.startChatWithAgent = startChatWithAgent;
window.addChatMessage = addChatMessage;
window.sendMessageToAgent = sendMessageToAgent;
window.testTypingIndicator = testTypingIndicator;
