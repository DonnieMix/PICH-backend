import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import type { CardsService } from './cards.service';
import type { CreateCardDto } from './dto/create-card.dto';
import type { UpdateCardDto } from './dto/update-card.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { User } from '../users/entities/user.entity';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto, @GetUser() user: User) {
    return this.cardsService.create(createCardDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.cardsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.findOne(id, user);
  }

  @Get('public/:id')
  findOnePublic(@Param('id') id: string) {
    return this.cardsService.findOnePublic(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @GetUser() user: User,
  ) {
    return this.cardsService.update(id, updateCardDto, user);
  }

  @Patch(':id/toggle-prime')
  togglePrime(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.togglePrime(id, user);
  }

  @Patch(':id/toggle-wallet')
  toggleWallet(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.toggleWallet(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.remove(id, user);
  }
}
