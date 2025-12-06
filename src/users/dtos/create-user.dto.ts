import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsString, IsEnum, IsOptional, IsInt, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from 'src/common/enums/app.enums';

export class CreateUserDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsOptional()
  merchantId?: number;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(96)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(96)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Minimum eight characters, at least one letter, one number and one special character',
  })
  password: string;

  @ApiProperty({
    enum: UserRole,
    description: "Possible values: 'superadmin', 'admin', 'staff', 'user'",
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    enum: UserStatus,
    description: "Possible values: 'active', 'inactive'",
  })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}