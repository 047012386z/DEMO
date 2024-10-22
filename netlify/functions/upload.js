const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');
const sharp = require('sharp');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        
        // Handle image uploads
        if (body.file && body.fileName) {
            const buffer = Buffer.from(body.file, 'base64');
            const filePath = path.join(__dirname, '../uploads', body.fileName);
            await sharp(buffer).toFile(filePath); // Resize or process if needed
            
            return {
                statusCode: 200,
                body: JSON.stringify({ filePath: `/uploads/${body.fileName}` }),
            };
        }

        // Handle video uploads
        const data = event.body; // Use raw body for FormData
        const buffer = Buffer.from(data, 'binary');
        const videoPath = path.join(__dirname, '../uploads', 'recorded-video.mp4');
        fs.writeFileSync(videoPath, buffer);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ filePath: `/uploads/recorded-video.mp4` }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error uploading file' }),
        };
    }
};
