import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import type { ConfigService } from '@nestjs/config';

@Injectable()
export class QrService {
  constructor(private configService: ConfigService) {}

  async generateUserQR(userId: string): Promise<string> {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://pich.app',
    );
    const connectUrl = `${baseUrl}/connect/${userId}`;

    // Generate QR code as data URL
    return QRCode.toDataURL(connectUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#a39de8', // Using design token from Figma
        light: '#FFFFFF', // White background
      },
    });
  }
}
