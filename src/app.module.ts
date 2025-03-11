import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import appConfig from './common/config/app.config';
import cacheConfig from './common/config/cache.config';
import loggingConfig from './common/config/logging.config';
import monitoringConfig from './common/config/monitoring.config';
import { CachingService } from './common/services/caching.service';
import { LoggingMiddleWare } from './common/services/logging.midleware';
import { ExceptionFilter } from './common/filters/exception-filter';

import { PrometheusMetricsService } from './common/services/monitoring.service';
import { AppController } from './app.controller';
import { PrometheusController } from './common/controllers/monitoring.controller';
import { AppService } from './app.service';
import { RabbitmqService } from './common/services/logger-rmq-service';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import rmqConfig from './common/config/rmq.config';
import { LoggingService } from './common/services/logging.service';
import { AuthClientService } from './common/services/auth.service';
import { CircuitBreakerService } from './common/services/sercuit.breaker.service';
import { BlogModule } from './modules/blog/blog.module';
import { FileModule } from './common/file/file.module';

@Module({
  imports: [
    // ConfigModule for environment-based settings
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: true, // Prevents loading the `.env` file

      load: [appConfig, cacheConfig, loggingConfig, monitoringConfig, rmqConfig],
    }),

    // Logging module (conditionally enabled)

    // Register RabbitMQ client (as a microservice)
    ClientsModule.registerAsync([
      {
        name: 'LOGGER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rmq.url', 'amqp://localhost:5672')],
            queue: configService.get<string>('rmq.loggerQueue', 'logging_queue'),
            queueOptions: {
              durable: false, // Make the queue durable
            },
          },
        }),
      },
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rmq.url', 'amqp://localhost:5672')],
            queue: 'AUTH_QUEUE',
            queueOptions: {
              durable: false, // Make the queue durable
            },
          },
        }),
      },
    ]),

    UserModule,

    PostModule,

    BlogModule,

    FileModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },

    // Conditionally register caching service
    {
      provide: CachingService,
      useFactory: (configService: ConfigService) => {
        const isEnabled = configService.get<boolean>('cache.isEnabled');
        return isEnabled ? new CachingService(configService) : null;
      },
      inject: [ConfigService],
    },

    // Conditionally register logging service

    PrometheusMetricsService,
    AppService,
    RabbitmqService,
    LoggingService,
    AuthClientService,
    CircuitBreakerService,
  ],
  exports: [AuthClientService, CircuitBreakerService],
  controllers: [AppController, PrometheusController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleWare) // Use the LoggingMiddleware
      .forRoutes('*'); // Apply it globally to all routes
  }
}
