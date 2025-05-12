import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
  ) {}

  async create(createCardDto: CreateCardDto, user: User): Promise<Card> {
    const card = this.cardsRepository.create({
      ...createCardDto,
      user,
      userId: user.id,
    });

    return this.cardsRepository.save(card);
  }

  async findAll(user: User): Promise<Card[]> {
    return this.cardsRepository.find({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Card> {
    const card = await this.cardsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!card) {
      throw new NotFoundException(`Card with ID "${id}" not found`);
    }

    // Check if the card belongs to the user
    if (card.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to access this card',
      );
    }

    return card;
  }

  async findOnePublic(id: string): Promise<Card> {
    const card = await this.cardsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!card) {
      throw new NotFoundException(`Card with ID "${id}" not found`);
    }

    // Remove sensitive information by creating a new user object without password
    if (card.user) {
      const { password: _unused, ...userWithoutPassword } = card.user;
      card.user = userWithoutPassword as User;
    }

    return card;
  }

  async update(
    id: string,
    updateCardDto: UpdateCardDto,
    user: User,
  ): Promise<Card> {
    const card = await this.findOne(id, user);

    Object.assign(card, updateCardDto);

    return this.cardsRepository.save(card);
  }

  async remove(id: string, user: User): Promise<void> {
    const card = await this.findOne(id, user);

    await this.cardsRepository.remove(card);
  }
}
