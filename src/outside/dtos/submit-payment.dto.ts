import { IsEmail, IsNotEmpty, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitPaymentDto {
  @ApiProperty({
    description: 'Buyer email for gate registration',
    example: 'buyer@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  buyerGateEmail: string;

  @ApiProperty({
    description: 'Buyer phone number for gate registration',
    example: 601234567890
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsNotEmpty()
  buyerGatePhone: number;

  @ApiProperty({
    description: 'Whether buyer wants to register',
    example: true
  })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsNotEmpty()
  isRegistered: boolean;

  @ApiProperty({
    description: 'Whether buyer confirms payment details',
    example: true
  })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsNotEmpty()
  isConfirmPaymentDetail: boolean;
}