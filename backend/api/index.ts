import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../src/app.module';

let app: any = null;
let errorLogged = false;

async function createApp() {
  const expressApp = express();
  
  // Add middleware first
  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

  try {
    const adapter = new ExpressAdapter(expressApp);
    const nestApp = await NestFactory.create(AppModule, adapter, {
      logger: false,
    });

    nestApp.enableCors({ origin: '*', credentials: true });
    nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    nestApp.setGlobalPrefix('api');

    // Try to initialize, but catch router errors
    try {
      await nestApp.init();
    } catch (err) {
      const errStr = String(err);
      if (!errStr.includes("'app.router'") && !errStr.includes('_router')) {
        throw err; // Re-throw if it's not a router error
      }
      console.warn('Router deprecation warning ignored');
    }

    return expressApp;
  } catch (error) {
    console.error('NestJS initialization failed:', error);
    
    // Return a fallback error handler
    return expressApp.use((req: any, res: any) => {
      res.status(500).json({
        error: 'Service initialization failed',
        message: error instanceof Error ? error.message : String(error),
      });
    });
  }
}

export default async (req: any, res: any) => {
  try {
    if (!app) {
      app = await createApp();
    }
    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
