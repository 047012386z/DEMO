const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body);
        const { file, fileName } = body;

        // Path สำหรับเก็บไฟล์ที่อัปโหลด
        const uploadDir = path.join(__dirname, '../../uploads');

        // สร้างโฟลเดอร์หากยังไม่มี
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Path ของไฟล์ที่จะบันทึก
        const filePath = path.join(uploadDir, fileName);

        // แปลง Base64 เป็น Buffer และบันทึกไฟล์
        const buffer = Buffer.from(file, 'base64');
        fs.writeFileSync(filePath, buffer);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File uploaded successfully' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to upload file' })
        };
    }
};
