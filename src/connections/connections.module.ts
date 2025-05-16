import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { Connection } from './entities/connection.entity';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Connection]), CardsModule],
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
