import { Controller, Post, Get, UseGuards, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { PrivyAuthGuard } from './privy-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  async register(registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  async login(loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get('privy/me')
  @UseGuards(PrivyAuthGuard)
  getPrivyProfile(@GetUser() user: User) {
    return user;
  }
}
