// src/outside/dtos/payment-request.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaymentRequestDto {
  @ApiProperty({
    description: 'Merchant secret key',
    example: 'ABC1234567890DE'
  })
  @IsString()
  @IsNotEmpty()
  secretKey: string;

  @ApiProperty({
    description: 'Merchant API key',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({
    description: 'Return URL after payment completion',
    example: 'https://merchant.com/return',
    required: false
  })
  @IsString()
  @IsOptional()
  returnUrl?: string;

  @ApiProperty({
    description: 'Buyer email address',
    example: 'buyer@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  buyerAccount: string;

  @ApiProperty({
    description: 'Buyer phone number',
    example: '601234567890'
  })
  @IsString() // Keep as string for signature consistency
  @IsNotEmpty()
  buyerPhone: string;

  @ApiProperty({
    description: 'Buyer full name',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @ApiProperty({
    description: 'Unique order ID from merchant',
    example: 'ORD-2024-001'
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Subscription'
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Monthly premium subscription with full features'
  })
  @IsString()
  @IsNotEmpty()
  productDesc: string;

  @ApiProperty({
    description: 'Product amount in currency',
    example: '29.99'
  })
  @IsString() // Keep as string for signature consistency
  @IsNotEmpty()
  productAmount: string;

  @ApiProperty({
    description: 'Whether the product is refundable',
    example: 'false',
    default: 'false'
  })
  @IsString() // Keep as string for signature consistency
  @IsNotEmpty()
  isRefundable: string;

  @ApiProperty({
    description: 'Product category',
    example: 'digital_services',
    required: false
  })
  @IsString()
  @IsOptional()
  productCat?: string;

  @ApiProperty({
    description: 'SHA256 signature of the request',
    example: 'a1b2c3d4e5f6...'
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
}