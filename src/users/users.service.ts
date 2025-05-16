import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

// Define a more specific interface for Postgres errors
interface PostgresError {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

// Define a more general error type for the type guard
type PossibleError = Error | PostgresError;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      // Create new user
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      // Save user to database
      await this.usersRepository.save(user);

      return user;
    } catch (error) {
      // Type guard to check if error is a Postgres error
      if (this.isPostgresError(error) && error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  // Type guard function with improved type safety
  private isPostgresError(error: PossibleError): error is PostgresError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
    );
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['cards'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['cards'],
    });
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If password is provided, hash it
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    return updatedUser;
  }

  async setMainCard(userId: string, cardId: string): Promise<User> {
    const user = await this.findOne(userId);

    // Check if the card belongs to the user
    const cardBelongsToUser = user.cards.some((card) => card.id === cardId);
    if (!cardBelongsToUser) {
      throw new NotFoundException(
        `Card with ID "${cardId}" not found for this user`,
      );
    }

    user.mainCardId = cardId;
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
}
