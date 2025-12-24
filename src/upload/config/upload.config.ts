// src/upload/config/upload.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
  // File size limits (in bytes)
  maxFileSize: {
    image: 5 * 1024 * 1024,      // 5MB for images
    document: 10 * 1024 * 1024,   // 10MB for PDFs
  },

  // Allowed MIME types
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    document: ['application/pdf'],
    all: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  },

  // Image optimization settings
  imageOptimization: {
    quality: 85,
    maxWidth: 2048,
    maxHeight: 2048,
    thumbnail: {
      width: 300,
      height: 300,
    },
  },

  // Image dimension constraints (optional)
  imageDimensions: {
    profile: {
      minWidth: 200,
      minHeight: 200,
      maxWidth: 4096,
      maxHeight: 4096,
    },
    merchant: {
      minWidth: 400,
      minHeight: 400,
      maxWidth: 2048,
      maxHeight: 2048,
    },
  },

  // Folder structure
  folders: {
    profiles: 'profiles',
    kyc: 'kyc',
    merchants: 'merchants',
    receipts: 'receipts',
    temp: 'temp',
  },

  // Multiple file upload limits
  maxFiles: {
    kyc: 2,        // IC front + back
    general: 5,    // General uploads
  },
}));