import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import './common/config/tracing.setup'; // Import tracing setup

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalFilters(new ExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const rabbitMQUrl = configService.get<string>('rmq.url');
  const rabbitMQQueue = configService.get<string>('rmq.CURRENT_QUEUE');

  // const loggingInterceptor = new RmqLoggingInterceptor(loggingService);

  // HTTP context
  // app.useGlobalInterceptors(loggingInterceptor);

  // RabbitMQ microservice context
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMQUrl],
      queue: rabbitMQQueue,
      queueOptions: {
        durable: false,
      },
      prefetchCount: 1,
      noAck: false,
      persistent: true,
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  });

  // Apply global interceptors to the microservice instance
  // microservice.useGlobalInterceptors(loggingInterceptor);

  // Start services
  console.log(`Application is running on: http://localhost:${port}? QUEUE: ${rabbitMQQueue}`);

  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
