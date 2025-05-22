import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrivyAuthStrategy } from './strategies/privy-auth.strategy';
import { PrivyAuthGuard } from './guards/privy-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'privy' }),
    ConfigModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrivyAuthStrategy, PrivyAuthGuard],
  exports: [PrivyAuthStrategy, PrivyAuthGuard, PassportModule, AuthService],
})
export class AuthModule {}
