import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: false,
      load: [appConfig, cacheConfig, loggingConfig, monitoringConfig, rmqConfig],
    }),
    ClientsModule.register([
      {
        name: 'LOGGER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rmqConfig().url],
          queue: rmqConfig().LOGGER_QUEUE,
          queueOptions: {
            durable: rmqConfig().QUEUE_DURABLE,
          },
          socketOptions: { frameMax: rmqConfig().frameMax },
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rmqConfig().url],
          queue: rmqConfig().AUTH_QUEUE,
          queueOptions: { durable: rmqConfig().QUEUE_DURABLE },
          socketOptions: { frameMax: rmqConfig().frameMax },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rmqConfig().url],
          queue: rmqConfig().USER_QUEUE,
          queueOptions: { durable: rmqConfig().QUEUE_DURABLE },
          socketOptions: { frameMax: rmqConfig().frameMax },
        },
      },
    ]),
    UserModule,
    PostModule,
    BlogModule,
    FileModule,
  ],
  controllers: [AppController, PrometheusController],
  providers: [
    AppService,
    CachingService,
    LoggingService,
    PrometheusMetricsService,
    AuthClientService,
    CircuitBreakerService,
    RabbitmqService,
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleWare).forRoutes('*');
  }
}
