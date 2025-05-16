import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Repository, In } from 'typeorm';
import { Connection } from './entities/connection.entity';
import type { CreateConnectionDto } from './dto/create-connection.dto';
import type { UpdateNotesDto } from './dto/update-notes.dto';
import type { User } from '../users/entities/user.entity';
import type { Card } from '../cards/entities/card.entity';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionsRepository: Repository<Connection>,
    @Inject(CardsService)
    private readonly cardsService: CardsService,
  ) {}

  async create(
    createConnectionDto: CreateConnectionDto,
    currentUser: User,
  ): Promise<Connection> {
    // Get the scanned card
    const scannedCard = await this.cardsService.findOnePublic(
      createConnectionDto.scannedCardId,
    );

    // Get the current user's main card or first card if no main card is set
    let userCard: Card;
    if (currentUser.mainCardId) {
      userCard = await this.cardsService.findOne(
        currentUser.mainCardId,
        currentUser,
      );
    } else {
      const userCards = await this.cardsService.findAll(currentUser);
      if (userCards.length === 0) {
        throw new ConflictException(
          'You need to create a card before connecting with others',
        );
      }
      userCard = userCards[0];
    }

    // Ensure users aren't connecting with themselves
    if (userCard.userId === scannedCard.userId) {
      throw new ConflictException('Cannot connect with your own card');
    }

    // Check if connection already exists (in either direction)
    const existingConnection = await this.findConnectionBetweenCards(
      userCard.id,
      scannedCard.id,
    );

    if (existingConnection) {
      throw new ConflictException(
        'Connection already exists between these cards',
      );
    }

    // Create new connection
    const connection = this.connectionsRepository.create({
      card1Id: userCard.id,
      card2Id: scannedCard.id,
      connectionDate: new Date(),
      lastInteractionDate: new Date(),
    });

    // Save the connection
    await this.connectionsRepository.save(connection);

    // Return the connection with relations loaded
    const savedConnection = await this.connectionsRepository.findOne({
      where: { id: connection.id },
      relations: ['card1', 'card2'],
    });

    // Handle the case where the connection might not be found (should never happen)
    if (!savedConnection) {
      throw new InternalServerErrorException('Failed to create connection');
    }

    return savedConnection;
  }

  async findAll(user: User): Promise<Connection[]> {
    // Get all user's cards
    const userCards = await this.cardsService.findAll(user);
    const userCardIds = userCards.map((card) => card.id);

    // Find all connections where any of the user's cards is either card1 or card2
    return this.connectionsRepository.find({
      where: [{ card1Id: In(userCardIds) }, { card2Id: In(userCardIds) }],
      relations: ['card1', 'card2'],
      order: { lastInteractionDate: 'DESC' },
    });
  }

  async findConnectedCards(user: User): Promise<Card[]> {
    const connections = await this.findAll(user);
    const userCards = await this.cardsService.findAll(user);
    const userCardIds = userCards.map((card) => card.id);

    // For each connection, return the other card
    return connections.map((connection) => {
      return userCardIds.includes(connection.card1Id)
        ? connection.card2
        : connection.card1;
    });
  }

  async findOne(id: string, user: User): Promise<Connection> {
    const userCards = await this.cardsService.findAll(user);
    const userCardIds = userCards.map((card) => card.id);

    const connection = await this.connectionsRepository.findOne({
      where: [
        { id, card1Id: In(userCardIds) },
        { id, card2Id: In(userCardIds) },
      ],
      relations: ['card1', 'card2'],
    });

    if (!connection) {
      throw new NotFoundException(`Connection with ID "${id}" not found`);
    }

    return connection;
  }

  async findConnectionBetweenCards(
    card1Id: string,
    card2Id: string,
  ): Promise<Connection | null> {
    return this.connectionsRepository.findOne({
      where: [
        { card1Id, card2Id },
        { card1Id: card2Id, card2Id: card1Id },
      ],
    });
  }

  async updateNotes(
    id: string,
    updateNotesDto: UpdateNotesDto,
    user: User,
  ): Promise<Connection> {
    const connection = await this.findOne(id, user);
    const userCards = await this.cardsService.findAll(user);
    const userCardIds = userCards.map((card) => card.id);

    // Update notes based on which card belongs to the user
    if (userCardIds.includes(connection.card1Id)) {
      connection.card1Notes = updateNotesDto.notes;
    } else {
      connection.card2Notes = updateNotesDto.notes;
    }

    connection.lastInteractionDate = new Date();

    return this.connectionsRepository.save(connection);
  }

  async toggleFavorite(id: string, user: User): Promise<Connection> {
    const connection = await this.findOne(id, user);
    const userCards = await this.cardsService.findAll(user);
    const userCardIds = userCards.map((card) => card.id);

    // Toggle favorite status based on which card belongs to the user
    if (userCardIds.includes(connection.card1Id)) {
      connection.card1FavoritedCard2 = !connection.card1FavoritedCard2;
    } else {
      connection.card2FavoritedCard1 = !connection.card2FavoritedCard1;
    }

    connection.lastInteractionDate = new Date();

    return this.connectionsRepository.save(connection);
  }

  async remove(id: string, user: User): Promise<void> {
    const connection = await this.findOne(id, user);
    await this.connectionsRepository.remove(connection);
  }

  // Get notes for a specific connection from the perspective of the current user's card
  getNotes(connection: Connection, userCardIds: string[]): string | null {
    if (userCardIds.includes(connection.card1Id)) {
      return connection.card1Notes;
    } else {
      return connection.card2Notes;
    }
  }

  // Check if the current user's card has favorited the other card in this connection
  hasFavorited(connection: Connection, userCardIds: string[]): boolean {
    if (userCardIds.includes(connection.card1Id)) {
      return connection.card1FavoritedCard2;
    } else {
      return connection.card2FavoritedCard1;
    }
  }

  // Get the other card in a connection
  getOtherCard(connection: Connection, userCardIds: string[]): Card {
    return userCardIds.includes(connection.card1Id)
      ? connection.card2
      : connection.card1;
  }
}
