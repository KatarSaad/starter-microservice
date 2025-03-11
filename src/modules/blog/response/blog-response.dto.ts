import { Blog } from '@prisma/client';

export class BlogResponseDto implements Blog {
  id: number;
  title: string;
  author: string;
  createdAt: Date;
}
