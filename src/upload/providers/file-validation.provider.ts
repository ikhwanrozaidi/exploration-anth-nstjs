// src/upload/providers/file-validation.provider.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

@Injectable()
export class FileValidationProvider {
  constructor(private configService: ConfigService) {}

  /**
   * Validate file type
   */
  validateFileType(
    file: Express.Multer.File,
    category: 'image' | 'document' | 'all',
  ): ValidationResult {
    const allowedTypes = this.configService.get<string[]>(
      `upload.allowedMimeTypes.${category}`,
    );

    if (!allowedTypes || !allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes?.join(', ') || 'none'}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate file size
   */
  validateFileSize(
    file: Express.Multer.File,
    category: 'image' | 'document',
  ): ValidationResult {
    const maxSize = this.configService.get<number>(
      `upload.maxFileSize.${category}`,
    );

    if (!maxSize) {
      return {
        isValid: false,
        error: 'Invalid file category configuration',
      };
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate file name (security check)
   */
  validateFileName(fileName: string): ValidationResult {
    // Prevent path traversal attacks
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return {
        isValid: false,
        error: 'Invalid file name',
      };
    }

    // Check for dangerous extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.jsp', '.asp',
      '.html', '.htm', '.svg', // SVG can contain scripts
    ];

    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'File type not allowed for security reasons',
      };
    }

    return { isValid: true };
  }

  /**
   * Complete validation
   */
  validate(
    file: Express.Multer.File,
    options: {
      category: 'image' | 'document' | 'all';
      maxSize?: number;
    },
  ): void {
    // Validate file exists
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file name
    const fileNameCheck = this.validateFileName(file.originalname);
    if (!fileNameCheck.isValid) {
      throw new BadRequestException(fileNameCheck.error);
    }

    // Validate file type
    const typeCheck = this.validateFileType(file, options.category);
    if (!typeCheck.isValid) {
      throw new BadRequestException(typeCheck.error);
    }

    // Validate file size
    // Map 'all' category to 'document' for size validation
    const sizeCategory: 'image' | 'document' = 
      options.category === 'all' ? 'document' : options.category;

    const sizeCheck = this.validateFileSize(file, sizeCategory);
    if (!sizeCheck.isValid) {
      throw new BadRequestException(sizeCheck.error);
    }
  }

  /**
   * Validate multiple files
   */
  validateMultiple(
    files: Express.Multer.File[],
    options: {
      category: 'image' | 'document' | 'all';
      maxFiles?: number;
    },
  ): void {
    // Check if files exist
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Check max files limit
    if (options.maxFiles && files.length > options.maxFiles) {
      throw new BadRequestException(
        `Maximum ${options.maxFiles} files allowed. You uploaded ${files.length} files.`,
      );
    }

    // Validate each file
    files.forEach((file, index) => {
      try {
        this.validate(file, options);
      } catch (error) {
        throw new BadRequestException(
          `File ${index + 1} (${file.originalname}): ${error.message}`,
        );
      }
    });
  }

  /**
   * Check if file is an image
   */
  isImage(file: Express.Multer.File): boolean {
    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return imageMimeTypes.includes(file.mimetype);
  }

  /**
   * Check if file is a PDF
   */
  isPdf(file: Express.Multer.File): boolean {
    return file.mimetype === 'application/pdf';
  }

  /**
   * Get file extension
   */
  getFileExtension(fileName: string): string {
    return fileName.toLowerCase().substring(fileName.lastIndexOf('.') + 1);
  }

  /**
   * Validate image dimensions (optional - requires sharp)
   */
  async validateImageDimensions(
    buffer: Buffer,
    options: {
      minWidth?: number;
      minHeight?: number;
      maxWidth?: number;
      maxHeight?: number;
    },
  ): Promise<ValidationResult> {
    try {
      // This requires sharp package
      const sharp = require('sharp');
      const metadata = await sharp(buffer).metadata();

      if (options.minWidth && metadata.width < options.minWidth) {
        return {
          isValid: false,
          error: `Image width must be at least ${options.minWidth}px`,
        };
      }

      if (options.minHeight && metadata.height < options.minHeight) {
        return {
          isValid: false,
          error: `Image height must be at least ${options.minHeight}px`,
        };
      }

      if (options.maxWidth && metadata.width > options.maxWidth) {
        return {
          isValid: false,
          error: `Image width must not exceed ${options.maxWidth}px`,
        };
      }

      if (options.maxHeight && metadata.height > options.maxHeight) {
        return {
          isValid: false,
          error: `Image height must not exceed ${options.maxHeight}px`,
        };
      }

      return { isValid: true };

    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid image file',
      };
    }
  }
}