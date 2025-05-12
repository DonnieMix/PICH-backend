import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from './entities/connection.entity';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { User } from '../users/entities/user.entity';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(Connection)
    private connectionsRepository: Repository<Connection>,
    private cardsService: CardsService,
  ) {}

  async create(
    createConnectionDto: CreateConnectionDto,
    user: User,
  ): Promise<Connection> {
    // Check if the card exists (will throw NotFoundException if not)
    const card = await this.cardsService.findOnePublic(
      createConnectionDto.cardId,
    );

    // Check if connection already exists
    const existingConnection = await this.connectionsRepository.findOne({
      where: {
        userId: user.id,
        cardId: card.id,
      },
    });

    if (existingConnection) {
      throw new ConflictException('Connection already exists');
    }

    // Create new connection
    const connection = this.connectionsRepository.create({
      ...createConnectionDto,
      user,
      userId: user.id,
    });

    return this.connectionsRepository.save(connection);
  }

  async findAll(user: User): Promise<Connection[]> {
    return this.connectionsRepository.find({
      where: { userId: user.id },
      relations: ['card'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Connection> {
    const connection = await this.connectionsRepository.findOne({
      where: { id, userId: user.id },
      relations: ['card'],
    });

    if (!connection) {
      throw new NotFoundException(`Connection with ID "${id}" not found`);
    }

    return connection;
  }

  async toggleFavorite(id: string, user: User): Promise<Connection> {
    const connection = await this.findOne(id, user);

    connection.isFavorite = !connection.isFavorite;

    return this.connectionsRepository.save(connection);
  }

  async updateNotes(
    id: string,
    notes: string,
    user: User,
  ): Promise<Connection> {
    const connection = await this.findOne(id, user);

    connection.notes = notes;

    return this.connectionsRepository.save(connection);
  }

  async remove(id: string, user: User): Promise<void> {
    const connection = await this.findOne(id, user);

    await this.connectionsRepository.remove(connection);
  }
}
