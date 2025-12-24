import {
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import { HashingProvider } from './hashing.provider';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { OtpProvider } from './otp.provider';

@Injectable()
export class SignInProvider {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    /**
     * Inject the hashingProvider
     */
    private readonly hashingProvider: HashingProvider,

    /**
     * Inject generateTokensProvider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,

    /**
     * Inject generateTokensProvider
     */
    private readonly otpProvider: OtpProvider,
  ) {}

  public async signIn(signInDto: SignInDto) {
    // Find user by email
    let user = await this.usersService.findOneByEmail(signInDto.email);

    let isEqual: boolean = false;

    try {
      // Compare the password
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare the password',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException('Password does not match');
    }

    // ✅ PASSWORD CORRECT - Generate and send OTP
    const otpResult = await this.otpProvider.generateAndSendOtp(user);

    // Return OTP sent confirmation (no tokens yet)
    return {
      message: otpResult.message,
      sentTo: otpResult.sentTo,
      email: user.email,
    };
  }
}
