const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const recordBtn = document.getElementById('record-btn');
const stopRecordBtn = document.getElementById('stop-record-btn');
const uploadedImage = document.getElementById('uploaded-image');
const uploadedVideo = document.getElementById('uploaded-video');

let mediaRecorder;
let recordedChunks = [];

// เริ่มการสตรีมกล้อง
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing camera: ', error);
    });

// จับภาพและอัปโหลด
captureBtn.addEventListener('click', async () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    const fileName = `photo-${Date.now()}.png`;

    // ส่งรูปภาพไปยัง API
    const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: JSON.stringify({
            file: imageData.split(',')[1], // ตัด "data:image/png;base64," ออก
            fileName: fileName
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    if (response.ok) {
        uploadedImage.src = result.filePath;
        uploadedImage.style.display = 'block';
        uploadedVideo.style.display = 'none';
    } else {
        console.error('Failed to upload photo');
    }
});

// บันทึกวิดีโอ
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
        const fileReader = new FileReader();
        fileReader.onloadend = async () => {
            const fileName = `video-${Date.now()}.mp4`;

            // ส่งวิดีโอไปยัง API
            const response = await fetch('/.netlify/functions/upload', {
                method: 'POST',
                body: JSON.stringify({
                    file: fileReader.result.split(',')[1], // ตัด "data:video/mp4;base64," ออก
                    fileName: fileName
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (response.ok) {
                uploadedVideo.src = result.filePath;
                uploadedVideo.style.display = 'block';
                uploadedImage.style.display = 'none';
            } else {
                console.error('Failed to upload video');
            }
        };
        fileReader.readAsDataURL(blob);
    };
    mediaRecorder.start();
    recordBtn.disabled = true;
    stopRecordBtn.disabled = false;
});

// หยุดบันทึกวิดีโอ
stopRecordBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopRecordBtn.disabled = true;
});
