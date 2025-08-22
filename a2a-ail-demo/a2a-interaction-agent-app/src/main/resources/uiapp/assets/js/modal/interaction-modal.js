(function() {
    function renderInteractionModal(agentInfo) {
        var interactionModalBody = document.getElementById('interactionModalBody');
        if (!interactionModalBody) return;
        if (!agentInfo || !Array.isArray(agentInfo.reasoning)) {
            interactionModalBody.innerHTML = '<em>No interaction details available.</em>';
            return;
        }
        let html = '';
        agentInfo.reasoning.forEach((plan, idx) => {
            html += `<div class='interaction-plan-tile'>`;
            let formattedCotId = '';
            if (plan.cotId) {
                let dateObj = null;
                let cotIdClean = plan.cotId.replace(/([+-]\d{2})(:?\d{2})?$/, '');
                try {
                    dateObj = new Date(cotIdClean);
                } catch (e) {}
                if (dateObj && !isNaN(dateObj.getTime())) {
                    const pad = n => n.toString().padStart(2, '0');
                    const padMs = n => n.toString().padStart(3, '0');
                    formattedCotId = `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}.${padMs(dateObj.getMilliseconds())}`;
                } else {
                    formattedCotId = plan.cotId;
                }
            }
            html += `<div class='interaction-plan-title'>Plan #${idx + 1}${formattedCotId ? ' (Started at ' + formattedCotId + ')' : ''}</div>`;
            if (Array.isArray(plan.calledAgents) && plan.calledAgents.length > 0) {
                plan.calledAgents.forEach(agent => {
                    html += `<div class='interaction-task-tile'>`;
                    html += `<div class='interaction-task-title'><b>Agent:</b> ${agent.agentName || ''}</div>`;
                    if (agent.agentTaskRequest) {
                        html += `<div class='interaction-task-request-tile'>`;
                        html += `<div class='interaction-task-section'><span class='interaction-task-label'>Agent Task Request</span></div>`;
                        html += `<div class='interaction-task-section'><span class='interaction-task-label'>ID:</span> <span class='interaction-task-value'>${agent.agentTaskRequest.id || ''}</span></div>`;
                        html += `<div class='interaction-task-section'><span class='interaction-task-label'>Session ID:</span> <span class='interaction-task-value'>${agent.agentTaskRequest.sessionId || ''}</span></div>`;
                        html += `<div class='interaction-task-section'><span class='interaction-task-label'>Message:</span> <span class='interaction-task-value'>${(agent.agentTaskRequest.message && Array.isArray(agent.agentTaskRequest.message.parts) ? agent.agentTaskRequest.message.parts.map(p => p.text).join('<br>') : '')}</span></div>`;
                        html += `</div>`;
                    }
                    if (agent.agentTaskResponse) {
                        html += `<div class='interaction-task-response-tile'>`;
                        html += `<div class='interaction-task-section'><span class='interaction-task-label'>Agent Task Response</span></div>`;
                        
                        // Handle regular response format
                        if (agent.agentTaskResponse.id) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>ID:</span> <span class='interaction-task-value'>${agent.agentTaskResponse.id}</span></div>`;
                        }
                        if (agent.agentTaskResponse.sessionId) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Session ID:</span> <span class='interaction-task-value'>${agent.agentTaskResponse.sessionId}</span></div>`;
                        }
                        
                        // Handle status object
                        if (agent.agentTaskResponse.status) {
                            if (agent.agentTaskResponse.status.state) {
                                html += `<div class='interaction-task-section'><span class='interaction-task-label'>Status:</span> <span class='interaction-task-value'>${agent.agentTaskResponse.status.state}</span></div>`;
                            }
                            if (agent.agentTaskResponse.status.timestamp) {
                                html += `<div class='interaction-task-section'><span class='interaction-task-label'>Timestamp:</span> <span class='interaction-task-value'>${agent.agentTaskResponse.status.timestamp}</span></div>`;
                            }
                            if (agent.agentTaskResponse.status.message && Array.isArray(agent.agentTaskResponse.status.message.parts)) {
                                const messageText = agent.agentTaskResponse.status.message.parts.map(p => p.text || p.type).join('<br>');
                                if (messageText.trim()) {
                                    html += `<div class='interaction-task-section'><span class='interaction-task-label'>Message:</span> <span class='interaction-task-value'>${messageText}</span></div>`;
                                }
                            }
                        }
                        
                        // Handle error format
                        if (agent.agentTaskResponse.status === 'error') {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Status:</span> <span class='interaction-task-value'>Error</span></div>`;
                        }
                        if (agent.agentTaskResponse.errorMessage) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Error Message:</span> <span class='interaction-task-value'>${agent.agentTaskResponse.errorMessage}</span></div>`;
                        }
                        if (agent.agentTaskResponse.detailedDescription) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Error Detailed Description:</span> <span class='interaction-task-value'>${agent.agentTaskResponse.detailedDescription}</span></div>`;
                        }
                        
                        html += `</div>`;
                    }
                    html += `</div>`;
                });
            } else {
                html += `<div class='interaction-task-tile'><em>No agent tasks in this plan.</em></div>`;
            }
            html += `</div>`;
        });
        interactionModalBody.innerHTML = html;
    }
    window.renderInteractionModal = renderInteractionModal;
})();
