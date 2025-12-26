import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Body,
  Headers,
  Ip,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
  UseGuards,
  SetMetadata,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './providers/users.service';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/common/enums/app.enums';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { SetUsernameDto } from './dtos/set-username.dto';
import { ChangeUsernameDto } from './dtos/change-username.dto';
import { SearchUserDto } from './dtos/search-user.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    // Injecting Users Service
    private readonly usersService: UsersService,
  ) {}

  /// ===== To create a any user
  @Post()
  @Auth(AuthType.None)
  public createUsers(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  /// ===== Edit user profile
  @Patch('profile')
  @Auth(AuthType.User)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Email or phone already in use' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async updateProfile(
    @ActiveUser() user: ActiveUserData,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    return await this.usersService.updateProfile(user.sub, updateDto);
  }

  @Post('username')
  @Auth(AuthType.User)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set username for the first time' })
  @ApiResponse({ status: 201, description: 'Username set successfully' })
  @ApiResponse({ status: 400, description: 'Username already set or taken' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async setUsername(
    @ActiveUser() user: ActiveUserData,
    @Body() setUsernameDto: SetUsernameDto,
  ) {
    return await this.usersService.setUsername(user.sub, setUsernameDto);
  }

  @Put('username')
  @Auth(AuthType.User)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Change username (requires KYC verification and 6 months cooldown)',
  })
  @ApiResponse({ status: 200, description: 'Username changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Username already taken or same as current',
  })
  @ApiResponse({
    status: 403,
    description: 'KYC not verified or 6 months not passed',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changeUsername(
    @ActiveUser() user: ActiveUserData,
    @Body() changeUsernameDto: ChangeUsernameDto,
  ) {
    return await this.usersService.changeUsername(user.sub, changeUsernameDto);
  }

  @Post('search-user')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search user by email, username, or phone' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 400,
    description: 'At least one search parameter is required',
  })
  async searchUser(@Body() searchUserDto: SearchUserDto) {
    await this.usersService.searchUser(searchUserDto);

    return {
      statusCode: 200,
      message: 'User found',
    };
  }
}
