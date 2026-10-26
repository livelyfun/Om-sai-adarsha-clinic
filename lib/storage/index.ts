import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

export interface StorageMetadata {
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
}

export interface ReportStorage {
  put(key: string, buffer: Buffer, metadata: StorageMetadata): Promise<void>;
  openStream(key: string): Promise<Readable>;
  delete(key: string): Promise<void>;
  getStatus(): { provider: string; status: 'DEVELOPMENT_LOCAL_NOT_FOR_PRODUCTION' | 'NOT_CONFIGURED' | 'CONFIGURED' };
}

/**
 * Local File Driver for Development.
 * WARNING: NOT FOR PRODUCTION USE.
 * Containerized platforms run on ephemeral disks. Production requires a private Cloud Storage bucket (GCS or S3).
 */
class LocalDevelopmentReportStorage implements ReportStorage {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'storage', 'secure-reports');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async put(key: string, buffer: Buffer): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    // Prevent path traversal
    if (!filePath.startsWith(this.baseDir)) {
      throw new Error('Invalid storage key');
    }
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, buffer);
  }

  async openStream(key: string): Promise<Readable> {
    const filePath = path.join(this.baseDir, key);
    if (!filePath.startsWith(this.baseDir) || !fs.existsSync(filePath)) {
      throw new Error('Report file not found in storage');
    }
    return fs.createReadStream(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    if (filePath.startsWith(this.baseDir) && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getStatus() {
    return {
      provider: 'local-filesystem',
      status: 'DEVELOPMENT_LOCAL_NOT_FOR_PRODUCTION' as const,
    };
  }
}

/**
 * Production Cloud Storage Boundary.
 * Labeled NOT CONFIGURED until cloud storage bucket and access credentials are provided.
 */
class ProductionCloudStorageBoundary implements ReportStorage {
  async put(): Promise<void> {
    throw new Error('Report storage NOT CONFIGURED: Cloud storage bucket credentials must be supplied in production.');
  }

  async openStream(): Promise<Readable> {
    throw new Error('Report storage NOT CONFIGURED: Cloud storage bucket credentials must be supplied in production.');
  }

  async delete(): Promise<void> {
    throw new Error('Report storage NOT CONFIGURED.');
  }

  getStatus() {
    return {
      provider: process.env.STORAGE_PROVIDER || 'gcs-bucket',
      status: 'NOT_CONFIGURED' as const,
    };
  }
}

const isProduction = process.env.APP_ENV === 'production';
const hasCloudStorageConfig = Boolean(process.env.STORAGE_BUCKET_NAME && process.env.STORAGE_ACCESS_KEY);

export const reportStorage: ReportStorage = 
  isProduction && !hasCloudStorageConfig
    ? new ProductionCloudStorageBoundary()
    : new LocalDevelopmentReportStorage();
