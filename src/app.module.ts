import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import enviromentValidation from './config/enviroment.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import jwtConfig from './auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MerchantModule } from './merchant/merchant.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentProviderModule } from './payment-provider/payment-provider.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { RoleBasedAccessGuard } from './auth/guards/role-based-access.guard';
import { OutsideModule } from './outside/outside.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { WalletModule } from './wallet/wallet.module';
import { BuyerModule } from './buyer/buyer.module';

// Get the current NODE_ENV
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    //--------Setup ENV files to read
    ConfigModule.forRoot({
      isGlobal: true,
      //envFilePath: ['.env.development', '.env'],
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: enviromentValidation,
    }),
    //--------Connection Configuration with database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        //entities: [User],
        synchronize: configService.get('database.synchronize'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        host: configService.get('database.host'),
        autoLoadEntities: configService.get('database.autoLoadEntities'),
        database: configService.get('database.name'),
      }),
    }),
    //--------Not so sure? For JWT Configurations?
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    //--------Import all module
    UsersModule,
    AuthModule,
    MerchantModule,
    PaymentModule,
    PaymentProviderModule,
    AuditLogModule,
    OutsideModule,
    WalletModule,
    BuyerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    //--------Configure Guards and AccessToken
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    RoleBasedAccessGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    Reflector,
  ],
})
export class AppModule {}
