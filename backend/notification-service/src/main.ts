import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      /mstagritech\.co\.zw$/,
    ],
    credentials: true,
  });
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Notification service running on port ${port}`);
}
bootstrap();
