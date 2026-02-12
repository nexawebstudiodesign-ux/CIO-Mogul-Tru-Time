import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../src/app.module';

let app: any = null;

async function createApp() {
  const expressApp = express();
  
  // Register middleware FIRST, before NestJS tries to check for them
  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Create adapter
  const adapter = new ExpressAdapter(expressApp);

  // Patch registerParserMiddleware to do nothing
  // This prevents the deprecated app.router check
  const originalRegister = adapter.registerParserMiddleware;
  adapter.registerParserMiddleware = function() {
    return this;
  };

  const nestApp = await NestFactory.create(AppModule, adapter, {
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

  // Initialize app routes
  await nestApp.init();

  return expressApp;
}

export default async (req: any, res: any) => {
  try {
    if (!app) {
      app = await createApp();
    }
    app(req, res);
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server Error' });
    }
  }
};
