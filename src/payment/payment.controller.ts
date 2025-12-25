import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Param, ParseUUIDPipe, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { PaymentService } from './providers/payment.service';
import { AuthType } from 'src/common/enums/app.enums';
import { UserPaymentResponse } from './interface/payment-user.interface';
import { CompletePaymentResponseDto } from './dtos/complete-payment-response.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetUserPaymentsQueryDto } from './dtos/get-user-payments-query.dto';
import { UserPaymentSummary } from './interface/payment-user-summary.interface';

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
  @Auth(AuthType.User)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personal payments with statistics (User only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Personal payments with summary statistics',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Request successful' },
        data: {
          type: 'object',
          properties: {
            completeOrder: { type: 'number', example: 10 },
            waitReceiveAmount: { type: 'number', example: 12.10 },
            completeReceive: { type: 'number', example: 12.10 },
            waitReleaseAmount: { type: 'number', example: 123.10 },
            completeRelease: { type: 'number', example: 20.10 },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  paymentId: { type: 'string' },
                  paymentType: { type: 'string' },
                  sellerId: { type: 'number', nullable: true },
                  buyerId: { type: 'number' },
                  merchantId: { type: 'number', nullable: true },
                  amount: { type: 'number' },
                  providerId: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  userRole: { type: 'string', enum: ['buyer', 'seller'] },
                  paymentDetails: { type: 'object' },
                  seller: { type: 'object', nullable: true },
                  buyer: { type: 'object' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getPersonalPayments(
    @ActiveUser() user: ActiveUserData,
    @Query() queryDto: GetUserPaymentsQueryDto,
  ): Promise<UserPaymentSummary> {
    return await this.paymentService.getPersonalPayments(user.sub, queryDto);
  }


 @Post(':paymentId/complete')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.User)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('proofImages', 3))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Mark payment as completed with proof images',
    description: `
      Upload 1-3 proof images showing that goods/services were received.
      
      Authorization rules:
      - Gateway payments: Only the BUYER (sender) can complete
      - P2P payments: Only the RECEIVER can complete
      
      This confirms delivery and triggers fund release from escrow.
    `,
  })
  @ApiParam({
    name: 'paymentId',
    type: 'string',
    format: 'uuid',
    description: 'Payment ID to mark as completed',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiBody({
    description: 'Proof images (1-3 images required)',
    schema: {
      type: 'object',
      required: ['proofImages'],
      properties: {
        proofImages: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          minItems: 1,
          maxItems: 3,
          description: 'Images showing proof of delivery/receipt (JPEG, PNG, WebP only, max 5MB each)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment marked as completed successfully',
    type: CompletePaymentResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Request successful',
        data: {
          paymentId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          isCompleted: true,
          status: 'success',
          proofImages: [
            {
              url: 'https://sgp1.digitaloceanspaces.com/gatepay-uploads/order-received-proof/a1b2.../proof-1.jpg',
              cdnUrl: 'https://gatepay-uploads.sgp1.cdn.digitaloceanspaces.com/order-received-proof/a1b2.../proof-1.jpg',
              key: 'order-received-proof/a1b2c3d4-e5f6-7890-1234-567890abcdef/proof-1.jpg',
              size: 245678,
            },
          ],
          completedAt: '2025-12-25T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Payment already completed, invalid status, or no proof images',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Gateway: Only buyer can complete | P2P: Only receiver can complete',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async completePayment(
    @ActiveUser() user: ActiveUserData,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @UploadedFiles() proofImages: Express.Multer.File[],
  ) {
    const result = await this.paymentService.completePayment(
      user.sub,
      paymentId,
      proofImages,
    );

    return {
      paymentId: result.payment.paymentId,
      isCompleted: result.payment.isCompleted,
      status: result.payment.status,
      proofImages: result.proofImages,
      completedAt: result.payment.updatedAt,
    };
  }
}