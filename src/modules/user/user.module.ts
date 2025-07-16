import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEventHandler } from './events/user.events';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoggingService } from '../../common/services/logging.service';
import { RabbitmqService } from '../../common/services/logger-rmq-service';
import { CircuitBreakerService } from '../../common/services/sercuit.breaker.service';
import { AppModule } from '../../app.module';

@Module({
  imports: [forwardRef(() => AppModule)],
  providers: [UserService, PrismaService, LoggingService, RabbitmqService, CircuitBreakerService],
  controllers: [UserController, UserEventHandler],
})
export class UserModule {}
