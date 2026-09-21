import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { IStorageService, FileMetadata } from './IStorageService.js';

export class LocalStorageService implements IStorageService {
  private baseDir: string;
  private baseUrl: string;

  constructor(baseDir?: string, baseUrl: string = '/uploads') {
    this.baseDir = baseDir || path.resolve(process.cwd(), 'uploads');
    this.baseUrl = baseUrl;
    this.ensureDirectoryExists(this.baseDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public async saveFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'reports'
  ): Promise<FileMetadata> {
    const targetFolder = path.join(this.baseDir, folder);
    this.ensureDirectoryExists(targetFolder);

    const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fullPath = path.join(targetFolder, safeName);

    await fs.promises.writeFile(fullPath, fileBuffer);

    const relativePath = path.posix.join(folder, safeName);
    const url = `${this.baseUrl}/${relativePath}`;

    return {
      fileName: safeName,
      originalName: fileName,
      mimeType,
      size: fileBuffer.length,
      filePath: fullPath,
      url,
    };
  }

  public async getFileStream(filePath: string): Promise<Readable> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.createReadStream(filePath);
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public getFileUrl(filePath: string): string {
    const relative = path.relative(this.baseDir, filePath).replace(/\\/g, '/');
    return `${this.baseUrl}/${relative}`;
  }
}

export const storageService = new LocalStorageService();
