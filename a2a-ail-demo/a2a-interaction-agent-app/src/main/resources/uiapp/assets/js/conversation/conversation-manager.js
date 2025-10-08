// ============================================================================
// CONVERSATION-MANAGER.JS - Conversation functionality for the Host Agent
// ============================================================================

// Create a namespace for conversation functionality
window.ConversationManager = (function() {
    // ----------------------------------------------------------------------------
    // PRIVATE VARIABLES
    // ----------------------------------------------------------------------------
    
    let websocket = null;
    let currentReasoningUpdates = [];
    let responseReasoningMap = new Map();
    let typingIntervalId = null;
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

    // Session ID logic for conversation
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // ----------------------------------------------------------------------------
    // WEBSOCKET CONNECTION MANAGEMENT
    // ----------------------------------------------------------------------------

    function createWebSocketConnection(sessionId, messageHandler) {
        // Close any existing connection before creating a new one
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            console.log('Closing existing WebSocket before creating new connection');
            websocket.close(1000, 'Normal closure');
        }
        websocket = null;
        
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        }
        
        const userSessionId = getCookie('userSessionId');
        const url = new URL(window.location.href);
        // Find the /ui/ segment and get the parent path above /ui/
        const pathSegments = url.pathname.split("/");
        const uiIndex = pathSegments.indexOf("ui");
        let parentPath;
        if (uiIndex !== -1) {
            // Take everything up to (but not including) "ui" to get the parent path
            const validSegments = pathSegments.slice(1, uiIndex).filter(segment => segment !== "");
            if (validSegments.length > 0) {
                parentPath = "/" + validSegments.join("/") + "/";
            } else {
                parentPath = "/";
            }
        } else {
            // Fallback: remove trailing slash, split, and drop last segment
            const segments = url.pathname.replace(/\/$/, "").split("/");
            segments.pop();
            parentPath = segments.join("/") + "/";
        }
        const wsUrl = new URL(parentPath + 'ws/prompt', window.location.origin);
        wsUrl.searchParams.set('userSessionId', userSessionId || '');
        wsUrl.searchParams.set('sessionId', sessionId);
        
        console.log('Creating WebSocket connection to:', wsUrl.toString());
        websocket = new WebSocket(wsUrl);
        
        websocket.onopen = function(event) {
            console.log('WebSocket connection established');
        };
        
        websocket.onmessage = messageHandler;
        
        websocket.onerror = function(error) {
            console.error('WebSocket error:', error);
            // Close the connection on error to ensure clean state
            if (websocket && websocket.readyState === WebSocket.OPEN) {
                websocket.close(1000, 'Normal closure');
                websocket = null;
            }
            if (messageHandler) {
                messageHandler({ data: JSON.stringify({ error: 'Connection error' }) });
            }
        };
        
        websocket.onclose = function(event) {
            console.log('WebSocket connection closed:', event.code, event.reason);
            if (websocket === this) {
                websocket = null;
            }
        };
        
        return websocket;
    }

    // ----------------------------------------------------------------------------
    // MESSAGE HANDLING
    // ----------------------------------------------------------------------------

    function handleWebSocketMessage(event) {
        if (event.data) {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                
                if (data.type === 'update') {
                    const updateObj = {
                        content: data.content,
                        timestamp: data.timestamp || new Date().toISOString()
                    };
                    currentReasoningUpdates.push(updateObj);
                    updateTypingMessageWithReasoning();
                    const chatMessages = document.getElementById('chatMessages');
                    if (chatMessages) {
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                } else if ('response' in data) {
                    const hasContent = typeof data.response === 'string' ? data.response.trim().length > 0 : !!data.response;
                    const safeResponse = hasContent
                        ? (typeof data.response === 'string' ? data.response : (() => { try { return JSON.stringify(data.response); } catch(e) { return String(data.response); } })())
                        : 'No response from agent.';
                    const responseId = generateUUID();
                    responseReasoningMap.set(responseId, [...currentReasoningUpdates]);
                    addMessage(safeResponse, false, data, true, responseId);
                    
                    const sessionHistory = JSON.parse(localStorage.getItem('agent_sessions') || '[]');
                    sessionHistory.push({
                        interactionId: generateUUID(),
                        timestamp: new Date().toISOString(),
                        data: data
                    });
                    localStorage.setItem('agent_sessions', JSON.stringify(sessionHistory));
                    
                    currentReasoningUpdates = [];
                    
                    // Close WebSocket immediately after receiving final response
                    if (websocket && websocket.readyState === WebSocket.OPEN) {
                        console.log('Closing WebSocket connection after final response');
                        websocket.close(1000, 'Normal closure');
                        websocket = null;
                    }
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        }
    }

    function sendPromptMessage(prompt) {
        const reasoningEngine = window.getReasoningEngine();
        const useTrustLayer = reasoningEngine === 'einstein';
        const message = JSON.stringify({ 
            prompt: prompt,
            useTrustLayer: useTrustLayer
        });
        websocket.send(message);
    }

    // ----------------------------------------------------------------------------
    // MESSAGE DISPLAY FUNCTIONS
    // ----------------------------------------------------------------------------

    function updateTypingMessageWithReasoning() {
        const typingMsg = document.getElementById('typingMessage');
        const chatMessages = document.getElementById('chatMessages');
        
        if (!typingMsg || !chatMessages) {
            console.error('Required elements not found in updateTypingMessageWithReasoning');
            return;
        }
        
        const reasoningText = currentReasoningUpdates.map(update => {
            const timestamp = update.timestamp ? `[${update.timestamp}] ` : '';
            return timestamp + update.content;
        }).join('\n\n');
        typingMsg.innerHTML = `<div class="reasoning-updates">${marked.parse(reasoningText)}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingMessage() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.error('chatMessages element not found in addTypingMessage');
            return;
        }
        
        const oldTyping = document.getElementById('typingMessage');
        if (oldTyping) oldTyping.remove();
        if (typingIntervalId) {
            clearInterval(typingIntervalId);
            typingIntervalId = null;
        }
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message agent-message';
        typingDiv.id = 'typingMessage';
        typingDiv.innerHTML = '<div class="reasoning-updates">Agent is thinking...</div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessage(message, isUser = false, agentInfo = null, replaceTyping = false, responseId = null) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.error('chatMessages element not found');
            return;
        }
        
        const defaultAvatar = `<svg class="engine-logo" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 512 512"><circle r="256" cx="256" cy="256" fill="#cfe9fe"/><g transform="matrix(0.97,0,0,0.97,7.68,22.68)"><path d="M335.2 279.9c21.2-21.2 32.8-49.3 32.8-79.3 0-29.9-11.7-58.1-32.8-79.3l-26.4 26.4c14.1 14.1 21.9 32.9 21.9 52.8 0 20-7.8 38.7-21.9 52.9zM176.7 279.9l26.4-26.4c-29.1-29.1-29.1-76.6 0-105.7l-26.4-26.4c-43.7 43.6-43.7 114.8 0 158.5z" fill="#0176d3"/><path d="m388.1 68.5-26.4 26.4c28.2 28.2 43.8 65.8 43.8 105.7s-15.5 77.5-43.8 105.7l26.4 26.4c35.3-35.3 54.7-82.2 54.7-132.1s-19.4-96.8-54.7-132.1zM150.3 94.9l-26.4-26.4c-72.9 72.8-72.9 191.4 0 264.2l26.4-26.4C92 248 92 153.2 150.3 94.9zM274.6 232.8c2.8-1.6 5.4-3.5 7.7-5.8 7.1-7.1 10.9-16.4 10.9-26.4s-3.9-19.4-10.9-26.4c-14.1-14.1-38.7-14.1-52.8 0-7.1 7.1-10.9 16.4-10.9 26.4s3.9 19.4 10.9 26.4c2.3 2.3 5 4.2 7.7 5.8v173.3h-74.7v37.4h186.8v-37.4h-74.7z" fill="#0176d3"/></g></svg>`;

        if (replaceTyping) {
            const typingMsg = document.getElementById('typingMessage');
            if (typingMsg) {
                if (typingIntervalId) {
                    clearInterval(typingIntervalId);
                    typingIntervalId = null;
                }
                typingMsg.removeAttribute('id');
                typingMsg.className = 'message agent-message';
                const reasoningEngine = window.getReasoningEngine ? window.getReasoningEngine() : 'inference';
                const avatarHtml = window.ENGINE_INFO && window.ENGINE_INFO[reasoningEngine] ? 
                    window.ENGINE_INFO[reasoningEngine].svg : defaultAvatar;
                typingMsg.innerHTML = `<div style='display:flex;align-items:flex-start;'><span style='margin-right:8px;'>${avatarHtml}</span><span style='flex:1;'>${marked.parse(message)}</span></div>`;
                
                // Add reasoning expand/collapse functionality
                if (responseId && responseReasoningMap.has(responseId)) {
                    const reasoningUpdates = responseReasoningMap.get(responseId);
                    if (reasoningUpdates.length > 0) {
                        const reasoningContainer = document.createElement('div');
                        reasoningContainer.className = 'reasoning-container';
                        
                        const reasoningToggle = document.createElement('button');
                        reasoningToggle.className = 'btn btn-sm btn-outline-secondary reasoning-toggle';
                        reasoningToggle.textContent = 'Show Chain of Thoughts';
                        reasoningToggle.onclick = function() {
                            const reasoningContent = reasoningContainer.querySelector('.reasoning-content');
                            if (reasoningContent.style.display === 'none' || !reasoningContent.style.display) {
                                reasoningContent.style.display = 'block';
                                reasoningToggle.textContent = 'Hide Chain of Thoughts';
                            } else {
                                reasoningContent.style.display = 'none';
                                reasoningToggle.textContent = 'Show Chain of Thoughts';
                            }
                        };
                        
                        const reasoningContent = document.createElement('div');
                        reasoningContent.className = 'reasoning-content';
                        reasoningContent.style.display = 'none';
                        const reasoningText = reasoningUpdates.map(update => {
                            const timestamp = update.timestamp ? `[${update.timestamp}] ` : '';
                            return timestamp + update.content;
                        }).join('\n\n');
                        reasoningContent.innerHTML = `<div class="reasoning-updates">${marked.parse(reasoningText)}</div>`;
                        
                        reasoningContainer.appendChild(reasoningToggle);
                        reasoningContainer.appendChild(reasoningContent);
                        typingMsg.appendChild(reasoningContainer);
                    }
                }
                
                // Create bottom section with pills on left and toxicity on right
                if (agentInfo) {
                    const bottomSection = document.createElement('div');
                    bottomSection.className = 'message-bottom-section';
                    
                    // Pills logic (left side)
                    const pillsContainer = document.createElement('div');
                    pillsContainer.className = 'pills-container';
                    let agentNames = [];
                    if (Array.isArray(agentInfo.reasoning)) {
                        agentInfo.reasoning.forEach(r => {
                            if (Array.isArray(r.calledAgents)) {
                                r.calledAgents.forEach(a => {
                                    if (a.agentName && !agentNames.includes(a.agentName)) {
                                        agentNames.push(a.agentName);
                                    }
                                });
                            }
                        });
                    }
                    if (agentNames.length === 0) {
                        const noAgentPill = document.createElement('span');
                        noAgentPill.className = 'agent-pill';
                        noAgentPill.textContent = 'No Remote Agent Used';
                        pillsContainer.appendChild(noAgentPill);
                    } else {
                        if (typeof agentInfo.replanCount !== 'undefined' && agentInfo.replanCount !== null) {
                            const replanPill = document.createElement('span');
                            replanPill.className = 'agent-pill green';
                            replanPill.textContent = `Replan Count: ${agentInfo.replanCount}`;
                            replanPill.style.cursor = 'pointer';
                            replanPill.title = 'Click to view session details';
                            replanPill.addEventListener('click', function(e) {
                                console.log('Green replan pill clicked, will load modal');
                                ensureSessionModalLoaded(function() {
                                    console.log('ensureSessionModalLoaded callback, about to show modal');
                                    if (typeof window.renderInteractionModal === 'function') {
                                        window.renderInteractionModal(agentInfo);
                                        let interactionModal = document.getElementById('interactionModal');
                                        if (window.bootstrap && interactionModal) {
                                            let interactionModalInstance = window.bootstrap.Modal.getOrCreateInstance(interactionModal);
                                            interactionModalInstance.show();
                                            console.log('Bootstrap modal shown');
                                        } else if (interactionModal) {
                                            interactionModal.classList.add('show');
                                            interactionModal.style.display = 'block';
                                            console.log('Fallback modal shown');
                                        } else {
                                            console.error('interactionModal not found in DOM after loading');
                                        }
                                    } else {
                                        console.error('renderInteractionModal function is not available after loading modal.');
                                        alert('Could not show session details.');
                                    }
                                });
                            });
                            pillsContainer.appendChild(replanPill);
                        }
                        agentNames.forEach(name => {
                            const agentPill = document.createElement('span');
                            agentPill.className = 'agent-pill blue';
                            agentPill.textContent = name;
                            pillsContainer.appendChild(agentPill);
                        });
                    }
                    bottomSection.appendChild(pillsContainer);
                    
                    // Toxicity button (right side) - only if toxicity data exists
                    if (agentInfo.toxicity && Array.isArray(agentInfo.toxicity) && agentInfo.toxicity.length > 0) {
                        const toxicityContainer = document.createElement('div');
                        toxicityContainer.className = 'toxicity-container';
                        
                        const toxicityToggle = document.createElement('button');
                        toxicityToggle.className = 'btn btn-sm btn-outline-warning toxicity-toggle';
                        toxicityToggle.textContent = 'Show Toxicity';
                        toxicityToggle.onclick = function() {
                            const toxicityContent = toxicityContainer.querySelector('.toxicity-content');
                            if (toxicityContent.style.display === 'none' || !toxicityContent.style.display) {
                                toxicityContent.style.display = 'block';
                                toxicityToggle.textContent = 'Hide Toxicity';
                            } else {
                                toxicityContent.style.display = 'none';
                                toxicityToggle.textContent = 'Show Toxicity';
                            }
                        };
                        
                        const toxicityContent = document.createElement('div');
                        toxicityContent.className = 'toxicity-content';
                        toxicityContent.style.display = 'none';
                        
                        const toxicityPillsContainer = document.createElement('div');
                        toxicityPillsContainer.className = 'toxicity-pills-container';
                        
                        agentInfo.toxicity.forEach(toxicityItem => {
                            const toxicityPill = document.createElement('span');
                            toxicityPill.className = 'toxicity-pill';
                            toxicityPill.textContent = `${toxicityItem.categoryName}: ${toxicityItem.score === 0 ? '0.0' : toxicityItem.score === 1 ? '1.0' : toxicityItem.score.toString()}`;
                            
                            // Color coding based on score
                            if (toxicityItem.score >= 0.7) {
                                toxicityPill.className += ' high';
                            } else if (toxicityItem.score >= 0.4) {
                                toxicityPill.className += ' medium';
                            } else {
                                toxicityPill.className += ' low';
                            }
                            
                            toxicityPillsContainer.appendChild(toxicityPill);
                        });
                        
                        toxicityContent.appendChild(toxicityPillsContainer);
                        toxicityContainer.appendChild(toxicityToggle);
                        toxicityContainer.appendChild(toxicityContent);
                        bottomSection.appendChild(toxicityContainer);
                    }
                    
                    typingMsg.appendChild(bottomSection);
                }
                chatMessages.scrollTop = chatMessages.scrollHeight;
                return;
            }
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'agent-message'}`;
        if (isUser) {
            messageDiv.textContent = message;
        } else {
            const reasoningEngine = window.getReasoningEngine ? window.getReasoningEngine() : 'inference';
            const avatarHtml = window.ENGINE_INFO && window.ENGINE_INFO[reasoningEngine] ? 
                window.ENGINE_INFO[reasoningEngine].svg : defaultAvatar;
            messageDiv.innerHTML = `<div style='display:flex;align-items:flex-start;'><span style='margin-right:8px;'>${avatarHtml}</span><span style='flex:1;'>${marked.parse(message)}</span></div>`;
            
            // Add reasoning button for all agent responses if reasoning exists
            if (responseId && responseReasoningMap.has(responseId)) {
                const reasoningUpdates = responseReasoningMap.get(responseId);
                if (reasoningUpdates.length > 0) {
                    const reasoningContainer = document.createElement('div');
                    reasoningContainer.className = 'reasoning-container';
                    
                    const reasoningToggle = document.createElement('button');
                    reasoningToggle.className = 'btn btn-sm btn-outline-secondary reasoning-toggle';
                    reasoningToggle.textContent = 'Show Chain of Thoughts';
                    reasoningToggle.onclick = function() {
                        const reasoningContent = reasoningContainer.querySelector('.reasoning-content');
                        if (reasoningContent.style.display === 'none' || !reasoningContent.style.display) {
                            reasoningContent.style.display = 'block';
                            reasoningToggle.textContent = 'Hide Chain of Thoughts';
                        } else {
                            reasoningContent.style.display = 'none';
                            reasoningToggle.textContent = 'Show Chain of Thoughts';
                        }
                    };
                    
                    const reasoningContent = document.createElement('div');
                    reasoningContent.className = 'reasoning-content';
                    reasoningContent.style.display = 'none';
                    reasoningContent.innerHTML = `<div class="reasoning-updates">${marked.parse(reasoningUpdates.map(update => {
                        const timestamp = update.timestamp ? `[${update.timestamp}] ` : '';
                        return timestamp + update.content;
                    }).join('\n\n'))}</div>`;
                    
                    reasoningContainer.appendChild(reasoningToggle);
                    reasoningContainer.appendChild(reasoningContent);
                    messageDiv.appendChild(reasoningContainer);
                }
            }
            
            // Create bottom section with pills on left and toxicity on right
            if (agentInfo) {
                const bottomSection = document.createElement('div');
                bottomSection.className = 'message-bottom-section';
                
                // Pills logic (left side)
                const pillsContainer = document.createElement('div');
                pillsContainer.className = 'pills-container';
                let agentNames = [];
                if (Array.isArray(agentInfo.reasoning)) {
                    agentInfo.reasoning.forEach(r => {
                        if (Array.isArray(r.calledAgents)) {
                            r.calledAgents.forEach(a => {
                                if (a.agentName && !agentNames.includes(a.agentName)) {
                                    agentNames.push(a.agentName);
                                }
                            });
                        }
                    });
                }
                if (agentNames.length === 0) {
                    const noAgentPill = document.createElement('span');
                    noAgentPill.className = 'agent-pill';
                    noAgentPill.textContent = 'No Remote Agent Used';
                    pillsContainer.appendChild(noAgentPill);
                } else {
                    if (typeof agentInfo.replanCount !== 'undefined' && agentInfo.replanCount !== null) {
                        const replanPill = document.createElement('span');
                        replanPill.className = 'agent-pill green';
                        replanPill.textContent = `Replan Count: ${agentInfo.replanCount}`;
                        replanPill.style.cursor = 'pointer';
                        replanPill.title = 'Click to view session details';
                        replanPill.addEventListener('click', function(e) {
                            console.log('Green replan pill clicked, will load modal');
                            ensureSessionModalLoaded(function() {
                                console.log('ensureSessionModalLoaded callback, about to show modal');
                                if (typeof window.renderInteractionModal === 'function') {
                                    window.renderInteractionModal(agentInfo);
                                    let interactionModal = document.getElementById('interactionModal');
                                    if (window.bootstrap && interactionModal) {
                                        let interactionModalInstance = window.bootstrap.Modal.getOrCreateInstance(interactionModal);
                                        interactionModalInstance.show();
                                        console.log('Bootstrap modal shown');
                                    } else if (interactionModal) {
                                        interactionModal.classList.add('show');
                                        interactionModal.style.display = 'block';
                                        console.log('Fallback modal shown');
                                    } else {
                                        console.error('interactionModal not found in DOM after loading');
                                    }
                                } else {
                                    console.error('renderInteractionModal function is not available after loading modal.');
                                    alert('Could not show session details.');
                                }
                            });
                        });
                        pillsContainer.appendChild(replanPill);
                    }
                    agentNames.forEach(name => {
                        const agentPill = document.createElement('span');
                        agentPill.className = 'agent-pill blue';
                        agentPill.textContent = name;
                        pillsContainer.appendChild(agentPill);
                    });
                }
                bottomSection.appendChild(pillsContainer);
                
                // Toxicity button (right side) - only if toxicity data exists
                if (agentInfo.toxicity && Array.isArray(agentInfo.toxicity) && agentInfo.toxicity.length > 0) {
                    const toxicityContainer = document.createElement('div');
                    toxicityContainer.className = 'toxicity-container';
                    
                    const toxicityToggle = document.createElement('button');
                    toxicityToggle.className = 'btn btn-sm btn-outline-warning toxicity-toggle';
                    toxicityToggle.textContent = 'Show Toxicity';
                    toxicityToggle.onclick = function() {
                        const toxicityContent = toxicityContainer.querySelector('.toxicity-content');
                        if (toxicityContent.style.display === 'none' || !toxicityContent.style.display) {
                            toxicityContent.style.display = 'block';
                            toxicityToggle.textContent = 'Hide Toxicity';
                        } else {
                            toxicityContent.style.display = 'none';
                            toxicityToggle.textContent = 'Show Toxicity';
                        }
                    };
                    
                    const toxicityContent = document.createElement('div');
                    toxicityContent.className = 'toxicity-content';
                    toxicityContent.style.display = 'none';
                    
                    const toxicityPillsContainer = document.createElement('div');
                    toxicityPillsContainer.className = 'toxicity-pills-container';
                    
                    agentInfo.toxicity.forEach(toxicityItem => {
                        const toxicityPill = document.createElement('span');
                        toxicityPill.className = 'toxicity-pill';
                        toxicityPill.textContent = `${toxicityItem.categoryName}: ${toxicityItem.score === 0 ? '0.0' : toxicityItem.score === 1 ? '1.0' : toxicityItem.score.toString()}`;
                        
                        // Color coding based on score
                        if (toxicityItem.score >= 0.7) {
                            toxicityPill.className += ' high';
                        } else if (toxicityItem.score >= 0.4) {
                            toxicityPill.className += ' medium';
                        } else {
                            toxicityPill.className += ' low';
                        }
                        
                        toxicityPillsContainer.appendChild(toxicityPill);
                    });
                    
                    toxicityContent.appendChild(toxicityPillsContainer);
                    toxicityContainer.appendChild(toxicityToggle);
                    toxicityContainer.appendChild(toxicityContent);
                    bottomSection.appendChild(toxicityContainer);
                }
                
                messageDiv.appendChild(bottomSection);
            }
        }
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ----------------------------------------------------------------------------
    // MODAL MANAGEMENT
    // ----------------------------------------------------------------------------

    // Utility to load the shared session modal and script, and ensure no duplicates
    function ensureSessionModalLoaded(callback) {
        console.log('ensureSessionModalLoaded called');
        const chatContainer = document.querySelector('.chat-container');
        const modal = document.getElementById('interactionModal');
        if (modal && typeof window.renderInteractionModal === 'function') {
            console.log('Modal already exists and function is available, calling callback');
            callback();
            return;
        }
        if (modal) { modal.remove(); console.log('Removed old modal'); }
        if (window.renderInteractionModal) { delete window.renderInteractionModal; console.log('Deleted old renderInteractionModal'); }
        fetch('interaction-modal.html')
            .then(resp => resp.text())
            .then(html => {
                console.log('Fetched interaction-modal.html');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const modalEl = tempDiv.querySelector('#interactionModal');
                if (modalEl) {
                    document.body.appendChild(modalEl);
                    console.log('Appended modal to document.body');
                    setupModalFocusManagement(modalEl);
                } else {
                    console.warn('No modalEl found in fetched HTML');
                }
                // Load the external JavaScript file
                const scriptTag = tempDiv.querySelector('script');
                if (scriptTag && scriptTag.src) {
                    const newScript = document.createElement('script');
                    newScript.src = scriptTag.src;
                    newScript.onload = function() {
                        console.log('External modal script loaded successfully');
                        // Wait a bit more for the function to be available
                        setTimeout(function() {
                            if (typeof window.renderInteractionModal === 'function') {
                                console.log('renderInteractionModal function is available, calling callback');
                                callback();
                            } else {
                                console.error('renderInteractionModal function still not available after script load');
                                callback(); // Call callback anyway to avoid hanging
                            }
                        }, 50);
                    };
                    newScript.onerror = function() {
                        console.error('Failed to load external modal script:', scriptTag.src);
                        callback(); // Call callback anyway to avoid hanging
                    };
                    document.body.appendChild(newScript);
                    console.log('Loading external modal script:', scriptTag.src);
                } else {
                    console.warn('No script tag with src found in fetched HTML');
                    callback(); // Call callback anyway to avoid hanging
                }
            })
            .catch(err => {
                console.error('Failed to load interaction-modal.html:', err);
                alert('Could not load session modal.');
            });
    }

    function setupModalFocusManagement(modal) {
        if (!modal) return;
        let closeBtn = modal.querySelector('.btn-close');
        if (!closeBtn) {
            const observer = new MutationObserver(() => {
                closeBtn = modal.querySelector('.btn-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        let focusTarget = document.querySelector('.sidebar .nav-link.active') || document.body;
                        if (focusTarget) {
                            focusTarget.focus();
                            console.log('[Conversation] Focused safe element on close button click (observer)');
                        }
                    });
                    observer.disconnect();
                }
            });
            observer.observe(modal, { childList: true, subtree: true });
        } else {
            closeBtn.addEventListener('click', function() {
                let focusTarget = document.querySelector('.sidebar .nav-link.active') || document.body;
                if (focusTarget) {
                    focusTarget.focus();
                }
            });
        }
        modal.addEventListener('hide.bs.modal', function() {
            let focusTarget = document.querySelector('.sidebar .nav-link.active') || document.body;
            if (focusTarget) {
                focusTarget.focus();
            }
        });
    }

    // ----------------------------------------------------------------------------
    // INITIALIZATION AND CLEANUP
    // ----------------------------------------------------------------------------

    // Initialize function
    function init() {
        // Prevent multiple initializations
        if (window.ConversationManager._initialized) {
            console.log('ConversationManager already initialized, skipping...');
            return;
        }
        
        const promptInput = document.getElementById('promptInput');
        const sendButton = document.getElementById('sendButton');
        const chatMessages = document.getElementById('chatMessages');
        const newConversationBtn = document.getElementById('newConversationBtn');

        if (!promptInput || !sendButton || !chatMessages) {
            console.error('Required elements not found in init');
            return;
        }

        // Mark as initialized
        window.ConversationManager._initialized = true;

        // Initialize session ID (WebSocket connection will be created when user sends first message)
        let a2aSessionId = generateUUID();

        // Setup New Conversation button
        if (newConversationBtn) {
            addTrackedEventListener(newConversationBtn, 'click', function() {
                if (websocket) {
                    websocket.close(1000, 'Normal closure');
                    websocket = null;
                }
                a2aSessionId = generateUUID();
                currentReasoningUpdates = [];
                responseReasoningMap.clear();
                chatMessages.innerHTML = '';
                addMessage("Hello! I'm your Host Agent. How can I help you today?", false);
                if (promptInput) promptInput.value = '';
                // WebSocket connection will be created when user sends first message
            });
        }

        // Clean up any existing interaction modal
        if (document.getElementById('interactionModal')) {
            document.getElementById('interactionModal').remove();
        }

        // Define send message handler
        async function handleSendMessage() {
            const promptInput = document.getElementById('promptInput');
            const chatMessages = document.getElementById('chatMessages');
            
            if (!promptInput || !chatMessages) {
                console.error('Required elements not found in handleSendMessage');
                return;
            }
            
            const prompt = promptInput.value.trim();
            if (!prompt) return;
            
            addMessage(prompt, true);
            promptInput.value = '';
            addTypingMessage();
            
            currentReasoningUpdates = [];
            
            // Create WebSocket connection if it doesn't exist or is closed
            if (!websocket || websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING) {
                console.log('Creating fresh WebSocket connection for new request');
                createWebSocketConnection(a2aSessionId, handleWebSocketMessage);
                
                // Send message once connection is established
                websocket.onopen = function() {
                    console.log('WebSocket connection established, sending message');
                    sendPromptMessage(prompt);
                };
            } else if (websocket.readyState === WebSocket.OPEN) {
                // Connection is already open, send message immediately
                console.log('Using existing WebSocket connection');
                sendPromptMessage(prompt);
            } else if (websocket.readyState === WebSocket.CONNECTING) {
                // Connection is still connecting, wait for it to open
                websocket.onopen = function() {
                    console.log('WebSocket connection established, sending message');
                    sendPromptMessage(prompt);
                };
            }
        }

        // Add event listeners with tracking
        addTrackedEventListener(sendButton, 'click', handleSendMessage);
        addTrackedEventListener(promptInput, 'keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // Add initial message if chat is empty
        if (chatMessages.children.length === 0) {
            addMessage("Hello! I'm your Host Agent. How can I help you today?", false);
        }
    }

    // Cleanup function
    function cleanup() {
        // Close websocket if open
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.close(1000, 'Normal closure');
            websocket = null;
        }

        // Clear any intervals
        if (typingIntervalId) {
            clearInterval(typingIntervalId);
            typingIntervalId = null;
        }

        // Remove all tracked event listeners
        eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        eventListeners.clear();

        // Clear data structures
        currentReasoningUpdates = [];
        responseReasoningMap.clear();
        
        // Reset initialization flag
        window.ConversationManager._initialized = false;
    }

    // ----------------------------------------------------------------------------
    // PUBLIC API
    // ----------------------------------------------------------------------------

    return {
        init: init,
        cleanup: cleanup,
        removeSessionModal: function() {
            const modal = document.getElementById('interactionModal');
            if (modal) {
                modal.setAttribute('inert', '');
                let focusTarget = document.querySelector('.sidebar .nav-link.active') || document.body;
                if (focusTarget) {
                    focusTarget.focus();
                }
                setTimeout(function() {
                    if (window.bootstrap) {
                        let modalInstance = window.bootstrap.Modal.getOrCreateInstance(modal);
                        modal.addEventListener('hidden.bs.modal', function handler() {
                            modal.removeEventListener('hidden.bs.modal', handler);
                            modal.remove();
                            if (window.renderInteractionModal) {
                                delete window.renderInteractionModal;
                            }
                        });
                        modalInstance.hide();
                    } else {
                        modal.remove();
                        if (window.renderInteractionModal) {
                            delete window.renderInteractionModal;
                        }
                    }
                }, 30);
            } else if (window.renderInteractionModal) {
                delete window.renderInteractionModal;
            }
        }
    };
})();

// ----------------------------------------------------------------------------
// GLOBAL INITIALIZATION
// ----------------------------------------------------------------------------

// Note: Initialization is now handled by the index.js loadConversation function
// This prevents conflicts with dynamic content loading

// Expose the chat attachment function globally
window.attachConversationChat = function() {
    // Wait for DOM elements to be available
    const checkElements = () => {
        const promptInput = document.getElementById('promptInput');
        const sendButton = document.getElementById('sendButton');
        const chatMessages = document.getElementById('chatMessages');
        
        if (promptInput && sendButton && chatMessages) {
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
        } else {
            // DOM elements not ready yet, retry
            setTimeout(checkElements, 100);
        }
    };
    checkElements();
};

// Expose the modal removal function globally
window.removeConversationSessionModal = function() {
    window.ConversationManager.removeSessionModal();
}; 