import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrivyAuthStrategy } from './strategies/privy-auth.strategy';
import { PrivyAuthGuard } from './guards/privy-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'privy' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrivyAuthStrategy, PrivyAuthGuard],
  exports: [
    JwtStrategy,
    PrivyAuthStrategy,
    PrivyAuthGuard,
    PassportModule,
    AuthService,
  ],
})
export class AuthModule {}
