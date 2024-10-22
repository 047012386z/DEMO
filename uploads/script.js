const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const recordBtn = document.getElementById('record-btn');
const stopRecordBtn = document.getElementById('stop-record-btn');
const uploadedImage = document.getElementById('uploaded-image');
const uploadedVideo = document.getElementById('uploaded-video');

let mediaRecorder;
let recordedChunks = [];

// Start the camera stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing camera: ', error);
    });

// Capture photo
captureBtn.addEventListener('click', async () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    await uploadImage(imageData);
});

// Start recording video
recordBtn.addEventListener('click', () => {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(video.srcObject);
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/mp4' });
        await uploadVideo(blob);
    };
    mediaRecorder.start();
    recordBtn.disabled = true;
    stopRecordBtn.disabled = false;
});

// Stop recording video
stopRecordBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopRecordBtn.disabled = true;
});

// Function to upload image
async function uploadImage(imageData) {
    const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: JSON.stringify({
            file: imageData.split(',')[1], // Get base64 data
            fileName: 'captured-photo.png'
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const result = await response.json();
        uploadedImage.src = result.filePath; // Update the image source
        uploadedImage.style.display = 'block'; // Show the image
    } else {
        console.error('Failed to upload photo');
    }
}

// Function to upload video
async function uploadVideo(blob) {
    const formData = new FormData();
    formData.append('file', blob, 'recorded-video.mp4');

    const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const result = await response.json();
        uploadedVideo.src = result.filePath; // Update the video source
        uploadedVideo.style.display = 'block'; // Show the video
    } else {
        console.error('Failed to upload video');
    }
}
