import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/configuration';

/**
 * Cloudflare R2 (S3-compatible): product files, cover images, invoice PDFs.
 * The bucket stays private. Everything is reached through short-lived signed URLs.
 */
@Injectable()
export class StorageService {
  private client?: S3Client;

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  private get r2() {
    return this.config.get('r2', { infer: true });
  }

  get isConfigured(): boolean {
    const r2 = this.r2;
    return Boolean(r2.accountId && r2.accessKeyId && r2.secretAccessKey && r2.bucket);
  }

  private s3(): S3Client {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        'File storage is not configured yet. Add the R2_* variables.',
      );
    }
    this.client ??= new S3Client({
      region: 'auto',
      endpoint: `https://${this.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: this.r2.accessKeyId, secretAccessKey: this.r2.secretAccessKey },
    });
    return this.client;
  }

  /** Presigned PUT so the browser uploads straight to R2, not through our API. */
  getSignedUploadUrl(key: string, contentType: string, expiresInSeconds = 600): Promise<string> {
    return getSignedUrl(
      this.s3(),
      new PutObjectCommand({ Bucket: this.r2.bucket, Key: key, ContentType: contentType }),
      { expiresIn: expiresInSeconds },
    );
  }

  /** Presigned GET. Pass `downloadName` to make the browser save the file under that name. */
  getSignedDownloadUrl(
    key: string,
    expiresInSeconds = 600,
    downloadName?: string,
  ): Promise<string> {
    const safeName = downloadName?.replace(/[^\w.\- ]+/g, '_');
    return getSignedUrl(
      this.s3(),
      new GetObjectCommand({
        Bucket: this.r2.bucket,
        Key: key,
        ...(safeName ? { ResponseContentDisposition: `attachment; filename="${safeName}"` } : {}),
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  /** Server-side upload (invoice PDFs). */
  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.s3().send(
      new PutObjectCommand({
        Bucket: this.r2.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }
}
