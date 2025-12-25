import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { AuthType } from 'src/common/enums/app.enums';
import { RequestWithdrawalDto } from './dtos/request-withdrawal.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('request-withdrawal')
  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.User)
  @ApiBearerAuth()
  @ResponseMessage('Withdrawal request submitted successfully')
  @ApiOperation({ summary: 'Request withdrawal to bank account (User only)' })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal request created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Withdrawal request submitted successfully' },
        data: {
          type: 'object',
          properties: {
            withdrawal: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                userId: { type: 'number', example: 2 },
                amount: { type: 'number', example: 29.99 },
                bankName: { type: 'string', example: 'Maybank' },
                bankNumber: { type: 'string', example: '1234567890' },
                status: { type: 'string', example: 'requested' },
                createdAt: { type: 'string', example: '2025-12-25T12:00:00.000Z' },
                updatedAt: { type: 'string', example: '2025-12-25T12:00:00.000Z' },
              },
            },
            wallet: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 123 },
                userId: { type: 'number', example: 2 },
                amount: { type: 'number', example: 29.99 },
                direction: { type: 'string', example: 'out' },
                source: { type: 'string', nullable: true, example: null },
                status: { type: 'string', example: 'pending' },
                oppositeId: { type: 'number', nullable: true, example: null },
                reference: { type: 'string', example: 'WITHDRAWAL-1' },
                balance: { type: 'number', example: 970.01 },
                createdAt: { type: 'string', example: '2025-12-25T12:00:00.000Z' },
                updatedAt: { type: 'string', example: '2025-12-25T12:00:00.000Z' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient balance or invalid amount',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User access required',
  })
  async requestWithdrawal(
    @ActiveUser() user: ActiveUserData,
    @Body() requestWithdrawalDto: RequestWithdrawalDto,
  ) {
    return await this.walletService.requestWithdrawal(
      user.sub,
      requestWithdrawalDto,
    );
  }
}