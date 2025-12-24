import { CreateUserDto } from './../dtos/create-user.dto';
import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  RequestTimeoutException,
  forwardRef,
} from '@nestjs/common';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserProvider } from './create-user.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';
import { UpdateUserProfileProvider } from './update-user-profile.provider';
import { UpdateUserProfileDto } from '../dtos/update-user-profile.dto';
import { SetUsernameProvider } from './set-username.provider';
import { ChangeUsernameProvider } from './change-username.provider';
import { SetUsernameDto } from '../dtos/set-username.dto';
import { ChangeUsernameDto } from '../dtos/change-username.dto';

/**
 * Controller class for '/users' API endpoint
 */
@Injectable()
export class UsersService {
  constructor(
    /**
     * Injecting usersRepository
     */
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    /**
     * Import Providers
     */
    private readonly createUserProvider: CreateUserProvider,

    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,

    private readonly updateUserProfileProvider: UpdateUserProfileProvider,

    private readonly setUsernameProvider: SetUsernameProvider,

    private readonly changeUsernameProvider: ChangeUsernameProvider,
  ) {}

  /**
   * Method to create a new user
   */
  public async createUser(createUserDto: CreateUserDto) {
    return await this.createUserProvider.createUser(createUserDto);
  }

  /**
   * Public method used to find one user using the ID of the user
   */
  public async findOneById(id: number) {
    let user = undefined;

    try {
      user = await this.usersRepository.findOne({
        where: { id },
        relations: ['userDetail', 'userSettings'], // Add relations
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the the datbase',
        },
      );
    }

    /**
     * Handle the user does not exist
     */
    if (!user) {
      throw new BadRequestException('The user id does not exist');
    }

    return user;
  }

  // Finds one user by email
  public async findOneByEmail(email: string) {
    return await this.findOneUserByEmailProvider.findOneByEmail(email);
  }

  public async updateProfile(userId: number, updateDto: UpdateUserProfileDto) {
    return await this.updateUserProfileProvider.updateProfile(
      userId,
      updateDto,
    );
  }

  public async setUsername(userId: number, setUsernameDto: SetUsernameDto) {
    return await this.setUsernameProvider.setUsername(userId, setUsernameDto);
  }

  public async changeUsername(
    userId: number,
    changeUsernameDto: ChangeUsernameDto,
  ) {
    return await this.changeUsernameProvider.changeUsername(
      userId,
      changeUsernameDto,
    );
  }
}
