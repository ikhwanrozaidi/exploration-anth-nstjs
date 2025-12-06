import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MerchantStatus } from 'src/common/enums/app.enums';

export class UpdateMerchantStatusDto {
  @ApiProperty({
    enum: MerchantStatus,
    description: "Possible values: 'pending', 'active', 'inactive', 'suspended'",
    example: MerchantStatus.ACTIVE
  })
  @IsEnum(MerchantStatus)
  @IsNotEmpty()
  status: MerchantStatus;
}
