import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

// Create Express app at module level to reuse across invocations
const expressApp = express();

// Add middleware at module level before NestJS tries to register them
expressApp.use(express.json({ limit: '50mb' }));
expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

let app: any;

async function bootstrap() {
  if (!app) {
    try {
      const adapter = new ExpressAdapter(expressApp);
      app = await NestFactory.create(AppModule, adapter, {
        logger: ['error', 'warn'],
        bufferLogs: true,
      });

      app.enableCors({
        origin: true,
        credentials: true,
      });

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      app.setGlobalPrefix('api');
      
      // Use app.getHttpAdapter() to get the Express instance
      // This prevents NestJS from trying to check app.router
      await app.init();
    } catch (error) {
      console.error('Failed to bootstrap NestJS app:', error);
      throw error;
    }
  }

  return app;
}

export default async (req: Request, res: Response) => {
  try {
    await bootstrap();
    // Call the middleware chain directly
    return expressApp(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
};
