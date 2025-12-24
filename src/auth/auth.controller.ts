import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { AuthService } from './providers/auth.service';
import { SignInDto } from './dtos/signin.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from 'src/common/enums/app.enums';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { VerifyOtpProvider } from './providers/verify-otp.provider';
import { OtpProvider } from './providers/otp.provider';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { ResendOtpDto } from './dtos/resend-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    /*
     * Injecting Auth Service
     */
    private readonly authService: AuthService,

    /*
     * Injecting OTP Service
     */
    private readonly otpProvider: OtpProvider,

    /*
     * Injecting Verify OTP Service
     */
    private readonly verifyOtpProvider: VerifyOtpProvider,
  ) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ResponseMessage('OTP sent successfully')
  @ApiOperation({ summary: 'Sign in with email and password (sends OTP)' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'OTP sent successfully' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'OTP sent to your phone' },
            sentTo: {
              type: 'string',
              enum: ['email', 'phone'],
              example: 'phone',
            },
            email: { type: 'string', example: 'user@example.com' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  public signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ResponseMessage('OTP verified successfully')
  @ApiOperation({
    summary: 'Verify OTP and get JWT tokens with full user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified, tokens and full user profile returned',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'OTP verified successfully' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGc...' },
            refreshToken: { type: 'string', example: 'eyJhbGc...' },
            accessTokenExpiresAt: {
              type: 'string',
              example: '2025-12-15T14:28:40.797Z',
            },
            refreshTokenExpiresAt: {
              type: 'string',
              example: '2025-12-22T13:28:40.797Z',
            },
            userProfile: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                email: { type: 'string', example: 'user@example.com' },
                role: { type: 'string', example: 'user' },
                phone: {
                  type: 'string',
                  example: '60123456789',
                  nullable: true,
                },
                status: { type: 'string', example: 'active' },
                balance: { type: 'number', example: 0 },
                merchantId: { type: 'number', example: null, nullable: true },
                country: {
                  type: 'string',
                  example: 'Malaysia',
                  nullable: true,
                },
                createdAt: {
                  type: 'string',
                  example: '2025-01-01T00:00:00.000Z',
                },
                userDetail: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    firstName: {
                      type: 'string',
                      example: 'John',
                      nullable: true,
                    },
                    lastName: {
                      type: 'string',
                      example: 'Doe',
                      nullable: true,
                    },
                    fullName: {
                      type: 'string',
                      example: 'John Doe',
                      nullable: true,
                    },
                    address: {
                      type: 'string',
                      example: '123 Main St',
                      nullable: true,
                    },
                    birthDate: {
                      type: 'string',
                      example: '1990-01-01',
                      nullable: true,
                    },
                    profilePicture: {
                      type: 'string',
                      example: 'https://...',
                      nullable: true,
                    },
                    gatePoint: { type: 'number', example: 0 },
                    verify: { type: 'boolean', example: false },
                    vaccount: {
                      type: 'string',
                      example: 'VA123456',
                      nullable: true,
                    },
                  },
                },
                userSettings: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    marketing: { type: 'boolean', example: true },
                    notifications: { type: 'boolean', example: true },
                    twoFA: { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  public verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.verifyOtpProvider.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ResponseMessage('OTP resent successfully')
  @ApiOperation({ summary: 'Resend OTP to email or phone' })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'OTP resent successfully' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'OTP resent to your phone' },
            sentTo: {
              type: 'string',
              enum: ['email', 'phone'],
              example: 'phone',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Rate limit or no OTP session found',
  })
  public resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.otpProvider.resendOtp(resendOtpDto.email);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK) // changed since the default is 201
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Get('system-config')
  @Auth(AuthType.Admin)
  getSystemConfig() {
    return 'System configuration - SuperAdmin only';
  }
}
