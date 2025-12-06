import { IsString, IsEmail, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ProviderStatus } from 'src/common/enums/app.enums';

export class CreatePaymentProviderDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @IsDateString()
  expiryDate: string; // Will be converted to Date
}