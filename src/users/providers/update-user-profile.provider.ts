import { Injectable, NotFoundException, BadRequestException, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { UserDetail } from '../entity/user-detail.entity';
import { UpdateUserProfileDto } from '../dtos/update-user-profile.dto';

@Injectable()
export class UpdateUserProfileProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserDetail)
    private readonly userDetailRepository: Repository<UserDetail>,
  ) {}

  async updateProfile(userId: number, updateDto: UpdateUserProfileDto): Promise<{ user: User; userDetail: UserDetail }> {
    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check email uniqueness if changing email
      if (updateDto.email && updateDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateDto.email },
        });

        if (existingUser) {
          throw new BadRequestException('Email already in use');
        }
      }

      // Check phone uniqueness if changing phone
      if (updateDto.phone && updateDto.phone !== user.phone) {
        const existingPhone = await this.userRepository.findOne({
          where: { phone: updateDto.phone },
        });

        if (existingPhone) {
          throw new BadRequestException('Phone number already in use');
        }
      }

      // Update user table fields
      if (updateDto.email) user.email = updateDto.email;
      if (updateDto.phone) user.phone = updateDto.phone;
      if (updateDto.country) user.country = updateDto.country;

      // Save user
      const updatedUser = await this.userRepository.save(user);

      // Find or create user_detail
      let userDetail = await this.userDetailRepository.findOne({
        where: { userId },
      });

      if (!userDetail) {
        // Create new user_detail if doesn't exist
        userDetail = this.userDetailRepository.create({
          userId,
        });
      }

      // Update user_detail fields
      if (updateDto.firstName !== undefined) userDetail.firstName = updateDto.firstName;
      if (updateDto.lastName !== undefined) userDetail.lastName = updateDto.lastName;
      if (updateDto.fullName !== undefined) userDetail.fullName = updateDto.fullName;
      if (updateDto.address !== undefined) userDetail.address = updateDto.address;
      if (updateDto.birthDate !== undefined) userDetail.birthDate = new Date(updateDto.birthDate);
      if (updateDto.profilePicture !== undefined) userDetail.profilePicture = updateDto.profilePicture;

      // Save user_detail
      const updatedUserDetail = await this.userDetailRepository.save(userDetail);

      return {
        user: updatedUser,
        userDetail: updatedUserDetail,
      };

    } catch (error) {
      // Re-throw validation errors
      if (error.status === 400 || error.status === 404) {
        throw error;
      }

      console.error('Error updating user profile:', error);
      throw new RequestTimeoutException(
        'Unable to update profile at the moment. Please try again later.',
      );
    }
  }
}