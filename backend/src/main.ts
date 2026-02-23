// import { ValidationPipe } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const localOrigins = new Set([
//     'http://localhost:5173',
//     'http://localhost:5174',
//     'http://localhost:5175',
//     'http://localhost:5176',
//     'http://127.0.0.1:5173',
//     'http://127.0.0.1:5174',
//     'http://127.0.0.1:5175',
//     'http://127.0.0.1:5176',
//   ]);
//   app.enableCors({
//     origin: (origin, callback) => {
//       if (!origin || localOrigins.has(origin)) {
//         callback(null, true);
//         return;
//       }
//       callback(new Error(`CORS blocked for origin: ${origin}`));
//     },
//     credentials: true,
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     allowedHeaders: 'Content-Type,Authorization',
//   });
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }),
//   );
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // List of allowed frontend URLs
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5173',
    // ADD YOUR VERCEL URL HERE:
    'https://cio-mogul-tru-time-e47w.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Logic: If there is no origin (like a mobile app) 
      // or the origin is in our list, allow it.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // This is where it was failing before!
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
