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
                        const messageId = agent.agentTaskRequest.message && agent.agentTaskRequest.message.messageId ? agent.agentTaskRequest.message.messageId : '';
                        const requestContextId = (agent.agentTaskRequest.message && agent.agentTaskRequest.message.contextId) ? agent.agentTaskRequest.message.contextId : (agent.agentTaskRequest.contextId || '');
                        const requestTaskId = (agent.agentTaskRequest.message && agent.agentTaskRequest.message.taskId) ? agent.agentTaskRequest.message.taskId : (agent.agentTaskRequest.taskId || '');
                        if (messageId) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Message ID:</span> <span class='interaction-task-value'>${messageId}</span></div>`;
                        }
                        if (requestTaskId) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Task ID:</span> <span class='interaction-task-value'>${requestTaskId}</span></div>`;
                        }
                        if (requestContextId) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Context ID:</span> <span class='interaction-task-value'>${requestContextId}</span></div>`;
                        }
                        // Show request message text if present
                        if (agent.agentTaskRequest.message && Array.isArray(agent.agentTaskRequest.message.parts)) {
                            const reqMsgText = agent.agentTaskRequest.message.parts.map(p => p.text || p.type).join('<br>');
                            if (reqMsgText && reqMsgText.trim()) {
                                html += `<div class='interaction-task-section'><span class='interaction-task-label'>Message:</span> <span class='interaction-task-value'>${reqMsgText}</span></div>`;
                            }
                        }
                        html += `</div>`;
                    }
                    if (agent.agentTaskResponse) {
                        html += `<div class='interaction-task-response-tile'>`;
                        html += `<div class='interaction-task-section'><span class='interaction-task-label'>Agent Task Response</span></div>`;
                        
                        const responseTaskId = agent.agentTaskResponse.id || '';
                        const responseContextId = agent.agentTaskResponse.contextId || (agent.agentTaskResponse.status && agent.agentTaskResponse.status.message && agent.agentTaskResponse.status.message.contextId ? agent.agentTaskResponse.status.message.contextId : '');
                        const responseMessageId = (agent.agentTaskResponse.status && agent.agentTaskResponse.status.message && agent.agentTaskResponse.status.message.messageId)
                            ? agent.agentTaskResponse.status.message.messageId
                            : (agent.agentTaskResponse.message && agent.agentTaskResponse.message.messageId ? agent.agentTaskResponse.message.messageId : '');
                        
                        if (responseMessageId) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Message ID:</span> <span class='interaction-task-value'>${responseMessageId}</span></div>`;
                        }
                        if (responseTaskId) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Task ID:</span> <span class='interaction-task-value'>${responseTaskId}</span></div>`;
                        }
                        if (responseContextId) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Context ID:</span> <span class='interaction-task-value'>${responseContextId}</span></div>`;
                        }
                        
                        // Keep status timestamp and message; fallback to artifact text if status message is absent
                        if (agent.agentTaskResponse.status && agent.agentTaskResponse.status.timestamp) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Timestamp:</span> <span class='interaction-task-value'>${agent.agentTaskResponse.status.timestamp}</span></div>`;
                        }
                        let responseMessageText = '';
                        if (agent.agentTaskResponse.status && Array.isArray(agent.agentTaskResponse.status.message && agent.agentTaskResponse.status.message.parts)) {
                            responseMessageText = agent.agentTaskResponse.status.message.parts.map(p => p.text || p.type).join('<br>');
                        }
                        if ((!responseMessageText || !responseMessageText.trim()) && Array.isArray(agent.agentTaskResponse.artifacts)) {
                            const artifactParts = [];
                            agent.agentTaskResponse.artifacts.forEach(a => {
                                if (Array.isArray(a.parts)) {
                                    a.parts.forEach(part => {
                                        const txt = part && (part.text || part.type);
                                        if (txt) artifactParts.push(txt);
                                    });
                                }
                            });
                            responseMessageText = artifactParts.join('<br>');
                        }
                        if (responseMessageText && responseMessageText.trim()) {
                            html += `<div class='interaction-task-section'><span class='interaction-task-label'>Message:</span> <span class='interaction-task-value'>${responseMessageText}</span></div>`;
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
