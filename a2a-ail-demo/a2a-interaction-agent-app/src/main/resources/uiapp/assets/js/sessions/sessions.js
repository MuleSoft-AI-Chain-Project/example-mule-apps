// ============================================================================
// SESSIONS.JS - Sessions management functionality for the Host Agent interface
// ============================================================================

// Create a namespace for sessions functionality
window.SessionsManager = (function() {
    // ----------------------------------------------------------------------------
    // PRIVATE VARIABLES
    // ----------------------------------------------------------------------------
    
    let sessionsLoaded = false;
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

    // ----------------------------------------------------------------------------
    // SESSION RENDERING FUNCTIONS
    // ----------------------------------------------------------------------------

    function renderAgentPills(reasoning) {
        let agentNames = [];
        if (Array.isArray(reasoning)) {
            reasoning.forEach(r => {
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
            return '<span class="agent-pill no-agent">No Remote Agent Used</span>';
        } else {
            return agentNames.map(name => `<span class="agent-pill blue">${name}</span>`).join(' ');
        }
    }

    function setupModalFocusManagement(modal) {
        if (!modal) return;
        // If the close button is not yet in the DOM, wait for it
        let closeBtn = modal.querySelector('.btn-close');
        if (!closeBtn) {
            // Use MutationObserver to wait for the close button
            const observer = new MutationObserver(() => {
                closeBtn = modal.querySelector('.btn-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        let focusTarget = document.querySelector('.sidebar .nav-link.active') || document.body;
                        if (focusTarget) {
                            focusTarget.focus();
                            console.log('[Sessions] Focused safe element on close button click (observer)');
                        }
                    });
                    observer.disconnect();
                    console.log('[Sessions] Attached close button focus handler via MutationObserver');
                }
            });
            observer.observe(modal, { childList: true, subtree: true });
        } else {
            closeBtn.addEventListener('click', function() {
                let focusTarget = document.querySelector('.sidebar .nav-link.active') || document.body;
                if (focusTarget) {
                    focusTarget.focus();
                    console.log('[Sessions] Focused safe element on close button click');
                }
            });
            console.log('[Sessions] Attached close button focus handler immediately');
        }
        // Also move focus on hide.bs.modal (for other close methods)
        modal.addEventListener('hide.bs.modal', function() {
            let focusTarget = document.querySelector('.sidebar .nav-link.active') || document.body;
            if (focusTarget) {
                focusTarget.focus();
                console.log('[Sessions] Focused safe element on modal hide');
            }
        });
    }

    function ensureSessionModalLoadedForSessions(callback) {
        console.log('[Sessions] ensureSessionModalLoadedForSessions called');
        const sessionsContent = document.getElementById('sessions-content');
        const modal = document.getElementById('interactionModal');
        // Check if modal exists and is inside the correct container
        if (modal && sessionsContent && sessionsContent.contains(modal) && typeof window.renderInteractionModal === 'function') {
            console.log('[Sessions] Modal already exists in #sessions-content and function is available, calling callback');
            callback();
            return;
        }
        // Remove any existing modal and function to avoid stale state or wrong container
        if (modal) { modal.remove(); console.log('[Sessions] Removed old modal'); }
        if (window.renderInteractionModal) { delete window.renderInteractionModal; console.log('[Sessions] Deleted old renderInteractionModal'); }
        fetch('interaction-modal.html')
            .then(resp => resp.text())
            .then(html => {
                console.log('[Sessions] Fetched interaction-modal.html');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                // Append modal to #sessions-content if present, else body
                const modalEl = tempDiv.querySelector('#interactionModal');
                if (modalEl) {
                    // Always append to document.body for proper Bootstrap modal styling
                    document.body.appendChild(modalEl);
                    console.log('[Sessions] Appended modal to document.body');
                    setupModalFocusManagement(modalEl);
                } else {
                    console.warn('[Sessions] No modalEl found in fetched HTML');
                }
                // Load the external JavaScript file
                const scriptTag = tempDiv.querySelector('script');
                if (scriptTag && scriptTag.src) {
                    const newScript = document.createElement('script');
                    newScript.src = scriptTag.src;
                    newScript.onload = function() {
                        console.log('[Sessions] External modal script loaded successfully');
                        // Wait a bit more for the function to be available
                        setTimeout(function() {
                            if (typeof window.renderInteractionModal === 'function') {
                                console.log('[Sessions] renderInteractionModal function is available, calling callback');
                                callback();
                            } else {
                                console.error('[Sessions] renderInteractionModal function still not available after script load');
                                callback(); // Call callback anyway to avoid hanging
                            }
                        }, 50);
                    };
                    newScript.onerror = function() {
                        console.error('[Sessions] Failed to load external modal script:', scriptTag.src);
                        callback(); // Call callback anyway to avoid hanging
                    };
                    document.body.appendChild(newScript);
                    console.log('[Sessions] Loading external modal script:', scriptTag.src);
                } else {
                    console.warn('[Sessions] No script tag with src found in fetched HTML');
                    callback(); // Call callback anyway to avoid hanging
                }
            })
            .catch(err => {
                console.error('[Sessions] Failed to load interaction-modal.html:', err);
                alert('Could not load session modal.');
            });
    }

    function renderSessionsTable() {
        console.log('[Sessions] renderSessionsTable called');
        const tableBody = document.getElementById('sessionsTable').querySelector('tbody');
        if (!tableBody) {
            console.error('[Sessions] Table body not found');
            return;
        }
        tableBody.innerHTML = '';
        let interactions = [];
        try {
            const sessionsData = localStorage.getItem('agent_sessions');
            console.log('[Sessions] Raw sessions data from localStorage:', sessionsData);
            interactions = JSON.parse(sessionsData || '[]');
            console.log('[Sessions] Parsed interactions:', interactions);
            interactions = interactions.reverse(); // Most recent first
        } catch (e) {
            console.error('[Sessions] Error parsing sessions data:', e);
        }
        interactions.forEach((interaction, i) => {
            const data = interaction.data || {};
            // Collect all task IDs for this session
            let taskIds = [];
            if (Array.isArray(data.reasoning)) {
                data.reasoning.forEach(r => {
                    if (Array.isArray(r.calledAgents)) {
                        r.calledAgents.forEach(agent => {
                            if (agent.agentTaskRequest?.id) {
                                taskIds.push(agent.agentTaskRequest.id);
                            }
                        });
                    }
                });
            }
            // Use the sessionId from the top-level attribute if available
            let sessionId = data.sessionId || '';
            // Use the timestamp from the top-level attribute in localStorage
            let timestamp = interaction.timestamp ? interaction.timestamp.replace('T', ' ').replace('Z', '') : '';
            // Use the interactionId from the top-level attribute in localStorage
            let interactionId = interaction.interactionId || '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sessionId}</td>
                <td style="white-space:nowrap;">
                    <a href="#" class="open-session-modal" title="View session details" data-session-idx="${interactions.length - 1 - i}" data-task-idx="0">
                        <i class="fas fa-search"></i>
                    </a>
                    ${interactionId}
                </td>
                <td>${taskIds.map(id => `<div>${id}</div>`).join('')}</td>
                <td>${timestamp}</td>
                <td>${renderAgentPills(data.reasoning)}</td>
            `;
            tableBody.appendChild(tr);
        });
        // Attach click listeners for modal
        setTimeout(() => {
            document.querySelectorAll('.open-session-modal').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const interactionIdx = parseInt(this.getAttribute('data-session-idx'));
                    if (isNaN(interactionIdx)) return;
                    let interactions = [];
                    try {
                        interactions = JSON.parse(localStorage.getItem('agent_sessions') || '[]');
                    } catch (e) {}
                    const interaction = interactions[interactionIdx];
                    if (!interaction || !interaction.data) return;
                    // Debug log
                    console.log('[Sessions] Opening session modal for interaction:', interaction.data);
                    ensureSessionModalLoadedForSessions(function() {
                        console.log('[Sessions] ensureSessionModalLoadedForSessions callback, about to show modal');
                        if (typeof window.renderInteractionModal === 'function') {
                            window.renderInteractionModal(interaction.data);
                            let interactionModal = document.getElementById('interactionModal');
                            if (window.bootstrap && interactionModal) {
                                let interactionModalInstance = window.bootstrap.Modal.getOrCreateInstance(interactionModal);
                                interactionModalInstance.show();
                                console.log('[Sessions] Bootstrap modal shown');
                            } else if (interactionModal) {
                                interactionModal.classList.add('show');
                                interactionModal.style.display = 'block';
                                console.log('[Sessions] Fallback modal shown');
                            } else {
                                console.error('[Sessions] interactionModal not found in DOM after loading');
                            }
                        } else {
                            console.error('[Sessions] renderInteractionModal function is not available after loading modal.');
                            alert('Could not show session details.');
                        }
                    });
                });
            });
        }, 0);
    }

    function removeSessionsTabSessionModal() {
        var modal = document.getElementById('sessionModal');
        var sessionsContent = document.getElementById('sessions-content');
        // Move focus to a safe element outside the modal
        let focusTarget = document.querySelector('.sidebar .nav-link.active') || document.body;
        if (focusTarget) {
            focusTarget.focus();
            console.log('[Sessions] Focused safe element before hiding modal');
        }
        setTimeout(function() {
            if (modal && sessionsContent && sessionsContent.contains(modal)) {
                // Set inert before hiding/removing
                modal.setAttribute('inert', '');
                console.log('[Sessions] Set inert attribute on modal before hiding');
                if (window.bootstrap) {
                    let modalInstance = window.bootstrap.Modal.getOrCreateInstance(modal);
                    modal.addEventListener('hidden.bs.modal', function handler() {
                        modal.removeEventListener('hidden.bs.modal', handler);
                        modal.remove();
                        console.log('[Sessions] Removed sessionModal from #sessions-content after hidden');
                        if (window.renderSessionModal) {
                            delete window.renderSessionModal;
                            console.log('[Sessions] Deleted window.renderSessionModal');
                        }
                    });
                    modalInstance.hide();
                    console.log('[Sessions] Called Bootstrap modalInstance.hide()');
                } else {
                    modal.remove();
                    console.log('[Sessions] Removed sessionModal from #sessions-content (no bootstrap)');
                    if (window.renderSessionModal) {
                        delete window.renderSessionModal;
                        console.log('[Sessions] Deleted window.renderSessionModal');
                    }
                }
            } else if (window.renderSessionModal) {
                delete window.renderSessionModal;
                console.log('[Sessions] Deleted window.renderSessionModal (no modal)');
            }
        }, 30); // 30ms delay to allow focus to move
    }

    function setupDeleteAllButton() {
        const deleteAllBtn = document.getElementById('deleteAllSessionsBtn');
        if (deleteAllBtn) {
            // Remove any existing event listeners to prevent duplicates
            deleteAllBtn.removeEventListener('click', deleteAllSessionsHandler);
            deleteAllBtn.addEventListener('click', deleteAllSessionsHandler);
            console.log('[Sessions] Delete All button event listener attached');
        } else {
            console.warn('[Sessions] Delete All button not found in DOM');
        }
    }

    function deleteAllSessionsHandler() {
        if (confirm('Are you sure you want to delete all sessions? This action cannot be undone.')) {
            // Clear all sessions from localStorage
            localStorage.removeItem('agent_sessions');
            // Refresh the sessions table
            renderSessionsTable();
            console.log('[Sessions] All sessions deleted from localStorage');
        }
    }

    // ----------------------------------------------------------------------------
    // INITIALIZATION AND CLEANUP
    // ----------------------------------------------------------------------------

    // Initialize function
    function init() {
        console.log('[Sessions] SessionsManager.init() called');
        // Prevent multiple initializations
        if (window.SessionsManager._initialized) {
            console.log('SessionsManager already initialized, skipping...');
            return;
        }

        // Mark as initialized
        window.SessionsManager._initialized = true;
        console.log('[Sessions] SessionsManager marked as initialized');

        // Initialize immediately since DOM is already ready when this is called
        console.log('[Sessions] DOM is ready, rendering table and setting up button directly');
        renderSessionsTable();
        setupDeleteAllButton();
        
        // Also load the modal in the background for future use
        console.log('[Sessions] Loading modal in background');
        ensureSessionModalLoadedForSessions(function() {
            console.log('[Sessions] Modal loaded in background');
        });
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
        window.SessionsManager._initialized = false;
    }

    // ----------------------------------------------------------------------------
    // PUBLIC API
    // ----------------------------------------------------------------------------

    return {
        init: init,
        cleanup: cleanup,
        renderSessionsTable: renderSessionsTable,
        setupDeleteAllButton: setupDeleteAllButton,
        removeSessionsTabSessionModal: removeSessionsTabSessionModal
    };
})();

// ----------------------------------------------------------------------------
// GLOBAL INITIALIZATION
// ----------------------------------------------------------------------------

// Expose the sessions attachment function globally
window.attachSessionsTab = function() {
    console.log('[Sessions] attachSessionsTab called');
    // Wait for DOM elements to be available
    const checkElements = () => {
        const sessionsTable = document.getElementById('sessionsTable');
        const deleteAllSessionsBtn = document.getElementById('deleteAllSessionsBtn');
        
        console.log('[Sessions] Checking elements - sessionsTable:', sessionsTable, 'deleteAllSessionsBtn:', deleteAllSessionsBtn);
        
        if (sessionsTable && deleteAllSessionsBtn) {
            console.log('[Sessions] Elements found, initializing SessionsManager');
            window.SessionsManager.init();
        } else {
            // DOM elements not ready yet, retry
            console.log('[Sessions] Elements not ready, retrying in 100ms');
            setTimeout(checkElements, 100);
        }
    };
    checkElements();
};

// Make the setup function globally available
window.setupDeleteAllButton = window.SessionsManager.setupDeleteAllButton;
window.renderSessionsTable = window.SessionsManager.renderSessionsTable;
