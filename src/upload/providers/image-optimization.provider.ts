import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

export interface OptimizedImage {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

@Injectable()
export class ImageOptimizationProvider {
  constructor(private configService: ConfigService) {}

  /**
   * Optimize image (resize + compress)
   */
  async optimizeImage(
    buffer: Buffer,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    },
  ): Promise<OptimizedImage> {
    const maxWidth = options?.maxWidth || 
      this.configService.get('upload.imageOptimization.maxWidth');
    const maxHeight = options?.maxHeight || 
      this.configService.get('upload.imageOptimization.maxHeight');
    const quality = options?.quality || 
      this.configService.get('upload.imageOptimization.quality');

    // Process image
    const processed = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: processed.data,
      width: processed.info.width,
      height: processed.info.height,
      size: processed.info.size,
    };
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(buffer: Buffer): Promise<OptimizedImage> {
    const thumbWidth = this.configService.get('upload.imageOptimization.thumbnail.width');
    const thumbHeight = this.configService.get('upload.imageOptimization.thumbnail.height');

    const processed = await sharp(buffer)
      .resize(thumbWidth, thumbHeight, {
        fit: 'cover',
      })
      .jpeg({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: processed.data,
      width: processed.info.width,
      height: processed.info.height,
      size: processed.info.size,
    };
  }

  /**
   * Convert to WebP (better compression)
   */
  async convertToWebP(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer();
  }
}