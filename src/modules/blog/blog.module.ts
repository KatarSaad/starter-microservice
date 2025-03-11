import { forwardRef, Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggingService } from '@app/common/services/logging.service';
import { RabbitmqService } from '@app/common/services/logger-rmq-service';
import { BlogEventHandler } from './events/blog.events';

@Module({
  imports: [forwardRef(() => AppModule)],
  providers: [BlogService, PrismaService, LoggingService, RabbitmqService],
  controllers: [BlogController, BlogEventHandler],
})
export class BlogModule {}
