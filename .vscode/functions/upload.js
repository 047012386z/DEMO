const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body);
        const { file, fileName } = body;

        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        const buffer = Buffer.from(file, 'base64');
        fs.writeFileSync(filePath, buffer);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File uploaded successfully', filePath: `/uploads/${fileName}` })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to upload file' })
        };
    }
};
