import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Connection } from './entities/connection.entity';
import type { CreateConnectionDto } from './dto/create-connection.dto';
import type { UpdateNotesDto } from './dto/update-notes.dto';
import type { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionsRepository: Repository<Connection>,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  async create(
    createConnectionDto: CreateConnectionDto,
    currentUser: User,
  ): Promise<Connection> {
    // Check if the scanned user exists
    const scannedUser = await this.usersService.findOne(
      createConnectionDto.scannedUserId,
    );

    // Ensure users aren't connecting with themselves
    if (currentUser.id === scannedUser.id) {
      throw new ConflictException('Cannot connect with yourself');
    }

    // Check if connection already exists (in either direction)
    const existingConnection = await this.findConnectionBetweenUsers(
      currentUser.id,
      scannedUser.id,
    );

    if (existingConnection) {
      throw new ConflictException(
        'Connection already exists between these users',
      );
    }

    // Create new mutual connection
    const connection = this.connectionsRepository.create({
      user1Id: currentUser.id,
      user2Id: scannedUser.id,
      connectionDate: new Date(),
      lastInteractionDate: new Date(),
    });

    // Save the connection
    await this.connectionsRepository.save(connection);

    // Return the connection with relations loaded
    const savedConnection = await this.connectionsRepository.findOne({
      where: { id: connection.id },
      relations: ['user1', 'user2'],
    });

    // Handle the case where the connection might not be found (should never happen)
    if (!savedConnection) {
      throw new InternalServerErrorException('Failed to create connection');
    }

    return savedConnection;
  }

  async findAll(user: User): Promise<Connection[]> {
    // Find all connections where the user is either user1 or user2
    return this.connectionsRepository.find({
      where: [{ user1Id: user.id }, { user2Id: user.id }],
      relations: ['user1', 'user2'],
      order: { lastInteractionDate: 'DESC' },
    });
  }

  async findFriends(user: User): Promise<User[]> {
    const connections = await this.findAll(user);

    // For each connection, return the other user
    return connections.map((connection) => {
      return connection.user1Id === user.id
        ? connection.user2
        : connection.user1;
    });
  }

  async findOne(id: string, user: User): Promise<Connection> {
    const connection = await this.connectionsRepository.findOne({
      where: [
        { id, user1Id: user.id },
        { id, user2Id: user.id },
      ],
      relations: ['user1', 'user2'],
    });

    if (!connection) {
      throw new NotFoundException(`Connection with ID "${id}" not found`);
    }

    return connection;
  }

  async findConnectionBetweenUsers(
    user1Id: string,
    user2Id: string,
  ): Promise<Connection | null> {
    return this.connectionsRepository.findOne({
      where: [
        { user1Id, user2Id },
        { user1Id: user2Id, user2Id: user1Id },
      ],
    });
  }

  async updateNotes(
    id: string,
    updateNotesDto: UpdateNotesDto,
    user: User,
  ): Promise<Connection> {
    const connection = await this.findOne(id, user);

    // Update notes based on which user is updating
    if (connection.user1Id === user.id) {
      connection.user1Notes = updateNotesDto.notes;
    } else {
      connection.user2Notes = updateNotesDto.notes;
    }

    connection.lastInteractionDate = new Date();

    return this.connectionsRepository.save(connection);
  }

  async toggleFavorite(id: string, user: User): Promise<Connection> {
    const connection = await this.findOne(id, user);

    // Toggle favorite status based on which user is toggling
    if (connection.user1Id === user.id) {
      connection.user1FavoritedUser2 = !connection.user1FavoritedUser2;
    } else {
      connection.user2FavoritedUser1 = !connection.user2FavoritedUser1;
    }

    connection.lastInteractionDate = new Date();

    return this.connectionsRepository.save(connection);
  }

  async remove(id: string, user: User): Promise<void> {
    const connection = await this.findOne(id, user);
    await this.connectionsRepository.remove(connection);
  }

  // Get notes for a specific connection from the perspective of the current user
  getNotes(connection: Connection, userId: string): string | undefined {
    if (connection.user1Id === userId) {
      return connection.user1Notes;
    } else {
      return connection.user2Notes;
    }
  }

  // Check if the current user has favorited the other user in this connection
  hasFavorited(connection: Connection, userId: string): boolean {
    if (connection.user1Id === userId) {
      return connection.user1FavoritedUser2;
    } else {
      return connection.user2FavoritedUser1;
    }
  }

  // Get the other user in a connection
  getOtherUser(connection: Connection, userId: string): User {
    return connection.user1Id === userId ? connection.user2 : connection.user1;
  }
}
