import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/common/enums/app.enums';
import { OutsideService } from './providers/outside.service';
import { PaymentRequestDto } from './dtos/payment-request.dto';
import { TokenValidationResponseDto } from './dtos/token-validation-response.dto';
import { SubmitPaymentDto } from './dtos/submit-payment.dto';
import { BerryPayCallbackDto } from './dtos/berrypay-callback.dto';

@ApiTags('Outside Payment Gateway')
@Controller('outside')
export class OutsideController {
  constructor(
    private readonly outsideService: OutsideService
  ) { }

  /**
   * Check token from link given
   */
  @Get('validate-token/:token')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Validate payment token and get payment details' })
  @ApiParam({ name: 'token', type: 'string', description: 'Payment JWT Token' })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
    type: TokenValidationResponseDto
  })
  public async validateToken(
    @Param('token') token: string
  ): Promise<TokenValidationResponseDto> {
    return await this.outsideService.validateToken(token);
  }

  /**
   * Initial Call for PG
   */
  @Post(':companyId/payment')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Create payment request from external merchant' })
  @ApiParam({ name: 'companyId', type: 'number', description: 'Merchant Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment URL generated successfully',
    schema: {
      type: 'string',
      example: 'pay.gatepay.dev/1_1704067200000_abc123xyz'
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed'
  })
  @ApiResponse({
    status: 401,
    description: 'Access denied - invalid credentials or signature'
  })
  public async createPaymentRequest(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() paymentRequest: PaymentRequestDto
  ): Promise<string> {
    return await this.outsideService.createPaymentRequest(companyId, paymentRequest);
  }

  /**
   * Submission to Payment Provider
   */
  @Post('submit/:token')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Submit payment with buyer gate details' })
  @ApiParam({ name: 'token', type: 'string', description: 'Payment JWT Token' })
  @ApiResponse({
    status: 200,
    description: 'Payment submitted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Payment submitted successfully' }
      }
    }
  })
  public async submitPayment(
    @Param('token') token: string,
    @Body() submitPaymentDto: SubmitPaymentDto
  ): Promise<{ status: string; message: string }> {
    return await this.outsideService.submitPayment(token, submitPaymentDto);
  }

  /**
   * Callback from Payment Provider
   */
  @Post('callback/:publicKey')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None) // No authentication required for callbacks
  @ApiOperation({ summary: 'Process payment provider callback' })
  @ApiParam({ name: 'publicKey', type: 'number', description: 'Payment Provider Public Key' })
  @ApiResponse({
    status: 200,
    description: 'Callback processed successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Payment session updated successfully' }
      }
    }
  })
  public async processCallback(
    @Param('publicKey', ParseIntPipe) publicKey: number,
    @Body() callbackData: BerryPayCallbackDto
  ): Promise<{ status: string; message: string }> {
    return await this.outsideService.processCallback(publicKey, callbackData);
  }


  // Add this method to src/outside/outside.controller.ts
  @Get('status/:token')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None) // No authentication required
  @ApiOperation({ summary: 'Check payment token status' })
  @ApiParam({ name: 'token', type: 'string', description: 'Payment JWT Token' })
  @ApiResponse({
    status: 200,
    description: 'Token status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'pending',
          enum: ['initiate', 'invalid', 'pending', 'expired', 'success', 'passed', 'unpassed', 'failed', 'completed']
        }
      }
    }
  })
  async getTokenStatus(
    @Param('token') token: string
  ): Promise<{ status: string }> {
    return await this.outsideService.getTokenStatus(token);
  }
}