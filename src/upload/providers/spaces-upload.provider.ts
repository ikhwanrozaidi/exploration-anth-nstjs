// src/upload/providers/spaces-upload.provider.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  cdnUrl: string;
  key: string;
  size: number;
  contentType: string;
}

@Injectable()
export class SpacesUploadProvider {
  private s3Client: S3Client;
  private bucket: string;
  private endpoint: string;
  private cdnEndpoint: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get('spaces.bucket');
    this.endpoint = this.configService.get('spaces.endpoint');
    this.cdnEndpoint = this.configService.get('spaces.cdnEndpoint');

    console.log('🪣 Spaces Configuration:');
    console.log('  Bucket:', this.bucket);
    console.log('  Endpoint:', this.endpoint);
    console.log('  CDN:', this.cdnEndpoint);
    console.log('  Region:', this.configService.get('spaces.region'));

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.configService.get('spaces.region'),
      credentials: {
        accessKeyId: this.configService.get('spaces.accessKeyId'),
        secretAccessKey: this.configService.get('spaces.secretAccessKey'),
      },
      forcePathStyle: false,
    });
  }

  /**
   * Upload file to Spaces
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: string,
    options?: {
      isPublic?: boolean;
      contentType?: string;
    },
  ): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExtension = originalName.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      // Upload to Spaces
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ACL: options?.isPublic ? 'public-read' : 'private',
        ContentType: options?.contentType || this.getContentType(fileExtension),
        CacheControl: 'max-age=31536000', // Cache for 1 year
      });

      await this.s3Client.send(command);

      // Return URLs
      const url = `${this.endpoint}/${this.bucket}/${key}`;
      const cdnUrl = `${this.cdnEndpoint}/${key}`;

      return {
        url,
        cdnUrl,
        key,
        size: buffer.length,
        contentType: options?.contentType || this.getContentType(fileExtension),
      };
    } catch (error) {
      console.error('Spaces upload error:', error);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  /**
   * Delete file from Spaces
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Spaces delete error:', error);
      throw new InternalServerErrorException('File deletion failed');
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get content type from file extension
   */
  private getContentType(extension: string): string {
    const contentTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
      mp4: 'video/mp4',
      zip: 'application/zip',
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
