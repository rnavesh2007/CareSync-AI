import { Readable } from 'stream';

export interface FileMetadata {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  url: string;
}

export interface IStorageService {
  /**
   * Save a file buffer to storage
   */
  saveFile(fileBuffer: Buffer, fileName: string, mimeType: string, folder?: string): Promise<FileMetadata>;

  /**
   * Get file stream for download or processing
   */
  getFileStream(filePath: string): Promise<Readable>;

  /**
   * Delete file from storage
   */
  deleteFile(filePath: string): Promise<boolean>;

  /**
   * Get public or streamable URL
   */
  getFileUrl(filePath: string): string;
}
