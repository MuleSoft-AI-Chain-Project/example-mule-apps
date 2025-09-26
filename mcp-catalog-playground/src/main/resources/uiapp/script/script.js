let mcpServers = [];
let auditLog = [];
let currentConversation = [];
let userId = null;
let auditFilters = {
provider: 'all',
model: 'all',
endpoint: 'all'
};

// Model configurations
const modelConfig = {
OPENAI: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini'],
MISTRAL: ['mistral-small-latest', 'mistral-medium-latest', 'mistral-large-latest'],
XAI: [ 'grok-3'],
EINSTEIN: ['sfdc_ai__DefaultGPT41', 'sfdc_ai__DefaultGPT41Mini']
};

// User ID management
function generateUserId() {
// Generate a unique ID using timestamp and random string
const timestamp = Date.now().toString(36);
const randomStr = Math.random().toString(36).substring(2, 15);
return `user_${timestamp}_${randomStr}`;
}

function getOrCreateUserId() {
if (userId) {
return userId;
}

// Try to get existing userId from localStorage
const storedUserId = localStorage.getItem('userId');
if (storedUserId) {
userId = storedUserId;
console.log('Loaded existing userId from localStorage:', userId);
return userId;
}

// Generate new userId if none exists
userId = generateUserId();
localStorage.setItem('userId', userId);
console.log('Generated new userId and saved to localStorage:', userId);
return userId;
}

function resetUserId() {
userId = null;
localStorage.removeItem('userId');
console.log('UserId reset');
}

// Function to clean server name by removing user ID suffix
function cleanServerName(serverName) {
if (!serverName || typeof serverName !== 'string') {
return serverName;
}

// Get the current user ID to remove from server names
const currentUserId = getOrCreateUserId();

// Remove the user ID suffix from the server name
// The pattern is: originalName_user_mfce60b3_srzbgtd8ngd
const userSuffix = `_${currentUserId}`;

if (serverName.endsWith(userSuffix)) {
return serverName.slice(0, -userSuffix.length);
}

return serverName;
}

// URL cleaning function to remove excessive escaping
function cleanUrl(url) {
if (!url || typeof url !== 'string') {
return url;
}

// Remove all backslashes and quotes, then extract the actual URL
let cleanedUrl = url.replace(/\\/g, '').replace(/"/g, '');

// If the URL doesn't start with http, try to find the URL pattern
if (!cleanedUrl.startsWith('http')) {
// Look for URL pattern in the cleaned string
const urlMatch = cleanedUrl.match(/https?:\/\/[^\s]+/);
if (urlMatch) {
cleanedUrl = urlMatch[0];
}
}

// Ensure URL ends with a single slash if it's a base URL
if (cleanedUrl && !cleanedUrl.endsWith('/') && !cleanedUrl.includes('?')) {
cleanedUrl += '/';
}

console.log('URL cleaned:', { original: url, cleaned: cleanedUrl });
return cleanedUrl;
}

// CORS-aware fetch function
async function fetchWithCors(url, options = {}) {
try {
console.log(`Making ${options.method || 'GET'} request to: ${url}`);

// First try with CORS mode
const response = await fetch(url, {
...options,
mode: 'cors',
credentials: 'omit',
headers: {
'Content-Type': 'application/json',
...options.headers
}
});

console.log(`Response status: ${response.status} ${response.statusText}`);
console.log(`Response headers:`, [...response.headers.entries()]);


if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}

return response;
} catch (error) {
console.error('Fetch error details:', {
name: error.name,
message: error.message,
url: url,
method: options.method || 'GET'
});

// Check if it's a CORS error
if (error.name === 'TypeError' && 
(error.message.includes('fetch') || 
error.message.includes('CORS') || 
error.message.includes('blocked'))) {

console.warn('CORS error detected:', error.message);
console.warn('Backend is running but missing CORS headers. Operations will work locally only.');

// Throw a specific CORS error that can be caught by calling functions
throw new Error('CORS_ERROR: Backend is running but missing CORS headers. Please add CORS configuration to your backend server.');
}
throw error;
}
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
// Initialize userId first
getOrCreateUserId();

updateModels();
loadServers();
loadAuditLog(); // Load audit logs from localStorage

// Test backend connection on load
testBackendConnection();

// Add event listener for MuleSoft logo toggle
const mulesoftLogo = document.querySelector('.mulesoft-logo');
if (mulesoftLogo) {
mulesoftLogo.addEventListener('click', function(e) {
e.preventDefault();
e.stopPropagation();
console.log('MuleSoft logo clicked - current sidebar width:', document.getElementById('sidebar').offsetWidth);
toggleSidebar();
});
}

// Add sidebar click handler for easier interaction when collapsed
addSidebarClickHandler();
});

// Sidebar functionality
function toggleSidebar() {
console.log('toggleSidebar function called');
const sidebar = document.getElementById('sidebar');
const toggleIcon = document.getElementById('toggle-icon');

if (!sidebar) {
console.error('Sidebar element not found');
return;
}

if (!toggleIcon) {
console.error('Toggle icon element not found');
return;
}

console.log('Before toggle - sidebar classes:', sidebar.className);
sidebar.classList.toggle('collapsed');
console.log('After toggle - sidebar classes:', sidebar.className);

// Update icon based on state
if (sidebar.classList.contains('collapsed')) {
toggleIcon.className = 'fas fa-chevron-right';
console.log('Sidebar collapsed, icon changed to chevron-right');
} else {
toggleIcon.className = 'fas fa-bars';
console.log('Sidebar expanded, icon changed to bars');
}
}

// Add click listener to sidebar header when collapsed for easier clicking
function addSidebarClickHandler() {
const sidebar = document.getElementById('sidebar');
const sidebarHeader = sidebar.querySelector('.sidebar-header');

if (sidebarHeader) {
sidebarHeader.addEventListener('click', function(e) {
// Only trigger if sidebar is collapsed and click is not on the MuleSoft logo
if (sidebar.classList.contains('collapsed') && !e.target.closest('.mulesoft-logo')) {
console.log('Sidebar header clicked while collapsed');
toggleSidebar();
}
});
}
}

// Tab switching
function switchTab(tabName) {
// Remove active class from all nav items
document.querySelectorAll('.nav-item').forEach(item => {
item.classList.remove('active');
});

// Hide all tab contents
document.querySelectorAll('.tab-content').forEach(content => {
content.classList.remove('active');
});

// Activate clicked nav item
event.target.closest('.nav-item').classList.add('active');

// Show selected tab content
const selectedTab = document.getElementById(tabName + '-tab');
selectedTab.classList.add('active');

// Load servers when servers tab is clicked
if (tabName === 'servers') {
loadServersFromBackend();
}

// Update audit log and populate filters when audit tab is clicked
if (tabName === 'audit') {
updateAuditLog();
populateAuditModelFilter();
}
}

// Update models based on selected provider
function updateModels() {
const provider = document.getElementById('provider').value;
const modelSelect = document.getElementById('model');
const models = modelConfig[provider];

modelSelect.innerHTML = '';
models.forEach(model => {
const option = document.createElement('option');
option.value = model;
option.textContent = model;
modelSelect.appendChild(option);
});
}

// Conversation functionality
function handleKeyPress(event) {
if (event.key === 'Enter') {
sendMessage();
}
}

async function sendMessage() {
const messageInput = document.getElementById('messageInput');
const message = messageInput.value.trim();

if (!message) return;

const sendBtn = document.getElementById('sendBtn');
const originalHTML = sendBtn.innerHTML;
sendBtn.disabled = true;
sendBtn.innerHTML = '<div class="loading"></div>';

// Add user message to chat
addMessageToChat('user', message);
messageInput.value = '';

// Get configuration
const endpoint = document.querySelector('input[name="endpoint"]:checked').value;
const provider = document.getElementById('provider').value;
const model = document.getElementById('model').value;

try {
const response = await fetchWithCors(`/${endpoint}`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
prompt: message,
provider: provider,
model: model,
userId: getOrCreateUserId()
})
});

const data = await response.json();

// Add assistant response to chat
addMessageToChat('assistant', formatResponse(data, endpoint));

// Log conversation
logConversation(message, data, endpoint, provider, model);

} catch (error) {
const errorMsg = error.message.includes('CORS') ? 
'CORS Error: Please ensure your backend server is running with proper CORS headers enabled.' : 
`Error: ${error.message}`;
addMessageToChat('assistant', errorMsg);
console.error('Error:', error);
} finally {
sendBtn.disabled = false;
sendBtn.innerHTML = originalHTML;
}
}

function addMessageToChat(sender, message) {
const messagesDiv = document.getElementById('messages');
const messageDiv = document.createElement('div');
messageDiv.className = `message ${sender}`;

const time = new Date().toLocaleTimeString();
messageDiv.innerHTML = `
<div>${message}</div>
<div class="message-time">${time}</div>
`;

messagesDiv.appendChild(messageDiv);
messagesDiv.scrollTop = messagesDiv.scrollHeight;

// Store in current conversation
currentConversation.push({
sender,
message,
timestamp: new Date().toISOString()
});
}

function formatResponse(data, endpoint) {
console.log('Formatting response:', { endpoint, data });

// Always format responses in JSON viewer style without white-space
if (endpoint === 'reason') {
// Handle combined response (response + tools)
if (data.response && data.tools && Array.isArray(data.tools) && data.tools.length > 0) {
let formatted = '<div class="conversation-response">';
formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-comment"></i> Response';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += `<div class="conversation-content collapsible-content">${data.response}</div>`;
formatted += '</div>';

formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-tools"></i> Tools to be called';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += '<div class="conversation-content collapsible-content">';

data.tools.forEach((tool, index) => {
formatted += `<div class="conversation-tool-item">`;
formatted += `<div class="conversation-tool-header" onclick="toggleConversationTool(${index})">`;
formatted += `<span class="conversation-tool-number">Tool ${index + 1}</span>`;
formatted += `<span class="conversation-tool-name">${tool.function.name}</span>`;
if (tool.serverName) {
formatted += `<span class="conversation-tool-server">Server: ${tool.serverName}</span>`;
}
formatted += `<i class="fas fa-chevron-down conversation-tool-toggle-icon"></i>`;
formatted += `</div>`;
formatted += `<div class="conversation-tool-details collapsible-content">`;
formatted += `<strong>Arguments:</strong><pre>${formatToolArguments(tool.function.arguments)}</pre>`;
formatted += `</div></div>`;
});

formatted += '</div></div></div>';
return formatted;
} else if (data.tools && Array.isArray(data.tools) && data.tools.length > 0) {
let formatted = '<div class="conversation-response">';
formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-tools"></i> Tools to be called';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += '<div class="conversation-content collapsible-content">';

data.tools.forEach((tool, index) => {
formatted += `<div class="conversation-tool-item">`;
formatted += `<div class="conversation-tool-header" onclick="toggleConversationTool(${index})">`;
formatted += `<span class="conversation-tool-number">Tool ${index + 1}</span>`;
formatted += `<span class="conversation-tool-name">${tool.function.name}</span>`;
if (tool.serverName) {
formatted += `<span class="conversation-tool-server">Server: ${tool.serverName}</span>`;
}
formatted += `<i class="fas fa-chevron-down conversation-tool-toggle-icon"></i>`;
formatted += `</div>`;
formatted += `<div class="conversation-tool-details collapsible-content">`;
formatted += `<strong>Arguments:</strong><pre>${formatToolArguments(tool.function.arguments)}</pre>`;
formatted += `</div></div>`;
});

formatted += '</div></div></div>';
return formatted;
} else if (data.response) {
// Always use JSON viewer style for response text
return `<div class="conversation-response"><div class="conversation-section"><div class="conversation-header" onclick="toggleConversationSection(this)"><i class="fas fa-comment"></i> Response<i class="fas fa-chevron-down conversation-toggle-icon"></i></div><div class="conversation-content collapsible-content">${data.response}</div></div></div>`;
}
} else if (endpoint === 'reason-action') {
if (data.result && Array.isArray(data.result)) {
let formatted = '<div class="conversation-response">';
formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-play-circle"></i> Execution Results';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += '<div class="conversation-content collapsible-content">';

data.result.forEach((result, index) => {
formatted += `<div class="conversation-result-item">`;
formatted += `<div class="conversation-result-header" onclick="toggleConversationResult(${index})">`;
formatted += `<span class="conversation-result-number">Iteration ${result.execution}</span>`;
formatted += `<span class="conversation-result-tool">Tool: ${result.tool}</span>`;
if (result.serverName) {
formatted += `<span class="conversation-result-server">Server: ${result.serverName}</span>`;
}
formatted += `<i class="fas fa-chevron-down conversation-result-toggle-icon"></i>`;
formatted += `</div>`;
formatted += `<div class="conversation-result-details collapsible-content">`;
if (result.serverUrl) {
formatted += `<div class="conversation-result-url"><strong>Server URL:</strong> ${result.serverUrl}</div>`;
}
formatted += `<div class="conversation-result-content">`;
formatted += `<strong>Result:</strong>`;

try {
const resultData = JSON.parse(result.result);
if (resultData.contents && resultData.contents[0] && resultData.contents[0].text) {
const innerData = JSON.parse(resultData.contents[0].text);
formatted += `<pre>${JSON.stringify(innerData, null, 2)}</pre>`;
} else {
formatted += `<pre>${JSON.stringify(resultData, null, 2)}</pre>`;
}
} catch (e) {
formatted += `<pre>${JSON.stringify(result.result, null, 2)}</pre>`;
}

formatted += `</div></div></div>`;
});

formatted += '</div></div></div>';
return formatted;
} else if (data.result && typeof data.result === 'string') {
return `<div class="conversation-response"><div class="conversation-section"><div class="conversation-header" onclick="toggleConversationSection(this)"><i class="fas fa-play-circle"></i> Execution Result<i class="fas fa-chevron-down conversation-toggle-icon"></i></div><div class="conversation-content collapsible-content">${data.result}</div></div></div>`;
}
} else if (endpoint === 'augmentedtooling') {
// Handle Augmented Tooling endpoint
// Handle combined response (response + tools)
if (data.response && data.tools && Array.isArray(data.tools) && data.tools.length > 0) {
let formatted = '<div class="conversation-response">';
formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-comment"></i> Response';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += `<div class="conversation-content collapsible-content">${data.response}</div>`;
formatted += '</div>';

formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-tools"></i> Tools to be called';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += '<div class="conversation-content collapsible-content">';

data.tools.forEach((tool, index) => {
formatted += `<div class="conversation-tool-item">`;
formatted += `<div class="conversation-tool-header" onclick="toggleConversationTool(${index})">`;
formatted += `<span class="conversation-tool-number">Tool ${index + 1}</span>`;
formatted += `<span class="conversation-tool-name">${tool.function.name}</span>`;
if (tool.serverName) {
formatted += `<span class="conversation-tool-server">Server: ${tool.serverName}</span>`;
}
formatted += `<i class="fas fa-chevron-down conversation-tool-toggle-icon"></i>`;
formatted += `</div>`;
formatted += `<div class="conversation-tool-details collapsible-content">`;
formatted += `<strong>Arguments:</strong><pre>${formatToolArguments(tool.function.arguments)}</pre>`;
formatted += `</div></div>`;
});

formatted += '</div></div></div>';
return formatted;
} else if (data.tools && Array.isArray(data.tools) && data.tools.length > 0) {
let formatted = '<div class="conversation-response">';
formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-tools"></i> Tools to be called';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += '<div class="conversation-content collapsible-content">';

data.tools.forEach((tool, index) => {
formatted += `<div class="conversation-tool-item">`;
formatted += `<div class="conversation-tool-header" onclick="toggleConversationTool(${index})">`;
formatted += `<span class="conversation-tool-number">Tool ${index + 1}</span>`;
formatted += `<span class="conversation-tool-name">${tool.function.name}</span>`;
if (tool.serverName) {
formatted += `<span class="conversation-tool-server">Server: ${tool.serverName}</span>`;
}
formatted += `<i class="fas fa-chevron-down conversation-tool-toggle-icon"></i>`;
formatted += `</div>`;
formatted += `<div class="conversation-tool-details collapsible-content">`;
formatted += `<strong>Arguments:</strong><pre>${formatToolArguments(tool.function.arguments)}</pre>`;
formatted += `</div></div>`;
});

formatted += '</div></div></div>';
return formatted;
} else if (data.response) {
return `<div class="conversation-response"><div class="conversation-section"><div class="conversation-header" onclick="toggleConversationSection(this)"><i class="fas fa-comment"></i> Response<i class="fas fa-chevron-down conversation-toggle-icon"></i></div><div class="conversation-content collapsible-content">${data.response}</div></div></div>`;
}
} else if (endpoint === 'augmentedmcp') {
// Handle Augmented Action endpoint
if (data.result && Array.isArray(data.result)) {
let formatted = '<div class="conversation-response">';
formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-play-circle"></i> Augmented Execution Results';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += '<div class="conversation-content collapsible-content">';

data.result.forEach((result, index) => {
formatted += `<div class="conversation-result-item">`;
formatted += `<div class="conversation-result-header" onclick="toggleConversationResult(${index})">`;
formatted += `<span class="conversation-result-number">Iteration ${result.execution}</span>`;
formatted += `<span class="conversation-result-tool">Tool: ${result.tool}</span>`;
if (result.serverName) {
formatted += `<span class="conversation-result-server">Server: ${result.serverName}</span>`;
}
formatted += `<i class="fas fa-chevron-down conversation-result-toggle-icon"></i>`;
formatted += `</div>`;
formatted += `<div class="conversation-result-details collapsible-content">`;
if (result.serverUrl) {
formatted += `<div class="conversation-result-url"><strong>Server URL:</strong> ${result.serverUrl}</div>`;
}
formatted += `<div class="conversation-result-content">`;
formatted += `<strong>Result:</strong>`;

try {
const resultData = JSON.parse(result.result);
if (resultData.contents && resultData.contents[0] && resultData.contents[0].text) {
const innerData = JSON.parse(resultData.contents[0].text);
formatted += `<pre>${JSON.stringify(innerData, null, 2)}</pre>`;
} else {
formatted += `<pre>${JSON.stringify(resultData, null, 2)}</pre>`;
}
} catch (e) {
formatted += `<pre>${JSON.stringify(result.result, null, 2)}</pre>`;
}

formatted += `</div></div></div>`;
});

formatted += '</div></div></div>';
return formatted;
} else if (data.result && typeof data.result === 'string') {
return `<div class="conversation-response"><div class="conversation-section"><div class="conversation-header" onclick="toggleConversationSection(this)"><i class="fas fa-play-circle"></i> Augmented Execution Result<i class="fas fa-chevron-down conversation-toggle-icon"></i></div><div class="conversation-content collapsible-content">${data.result}</div></div></div>`;
} else if (data.response) {
return `<div class="conversation-response"><div class="conversation-section"><div class="conversation-header" onclick="toggleConversationSection(this)"><i class="fas fa-comment"></i> Response<i class="fas fa-chevron-down conversation-toggle-icon"></i></div><div class="conversation-content collapsible-content">${data.response}</div></div></div>`;
}
} else if (endpoint === 'agentic') {
// Handle Agentic Loop endpoint
// Handle combined response (response + results)
if (data.response && data.results && Array.isArray(data.results)) {
let formatted = '<div class="conversation-response">';
formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-comment"></i> Response';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += '<div class="conversation-content collapsible-content">';

// Format the response with proper line breaks and styling
const formattedResponse = data.response
.replace(/\n/g, '<br>')
.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
.replace(/\*(.*?)\*/g, '<em>$1</em>')
.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

formatted += formattedResponse;
formatted += '</div></div>';

formatted += '<div class="conversation-section">';
formatted += '<div class="conversation-header" onclick="toggleConversationSection(this)">';
formatted += '<i class="fas fa-play-circle"></i> Execution Results';
formatted += '<i class="fas fa-chevron-down conversation-toggle-icon"></i>';
formatted += '</div>';
formatted += '<div class="conversation-content collapsible-content">';

data.results.forEach((result, index) => {
formatted += `<div class="conversation-result-item">`;
formatted += `<div class="conversation-result-header" onclick="toggleConversationResult(${index})">`;
formatted += `<span class="conversation-result-number">Iteration ${result.execution}</span>`;
formatted += `<span class="conversation-result-tool">Tool: ${result.tool}</span>`;
if (result.serverName) {
formatted += `<span class="conversation-result-server">Server: ${result.serverName}</span>`;
}
formatted += `<i class="fas fa-chevron-down conversation-result-toggle-icon"></i>`;
formatted += `</div>`;
formatted += `<div class="conversation-result-details collapsible-content">`;
if (result.serverUrl) {
formatted += `<div class="conversation-result-url"><strong>Server URL:</strong> ${result.serverUrl}</div>`;
}
formatted += `<div class="conversation-result-content">`;
formatted += `<strong>Result:</strong>`;

try {
const resultData = result.result;
if (resultData.contents && resultData.contents[0] && resultData.contents[0].text) {
const innerData = JSON.parse(resultData.contents[0].text);
formatted += `<pre>${JSON.stringify(innerData, null, 2)}</pre>`;
} else {
formatted += `<pre>${JSON.stringify(resultData, null, 2)}</pre>`;
}
} catch (e) {
formatted += `<pre>${JSON.stringify(result.result, null, 2)}</pre>`;
}

formatted += `</div></div></div>`;
});

formatted += '</div></div></div>';
return formatted;
} else if (data.response) {
// Format the response with proper line breaks and styling
const formattedResponse = data.response
.replace(/\n/g, '<br>')
.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
.replace(/\*(.*?)\*/g, '<em>$1</em>')
.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

return `<div class="conversation-response"><div class="conversation-section"><div class="conversation-header" onclick="toggleConversationSection(this)"><i class="fas fa-comment"></i> Response<i class="fas fa-chevron-down conversation-toggle-icon"></i></div><div class="conversation-content collapsible-content">${formattedResponse}</div></div></div>`;
}
}

// Fallback: if we have a response field, always use collapsible style
if (data.response) {
return `<div class="conversation-response"><div class="conversation-section"><div class="conversation-header" onclick="toggleConversationSection(this)"><i class="fas fa-comment"></i> Response<i class="fas fa-chevron-down conversation-toggle-icon"></i></div><div class="conversation-content collapsible-content">${data.response}</div></div></div>`;
}

// Final fallback: display raw JSON
return `<div class="conversation-response"><div class="conversation-section"><div class="conversation-header" onclick="toggleConversationSection(this)"><i class="fas fa-code"></i> Response Data<i class="fas fa-chevron-down conversation-toggle-icon"></i></div><div class="conversation-content collapsible-content"><pre>${JSON.stringify(data, null, 2)}</pre></div></div></div>`;
}

function logConversation(prompt, response, endpoint, provider, model) {
const logEntry = {
timestamp: new Date().toISOString(),
prompt,
response,
endpoint,
provider,
model,
conversation: [...currentConversation]
};

auditLog.unshift(logEntry);
saveAuditLog(); // Save to localStorage
updateAuditLog();
}

// Save audit log to localStorage
function saveAuditLog() {
try {
localStorage.setItem('auditLog', JSON.stringify(auditLog));
console.log('Audit log saved to localStorage:', auditLog.length, 'entries');
} catch (error) {
console.error('Error saving audit log to localStorage:', error);
}
}

// Load audit log from localStorage
function loadAuditLog() {
try {
const savedAuditLog = localStorage.getItem('auditLog');
if (savedAuditLog) {
auditLog = JSON.parse(savedAuditLog);
console.log('Audit log loaded from localStorage:', auditLog.length, 'entries');
} else {
console.log('No saved audit log found in localStorage');
auditLog = [];
}
} catch (error) {
console.error('Error loading audit log from localStorage:', error);
auditLog = [];
}
}

function updateAuditLog() {
	const auditEntries = document.getElementById('auditEntries');

	if (auditLog.length === 0) {
		auditEntries.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 40px;">No audit entries yet. Start a conversation to see logs here.</p>';
		return;
	}

	// Filter audit log based on current filters
	const filteredLog = auditLog.filter(entry => {
		const providerMatch = auditFilters.provider === 'all' || entry.provider === auditFilters.provider;
		const modelMatch = auditFilters.model === 'all' || entry.model === auditFilters.model;
		const endpointMatch = auditFilters.endpoint === 'all' || entry.endpoint === auditFilters.endpoint;
		return providerMatch && modelMatch && endpointMatch;
	});

	if (filteredLog.length === 0) {
		auditEntries.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 40px;">No audit entries match the current filters.</p>';
		return;
	}

	auditEntries.innerHTML = '';

	filteredLog.forEach((entry, index) => {
		const logDiv = document.createElement('div');
		logDiv.className = 'log-entry';
		logDiv.innerHTML = `
<div class="log-time">${new Date(entry.timestamp).toLocaleString()}</div>
<div class="log-content">
<strong>Endpoint:</strong> ${entry.endpoint}<br>
<strong>Provider:</strong> ${entry.provider}<br>
<strong>Model:</strong> ${entry.model}<br>
<strong>Prompt:</strong> ${entry.prompt}<br>
<div style="margin-top: 10px;">
<strong>Response:</strong>
<div class="json-viewer" style="margin-top: 5px; max-height: 400px; overflow-y: auto;">
${formatAuditResponse(entry.response)}
</div>
</div>
</div>
`;
		auditEntries.appendChild(logDiv);
	});
}

// Format audit response for better readability
function formatAuditResponse(response) {
	if (!response) return '<div class="no-response">No response data</div>';
	
	try {
		// If response is already a string, try to parse it
		let data = typeof response === 'string' ? JSON.parse(response) : response;
		
		// Handle combined responses (response + results/result/tools)
		if (data.response && (data.results || data.result || data.tools)) {
			return formatCombinedResponse(data);
		}
		
		// Handle different response types
		if (data.tools && Array.isArray(data.tools)) {
			return formatToolsResponse(data.tools);
		} else if (data.result && Array.isArray(data.result)) {
			return formatResultResponse(data.result);
		} else if (data.results && Array.isArray(data.results)) {
			return formatResultResponse(data.results);
		} else if (data.response) {
			return formatTextResponse(data.response);
		} else {
			return formatGenericJson(data);
		}
	} catch (error) {
		// If parsing fails, treat as plain text
		return formatTextResponse(response);
	}
}

// Format combined response (response + results/result)
function formatCombinedResponse(data) {
	let html = '<div class="combined-response">';
	
	// Add the text response section
	if (data.response) {
		html += '<div class="response-section">';
		html += '<div class="section-header" onclick="toggleSection(this)">';
		html += '<i class="fas fa-comment"></i> Response';
		html += '<i class="fas fa-chevron-down toggle-icon"></i>';
		html += '</div>';
		html += '<div class="text-content collapsible-content">';
		
		// Format text with line breaks and basic markdown
		const formattedText = data.response
			.replace(/\n/g, '<br>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/`(.*?)`/g, '<code>$1</code>');
		
		html += formattedText;
		html += '</div></div>';
	}
	
	// Add the tools section
	if (data.tools && Array.isArray(data.tools)) {
		html += '<div class="response-section">';
		html += '<div class="section-header" onclick="toggleSection(this)">';
		html += '<i class="fas fa-tools"></i> Tools to be called';
		html += '<i class="fas fa-chevron-down toggle-icon"></i>';
		html += '</div>';
		html += '<div class="tools-list collapsible-content">';
		
		data.tools.forEach((tool, index) => {
			html += `<div class="tool-item">`;
			html += `<div class="tool-header" onclick="toggleTool(${index})">`;
			html += `<span class="tool-number">Tool ${index + 1}</span>`;
			html += `<span class="tool-name">${tool.function.name}</span>`;
			if (tool.serverName) {
				html += `<span class="tool-server">Server: ${tool.serverName}</span>`;
			}
			html += `<i class="fas fa-chevron-down tool-toggle-icon"></i>`;
			html += `</div>`;
			
			html += `<div class="tool-details collapsible-content">`;
			if (tool.function.arguments) {
				try {
					const args = JSON.parse(tool.function.arguments);
					html += `<div class="tool-arguments">`;
					html += `<strong>Arguments:</strong>`;
					html += `<div class="json-object">${formatJsonObject(args, 0, `combined-tool-${index}-args`)}</div>`;
					html += `</div>`;
				} catch (e) {
					html += `<div class="tool-arguments">`;
					html += `<strong>Arguments:</strong><pre>${formatToolArguments(tool.function.arguments)}</pre>`;
					html += `</div>`;
				}
			}
			html += `</div>`;
			html += `</div>`;
		});
		
		html += '</div></div>';
	}
	
	// Add the execution results section
	const results = data.results || data.result;
	if (results && Array.isArray(results)) {
		html += '<div class="response-section">';
		html += '<div class="section-header" onclick="toggleSection(this)">';
		html += '<i class="fas fa-play-circle"></i> Execution Results';
		html += '<i class="fas fa-chevron-down toggle-icon"></i>';
		html += '</div>';
		html += '<div class="results-list collapsible-content">';
		
		results.forEach((result, index) => {
			html += `<div class="result-item">`;
			html += `<div class="result-header" onclick="toggleResult(${index})">`;
			html += `<span class="result-number">Iteration ${result.execution}</span>`;
			html += `<span class="result-tool">Tool: ${result.tool}</span>`;
			if (result.serverName) {
				html += `<span class="result-server">Server: ${result.serverName}</span>`;
			}
			html += `<i class="fas fa-chevron-down result-toggle-icon"></i>`;
			html += `</div>`;
			
			html += `<div class="result-details collapsible-content">`;
			if (result.serverUrl) {
				html += `<div class="result-url"><strong>Server URL:</strong> ${result.serverUrl}</div>`;
			}
			
			html += `<div class="result-content">`;
			html += `<strong>Result:</strong>`;
			
			try {
				// Check if result.result is already an object or needs parsing
				const resultData = typeof result.result === 'string' ? JSON.parse(result.result) : result.result;
				
				if (resultData.contents && Array.isArray(resultData.contents)) {
					// Handle MCP response format
					resultData.contents.forEach((content, contentIndex) => {
						if (content.text) {
							try {
								const textData = JSON.parse(content.text);
								html += `<div class="json-object">${formatJsonObject(textData, 0, `combined-result-${index}-content-${contentIndex}`)}</div>`;
							} catch (e) {
								html += `<div class="text-content">${content.text}</div>`;
							}
						}
					});
				} else {
					html += `<div class="json-object">${formatJsonObject(resultData, 0, `combined-result-${index}`)}</div>`;
				}
			} catch (e) {
				html += `<div class="text-content">${typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)}</div>`;
			}
			
			html += `</div></div></div>`;
		});
		
		html += '</div></div>';
	}
	
	html += '</div>';
	return html;
}

// Format tools array response
function formatToolsResponse(tools) {
	let html = '<div class="response-section">';
	html += '<div class="section-header" onclick="toggleSection(this)">';
	html += '<i class="fas fa-tools"></i> Tools to be called';
	html += '<i class="fas fa-chevron-down toggle-icon"></i>';
	html += '</div>';
	html += '<div class="tools-list collapsible-content">';
	
	tools.forEach((tool, index) => {
		html += `<div class="tool-item">`;
		html += `<div class="tool-header" onclick="toggleTool(${index})">`;
		html += `<span class="tool-number">Tool ${index + 1}</span>`;
		html += `<span class="tool-name">${tool.function.name}</span>`;
		if (tool.serverName) {
			html += `<span class="tool-server">Server: ${tool.serverName}</span>`;
		}
		html += `<i class="fas fa-chevron-down tool-toggle-icon"></i>`;
		html += `</div>`;
		
		html += `<div class="tool-details collapsible-content">`;
		if (tool.function.arguments) {
			try {
				const args = JSON.parse(tool.function.arguments);
				html += `<div class="tool-arguments">`;
				html += `<strong>Arguments:</strong>`;
				html += `<div class="json-object">${formatJsonObject(args, 0, `tool-${index}-args`)}</div>`;
				html += `</div>`;
			} catch (e) {
				html += `<div class="tool-arguments">`;
				html += `<strong>Arguments:</strong><pre>${formatToolArguments(tool.function.arguments)}</pre>`;
				html += `</div>`;
			}
		}
		html += `</div>`;
		html += `</div>`;
	});
	
	html += '</div></div>';
	return html;
}

// Format result array response
function formatResultResponse(results) {
	let html = '<div class="response-section">';
	html += '<div class="section-header" onclick="toggleSection(this)">';
	html += '<i class="fas fa-play-circle"></i> Execution Results';
	html += '<i class="fas fa-chevron-down toggle-icon"></i>';
	html += '</div>';
	html += '<div class="results-list collapsible-content">';
	
	results.forEach((result, index) => {
		html += `<div class="result-item">`;
		html += `<div class="result-header" onclick="toggleResult(${index})">`;
		html += `<span class="result-number">Iteration ${result.execution}</span>`;
		html += `<span class="result-tool">Tool: ${result.tool}</span>`;
		if (result.serverName) {
			html += `<span class="result-server">Server: ${result.serverName}</span>`;
		}
		html += `<i class="fas fa-chevron-down result-toggle-icon"></i>`;
		html += `</div>`;
		
		html += `<div class="result-details collapsible-content">`;
		if (result.serverUrl) {
			html += `<div class="result-url"><strong>Server URL:</strong> ${result.serverUrl}</div>`;
		}
		
		html += `<div class="result-content">`;
		html += `<strong>Result:</strong>`;
		
		try {
			// Check if result.result is already an object or needs parsing
			const resultData = typeof result.result === 'string' ? JSON.parse(result.result) : result.result;
			
			if (resultData.contents && Array.isArray(resultData.contents)) {
				// Handle MCP response format
				resultData.contents.forEach((content, contentIndex) => {
					if (content.text) {
						try {
							const textData = JSON.parse(content.text);
							html += `<div class="json-object">${formatJsonObject(textData, 0, `result-${index}-content-${contentIndex}`)}</div>`;
						} catch (e) {
							html += `<div class="text-content">${content.text}</div>`;
						}
					}
				});
			} else {
				html += `<div class="json-object">${formatJsonObject(resultData, 0, `result-${index}`)}</div>`;
			}
		} catch (e) {
			html += `<div class="text-content">${typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)}</div>`;
		}
		
		html += `</div></div></div>`;
	});
	
	html += '</div></div>';
	return html;
}

// Format text response
function formatTextResponse(text) {
	let html = '<div class="response-section">';
	html += '<div class="section-header" onclick="toggleSection(this)">';
	html += '<i class="fas fa-comment"></i> Response';
	html += '<i class="fas fa-chevron-down toggle-icon"></i>';
	html += '</div>';
	html += '<div class="text-content collapsible-content">';
	
	// Format text with line breaks and basic markdown
	const formattedText = text
		.replace(/\n/g, '<br>')
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/`(.*?)`/g, '<code>$1</code>');
	
	html += formattedText;
	html += '</div></div>';
	return html;
}

// Format generic JSON object
function formatGenericJson(data) {
	let html = '<div class="response-section">';
	html += '<div class="section-header" onclick="toggleSection(this)">';
	html += '<i class="fas fa-code"></i> Response Data';
	html += '<i class="fas fa-chevron-down toggle-icon"></i>';
	html += '</div>';
	html += '<div class="json-object collapsible-content">';
	html += formatJsonObject(data, 0, 'generic-json');
	html += '</div></div>';
	return html;
}

// Helper function to format tool arguments properly
function formatToolArguments(arguments) {
	if (!arguments) return 'No arguments';
	
	try {
		// If arguments is already an object, stringify it
		if (typeof arguments === 'object') {
			return JSON.stringify(arguments, null, 2);
		}
		
		// If arguments is a string, try to parse and re-stringify for formatting
		const parsed = JSON.parse(arguments);
		return JSON.stringify(parsed, null, 2);
	} catch (e) {
		// If parsing fails, return as string
		return typeof arguments === 'string' ? arguments : JSON.stringify(arguments);
	}
}

// Format JSON object with proper structure and collapsible functionality
function formatJsonObject(obj, level = 0, parentId = '') {
	if (obj === null) return '<span class="json-null">null</span>';
	if (obj === undefined) return '<span class="json-undefined">undefined</span>';
	
	if (typeof obj === 'string') {
		return `<span class="json-string">"${obj}"</span>`;
	}
	
	if (typeof obj === 'number') {
		return `<span class="json-number">${obj}</span>`;
	}
	
	if (typeof obj === 'boolean') {
		return `<span class="json-boolean">${obj}</span>`;
	}
	
	if (Array.isArray(obj)) {
		if (obj.length === 0) {
			return '<span class="json-array">[]</span>';
		}
		
		const arrayId = `${parentId}-array`;
		let html = '<div class="json-array">';
		html += `<div class="json-toggle" onclick="toggleJson('${arrayId}')">`;
		html += '<i class="fas fa-chevron-down"></i>';
		html += `[<span class="json-count">${obj.length} items</span>]`;
		html += '</div>';
		html += `<div class="json-array-content collapsible-content" id="${arrayId}">`;
		obj.forEach((item, index) => {
			html += `<div class="json-array-item">`;
			html += `<span class="json-array-index">${index}:</span>`;
			html += formatJsonObject(item, level + 1, `${arrayId}-${index}`);
			html += index < obj.length - 1 ? ',' : '';
			html += '</div>';
		});
		html += '</div></div>';
		return html;
	}
	
	if (typeof obj === 'object') {
		const keys = Object.keys(obj);
		if (keys.length === 0) {
			return '<span class="json-object">{}</span>';
		}
		
		const objectId = `${parentId}-object`;
		let html = '<div class="json-object">';
		html += `<div class="json-toggle" onclick="toggleJson('${objectId}')">`;
		html += '<i class="fas fa-chevron-down"></i>';
		html += `{<span class="json-count">${keys.length} properties</span>}`;
		html += '</div>';
		html += `<div class="json-object-content collapsible-content" id="${objectId}">`;
		keys.forEach((key, index) => {
			html += `<div class="json-object-item">`;
			html += `<span class="json-key">"${key}":</span>`;
			html += formatJsonObject(obj[key], level + 1, `${objectId}-${key}`);
			html += index < keys.length - 1 ? ',' : '';
			html += '</div>';
		});
		html += '</div></div>';
		return html;
	}
	
	return `<span class="json-unknown">${obj}</span>`;
}

// Filter audit log by provider
function filterAuditByProvider(provider) {
	auditFilters.provider = provider;
	updateAuditLog();
}

// Filter audit log by model
function filterAuditByModel(model) {
auditFilters.model = model;
updateAuditLog();
}

// Filter audit log by endpoint
function filterAuditByEndpoint(endpoint) {
auditFilters.endpoint = endpoint;
updateAuditLog();
}

// Clear all audit filters
function clearAuditFilters() {
auditFilters = {
provider: 'all',
model: 'all',
endpoint: 'all'
};

// Reset filter dropdowns
document.getElementById('auditProviderFilter').value = 'all';
document.getElementById('auditModelFilter').value = 'all';
document.getElementById('auditEndpointFilter').value = 'all';

updateAuditLog();
}

// Populate model filter dropdown based on audit log entries
function populateAuditModelFilter() {
const modelFilter = document.getElementById('auditModelFilter');
if (!modelFilter) return;

// Get unique models from audit log
const uniqueModels = [...new Set(auditLog.map(entry => entry.model))].sort();

// Clear existing options except "All Models"
modelFilter.innerHTML = '<option value="all">All Models</option>';

// Add model options
uniqueModels.forEach(model => {
const option = document.createElement('option');
option.value = model;
option.textContent = model;
modelFilter.appendChild(option);
});
}

// Export audit log to JSON file
function exportAuditLog() {
if (auditLog.length === 0) {
alert('No audit logs to export.');
return;
}

const filteredLog = auditLog.filter(entry => {
const providerMatch = auditFilters.provider === 'all' || entry.provider === auditFilters.provider;
const modelMatch = auditFilters.model === 'all' || entry.model === auditFilters.model;
const endpointMatch = auditFilters.endpoint === 'all' || entry.endpoint === auditFilters.endpoint;
return providerMatch && modelMatch && endpointMatch;
});

const blob = new Blob([JSON.stringify(filteredLog, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}

// Clear all audit logs
function clearAuditLog() {
if (auditLog.length === 0) {
alert('No audit logs to clear.');
return;
}

if (confirm(`Are you sure you want to clear all ${auditLog.length} audit log entries? This action cannot be undone.`)) {
auditLog = [];
saveAuditLog();
updateAuditLog();
populateAuditModelFilter();
alert('All audit logs have been cleared.');
}
}

// MCP Server functionality
function openAddServerModal() {
document.getElementById('addServerModal').classList.add('active');
}

function closeModal(modalId) {
document.getElementById(modalId).classList.remove('active');
}

async function addServer(event) {
	event.preventDefault();

	const cleanKey = cleanServerName(document.getElementById('serverKey').value);
	const url = cleanUrl(document.getElementById('serverUrl').value);
	const userId = getOrCreateUserId();
	const fullKey = `${cleanKey}_${userId}`;

	try {
		// Register server
		const registerResponse = await fetchWithCors('/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ 
				key: cleanKey, 
				value: url,
				userId: userId
			})
		});

		if (registerResponse.status !== 200) {
			throw new Error('Failed to register server');
		}

		// Get tools for the server
		const toolsResponse = await fetchWithCors('/mcp2tool', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ 
				key: cleanKey,
				userId: userId
			})
		});

		const toolsData = await toolsResponse.json();

		// Add to servers list with full key (including user ID) for proper filtering
		const server = {
			key: fullKey,
			url: cleanUrl(url),
			tools: toolsData.tools || []
		};

		mcpServers.push(server);
		saveServers(); // Save to localStorage
		updateServersGrid();
		closeModal('addServerModal');

		// Clear form
		document.getElementById('serverKey').value = '';
		document.getElementById('serverUrl').value = '';

	} catch (error) {
		const errorMsg = error.message.includes('CORS') ? 
		'CORS Error: Please ensure your backend server is running with CORS headers enabled.' : 
		`Error adding server: ${error.message}`;
		alert(errorMsg);
		console.error('Error:', error);
	}
}

function updateServersGrid() {
const grid = document.getElementById('serversGrid');
const currentUserId = getOrCreateUserId();

// Keep the add button
grid.innerHTML = `
<div class="server-card add-server-card" onclick="openAddServerModal()">
<div style="text-align: center;">
<div class="add-icon">
<i class="fas fa-plus"></i>
</div>
<h3>Add MCP Server</h3>
</div>
</div>
`;

mcpServers.forEach((server, index) => {
// Only display servers that belong to the current user
if (server.key && server.key.includes(currentUserId)) {
const serverCard = document.createElement('div');
serverCard.className = 'server-card';
serverCard.innerHTML = `
<div class="server-actions">
<button class="delete-btn" onclick="deleteServer(${index})">
<i class="fas fa-trash"></i>
</button>
</div>
<div class="server-name">${cleanServerName(server.key)}</div>
<div class="server-url">${cleanUrl(server.url)}</div>
<div class="server-tools">
<span class="tools-count">${server.tools.length} tools</span>
<button class="view-tools-btn" onclick="viewTools(${index})">View Tools</button>
</div>
`;
grid.appendChild(serverCard);
}
});
}

async function deleteServer(index) {
const server = mcpServers[index];

if (!confirm(`Are you sure you want to delete "${server.key}"?`)) {
return;
}

try {
console.log(`Attempting to delete server: ${server.key}`);
const requestBody = { key: server.key };
console.log('Request body:', requestBody);

const response = await fetchWithCors('/server', {
method: 'DELETE',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
...requestBody,
userId: getOrCreateUserId()
})
});

console.log('Delete response status:', response.status);
console.log('Delete response ok:', response.ok);

// Try to read response body for debugging
try {
const responseText = await response.text();
console.log('Delete response body:', responseText);
} catch (e) {
console.log('Could not read response body:', e.message);
}

if (response.ok) {
mcpServers.splice(index, 1);
saveServers(); // Save to localStorage
updateServersGrid();

// Verify deletion on backend
setTimeout(async () => {
await verifyBackendServers();
}, 1000);

alert(`Server "${server.key}" deleted successfully!`);
} else {
throw new Error(`Failed to delete server from backend. Status: ${response.status}`);
}
} catch (error) {
// Handle CORS errors specifically
if (error.message.includes('CORS_ERROR')) {
console.warn(`CORS issue: Backend is running but missing CORS headers. Deleting server "${server.key}" locally only.`);

mcpServers.splice(index, 1);
saveServers();
updateServersGrid();

alert(`Server "${server.key}" deleted locally.\n\nNote: Backend is running but missing CORS headers. The server may still exist on the backend. Please add CORS configuration to your backend server.`);
} else if (error.message.includes('CORS') || error.message.includes('fetch')) {
console.warn(`Backend not available, deleting server "${server.key}" locally only`);

mcpServers.splice(index, 1);
saveServers();
updateServersGrid();

alert(`Server "${server.key}" deleted locally. It may still exist on the backend if it's not running.`);
} else {
alert(`Error deleting server: ${error.message}`);
console.error('Error:', error);
}
}
}

async function deleteAllServers() {
if (!confirm('Are you sure you want to delete all servers? This action cannot be undone.')) {
return;
}

try {
console.log('Attempting to delete all servers from backend...');
		// Try to delete from backend first
		const response = await fetchWithCors('/servers', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId: getOrCreateUserId()
			})
		});

console.log('Delete all response status:', response.status);
console.log('Delete all response ok:', response.ok);

// Try to read response body for debugging
try {
const responseText = await response.text();
console.log('Delete all response body:', responseText);
} catch (e) {
console.log('Could not read delete all response body:', e.message);
}

if (response.ok) {
mcpServers = [];
saveServers(); // Save to localStorage
updateServersGrid();

// Verify deletion on backend
setTimeout(async () => {
await verifyBackendServers();
}, 1000);

alert('All servers deleted successfully from backend and local storage!');
} else {
throw new Error(`Failed to delete all servers from backend. Status: ${response.status}`);
}
} catch (error) {
// Handle CORS errors specifically
if (error.message.includes('CORS_ERROR')) {
console.warn('CORS issue: Backend is running but missing CORS headers. Deleting servers locally only.');

// Clear local data
mcpServers = [];
saveServers();
updateServersGrid();

alert('Servers deleted locally.\n\nNote: Backend is running but missing CORS headers. The servers may still exist on the backend. Please add CORS configuration to your backend server.');
} else if (error.message.includes('CORS') || error.message.includes('fetch')) {
console.warn('Backend not available, deleting servers locally only');

// Delete each server individually from backend if possible
const deletePromises = mcpServers.map(async (server) => {
try {
await fetchWithCors('/server', {
method: 'DELETE',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ key: server.key })
});
} catch (e) {
// Ignore individual server deletion errors
console.warn(`Could not delete server ${server.key} from backend:`, e.message);
}
});

// Wait for all deletion attempts to complete
await Promise.allSettled(deletePromises);

// Clear local data regardless
mcpServers = [];
saveServers();
updateServersGrid();

alert('Servers deleted locally. Some servers may still exist on the backend if it\'s not running.');
} else {
alert(`Error deleting servers: ${error.message}`);
console.error('Error:', error);
}
}
}

function viewTools(index) {
const server = mcpServers[index];
const modal = document.getElementById('toolsModal');
const title = document.getElementById('toolsModalTitle');
const toolsList = document.getElementById('toolsList');

title.textContent = `${cleanServerName(server.key)} - Tools`;

toolsList.innerHTML = '';

if (server.tools.length === 0) {
toolsList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px; font-size: 1.1rem;">No tools available for this server.</p>';
} else {
server.tools.forEach((tool, toolIndex) => {
const toolDiv = document.createElement('div');
toolDiv.className = 'tool-item';

// Build parameters structure
let paramsHtml = '';
if (tool.function.parameters && tool.function.parameters.properties) {
const properties = tool.function.parameters.properties;
const required = tool.function.parameters.required || [];

paramsHtml = '<div class="param-list">';

Object.entries(properties).forEach(([paramName, paramDetails]) => {
const isRequired = required.includes(paramName);
const requiredBadge = isRequired ? 
'<span class="param-required">Required</span>' : 
'<span class="param-optional">Optional</span>';

paramsHtml += `
<div class="param-item">
<div class="param-name">
<strong>${paramName}</strong>
<span class="param-type">${paramDetails.type || 'any'}</span>
${requiredBadge}
</div>
${paramDetails.description ? 
`<div class="param-description">${paramDetails.description}</div>` : ''
}
${paramDetails.items && paramDetails.items.properties ? 
formatArrayProperties(paramDetails.items.properties, paramDetails.items.required || []) : ''
}
</div>
`;
});

paramsHtml += '</div>';
} else {
paramsHtml = '<div class="no-params">No parameters required</div>';
}

const toolId = `tool-${index}-${toolIndex}`;

toolDiv.innerHTML = `
<div class="tool-name">${tool.function.name}</div>
<div class="tool-description">${tool.function.description || 'No description available'}</div>
<div class="tool-params">
<div class="param-title" onclick="toggleParams('${toolId}')">
Parameters
<span class="param-toggle" id="${toolId}-toggle">▼</span>
</div>
<div class="param-content collapsed" id="${toolId}-content">
${paramsHtml}
</div>
</div>
`;
toolsList.appendChild(toolDiv);
});
}

modal.classList.add('active');
}

function toggleParams(toolId) {
const content = document.getElementById(`${toolId}-content`);
const toggle = document.getElementById(`${toolId}-toggle`);

if (content && toggle) {
const isCollapsed = content.classList.contains('collapsed');

if (isCollapsed) {
// Expand
content.classList.remove('collapsed');
toggle.classList.add('expanded');
} else {
// Collapse
content.classList.add('collapsed');
toggle.classList.remove('expanded');
}
}
}

function formatArrayProperties(properties, required) {
let propertiesHtml = '<div class="param-properties"><strong>Object properties:</strong>';

Object.entries(properties).forEach(([propName, propDetails]) => {
const isRequired = required.includes(propName);
const requiredBadge = isRequired ? 
'<span class="param-required">Required</span>' : 
'<span class="param-optional">Optional</span>';

propertiesHtml += `
<div class="property-item">
<div class="property-name">
<strong>${propName}</strong>
<span class="param-type">${propDetails.type || 'any'}</span>
${requiredBadge}
</div>
${propDetails.description ? 
`<div class="param-description">${propDetails.description}</div>` : ''
}
</div>
`;
});

propertiesHtml += '</div>';
return propertiesHtml;
}

// Settings functionality
function exportConfig() {
const config = mcpServers.map(server => ({
key: server.key,
value: server.url
}));

const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = 'mcp-servers-config.json';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}

async function importConfig(event) {
const file = event.target.files[0];
if (!file) return;

try {
const text = await file.text();
const config = JSON.parse(text);

if (!Array.isArray(config)) {
throw new Error('Invalid configuration format');
}

// Clear current servers
mcpServers = [];

// Register each server
for (const serverConfig of config) {
if (!serverConfig.key || !serverConfig.value) {
console.warn('Skipping invalid server config:', serverConfig);
continue;
}

try {
// Register server
const registerResponse = await fetchWithCors('/register', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ 
key: serverConfig.key, 
value: serverConfig.value,
userId: getOrCreateUserId()
})
});

if (registerResponse.status === 200) {
// Get tools
const toolsResponse = await fetchWithCors('/mcp2tool', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ 
key: cleanServerName(serverConfig.key),
userId: getOrCreateUserId()
})
});

const toolsData = await toolsResponse.json();

mcpServers.push({
key: serverConfig.key,
url: cleanUrl(serverConfig.value),
tools: toolsData.tools || []
});
}
} catch (error) {
console.error(`Failed to register server ${serverConfig.key}:`, error);
}
}

saveServers(); // Save to localStorage
updateServersGrid();
alert(`Successfully imported ${mcpServers.length} servers`);

} catch (error) {
alert(`Error importing configuration: ${error.message}`);
console.error('Import error:', error);
}

// Clear file input
event.target.value = '';
}

// Save servers to localStorage
function saveServers() {
try {
localStorage.setItem('mcpServers', JSON.stringify(mcpServers));
console.log('Servers saved to localStorage:', mcpServers.length);
} catch (error) {
console.error('Error saving servers to localStorage:', error);
}
}

// Load servers from localStorage
function loadServers() {
try {
const savedServers = localStorage.getItem('mcpServers');
if (savedServers) {
mcpServers = JSON.parse(savedServers);
console.log('Servers loaded from localStorage:', mcpServers.length);

// Re-register servers with the backend
//reRegisterServers();
} else {
console.log('No saved servers found in localStorage');
mcpServers = [];
}
} catch (error) {
console.error('Error loading servers from localStorage:', error);
mcpServers = [];
}
updateServersGrid();
}

// Load servers from backend when servers tab is clicked
async function loadServersFromBackend() {
try {
console.log('Loading servers from backend...');

// Step 1: Call /retrieve endpoint
const retrieveResponse = await fetchWithCors('/retrieve', {
method: 'GET'
});

if (!retrieveResponse.ok) {
throw new Error(`Failed to retrieve servers. Status: ${retrieveResponse.status}`);
}

const serversData = await retrieveResponse.json();
console.log('Retrieved servers from backend:', serversData);

// Step 2: Clear current servers and load from backend
mcpServers = [];

// Step 3: For each server, get tools and add to mcpServers
if (serversData && Array.isArray(serversData)) {
for (const serverData of serversData) {
try {
console.log(`Fetching tools for server: ${serverData.key}`);

// Call /mcp2tool endpoint for each server
const toolsResponse = await fetchWithCors('/mcp2tool', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ 
key: cleanServerName(serverData.key),
userId: getOrCreateUserId()
})
});

if (toolsResponse.ok) {
const toolsData = await toolsResponse.json();

// Add server with tools to mcpServers
const server = {
key: serverData.key,
url: cleanUrl(serverData.value || serverData.url),
tools: toolsData.tools || []
};

mcpServers.push(server);
console.log(`Added server: ${server.key} with ${server.tools.length} tools`);
} else {
console.warn(`Failed to get tools for server ${serverData.key}:`, toolsResponse.status);

// Add server without tools
const server = {
key: serverData.key,
url: serverData.value || serverData.url,
tools: []
};
mcpServers.push(server);
}
} catch (error) {
console.error(`Error fetching tools for server ${serverData.key}:`, error);

// Add server without tools
const server = {
key: serverData.key,
url: serverData.value || serverData.url,
tools: []
};
mcpServers.push(server);
}
}
} else if (serversData && typeof serversData === 'object') {
// Handle case where serversData is an object instead of array
for (const [key, value] of Object.entries(serversData)) {
try {
console.log(`Fetching tools for server: ${key}`);

const toolsResponse = await fetchWithCors('/mcp2tool', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ 
key: cleanServerName(key),
userId: getOrCreateUserId()
})
});

if (toolsResponse.ok) {
const toolsData = await toolsResponse.json();

const server = {
key: key,
url: cleanUrl(value),
tools: toolsData.tools || []
};

mcpServers.push(server);
console.log(`Added server: ${server.key} with ${server.tools.length} tools`);
} else {
console.warn(`Failed to get tools for server ${key}:`, toolsResponse.status);

const server = {
key: key,
url: value,
tools: []
};
mcpServers.push(server);
}
} catch (error) {
console.error(`Error fetching tools for server ${key}:`, error);

const server = {
key: key,
url: value,
tools: []
};
mcpServers.push(server);
}
}
}

// Step 4: Save to localStorage and update UI
saveServers();
updateServersGrid();

console.log(`Successfully loaded ${mcpServers.length} servers from backend`);

} catch (error) {
console.error('Error loading servers from backend:', error);

// Check if it's a CORS error
if (error.message.includes('CORS_ERROR')) {
showCorsNotice();
console.log('CORS issue detected. Falling back to localStorage...');
} else {
console.log('Backend unavailable. Falling back to localStorage...');
}

// Fall back to localStorage if backend fails
loadServers();
}
}

// Show/hide CORS notice
function showCorsNotice() {
const corsNotice = document.getElementById('cors-notice');
if (corsNotice) {
corsNotice.style.display = 'block';
}
}

function hideCorsNotice() {
const corsNotice = document.getElementById('cors-notice');
if (corsNotice) {
corsNotice.style.display = 'none';
}
}

// Re-register servers with the backend after loading from localStorage
async function reRegisterServers() {
for (const server of mcpServers) {
try {
// Register server with backend
const registerResponse = await fetchWithCors('/register', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ 
key: server.key, 
value: cleanUrl(server.url),
userId: getOrCreateUserId()
})
});

if (registerResponse.status === 200) {
// Get updated tools for the server
const toolsResponse = await fetchWithCors('/mcp2tool', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ 
key: cleanServerName(server.key),
userId: getOrCreateUserId()
})
});

const toolsData = await toolsResponse.json();
server.tools = toolsData.tools || [];

console.log(`Re-registered server: ${server.key}`);
} else {
console.warn(`Failed to re-register server: ${server.key}`);
}
} catch (error) {
console.error(`Error re-registering server ${server.key}:`, error);
}
}

// Update the grid after re-registration
updateServersGrid();
}

// Test backend connectivity
async function testBackendConnection() {
try {
console.log('Testing backend connection...');
const response = await fetch('/retrieve', {
method: 'GET',
headers: {
'Content-Type': 'application/json'
}
});

console.log('Backend response:', response);
console.log('Response status:', response.status);
console.log('Response headers:', [...response.headers.entries()]);

if (response.ok) {
const data = await response.json();
console.log('Backend data:', data);
return true;
} else {
console.error('Backend returned error:', response.status);
return false;
}
} catch (error) {
console.error('Backend connection test failed:', error);
return false;
}
}

// Verify what servers exist on backend
async function verifyBackendServers() {
try {
console.log('Verifying servers on backend...');
const response = await fetchWithCors('/retrieve', {
method: 'GET'
});

if (response.ok) {
const data = await response.json();
console.log('Current servers on backend:', data);
return data;
} else {
console.error('Failed to get servers from backend:', response.status);
return null;
}
} catch (error) {
console.error('Error verifying backend servers:', error);
return null;
}
}

// Data management functions
function clearAllData() {
if (confirm('Are you sure you want to clear all stored data? This will remove all MCP servers, audit logs, and user ID and cannot be undone.')) {
try {
localStorage.removeItem('mcpServers');
localStorage.removeItem('auditLog');
localStorage.removeItem('userId');
mcpServers = [];
auditLog = [];
userId = null;
updateServersGrid();
updateAuditLog();
populateAuditModelFilter();
alert('All data cleared successfully!');
console.log('All localStorage data cleared');
} catch (error) {
console.error('Error clearing data:', error);
alert('Error clearing data. Please try again.');
}
}
}

function showDataInfo() {
try {
const savedServers = localStorage.getItem('mcpServers');
const savedAuditLog = localStorage.getItem('auditLog');
const savedUserId = localStorage.getItem('userId');
const serverCount = savedServers ? JSON.parse(savedServers).length : 0;
const auditCount = savedAuditLog ? JSON.parse(savedAuditLog).length : 0;

const serversSize = savedServers ? Math.round(savedServers.length / 1024 * 100) / 100 : 0;
const auditSize = savedAuditLog ? Math.round(savedAuditLog.length / 1024 * 100) / 100 : 0;
const userIdSize = savedUserId ? Math.round(savedUserId.length / 1024 * 100) / 100 : 0;
const totalSize = serversSize + auditSize + userIdSize;

const info = `
Data Storage Information:
• Stored MCP Servers: ${serverCount}
• Stored Audit Logs: ${auditCount}
• User ID: ${savedUserId || 'Not set'}
• Storage Location: Browser localStorage
• Data Persistence: Survives page refreshes and browser restarts
• Servers Data Size: ${serversSize} KB
• Audit Log Data Size: ${auditSize} KB
• User ID Data Size: ${userIdSize} KB
• Total Data Size: ${totalSize} KB

Note: Data is stored locally in your browser and will be lost if you clear browser data or use incognito mode.
`;

alert(info);
} catch (error) {
console.error('Error showing data info:', error);
alert('Error retrieving data information.');
}
}

// Toggle functions for collapsible content
function toggleSection(header) {
	const content = header.nextElementSibling;
	const icon = header.querySelector('.toggle-icon');
	
	if (content.classList.contains('collapsed')) {
		content.classList.remove('collapsed');
		icon.className = 'fas fa-chevron-down toggle-icon';
	} else {
		content.classList.add('collapsed');
		icon.className = 'fas fa-chevron-right toggle-icon';
	}
}

function toggleTool(toolIndex) {
	const toolHeader = event.currentTarget;
	const toolDetails = toolHeader.nextElementSibling;
	const icon = toolHeader.querySelector('.tool-toggle-icon');
	
	if (toolDetails.classList.contains('collapsed')) {
		toolDetails.classList.remove('collapsed');
		icon.className = 'fas fa-chevron-down tool-toggle-icon';
	} else {
		toolDetails.classList.add('collapsed');
		icon.className = 'fas fa-chevron-right tool-toggle-icon';
	}
}

function toggleResult(resultIndex) {
	const resultHeader = event.currentTarget;
	const resultDetails = resultHeader.nextElementSibling;
	const icon = resultHeader.querySelector('.result-toggle-icon');
	
	if (resultDetails.classList.contains('collapsed')) {
		resultDetails.classList.remove('collapsed');
		icon.className = 'fas fa-chevron-down result-toggle-icon';
	} else {
		resultDetails.classList.add('collapsed');
		icon.className = 'fas fa-chevron-right result-toggle-icon';
	}
}

function toggleJson(elementId) {
	const content = document.getElementById(elementId);
	const toggle = content.previousElementSibling;
	const icon = toggle.querySelector('i');
	
	if (content.classList.contains('collapsed')) {
		content.classList.remove('collapsed');
		icon.className = 'fas fa-chevron-down';
	} else {
		content.classList.add('collapsed');
		icon.className = 'fas fa-chevron-right';
	}
}

// Toggle function for conversation config section
function toggleConfigSection() {
	const content = document.querySelector('.config-content');
	const icon = document.querySelector('.config-toggle-icon');
	
	if (content.classList.contains('collapsed')) {
		content.classList.remove('collapsed');
		icon.className = 'fas fa-chevron-down config-toggle-icon';
	} else {
		content.classList.add('collapsed');
		icon.className = 'fas fa-chevron-right config-toggle-icon';
	}
}

// Toggle function for experiment mode options
function toggleExperimentModeOptions() {
	const options = document.getElementById('experiment-mode-options');
	const toggle = document.getElementById('experiment-mode-toggle');
	
	if (options.classList.contains('collapsed')) {
		options.classList.remove('collapsed');
		toggle.className = 'fas fa-chevron-up';
	} else {
		options.classList.add('collapsed');
		toggle.className = 'fas fa-chevron-down';
	}
}

// Update selected mode text when radio button changes
function updateSelectedMode() {
	const selectedRadio = document.querySelector('input[name="endpoint"]:checked');
	const selectedText = document.getElementById('selected-mode-text');
	const options = document.getElementById('experiment-mode-options');
	const toggle = document.getElementById('experiment-mode-toggle');
	
	if (selectedRadio && selectedText) {
		const label = selectedRadio.nextElementSibling;
		selectedText.textContent = label.textContent;
		
		// Collapse the options after selection
		options.classList.add('collapsed');
		toggle.className = 'fas fa-chevron-down';
	}
}

// Toggle functions for conversation collapsible content
function toggleConversationSection(header) {
	const content = header.nextElementSibling;
	const icon = header.querySelector('.conversation-toggle-icon');
	
	if (content.classList.contains('collapsed')) {
		content.classList.remove('collapsed');
		icon.className = 'fas fa-chevron-down conversation-toggle-icon';
	} else {
		content.classList.add('collapsed');
		icon.className = 'fas fa-chevron-right conversation-toggle-icon';
	}
}

function toggleConversationTool(toolIndex) {
	const toolHeader = event.currentTarget;
	const toolDetails = toolHeader.nextElementSibling;
	const icon = toolHeader.querySelector('.conversation-tool-toggle-icon');
	
	if (toolDetails.classList.contains('collapsed')) {
		toolDetails.classList.remove('collapsed');
		icon.className = 'fas fa-chevron-down conversation-tool-toggle-icon';
	} else {
		toolDetails.classList.add('collapsed');
		icon.className = 'fas fa-chevron-right conversation-tool-toggle-icon';
	}
}

function toggleConversationResult(resultIndex) {
	const resultHeader = event.currentTarget;
	const resultDetails = resultHeader.nextElementSibling;
	const icon = resultHeader.querySelector('.conversation-result-toggle-icon');
	
	if (resultDetails.classList.contains('collapsed')) {
		resultDetails.classList.remove('collapsed');
		icon.className = 'fas fa-chevron-down conversation-result-toggle-icon';
	} else {
		resultDetails.classList.add('collapsed');
		icon.className = 'fas fa-chevron-right conversation-result-toggle-icon';
	}
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
	const modals = document.querySelectorAll('.modal');
	modals.forEach(modal => {
		if (event.target === modal) {
			modal.classList.remove('active');
		}
	});
});
