const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const uploadButton = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const resultImage = document.getElementById('result-image');
const loadingMessage = document.getElementById('loading-message');
const styleSelect = document.getElementById('style-select');
const downloadButton = document.getElementById('download-button');

function downloadImage(imageSrc) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = 'analysis_result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

downloadButton.addEventListener('click', () => {
    if (resultImage.src) {
        downloadImage(resultImage.src);
    }
});


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


    video.style.display = 'none';
    photo.style.display = 'block';
});

function disableInputsDuringProcessing() {
    captureButton.disabled = true;
    uploadButton.disabled = true;
    styleSelect.disabled = true;
    loadingMessage.textContent = 'Processing...';
    loadingMessage.style.display = 'block';
    resultImage.style.display = 'none';
    downloadButton.style.visibility = 'hidden';
}

function enableInputsAfterProcessing() {
    captureButton.disabled = false;
    uploadButton.disabled = false;
    styleSelect.disabled = false;
    styleSelect.value = 'marvel-heroes'; // Reset to default option
    downloadButton.style.visibility = 'visible';
}

uploadButton.addEventListener('click', async () => {
    disableInputsDuringProcessing();
    // 1. Convert the canvas to an image data URL
    const dataURL = canvas.toDataURL('image/png');
    const imageBase64String = canvas.toDataURL('image/png').split(',')[1];

    const selectedStyle = styleSelect.value;

    // 2. Load the jsPDF library
    const { jsPDF } = window.jspdf;

    // 3. Create a new PDF document
    const pdf = new jsPDF();

    // 4. Add the image to the PDF
    pdf.addImage(dataURL, 'PNG', 10, 10, 180, 160); // Adjust positioning and size as needed

    // 5. Get the PDF as a base64 string
    const pdfBase64String = pdf.output('datauristring').split(',')[1];

    const payload = {
        pdf: pdfBase64String,
        png: imageBase64String,
        instructions: selectedStyle
    };

    try {
        const response = await fetch('https://mac-image-replication-app-fjrr5q.5sc6y6-1.usa-e2.cloudhub.io//upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(payload)
        });

        const jsonResponse = await response.json();

        console.log('Image URL:', jsonResponse.imageURL);


        if (jsonResponse.imageURL) {
            resultImage.src = jsonResponse.imageURL;
            resultImage.style.display = 'block';
            loadingMessage.style.display = 'none';
            downloadButton.style.display = 'block';
        } else {
            loadingMessage.textContent = 'No image result available';
            loadingMessage.style.display = 'block';
            resultImage.style.display = 'none';
            downloadButton.style.display = 'none';
        }

        // Hide video and show photo after capture
        video.style.display = 'block';
        photo.style.display = 'none';

        console.log('Image uploaded successfully:', jsonResponse);
    } catch (err) {
         console.error('Error uploading image:', err);
        loadingMessage.textContent = 'Error: Could not upload the image';
        loadingMessage.style.display = 'block';
        resultImage.style.display = 'none';
        downloadButton.style.display = 'none';
    } finally {
        enableInputsAfterProcessing();

    }
});

photo.addEventListener('click', () => {
    video.style.display = 'block';
    photo.style.display = 'none';
});