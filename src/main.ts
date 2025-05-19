import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS with configuration from environment
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global validation pipe with modified settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      transform: true, // Transform payloads to DTO instances
      forbidNonWhitelisted: false, // Changed to false to allow extra properties
    }),
  );

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Get port from environment or use default
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
