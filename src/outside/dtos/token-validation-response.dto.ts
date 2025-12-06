// src/outside/dtos/token-validation-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TokenValidationResponseDto {
  @ApiProperty({ example: 'valid' })
  status: 'valid' | 'invalid';

  @ApiProperty({ required: false })
  sessionId?: number;

  @ApiProperty({ required: false })
  merchantName?: string;

  @ApiProperty({ required: false })
  paymentData?: {
    buyerAccount: string;
    buyerPhone: number;
    buyerName: string;
    orderId: string;
    productName: string;
    productDesc: string;
    productAmount: number;
    isRefundable: boolean;
    productCat?: string;
    returnUrl?: string;
  };

  @ApiProperty({ required: false })
  expiresAt?: Date;
}