import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('connections')
//@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post()
  create(
    @Body() createConnectionDto: CreateConnectionDto,
    @GetUser() user: User,
  ) {
    return this.connectionsService.create(createConnectionDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.connectionsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.connectionsService.findOne(id, user);
  }

  @Patch(':id/favorite')
  toggleFavorite(@Param('id') id: string, @GetUser() user: User) {
    return this.connectionsService.toggleFavorite(id, user);
  }

  @Patch(':id/notes')
  updateNotes(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @GetUser() user: User,
  ) {
    return this.connectionsService.updateNotes(id, notes, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.connectionsService.remove(id, user);
  }
}
