import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { SearchUserDto } from '../dtos/search-user.dto';

@Injectable()
export class SearchUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async searchUser(searchUserDto: SearchUserDto): Promise<Partial<User>> {
    // Validate that at least one field is provided
    if (!searchUserDto.email && !searchUserDto.username && !searchUserDto.phone) {
      throw new BadRequestException('At least one search parameter (email, username, or phone) is required');
    }

    // Build query conditions
    const whereConditions = [];
    
    if (searchUserDto.email) {
      whereConditions.push({ email: searchUserDto.email });
    }
    
    if (searchUserDto.username) {
      whereConditions.push({ username: searchUserDto.username });
    }
    
    if (searchUserDto.phone) {
      whereConditions.push({ phone: searchUserDto.phone });
    }

    // Search for user
    const user = await this.userRepository.findOne({
      where: whereConditions,
      select: ['id', 'email', 'username', 'phone', 'country', 'status', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return limited user data
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      country: user.country,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}