import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { QrService } from './qr.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { User } from '../users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('qr')
export class QrController {
  constructor(
    @Inject(QrService)
    private readonly qrService: QrService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  generateUserQR(@GetUser() user: User) {
    return this.qrService.generateUserQR(user.id);
  }
}
