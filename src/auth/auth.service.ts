import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import axios from 'axios';

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
    private readonly usersService: UsersService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

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
