import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

let cachedApp: any;

async function bootstrap() {
  // In serverless, create a new Express app for each invocation
  // Don't cache the full app as it causes issues with Express 4.x adapter
  const expressApp = express();
  
  // Add built-in middleware directly
  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  // Only cache if not already cached
  if (!cachedApp) {
    try {
      const adapter = new ExpressAdapter(expressApp);
      cachedApp = await NestFactory.create(AppModule, adapter, {
        logger: ['error', 'warn'],
        bufferLogs: true,
      });

      cachedApp.enableCors({
        origin: true,
        credentials: true,
      });

      cachedApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      cachedApp.setGlobalPrefix('api');
      await cachedApp.init();
    } catch (error) {
      console.error('Failed to bootstrap NestJS app:', error);
      throw error;
    }
  }

  return expressApp;
}

export default async (req: Request, res: Response) => {
  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
};
