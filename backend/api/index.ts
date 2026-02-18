// import { NestFactory } from '@nestjs/core';
// import { ExpressAdapter } from '@nestjs/platform-express';
// import { ValidationPipe } from '@nestjs/common';
// import express from 'express';
// import { AppModule } from '../src/app.module';

// let app: any = null;

// async function createApp() {
//   const expressApp = express();
//   expressApp.use(express.json({ limit: '50mb' }));
//   expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

//   // Suppress all console errors during NestJS initialization to avoid router deprecation crash
//   const originalError = console.error;
//   const originalWarn = console.warn;
//   console.error = () => {};
//   console.warn = () => {};

//   try {
//     const adapter = new ExpressAdapter(expressApp);
//     const nestApp = await NestFactory.create(AppModule, adapter, {
//       logger: false,
//       abortOnError: false,
//     });

//     // nestApp.enableCors({ origin: '*', credentials: true });

//     nestApp.enableCors({
//       origin: [
//         'http://localhost:5173',
//         'https://cio-mogul-tru-time-e47w.vercel.app'
//       ],
//       credentials: true,
//     });
    


//     nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
//     nestApp.setGlobalPrefix('api');

//     // Don't call init() - routes are already registered
//     // well its needed for serverless express to work
//     await nestApp.init(); 
    
//     return expressApp;
//   } finally {
//     // Restore console
//     console.error = originalError;
//     console.warn = originalWarn;
//   }
// }

// export default async (req: any, res: any) => {
//   try {
//     if (!app) {
//       app = await createApp();
//     }
//     app(req, res);
//   } catch (error) {
//     if (!res.headersSent) {
//       res.status(500).json({ error: 'Service Error' });
//     }
//   }
// };


import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../src/app.module';

let app: any = null;

async function createApp() {
  const expressApp = express();

  // ✅ Handle CORS + Preflight BEFORE Nest boots
  expressApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://cio-mogul-tru-time-e47w.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  });

  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

  const adapter = new ExpressAdapter(expressApp);
  const nestApp = await NestFactory.create(AppModule, adapter, {
    logger: false,
    abortOnError: false,
  });

  // ✅ Proper CORS inside Nest as well
  nestApp.enableCors({
    origin: [
      'http://localhost:5173',
      'https://cio-mogul-tru-time-e47w.vercel.app'
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
