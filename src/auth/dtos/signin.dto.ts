import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;


  @ApiProperty({
    description: 'password',
    example: 'abcd1234'
  })
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
