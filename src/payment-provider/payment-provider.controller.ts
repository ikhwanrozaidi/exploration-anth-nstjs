import { Controller, Post, Body, Get, Param, HttpStatus, Put } from '@nestjs/common';
import { PaymentProvider } from './payment-provider.entity';
import { PaymentProviderService } from './providers/payment-provider.service';
import { CreatePaymentProviderDto } from './dtos/create-paymentprovider.dto';
import { AuthType } from 'src/common/enums/app.enums';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UpdatePaymentProviderDto } from './dtos/update-paymentprovider.dto';

@Controller('payment-providers')
export class PaymentProviderController {
  constructor(

    private readonly paymentProviderService: PaymentProviderService

) {}

  @Post()
  @Auth(AuthType.SuperAdmin)
  public async create(@Body() createPaymentProviderDto: CreatePaymentProviderDto): Promise<{
    statusCode: number;
    message: string;
    data: PaymentProvider;
  }> {
    const paymentProvider = await this.paymentProviderService.create(createPaymentProviderDto);
    
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payment provider created successfully',
      data: paymentProvider,
    };
  }

  @Get()
  public async findAll(): Promise<PaymentProvider[]> {
    return this.paymentProviderService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id') id: string): Promise<PaymentProvider> {
    return this.paymentProviderService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentProviderDto: UpdatePaymentProviderDto,
  ): Promise<{
    statusCode: number;
    message: string;
    data: PaymentProvider;
  }> {
    const paymentProvider = await this.paymentProviderService.update(id, updatePaymentProviderDto);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment provider updated successfully',
      data: paymentProvider,
    };
  }
}