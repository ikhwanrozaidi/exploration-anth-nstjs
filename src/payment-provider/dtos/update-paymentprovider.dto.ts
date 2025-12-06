import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { ProviderStatus } from "src/common/enums/app.enums";

export class UpdatePaymentProviderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}