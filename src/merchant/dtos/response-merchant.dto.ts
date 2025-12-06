import { ApiProperty } from '@nestjs/swagger';
import { MerchantStatus } from 'src/common/enums/app.enums';

export class MerchantDetailResponseDto {
  @ApiProperty()
  merchantId: number;

  @ApiProperty()
  founderName: string;

  @ApiProperty()
  founderPhone: string;

  @ApiProperty()
  businessAddress: string;

  @ApiProperty()
  ssmNumber: string;

  @ApiProperty()
  picName: string;

  @ApiProperty()
  picNumber: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  bankNumber: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MerchantWithDetailResponseDto {
  @ApiProperty()
  merchantId: number;

  @ApiProperty()
  apiKey: string;

  @ApiProperty()
  secretKey: string;

  @ApiProperty()
  callbackUrl: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  category: number;

  @ApiProperty({ enum: MerchantStatus })
  status: MerchantStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: MerchantDetailResponseDto, nullable: true })
  merchantDetail?: MerchantDetailResponseDto;
}
