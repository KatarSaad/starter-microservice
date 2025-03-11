import { Post } from '@prisma/client';

export class PostResponseDto implements Post {
  id: number;
  createdAt: Date;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
}
