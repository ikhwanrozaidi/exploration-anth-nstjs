import { IsEmail, IsNotEmpty, IsString, IsOptional, IsPhoneNumber, IsNumber, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty({
    description: 'Merchant name',
    example: 'ABC Company Ltd'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Merchant email address',
    example: 'merchant@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Merchant phone number',
    example: '+60123456789'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    description: 'Merchant category ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  category: number;

  @ApiProperty({
    description: 'Callback URL for webhook notifications',
    example: 'https://merchant.com/webhook',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  callbackUrl?: string;
}