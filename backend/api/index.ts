import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

let nestApp: any;

async function bootstrap() {
  if (!nestApp) {
    try {
      const expressInstance = express();

      // Patch app.get to prevent 'router' access from triggering deprecation
      const originalGet = expressInstance.get;
      expressInstance.get = function(prop: any, ...args: any[]) {
        if (prop === 'router' || prop === '_router') {
          return undefined;
        }
        return originalGet.call(this, prop, ...args);
      };

      // Add middleware BEFORE creating NestJS
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

      // Use getHttpServer() instead of calling init()
      const server = nestApp.getHttpServer();
      
      // Silence the init if needed
      try {
        await nestApp.init();
      } catch (e) {
        // Ignore router deprecation error if it still occurs
        if (!String(e).includes("'app.router'")) {
          throw e;
        }
      }

      return expressInstance;
    } catch (error) {
      console.error('Bootstrap error:', error);
      throw error;
    }
  }

  // Return the express instance on subsequent calls
  const adapter = nestApp.getHttpAdapter();
  return adapter.getInstance();
}

export default async (req: Request, res: Response) => {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error'
      });
    }
  }
};
