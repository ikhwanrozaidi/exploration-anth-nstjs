import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export interface ProofUploadResult {
  url: string;
  cdnUrl: string;
  key: string;
  size: number;
}

@Injectable()
export class PaymentProofUploadProvider {
  private s3Client: S3Client;
  private bucket: string;
  private endpoint: string;
  private cdnEndpoint: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get('spaces.bucket');
    this.endpoint = this.configService.get('spaces.endpoint');
    this.cdnEndpoint = this.configService.get('spaces.cdnEndpoint');

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
   * Upload payment proof images
   */
  async uploadProofImages(
    files: Express.Multer.File[],
    paymentId: string,
  ): Promise<ProofUploadResult[]> {
    // Validate files count
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one proof image is required');
    }

    if (files.length > 3) {
      throw new BadRequestException('Maximum 3 proof images allowed');
    }

    // Validate each file
    files.forEach((file, index) => {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Image ${index + 1}: Invalid file type. Only JPEG, PNG, and WebP allowed.`,
        );
      }

      // Check file size (max 5MB per image)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          `Image ${index + 1}: File size exceeds 5MB limit.`,
        );
      }
    });

    // Upload all files
    const uploadPromises = files.map((file, index) => 
      this.uploadSingleProof(file, paymentId, index + 1)
    );

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading proof images:', error);
      throw new InternalServerErrorException('Failed to upload proof images');
    }
  }

  /**
   * Upload single proof image
   */
  private async uploadSingleProof(
    file: Express.Multer.File,
    paymentId: string,
    imageNumber: number,
  ): Promise<ProofUploadResult> {
    try {
      // Get file extension
      const fileExtension = file.originalname.split('.').pop();
      
      // Create key: order-received-proof/paymentId/proof-1.jpg
      const fileName = `proof-${imageNumber}.${fileExtension}`;
      const key = `order-received-proof/${paymentId}/${fileName}`;

      // Upload to Spaces
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ACL: 'private', // Private - only accessible via signed URLs
        ContentType: file.mimetype,
        CacheControl: 'max-age=31536000',
      });

      await this.s3Client.send(command);

      // Return URLs
      const url = `${this.endpoint}/${this.bucket}/${key}`;
      const cdnUrl = `${this.cdnEndpoint}/${key}`;

      return {
        url,
        cdnUrl,
        key,
        size: file.size,
      };

    } catch (error) {
      console.error(`Error uploading proof image ${imageNumber}:`, error);
      throw new InternalServerErrorException(
        `Failed to upload proof image ${imageNumber}`,
      );
    }
  }
}