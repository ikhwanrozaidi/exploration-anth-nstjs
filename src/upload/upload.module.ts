import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { FileValidationProvider } from './providers/file-validation.provider';
import { ImageOptimizationProvider } from './providers/image-optimization.provider';
import { SpacesUploadProvider } from './providers/spaces-upload.provider';
import uploadConfig from './config/upload.config';
import spacesDoConfig from 'src/config/spaces-do.config';

@Module({
  imports: [
    ConfigModule.forFeature(uploadConfig),
    ConfigModule.forFeature(spacesDoConfig),
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    FileValidationProvider,
    ImageOptimizationProvider,
    SpacesUploadProvider,
  ],
  exports: [UploadService],
})
export class UploadModule {}