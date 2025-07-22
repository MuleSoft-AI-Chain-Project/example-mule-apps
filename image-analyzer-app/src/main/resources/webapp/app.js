const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const uploadButton = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const outputElement = document.getElementById('rest-api-output'); // Element to display the API response
const instructionsInput = document.getElementById('instructions');


// Function to disable inputs during processing
function disableInputsDuringProcessing() {
    captureButton.disabled = true;
    uploadButton.disabled = true;
    instructionsInput.disabled = true;
}

// Function to enable inputs after processing
function enableInputsAfterProcessing() {
    captureButton.disabled = false;
    uploadButton.disabled = false;
    instructionsInput.disabled = false;
    instructionsInput.value = ''; // Clear the input field
}

// Get the user's camera stream
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" } // "user" for front camera, "environment" for back camera
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error accessing the camera: ", err);
        alert("Error accessing the camera. Please make sure your device has a working camera.");
    }
}

startCamera();

// Capture the image from the video stream
captureButton.addEventListener('click', () => {
    // Set the canvas dimensions to match the video element's dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the data URL (Base64 string) of the image
    const dataURL = canvas.toDataURL('image/png');

    // Display the captured image
    photo.src = dataURL;
    photo.style.display = 'block';
    photo.classList.add('show');  // Apply the smooth fade-in effect

    // Hide video and show photo after capture
    video.style.display = 'none';
    photo.style.display = 'block';
    
});

// Upload the captured image to the REST API
uploadButton.addEventListener('click', async () => {
    disableInputsDuringProcessing();
    outputElement.innerHTML = 'Processing...';

    // 1. Convert the canvas to an image data URL
    const dataURL = canvas.toDataURL('image/png');
    const instructions = instructionsInput.value;

    // 2. Load the jsPDF library
    const { jsPDF } = window.jspdf;

    // 3. Create a new PDF document
    const pdf = new jsPDF();

    // 4. Add the image to the PDF
    pdf.addImage(dataURL, 'PNG', 10, 10, 180, 160); // Adjust positioning and size as needed

    // 5. Get the PDF as a base64 string
    const pdfBase64String = pdf.output('datauristring').split(',')[1];

    // 6. Create the payload object
    const payload = {
        pdf: pdfBase64String, // Base64 string of the PDF,
        prompt: instructions
    };

    // Debugging: Check if payload is created correctly
    console.log("Payload:", payload);

    try {
        // 7. Send the PDF data as a base64 string to the REST API using Fetch
        const response = await fetch('https://image-analyse-agent-fjrr5q.5sc6y6-3.usa-e2.cloudhub.io/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // For CORS
            },
            body: JSON.stringify(payload)
        });

        // 8. Parse the JSON response
        const jsonResponse = await response.json();

        // 9. Extract and display the response and token usage
        const imageDescription = jsonResponse.response[0];
        const tokenUsage = jsonResponse.tokenUsage[0];

        // Display the response in the 'rest-api-output' div
        outputElement.innerHTML = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <strong>Response:</strong>
                <p style="margin-top: 0;">${imageDescription}</p>
                <strong>Token Usage:</strong>
                <table style="border-collapse: collapse; margin-top: 5px; font-size: 14px;">
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 4px; font-weight: bold;">Input Count</td>
                        <td style="border: 1px solid #ddd; padding: 4px;">${tokenUsage.inputCount}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 4px; font-weight: bold;">Output Count</td>
                        <td style="border: 1px solid #ddd; padding: 4px;">${tokenUsage.outputCount}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 4px; font-weight: bold;">Total Count</td>
                        <td style="border: 1px solid #ddd; padding: 4px;">${tokenUsage.totalCount}</td>
                    </tr>
                </table>
            </div>
        `;
        console.log('Image uploaded successfully:', jsonResponse);
        // Hide video and show photo after capture
        video.style.display = 'block';
        photo.style.display = 'none';
            
    } catch (err) {
        console.error('Error uploading image:', err);
        outputElement.innerHTML = `<strong>Error:</strong> Could not upload the image.`;
    } finally {
        enableInputsAfterProcessing();
    }
});

// Add this to switch back to video view
photo.addEventListener('click', () => {
    video.style.display = 'block';
    photo.style.display = 'none';
});

// Utility function to convert Base64 to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}
