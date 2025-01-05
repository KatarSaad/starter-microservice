import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MikroOrmModule } from '@mikro-orm/nestjs/mikro-orm.module';
import { LoggerMiddleware } from './midlewares/logger-midleware';
import defineConfig from './mikro-orm.config';
import { RabbitmqService } from 'services/logger-rmq-service';

@Module({
  imports: [
    // Load environment variables and make them globally available
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MikroORM setup
    MikroOrmModule.forRoot(defineConfig),

    // Dynamic Client Modules for RabbitMQ services
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('ORDER_QUEUE'),
            queueOptions: {
              durable: configService.get<boolean>('QUEUE_DURABLE', false),
            },
          },
        }),
      },
      {
        name: 'LOGGER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('LOGGER_QUEUE'),
            queueOptions: {
              durable: configService.get<boolean>('QUEUE_DURABLE', false),
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, RabbitmqService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware) // Apply the logger middleware
      .forRoutes('*'); // Apply for all routes or specify specific routes
  }
}
