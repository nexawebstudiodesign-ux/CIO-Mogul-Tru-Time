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

  const adapter = new ExpressAdapter(expressApp);

  const nestApp = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn', 'log'],        // ✅ enable logs
    abortOnError: true,  // ✅ crash properly if something fails
  });

  nestApp.enableCors({
    origin: [
      'http://localhost:5173',
      'https://cio-mogul-tru-time-e47w.vercel.app',
    ],
    credentials: true,
  });

  nestApp.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true })
  );

  nestApp.setGlobalPrefix('api');

  await nestApp.init();

  return expressApp;
}

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      console.log('Creating Nest app...');
      app = await createApp();
      console.log('Nest app created successfully');
    }

    return app(req, res);
  } catch (error: any) {
    console.error(' FATAL ERROR:', error);

    return res.status(500).json({
      message: 'Application crashed',
      error: error?.message,
      stack: error?.stack,
    });
  }
}
