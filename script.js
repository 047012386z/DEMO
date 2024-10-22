const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');

// เริ่มการสตรีมกล้อง
navigator.mediaDevices.getUserMedia({ video: true })
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
    const fileName = 'captured-photo.png';

    // ส่งข้อมูลรูปภาพไปยัง API
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

    if (response.ok) {
        console.log('File uploaded successfully');
    } else {
        console.error('File upload failed');
    }
});
