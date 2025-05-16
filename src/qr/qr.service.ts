import { Inject, Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrService {
  constructor(
    @Inject(ConfigService)
    private configService: ConfigService,
  ) {}

  async generateUserQR(userId: string): Promise<string> {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const connectUrl = `${baseUrl}/connect/${userId}`;

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
}
