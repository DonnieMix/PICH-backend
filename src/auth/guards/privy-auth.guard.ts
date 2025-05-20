import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import type { Request } from 'express';

@Injectable()
export class PrivyAuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const { user } = await this.authService.verifyPrivyToken(token);
      // Attach the user to the request object
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
