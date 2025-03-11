import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEventHandler } from './events/user.events';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggingService } from '@app/common/services/logging.service';
import { RabbitmqService } from '@app/common/services/logger-rmq-service';
import { AppModule } from 'src/app.module';

@Module({
  imports: [forwardRef(() => AppModule)],
  providers: [UserService, PrismaService, LoggingService, RabbitmqService],
  controllers: [UserController, UserEventHandler],
})
export class UserModule {}
