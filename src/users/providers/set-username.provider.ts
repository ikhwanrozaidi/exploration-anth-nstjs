import { Injectable, BadRequestException, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { SetUsernameDto } from '../dtos/set-username.dto';

@Injectable()
export class SetUsernameProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async setUsername(userId: number, setUsernameDto: SetUsernameDto): Promise<User> {
    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user already has a username
      if (user.username) {
        throw new BadRequestException('Username already set. Use PUT /users/username to change it.');
      }

      // Check username uniqueness
      const existingUsername = await this.userRepository.findOne({
        where: { username: setUsernameDto.username },
      });

      if (existingUsername) {
        throw new BadRequestException('Username already taken');
      }

      // Set username (usernameChangedAt stays null)
      user.username = setUsernameDto.username;
      user.usernameChangedAt = null;

      const updatedUser = await this.userRepository.save(user);

      return updatedUser;

    } catch (error) {
      if (error.status === 400 || error.status === 404) {
        throw error;
      }

      console.error('Error setting username:', error);
      throw new RequestTimeoutException('Unable to set username at the moment. Please try again later.');
    }
  }
}