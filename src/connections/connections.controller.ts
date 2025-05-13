import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import type { ConnectionsService } from './connections.service';
import type { CreateConnectionDto } from './dto/create-connection.dto';
import type { UpdateNotesDto } from './dto/update-notes.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('connections')
@UseGuards(JwtAuthGuard)
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

  @Get('friends')
  findFriends(@GetUser() user: User) {
    return this.connectionsService.findFriends(user);
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
    @Body() updateNotesDto: UpdateNotesDto,
    @GetUser() user: User,
  ) {
    return this.connectionsService.updateNotes(id, updateNotesDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.connectionsService.remove(id, user);
  }
}
