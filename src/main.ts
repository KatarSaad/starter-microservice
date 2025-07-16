import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import './common/config/tracing.setup'; // Import tracing setup
import rmqConfig from './common/config/rmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalFilters(new ExceptionFilter());

  const rmq = rmqConfig();
  const port = process.env.PORT || 1000;

  // const loggingInterceptor = new RmqLoggingInterceptor(loggingService);

  // HTTP context
  // app.useGlobalInterceptors(loggingInterceptor);

  // RabbitMQ microservice context
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmq.url],
      queue: rmq.USER_QUEUE,
      queueOptions: {
        durable: rmq.QUEUE_DURABLE,
      },
      prefetchCount: 1,
      noAck: false,
      persistent: true,
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
        frameMax: rmq.frameMax,
      },
    },
  });

  // Apply global interceptors to the microservice instance
  // microservice.useGlobalInterceptors(loggingInterceptor);

  // Start services
  console.log(`Application is running on: http://0.0.0.0:${port}? QUEUE: ${rmq.QUEUE_DURABLE}`);

  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');
}
bootstrap();
