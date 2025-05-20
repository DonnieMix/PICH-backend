import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { Connection } from './entities/connection.entity';
import { CardsModule } from '../cards/cards.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Connection]), CardsModule, AuthModule],
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
