import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

// Express app created at module level
const expressApp = express();
expressApp.use(express.json({ limit: '50mb' }));
expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

// Don't pass expressApp to adapter, let NestJS create its own
// Then we'll get the underlying app and use it
let nestApp: any;
let httpApp: any;

async function bootstrap() {
  if (!nestApp) {
    try {
      // Create NestJS app with fresh Express adapter
      // Don't pass our pre-configured expressApp to avoid middleware conflicts
      const adapter = new ExpressAdapter();
      nestApp = await NestFactory.create(AppModule, adapter, {
        logger: false,
      });

      // Get the underlying Express app from the adapter
      httpApp = adapter.getInstance();

      // Apply middleware to NestJS's Express app
      httpApp.use(express.json({ limit: '50mb' }));
      httpApp.use(express.urlencoded({ limit: '50mb', extended: true }));

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
      
      // Now call init to set up routes
      await nestApp.init();
    } catch (error) {
      console.error('Bootstrap error:', error);
      throw error;
    }
  }
  return httpApp;
}

export default async (req: Request, res: Response) => {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error', msg: error.message });
    }
  }
};
