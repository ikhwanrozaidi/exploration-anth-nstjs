// src/payment/payment.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { PaymentService } from './providers/payment.service';
import { AuthType } from 'src/common/enums/app.enums';
import { UserPaymentResponse } from './interface/payment-user.interface';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(

    private readonly paymentService: PaymentService
  
  ) {}

  @Get('merchant')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Admin) // Admin/Merchant access only
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant payments (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Merchant payments retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          paymentId: { type: 'string', example: 'uuid-123' },
          paymentType: { type: 'string', example: 'gateway' },
          merchantId: { type: 'number', example: 1 },
          amount: { type: 'number', example: 29.99 },
          status: { type: 'string', example: 'success' },
          userRole: { type: 'string', example: 'merchant' },
          paymentDetails: { type: 'object' },
          sender: { type: 'object' },
          provider: { type: 'object' }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin access required' 
  })
  async getMerchantPayments(
    @ActiveUser() user: ActiveUserData
  ): Promise<UserPaymentResponse[]> {
    return await this.paymentService.getMerchantPayments(user.sub);
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.User) // Regular user access
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personal payments (User only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Personal payments retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          paymentId: { type: 'string', example: 'uuid-456' },
          paymentType: { type: 'string', example: 'transfer' },
          receiverId: { type: 'string', example: '1' },
          senderId: { type: 'string', example: '2' },
          merchantId: { type: 'number', nullable: true, example: null },
          amount: { type: 'number', example: 50.00 },
          status: { type: 'string', example: 'success' },
          userRole: { 
            type: 'string', 
            enum: ['sender', 'receiver'],
            example: 'sender' 
          },
          receiver: { type: 'object' },
          sender: { type: 'object' },
          provider: { type: 'object' }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User access required' 
  })
  async getPersonalPayments(
    @ActiveUser() user: ActiveUserData
  ): Promise<UserPaymentResponse[]> {
    return await this.paymentService.getPersonalPayments(user.sub);
  }
}