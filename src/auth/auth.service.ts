import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import axios from 'axios';
import { Logger } from '@nestjs/common';

// Define interfaces for Privy API response
interface PrivyWallet {
  address: string;
  chainId: string;
  walletClientType: string;
}

interface PrivyVerificationResponse {
  userId: string;
  verified: boolean;
  wallets?: PrivyWallet[];
  email?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(UsersService)
    private usersService: UsersService,
    @Inject(ConfigService)
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Create user (UsersService handles password hashing)
    const user = await this.usersService.create(registerDto);

    // Create a new object without the password
    const { password: _unused, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create a new object without the password
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }

  async verifyPrivyToken(token: string) {
    try {
      const privyApiKey = this.configService.get<string>('PRIVY_API_KEY');
      const privyAppId = this.configService.get<string>('PRIVY_APP_ID');

      if (!privyApiKey || !privyAppId) {
        throw new UnauthorizedException('Privy configuration is missing');
      }

      const response = await axios.post<PrivyVerificationResponse>(
        'https://auth.privy.io/api/v1/verify',
        { token },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${privyApiKey}`,
            'X-Privy-App-Id': privyAppId,
          },
        },
      );

      const { userId: privyUserId, verified, wallets, email } = response.data;

      if (!privyUserId || typeof privyUserId !== 'string') {
        throw new Error('Invalid user ID in Privy response');
      }

      if (typeof verified !== 'boolean' || !verified) {
        throw new Error('Invalid or unverified token');
      }

      // Find or create user based on Privy user ID
      let user = await this.usersService.findByPrivyId(privyUserId);

      if (!user) {
        // Extract user information from Privy data
        const firstName =
          email && typeof email === 'string' ? email.split('@')[0] : 'User';
        const lastName = '';

        // Create a new user with Privy information
        user = await this.usersService.createWithPrivy({
          privyId: privyUserId,
          email: email || `${privyUserId}@privy.user`,
          firstName,
          lastName,
          walletAddress:
            wallets && wallets.length > 0 ? wallets[0].address : null,
        });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword };
    } catch (error) {
      this.logger.error(
        `Privy token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
