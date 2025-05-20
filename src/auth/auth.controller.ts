import {
  Controller,
  Post,
  Get,
  Headers,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

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

  @Get('me')
  async getProfile(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];
    return this.authService.verifyPrivyToken(token);
  }
}
