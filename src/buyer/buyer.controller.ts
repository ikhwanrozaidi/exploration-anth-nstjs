import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { AuthType } from 'src/common/enums/app.enums';
import { BuyerService } from './buyer.service';
import { BuyerCreateOrderDto } from './dtos/create-order.dto';

@Controller('buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  @Post('create-order')
  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.User)
  @ApiBearerAuth()
  @ResponseMessage('Payment order created successfully')
  @ApiOperation({ summary: 'Create P2P payment order (User only)' })
  @ApiResponse({
    status: 201,
    description: 'Payment order created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: 'Payment order created successfully',
        },
        data: {
          type: 'object',
          properties: {
            paymentId: { type: 'string', example: 'uuid-123' },
            paymentType: { type: 'string', example: 'p2p' },
            senderId: { type: 'string', example: '1' },
            receiverId: { type: 'string', example: '2' },
            amount: { type: 'number', example: 29.99 },
            status: { type: 'string', example: 'success' },
            isCompleted: { type: 'boolean', example: false },
            createdAt: { type: 'string', example: '2025-12-15T10:00:00.000Z' },
            paymentDetails: {
              type: 'object',
              properties: {
                productName: { type: 'string', example: 'Product A' },
                productDesc: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['cookies', 'crumbs'],
                },
                productCat: { type: 'string', example: 'food_beverages' },
                buyerName: { type: 'string', example: 'John Doe' },
                buyerEmail: { type: 'string', example: 'buyer@example.com' },
                buyerPhone: { type: 'string', example: '60123456789' },
                refundable: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - username not found or insufficient balance',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User access required',
  })
  async createOrder(
    @ActiveUser() user: ActiveUserData,
    @Body() createOrderDto: BuyerCreateOrderDto,
    @Ip() ipAddress: string,
  ) {
    return await this.buyerService.createOrder(
      user.sub,
      createOrderDto,
      ipAddress,
    );
  }
}
