import { Injectable, BadRequestException, NotFoundException, ForbiddenException, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { UserDetail } from '../entity/user-detail.entity';
import { ChangeUsernameDto } from '../dtos/change-username.dto';

@Injectable()
export class ChangeUsernameProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserDetail)
    private readonly userDetailRepository: Repository<UserDetail>,
  ) {}

  async changeUsername(userId: number, changeUsernameDto: ChangeUsernameDto): Promise<User> {
    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user has a username set
      if (!user.username) {
        throw new BadRequestException('You must set a username first using POST /users/username');
      }

      // Check if trying to set the same username
      if (user.username === changeUsernameDto.username) {
        throw new BadRequestException('New username cannot be the same as current username');
      }

      // Find user_detail to check verification
      const userDetail = await this.userDetailRepository.findOne({
        where: { userId },
      });

      if (!userDetail || !userDetail.verify) {
        throw new ForbiddenException('You must complete KYC verification before changing username');
      }

      // Check if 6 months have passed since last change
      if (user.usernameChangedAt) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (user.usernameChangedAt > sixMonthsAgo) {
          const nextAllowedDate = new Date(user.usernameChangedAt);
          nextAllowedDate.setMonth(nextAllowedDate.getMonth() + 6);

          throw new ForbiddenException(
            `You can only change username every 6 months. Next change allowed: ${nextAllowedDate.toISOString().split('T')[0]}`
          );
        }
      }

      // Check username uniqueness
      const existingUsername = await this.userRepository.findOne({
        where: { username: changeUsernameDto.username },
      });

      if (existingUsername) {
        throw new BadRequestException('Username already taken');
      }

      // Update username and usernameChangedAt
      user.username = changeUsernameDto.username;
      user.usernameChangedAt = new Date();

      const updatedUser = await this.userRepository.save(user);

      return updatedUser;

    } catch (error) {
      if (error.status === 400 || error.status === 403 || error.status === 404) {
        throw error;
      }

      console.error('Error changing username:', error);
      throw new RequestTimeoutException('Unable to change username at the moment. Please try again later.');
    }
  }
}