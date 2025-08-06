import { registerAs } from '@nestjs/config';

export default registerAs('multer', () => ({
    UPLOAD_DESTINATION: process.env.UPLOAD_DESTINATION || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por defecto
    ALLOWED_MIME_TYPES: process.env.ALLOWED_MIME_TYPES?.split(',') || [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
    ],
}));