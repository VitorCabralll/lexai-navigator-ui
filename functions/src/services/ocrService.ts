import { createWorker } from 'tesseract.js';
import * as logger from 'firebase-functions/v2/logger';

export interface OcrResult {
  text: string;
  confidence: number;
}

export class OCRService {
  async processImage(buffer: Buffer): Promise<OcrResult> {
    const worker = await createWorker('por');
    const { data } = await worker.recognize(buffer);
    await worker.terminate();

    logger.info('OCR processing finished', { confidence: data.confidence });

    return {
      text: data.text.trim(),
      confidence: data.confidence
    };
  }
}
