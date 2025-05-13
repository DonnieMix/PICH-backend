import { Controller, Get } from '@nestjs/common';
import type { QrService } from './qr.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { User } from '../users/entities/user.entity';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('user')
  generateUserQR(@GetUser() user: User) {
    return this.qrService.generateUserQR(user.id);
  }
}
