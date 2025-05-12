import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  //@UseGuards(JwtAuthGuard)
  @Get('card/:cardId')
  generateCardQR(@Param('cardId') cardId: string) {
    return this.qrService.generateCardQR(cardId);
  }

  //@UseGuards(JwtAuthGuard)
  @Get('profile')
  generateProfileQR(@GetUser() user: User) {
    return this.qrService.generateProfileQR(user.id);
  }
}
