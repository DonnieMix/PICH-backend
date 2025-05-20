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
import { CardsService } from './cards.service';
import type { CreateCardDto } from './dto/create-card.dto';
import type { UpdateCardDto } from './dto/update-card.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { User } from '../users/entities/user.entity';
import { PrivyAuthGuard } from '../auth/guards/privy-auth.guard';

@Controller('cards')
export class CardsController {
  constructor(
    @Inject(CardsService) private readonly cardsService: CardsService,
  ) {}

  @UseGuards(PrivyAuthGuard)
  @Post()
  create(createCardDto: CreateCardDto, @GetUser() user: User) {
    return this.cardsService.create(createCardDto, user);
  }

  @UseGuards(PrivyAuthGuard)
  @Get()
  findAll(@GetUser() user: User) {
    return this.cardsService.findAll(user);
  }

  @UseGuards(PrivyAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.findOne(id, user);
  }

  @Get('public/:id')
  findOnePublic(@Param('id') id: string) {
    return this.cardsService.findOnePublic(id);
  }

  @UseGuards(PrivyAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    updateCardDto: UpdateCardDto,
    @GetUser() user: User,
  ) {
    return this.cardsService.update(id, updateCardDto, user);
  }

  @UseGuards(PrivyAuthGuard)
  @Patch(':id/toggle-prime')
  togglePrime(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.togglePrime(id, user);
  }

  @UseGuards(PrivyAuthGuard)
  @Patch(':id/toggle-wallet')
  toggleWallet(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.toggleWallet(id, user);
  }

  @UseGuards(PrivyAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.cardsService.remove(id, user);
  }
}
