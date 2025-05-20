import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { UsersService } from './users.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { User } from './entities/user.entity';
import { PrivyAuthGuard } from '../auth/guards/privy-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Post()
  create(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(PrivyAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(PrivyAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: User) {
    return user;
  }

  @UseGuards(PrivyAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(PrivyAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(PrivyAuthGuard)
  @Patch(':id/main-card/:cardId')
  setMainCard(@Param('id') id: string, @Param('cardId') cardId: string) {
    return this.usersService.setMainCard(id, cardId);
  }

  @UseGuards(PrivyAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
