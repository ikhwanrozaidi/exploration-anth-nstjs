import { 
  BadRequestException, 
  Inject, 
  Injectable, 
  RequestTimeoutException,
  forwardRef 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { IdGenerationProvider } from './id-generation.provider';
import { User } from '../user.entity';
import { VerifyStatus } from 'src/common/enums/app.enums';

@Injectable()
export class CreateUserProvider {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly idGenerationProvider: IdGenerationProvider,
  ) {}

  public async createUser(createUserDto: CreateUserDto) {
    let existingUser = undefined;

    try {
      // Check if user exists with same email
      existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    // Handle exception
    if (existingUser) {
      throw new BadRequestException(
        'The user already exists, please check your email.',
      );
    }

    // Generate role-specific ID
    let newUserId: number;
    try {
      newUserId = await this.idGenerationProvider.generateNextId(createUserDto.role);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to generate user ID at the moment please try later',
        {
          description: 'Error generating user ID',
        },
      );
    }

    // Create a new user with generated ID
    let newUser = this.usersRepository.create({
      ...createUserDto,
      id: newUserId,
      password: await this.hashingProvider.hashPassword(createUserDto.password),
    });

    try {
      newUser = await this.usersRepository.save(newUser);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    return newUser;
  }
}