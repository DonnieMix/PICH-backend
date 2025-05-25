import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import type { User } from '../users/entities/user.entity';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class QrService {
  constructor(
    @Inject(CardsService)
    private readonly cardsService: CardsService,
  ) {}

  async generateCardQR(cardId: string): Promise<string> {
    // Generate QR code for a specific card
    const connectUrl = `pich://connect/${cardId}`;

    // Generate QR code as data URL
    return QRCode.toDataURL(connectUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000', // Using design token from Figma
        light: '#FFFFFF', // White background
      },
    });
  }

  async generateMainCardQR(user: User): Promise<string> {
    // If user has a main card, generate QR for that card
    if (user.mainCardId) {
      return this.generateCardQR(user.mainCardId);
    }

    // Otherwise, find the first card or throw an error
    const userCards = await this.cardsService.findAll(user);
    if (userCards.length === 0) {
      throw new NotFoundException('User has no cards to generate QR code for');
    }

    return this.generateCardQR(userCards[0].id);
  }
}
