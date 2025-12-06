import { IsString, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDetailDto {
  @ApiProperty({
    description: 'Founder full name',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  founderName: string;

  @ApiProperty({
    description: 'Founder phone number',
    example: '+60123456789'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  founderPhone: string;

  @ApiProperty({
    description: 'Business address',
    example: '123 Business Street, Kuala Lumpur, 50000'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  businessAddress: string;

  @ApiProperty({
    description: 'SSM (Companies Commission of Malaysia) number',
    example: '202301234567'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  ssmNumber: string;

  @ApiProperty({
    description: 'Person in charge name',
    example: 'Jane Smith'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  picName: string;

  @ApiProperty({
    description: 'Person in charge phone number',
    example: '+60129876543'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  picNumber: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'Maybank'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bankName: string;

  @ApiProperty({
    description: 'Bank account number',
    example: '1234567890123456'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  bankNumber: string;
}