import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

let nestApp: any;

async function bootstrap() {
  if (!nestApp) {
    try {
      // Create Express app
      const expressInstance = express();
      
      // Add polyfill for app.router to prevent Express 4.x deprecation error
      Object.defineProperty(expressInstance, 'router', {
        get: () => undefined,
        set: () => {},
      });

      // Add middleware BEFORE creating NestJS app
      expressInstance.use(express.json({ limit: '50mb' }));
      expressInstance.use(express.urlencoded({ limit: '50mb', extended: true }));

      const adapter = new ExpressAdapter(expressInstance);
      nestApp = await NestFactory.create(AppModule, adapter, {
        logger: false,
      });

      nestApp.enableCors({
        origin: '*',
        credentials: true,
      });

      nestApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
        }),
      );

      nestApp.setGlobalPrefix('api');

      // Initialize NestJS
      await nestApp.init();

      return expressInstance;
    } catch (error) {
      console.error('Bootstrap error:', error);
      throw error;
    }
  }
  
  // On subsequent calls, return the already initialized app
  const adapter = nestApp.getHttpAdapter();
  return adapter.getInstance();
}

export default async (req: Request, res: Response) => {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch (error) {
    console.error('Serverless error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
