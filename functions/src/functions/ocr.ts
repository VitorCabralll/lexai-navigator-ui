import { onRequest } from 'firebase-functions/v2/https';
import * as express from 'express';
import * as multer from 'multer';
import * as cors from 'cors';
import { OCRService } from '../services/ocrService';
import { validateFile } from '../utils/validation';
import { handleError, ValidationError } from '../utils/errors';

const app = express();
app.use(cors({ origin: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 }
});

app.post('/ocr', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      throw new ValidationError('Arquivo de imagem é obrigatório');
    }

    validateFile(file, [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ], 20 * 1024 * 1024);

    const ocrService = new OCRService();
    const { text, confidence } = await ocrService.processImage(file.buffer);

    res.json({ success: true, text, confidence });
  } catch (error) {
    const errorResponse = handleError(error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'ocr',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export const ocr = onRequest({ timeoutSeconds: 60, memory: '512MiB' }, app);
