import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import type { Request } from 'express';
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
export class PrivyAuthStrategy extends PassportStrategy(Strategy, 'privy') {
  private readonly logger = new Logger(PrivyAuthStrategy.name);

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {
    // Disable ESLint for the super() call
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super();
  }

  async validate(request: Request): Promise<any> {
    try {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Missing authentication token');
      }

      // Verify the Privy token
      const privyApiKey = this.configService.get<string>('PRIVY_API_KEY');
      const privyAppId = this.configService.get<string>('PRIVY_APP_ID');

      if (!privyApiKey || !privyAppId) {
        throw new UnauthorizedException('Privy configuration is missing');
      }

      // Verify token with Privy API
      let privyUserId: string;
      let verified: boolean;
      let wallets: PrivyWallet[] | undefined;
      let email: string | undefined;

      try {
        // Disable ESLint for the axios.post call
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const response = await axios.post(
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

        // Extract data with explicit type checking
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Invalid response from Privy API');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        privyUserId = response.data.userId as string;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        verified = response.data.verified as boolean;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        wallets = response.data.wallets as PrivyWallet[] | undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        email = response.data.email as string | undefined;

        if (!privyUserId || typeof privyUserId !== 'string') {
          throw new Error('Invalid user ID in Privy response');
        }

        if (typeof verified !== 'boolean') {
          throw new Error('Invalid verification status in Privy response');
        }
      } catch (axiosError) {
        let errorMessage = 'Failed to verify token with Privy';

        // Handle error with explicit type checking
        if (axiosError instanceof Error) {
          errorMessage = `Privy API error: ${axiosError.message}`;
        }

        this.logger.error(errorMessage);
        throw new UnauthorizedException('Failed to verify token with Privy');
      }

      if (!verified) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      // Find or create user based on Privy user ID
      let user = await this.usersService.findByPrivyId(privyUserId);

      if (!user) {
        // Extract user information from Privy data
        const firstName =
          email && typeof email === 'string' ? email.split('@')[0] : 'User';
        const lastName = '';

        // Create a new user with Privy information
        try {
          user = await this.usersService.createWithPrivy({
            privyId: privyUserId,
            email: email || `${privyUserId}@privy.user`,
            firstName,
            lastName,
            walletAddress:
              wallets && wallets.length > 0 ? wallets[0].address : null,
          });
        } catch (createError) {
          let errorMessage = 'Failed to create user account';

          if (createError instanceof Error) {
            errorMessage = `Failed to create user with Privy: ${createError.message}`;
          }

          this.logger.error(errorMessage);
          throw new UnauthorizedException('Failed to create user account');
        }
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      // Safely handle different error types
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Log the error for debugging
      let errorMessage = 'Authentication failed';
      if (error instanceof Error) {
        errorMessage = `Authentication error: ${error.message}`;
      }
      this.logger.error(errorMessage);

      // Always throw a generic UnauthorizedException to the client
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
