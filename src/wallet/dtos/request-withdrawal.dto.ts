import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestWithdrawalDto {
  @ApiProperty({
    description: 'Withdrawal amount',
    example: '29.99'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a valid number with up to 2 decimal places'
  })
  amount: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'Maybank'
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({
    description: 'Bank account number',
    example: '1234567890'
  })
  @IsString()
  @IsNotEmpty()
  bankAccount: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'MYR',
    default: 'MYR'
  })
  @IsString()
  @IsOptional()
  currency?: string;
}