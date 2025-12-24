// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { FileValidationProvider } from './providers/file-validation.provider';
import { ImageOptimizationProvider } from './providers/image-optimization.provider';
import { SpacesUploadProvider, UploadResult } from './providers/spaces-upload.provider';

@Injectable()
export class UploadService {
  constructor(
    private fileValidation: FileValidationProvider,
    private imageOptimization: ImageOptimizationProvider,
    private spacesUpload: SpacesUploadProvider,
  ) {}

  /**
   * Upload profile picture (with optimization)
   */
  async uploadProfilePicture(
    file: Express.Multer.File,
    userId: number,
  ): Promise<UploadResult> {
    // Validate
    this.fileValidation.validate(file, { category: 'image' });

    // Optimize image
    const optimized = await this.imageOptimization.optimizeImage(file.buffer);

    // Upload to Spaces
    const result = await this.spacesUpload.uploadFile(
      optimized.buffer,
      file.originalname,
      `profiles/${userId}`,
      {
        isPublic: true,
        contentType: 'image/jpeg',
      },
    );

    return result;
  }

  /**
   * Upload KYC document (secure, no optimization)
   */
  async uploadKycDocument(
    file: Express.Multer.File,
    userId: number,
    documentType: 'ic_front' | 'ic_back',
  ): Promise<UploadResult> {
    // Validate
    this.fileValidation.validate(file, { category: 'all' });

    // Upload to Spaces (PRIVATE)
    const result = await this.spacesUpload.uploadFile(
      file.buffer,
      file.originalname,
      `kyc/${userId}`,
      {
        isPublic: false, // KYC docs should be private
        contentType: file.mimetype,
      },
    );

    return result;
  }

  /**
   * Upload merchant logo (with optimization + thumbnail)
   */
  async uploadMerchantLogo(
    file: Express.Multer.File,
    merchantId: number,
  ): Promise<{ main: UploadResult; thumbnail: UploadResult }> {
    // Validate
    this.fileValidation.validate(file, { category: 'image' });

    // Optimize main logo
    const optimized = await this.imageOptimization.optimizeImage(file.buffer);

    // Create thumbnail
    const thumbnail = await this.imageOptimization.createThumbnail(file.buffer);

    // Upload both versions
    const [mainResult, thumbResult] = await Promise.all([
      this.spacesUpload.uploadFile(
        optimized.buffer,
        file.originalname,
        `merchants/${merchantId}`,
        { isPublic: true, contentType: 'image/jpeg' },
      ),
      this.spacesUpload.uploadFile(
        thumbnail.buffer,
        `thumb_${file.originalname}`,
        `merchants/${merchantId}/thumbnails`,
        { isPublic: true, contentType: 'image/jpeg' },
      ),
    ]);

    return {
      main: mainResult,
      thumbnail: thumbResult,
    };
  }

  /**
   * Delete file
   */
  async deleteFile(key: string): Promise<void> {
    await this.spacesUpload.deleteFile(key);
  }
}