
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage();
    this.bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'lexai-default.appspot.com';
  }

  async uploadFile(
    buffer: Buffer, 
    fileName: string, 
    workspaceId: string, 
    folder: 'uploads' | 'generated' = 'uploads'
  ): Promise<string> {
    const fileId = uuidv4();
    const filePath = `${workspaceId}/${folder}/${fileId}_${fileName}`;
    
    const file = this.storage.bucket(this.bucketName).file(filePath);
    
    await file.save(buffer, {
      metadata: {
        contentType: this.getContentType(fileName),
        metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
          workspaceId
        }
      }
    });

    return `gs://${this.bucketName}/${filePath}`;
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    const file = this.storage.bucket(this.bucketName).file(filePath);
    const [buffer] = await file.download();
    return buffer;
  }

  async deleteFile(filePath: string): Promise<void> {
    const file = this.storage.bucket(this.bucketName).file(filePath);
    await file.delete();
  }

  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const file = this.storage.bucket(this.bucketName).file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000
    });
    return url;
  }

  private getContentType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}
