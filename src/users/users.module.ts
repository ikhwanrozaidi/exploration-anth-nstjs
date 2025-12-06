import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersCreateManyProvider } from './providers/users-create-many.provider';
import { CreateUserProvider } from './providers/create-user.provider';
import { FindOneUserByEmailProvider } from './providers/find-one-user-by-email.provider';
import { IdGenerationProvider } from './providers/id-generation.provider';
import { AuthModule } from '../auth/auth.module';
import profileConfig from './config/profile.config';
import { User } from './user.entity';
import { UserDetail } from './entity/user-detail.entity';
import { UserSettings } from './entity/user-setting.entity';
import { UsersService } from './providers/users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersCreateManyProvider,
    CreateUserProvider,
    FindOneUserByEmailProvider,
    IdGenerationProvider,
  ],
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User, UserDetail, UserSettings]),
    ConfigModule.forFeature(profileConfig),
    forwardRef(() => AuthModule),
  ],
})
export class UsersModule {}