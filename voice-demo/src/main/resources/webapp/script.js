document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const voiceSelect = document.getElementById('voiceSelect');
    const responseAudio = document.getElementById('responseAudio');
    const chatWindow = document.getElementById('chatWindow');
    const spinner = document.getElementById('spinner');
    const chatContent = document.querySelector('.chat-content'); // Updated to target chat-content

    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    function resetMetrics() {
        // Reset the text and styles of the metric boxes to default
        const inputTokensBox = document.getElementById('input-tokens');
        const outputTokensBox = document.getElementById('output-tokens');
        const totalTokensBox = document.getElementById('total-tokens');
        const toolsUsedBox = document.getElementById('tool-used');
    
        // Reset the text content to default values
        inputTokensBox.textContent = "Input tokens";  // Default text
        outputTokensBox.textContent = "Output tokens"; // Default text
        totalTokensBox.textContent = "Total tokens";  // Default text
        toolsUsedBox.textContent = "Tools used";  // Default text
    
        // Reset the background color and text color to default
        inputTokensBox.style.backgroundColor = '#f4f4f4'; // Light grey
        inputTokensBox.style.color = '#333'; // Default text color
    
        outputTokensBox.style.backgroundColor = '#f4f4f4'; // Light grey
        outputTokensBox.style.color = '#333'; // Default text color
    
        totalTokensBox.style.backgroundColor = '#f4f4f4'; // Light grey
        totalTokensBox.style.color = '#333'; // Default text color
    
        toolsUsedBox.style.backgroundColor = '#f4f4f4'; // Light grey
        toolsUsedBox.style.color = '#333'; // Default text color
    }

    toggleBtn.addEventListener('click', async () => {
        if (isRecording) {
            stopRecording();
        } else {
            resetMetrics(); // Reset metrics before starting a new recording
            startRecording();
        }
    });

    async function startRecording() {
        toggleBtn.textContent = 'Stop Recording';
        toggleBtn.disabled = true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);

                reader.onloadend = async () => {
                    const base64AudioMessage = reader.result.split(',')[1]; // Get the base64 string
                    const selectedVoice = voiceSelect.value;

                    // Show the spinner while waiting for the response
                    spinner.style.display = 'inline-block';

                    // Send the audio file and selected voice to the REST API
                    const payload = {
                        voice: selectedVoice,
                        audio: base64AudioMessage
                    };

                    try { 
// Local runtime                        
//                        const response = await fetch('http://localhost:8081/chat', {
// Jeroen's Anypoint
//                        const response = await fetch('https://mac-voice-connector-8w8sxt.rajrd4-2.usa-e1.cloudhub.io/chat', { 
// 1Platform Anypoint
                        const response = await fetch('https://mac-voice-connector-fjrr5q.5sc6y6-3.usa-e2.cloudhub.io/chat', {                           
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        });
                        const result = await response.json();
                        if (result) {
                            // Create a unique URL for the audio response
                            const uniqueUrl = `../web/speech.mp3?timestamp=${new Date().getTime()}`;
                            responseAudio.src = uniqueUrl;
                            responseAudio.play();

                            // Display the question and answer in the chat window
                            displayChatMessage(result.question, result.answer);
                            displayMetrics(result.tokenUsage, result.toolsUsed);
                        } else {
                            console.error('No audio URL in response');
                        }
                    } catch (error) {
                        console.error('Error sending audio to API:', error);
                    } finally {
                        // Hide the spinner once the API call is completed
                        spinner.style.display = 'none';
                    }

                    audioChunks = [];
                    toggleBtn.textContent = 'Start Recording';
                    toggleBtn.disabled = false;
                    isRecording = false;
                };
            };

            mediaRecorder.start();
            isRecording = true;
            toggleBtn.disabled = false;
        } catch (err) {
            console.error('Error accessing the microphone', err);
            toggleBtn.textContent = 'Start Recording';
            toggleBtn.disabled = false;
            isRecording = false;
        }
    }

    function stopRecording() {
        toggleBtn.disabled = true;
        mediaRecorder.stop();
    }

    async function wait() {
        console.log('Start');
        // Wait for 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('End');
    }

    function displayChatMessage(question, answer) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chat-message');

        const questionElement = document.createElement('div');
        questionElement.classList.add('chat-question');
        questionElement.textContent = `Question: ${question}`;

        const answerElement = document.createElement('div');
        answerElement.classList.add('chat-answer');
        answerElement.textContent = `Answer: ${answer}`;

        messageContainer.appendChild(questionElement);
        messageContainer.appendChild(answerElement);

        chatContent.appendChild(messageContainer); // Updated to append to chatContent
        chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the bottom
    }

    function displayMetrics(tokenUsage, toolsUsed){
        // Update the text of the input, output, and total token elements
        const inputTokensBox = document.getElementById('input-tokens');
        const outputTokensBox = document.getElementById('output-tokens');
        const totalTokensBox = document.getElementById('total-tokens');
        const toolsUsedBox = document.getElementById('tool-used');

        // Update input tokens
        inputTokensBox.innerHTML = `Input tokens: <span style="font-weight: bold;">${tokenUsage.inputCount}</span>`;
        inputTokensBox.style.backgroundColor = 'lightblue'; // Set background color to blue

        // Update output tokens
        outputTokensBox.innerHTML = `Output tokens: <span style="font-weight: bold;">${tokenUsage.outputCount}</span>`;
        outputTokensBox.style.backgroundColor = 'lightblue'; // Set background color to blue

        // Update total tokens
        totalTokensBox.innerHTML = `Total tokens: <span style="font-weight: bold;">${tokenUsage.totalCount}</span>`;
        totalTokensBox.style.backgroundColor = 'lightblue'; // Set background color to blue

        // Update tools used
        toolsUsedBox.style.backgroundColor = 'lightblue'; // Set background color to blue
        if (toolsUsed === "true") {
            toolsUsedBox.innerHTML = 'Tools used: <span style="font-weight: bold;">Yes</span>';
        } else {
            toolsUsedBox.innerHTML = 'Tools used: <span style="font-weight: bold;">No</span>';
        }
    }
});