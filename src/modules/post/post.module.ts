import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  providers: [PostService, PrismaService],
  controllers: [PostController],
})
export class PostModule {}
