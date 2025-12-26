import { IsNotEmpty, IsString, IsNumberString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferWalletDto {
  @ApiProperty({
    description: 'Amount to transfer',
    example: '29.99',
    type: String,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumberString({}, { message: 'Amount must be a valid number' })
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'Amount must have at most 2 decimal places' })
  amount: string;

  @ApiProperty({
    description: 'Username of the recipient',
    example: 'devimmain',
    type: String,
  })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username: string;

  @ApiProperty({
    description: 'Reference or note for the transfer',
    example: 'transfer for fun',
    type: String,
  })
  @IsNotEmpty({ message: 'Reference is required' })
  @IsString({ message: 'Reference must be a string' })
  @MinLength(1, { message: 'Reference must not be empty' })
  @MaxLength(200, { message: 'Reference must not exceed 200 characters' })
  reference: string;
}