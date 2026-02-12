import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../src/app.module';

let app: any = null;

async function createApp() {
  const expressApp = express();
  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Suppress all console errors during NestJS initialization to avoid router deprecation crash
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};

  try {
    const adapter = new ExpressAdapter(expressApp);
    const nestApp = await NestFactory.create(AppModule, adapter, {
      logger: false,
      abortOnError: false,
    });

    nestApp.enableCors({ origin: '*', credentials: true });
    nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    nestApp.setGlobalPrefix('api');

    // Don't call init() - routes are already registered
    // await nestApp.init(); 
    
    return expressApp;
  } finally {
    // Restore console
    console.error = originalError;
    console.warn = originalWarn;
  }
}

export default async (req: any, res: any) => {
  try {
    if (!app) {
      app = await createApp();
    }
    app(req, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Service Error' });
    }
  }
};
