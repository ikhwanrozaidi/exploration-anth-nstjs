// src/outside/dtos/berrypay-callback.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BerryPayCallbackDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  txn_status_id: string;

  @ApiProperty({ example: 'DI000120250730-2' })
  @IsString()
  @IsNotEmpty()
  txn_order_id: string;

  @ApiProperty({ example: 'BP10220250730222458' })
  @IsString()
  @IsNotEmpty()
  txn_ref_id: string;

  @ApiProperty({ example: 'Payment Successful' })
  @IsString()
  @IsNotEmpty()
  txn_msg: string;

  @ApiProperty({ example: '2025-07-30 22:24:58' })
  @IsString()
  @IsNotEmpty()
  txn_date: string;

  @ApiProperty({ example: 'SBI Bank A' })
  @IsString()
  @IsNotEmpty()
  txn_bank_name: string;

  @ApiProperty({ example: '', required: false })
  @IsString()
  return_url?: string;

  @ApiProperty({ example: 'Devimmain' })
  @IsString()
  @IsNotEmpty()
  txn_buyer_name: string;

  @ApiProperty({ example: '0133296916' })
  @IsString()
  @IsNotEmpty()
  txn_buyer_phone: string;

  @ApiProperty({ example: 'devimmain@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  txn_buyer_email: string;

  @ApiProperty({ example: '2507302225000225' })
  @IsString()
  @IsNotEmpty()
  txn_payment_id: string;

  @ApiProperty({ example: '6bfd378cbc8e88265c93415d0003f0d999bbdc4435f66d77d438ec2105429220' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ example: '250.00' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  txn_amount: number;
}