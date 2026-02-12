import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

const expressApp = express();
expressApp.use(express.json({ limit: '50mb' }));
expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

let app: any;
let initPromise: Promise<any> | null = null;

async function bootstrap() {
  if (!app) {
    if (!initPromise) {
      initPromise = (async () => {
        try {
          const adapter = new ExpressAdapter(expressApp);
          app = await NestFactory.create(AppModule, adapter, {
            logger: false,
            bufferLogs: true,
          });

          app.enableCors({
            origin: '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
          });

          app.useGlobalPipes(
            new ValidationPipe({
              whitelist: true,
              forbidNonWhitelisted: true,
              transform: true,
              transformOptions: {
                enableImplicitConversion: true,
              },
            }),
          );

          app.setGlobalPrefix('api');
          
          // Don't call app.init() - just return the app
          // The middleware is already registered on expressApp
          
          return app;
        } catch (error) {
          console.error('Bootstrap error:', error);
          initPromise = null;
          throw error;
        }
      })();
    }
    await initPromise;
  }
  return app;
}

export default async (req: Request, res: Response) => {
  try {
    await bootstrap();
    expressApp(req, res);
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
