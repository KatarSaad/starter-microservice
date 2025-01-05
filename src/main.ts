import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable microservice mode to listen to RabbitMQ messages
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'], // RabbitMQ URL
      queue: 'user_queue', // Queue name
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices(); // Start the microservice
  await app.listen(3000); // Start the main HTTP server if needed
}
bootstrap();
