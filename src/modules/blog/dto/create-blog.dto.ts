import { IsString, IsNotEmpty } from 'class-validator';
import { Blog } from '@prisma/client';

export class CreateBlogDto implements Omit<Blog, 'id'> {
  createdAt: Date;
  title: string;
  author: string;
}
