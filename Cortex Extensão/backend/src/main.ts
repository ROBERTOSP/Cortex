import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Importante para a extensão
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
