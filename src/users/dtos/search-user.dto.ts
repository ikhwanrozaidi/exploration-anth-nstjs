import { IsEmail, IsString, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiProperty({ 
    required: false, 
    example: 'user@example.com',
    description: 'Search by email'
  })
  @IsEmail()
  @IsOptional()
  @ValidateIf((o) => !o.username && !o.phone)
  email?: string;

  @ApiProperty({ 
    required: false, 
    example: 'john_doe123',
    description: 'Search by username'
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.email && !o.phone)
  username?: string;

  @ApiProperty({ 
    required: false, 
    example: '+60123456789',
    description: 'Search by phone number'
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.email && !o.username)
  phone?: string;
}