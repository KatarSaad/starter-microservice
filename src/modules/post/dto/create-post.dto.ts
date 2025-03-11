import { IsString, IsNotEmpty } from 'class-validator';
import { Post } from '@prisma/client';

export class CreatePostDto implements Omit<Post, 'id'> {
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  createdAt: Date;
}
