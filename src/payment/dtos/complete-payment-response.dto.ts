import { ApiProperty } from '@nestjs/swagger';

export class ProofImageDto {
  @ApiProperty({ example: 'https://gatepay-uploads.sgp1.cdn.digitaloceanspaces.com/order-received-proof/uuid-123/proof-1.jpg' })
  url: string;

  @ApiProperty({ example: 'https://gatepay-uploads.sgp1.cdn.digitaloceanspaces.com/order-received-proof/uuid-123/proof-1.jpg' })
  cdnUrl: string;

  @ApiProperty({ example: 'order-received-proof/uuid-123/proof-1.jpg' })
  key: string;

  @ApiProperty({ example: 245678 })
  size: number;
}

export class CompletePaymentResponseDto {
  @ApiProperty({ example: 'uuid-123' })
  paymentId: string;

  @ApiProperty({ example: true })
  isCompleted: boolean;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ 
    type: [ProofImageDto],
    description: 'Uploaded proof images',
  })
  proofImages: ProofImageDto[];

  @ApiProperty({ example: '2025-12-25T10:30:00.000Z' })
  completedAt: Date;
}