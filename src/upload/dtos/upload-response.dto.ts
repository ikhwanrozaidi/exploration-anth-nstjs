import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'https://gatepay-uploads.sgp1.cdn.digitaloceanspaces.com/profiles/1/uuid.jpg' })
  url: string;

  @ApiProperty({ example: 'https://gatepay-uploads.sgp1.cdn.digitaloceanspaces.com/profiles/1/uuid.jpg' })
  cdnUrl: string;

  @ApiProperty({ example: 'profiles/1/uuid.jpg' })
  key: string;

  @ApiProperty({ example: 245678 })
  size: number;

  @ApiProperty({ example: 'image/jpeg' })
  contentType: string;
}