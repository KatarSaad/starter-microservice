import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Retrieve ConfigService to access environment variables
  const configService = app.get(ConfigService);

  // Enable microservice mode to listen to RabbitMQ messages
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')], // RabbitMQ URL from .env
      queue: configService.get<string>('USER_QUEUE') || 'user_queue', // Queue name from .env or fallback
      queueOptions: {
        durable: configService.get<boolean>('QUEUE_DURABLE', false), // Durability setting
      },
    },
  });

  await app.startAllMicroservices(); // Start the microservice
  console.log('Microservice is running and connected to RabbitMQ');

  await app.listen(3000); // Start the main HTTP server
  console.log('HTTP server is running on http://localhost:3000');
}
bootstrap();
