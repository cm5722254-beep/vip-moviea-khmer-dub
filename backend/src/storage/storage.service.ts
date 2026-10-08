import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.region = process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1';
    this.bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || '';

    this.s3 = new S3Client({
      region: this.region,
      endpoint: process.env.S3_ENDPOINT, // For S3-compatible services like MinIO
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: !!process.env.S3_ENDPOINT, // MinIO requires path style
    });
  }

  async uploadFile(
    key: string,
    body: Buffer | Uint8Array,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    if (!this.bucket) {
      throw new InternalServerErrorException('S3 bucket មិនបានកំណត់');
    }

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          Metadata: metadata,
          ServerSideEncryption: 'AES256',
        }),
      );

      this.logger.log(`File uploaded: ${key}`);
      // Return storage key (NEVER the raw URL)
      return key;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error);
      throw new InternalServerErrorException('ការផ្ទុករូបភាពបរាជ័យ');
    }
  }

  /**
   * Generate a short-lived signed URL for secure content delivery.
   * NEVER expose raw storage keys or permanent URLs to the frontend.
   */
  async generateSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!this.bucket) {
      throw new InternalServerErrorException('S3 bucket មិនបានកំណត់');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3, command, { expiresIn });
      this.logger.debug(`Signed URL generated for key: ${key}, expires in ${expiresIn}s`);
      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for: ${key}`, error);
      throw new InternalServerErrorException('ការបង្កើត URL សម្ងាត់បរាជ័យ');
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.bucket) {
      throw new InternalServerErrorException('S3 bucket មិនបានកំណត់');
    }

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
      throw new InternalServerErrorException('ការលុបឯកសារបរាជ័យ');
    }
  }

  buildKey(prefix: string, filename: string): string {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${prefix}/${timestamp}_${sanitized}`;
  }
}
