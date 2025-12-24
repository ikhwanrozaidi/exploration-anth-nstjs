import { Injectable } from '@nestjs/common';
import { OtpProvider } from './otp.provider';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { UsersService } from 'src/users/providers/users.service';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';

@Injectable()
export class VerifyOtpProvider {
  constructor(
    private readonly otpProvider: OtpProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
    private readonly usersService: UsersService,
  ) {}

  public async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    // Verify OTP
    const { userId } = await this.otpProvider.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );

    // Get user with relations
    const user = await this.usersService.findOneById(userId);

    // Generate JWT tokens
    const tokens = await this.generateTokensProvider.generateTokens(user);

    // Return tokens + user profile + user details + user settings
    return {
      ...tokens,
      userProfile: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        balance: user.balance,
        merchantId: user.merchantId,
        country: user.country,
        createdAt: user.createdAt,
        userDetail: user.userDetail ? {
          firstName: user.userDetail.firstName,
          lastName: user.userDetail.lastName,
          fullName: user.userDetail.fullName,
          address: user.userDetail.address,
          birthDate: user.userDetail.birthDate,
          profilePicture: user.userDetail.profilePicture,
          gatePoint: user.userDetail.gatePoint,
          verify: user.userDetail.verify,
          vaccount: user.userDetail.vaccount,
        } : null,
        userSettings: user.userSettings ? {
          marketing: user.userSettings.marketing,
          notifications: user.userSettings.notifications,
          twoFA: user.userSettings.twoFA,
        } : null,
      },
    };
  }
}