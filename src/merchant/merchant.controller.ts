import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MerchantService } from './providers/merchant.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/common/enums/app.enums';
import { CreateMerchantDto } from './dtos/create-merchant.dto';
import { MerchantDetailResponseDto, MerchantWithDetailResponseDto } from './dtos/response-merchant.dto';
import { CreateMerchantDetailDto } from './dtos/create-merchant-detail.dto';
import { UpdateMerchantStatusDto } from './dtos/update-merchant-status.dto';

@ApiTags('Merchant')
@Controller('merchant')
export class MerchantController {
    constructor(

        private readonly merchantService: MerchantService,

    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Auth(AuthType.SuperAdmin)
    @ApiOperation({ summary: 'Create a new merchant' })
    @ApiResponse({
        status: 201,
        description: 'Merchant created successfully',
        type: 'Merchant'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - validation failed or duplicate data'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    async createMerchant(@Body() createMerchantDto: CreateMerchantDto) {
        return await this.merchantService.createMerchant(createMerchantDto);
    }

    @Post(':id/details')
    @HttpCode(HttpStatus.CREATED)
    @Auth(AuthType.SuperAdmin)
    @ApiOperation({ summary: 'Create merchant detail for existing merchant' })
    @ApiParam({ name: 'id', type: 'number', description: 'Merchant ID' })
    @ApiResponse({
        status: 201,
        description: 'Merchant detail created successfully',
        type: MerchantDetailResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - validation failed or duplicate data'
    })
    @ApiResponse({
        status: 404,
        description: 'Merchant not found'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    async createMerchantDetail(
        @Param('id', ParseIntPipe) merchantId: number,
        @Body() createMerchantDetailDto: CreateMerchantDetailDto
    ) {
        return await this.merchantService.createMerchantDetail(merchantId, createMerchantDetailDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Auth(AuthType.SuperAdmin)
    @ApiOperation({ summary: 'Fetch all merchants with details (Superadmin only)' })
    @ApiResponse({
        status: 200,
        description: 'Merchants fetched successfully',
        type: [MerchantWithDetailResponseDto]
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions (Superadmin only)'
    })
    async fetchAllMerchants() {
        return await this.merchantService.fetchAllMerchants();
    }

    @Put(':id/status')
    @HttpCode(HttpStatus.OK)
    @Auth(AuthType.SuperAdmin)
    @ApiOperation({ summary: 'Update merchant status (Superadmin only)' })
    @ApiParam({ name: 'id', type: 'number', description: 'Merchant ID' })
    @ApiResponse({
        status: 200,
        description: 'Merchant status updated successfully',
        type: 'Merchant'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid status or same status'
    })
    @ApiResponse({
        status: 404,
        description: 'Merchant not found'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    async updateMerchantStatus(
        @Param('id', ParseIntPipe) merchantId: number,
        @Body() updateMerchantStatusDto: UpdateMerchantStatusDto
    ) {
        return await this.merchantService.updateMerchantStatus(merchantId, updateMerchantStatusDto);
    }

}
