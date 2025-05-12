import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrService {
  constructor(private configService: ConfigService) {}

  async generateCardQR(cardId: string): Promise<string> {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://pich.app',
    );
    const cardUrl = `${baseUrl}/card/${cardId}`;

    // Generate QR code as data URL
    return QRCode.toDataURL(cardUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#1E1B4B', // Dark purple (primary color)
        light: '#FFFFFF', // White background
      },
    });
  }

  async generateProfileQR(userId: string): Promise<string> {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://pich.app',
    );
    const profileUrl = `${baseUrl}/profile/${userId}`;

    // Generate QR code as data URL
    return QRCode.toDataURL(profileUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#1E1B4B', // Dark purple (primary color)
        light: '#FFFFFF', // White background
      },
    });
  }
}
