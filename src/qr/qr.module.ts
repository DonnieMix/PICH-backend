import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { CardsModule } from '../cards/cards.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CardsModule, ConfigModule],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
