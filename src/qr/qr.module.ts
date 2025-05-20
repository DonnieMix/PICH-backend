import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { CardsModule } from '../cards/cards.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CardsModule, ConfigModule, AuthModule],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
