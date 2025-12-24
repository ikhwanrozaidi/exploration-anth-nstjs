import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuyerCreateOrderDto {
  @ApiProperty({
    description: 'Seller username',
    example: 'testuser2'
  })
  @IsString()
  @IsNotEmpty()
  sellerUsername: string;

  @ApiProperty({
    description: 'Payment amount',
    example: '29.99'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a valid number with up to 2 decimal places'
  })
  amount: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Product A'
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    description: 'Product description (array)',
    example: ['cookies', 'crumbs']
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  productDesc: string[];

  @ApiProperty({
    description: 'Product category',
    example: 'food_beverages'
  })
  @IsString()
  @IsNotEmpty()
  productCat: string;
}