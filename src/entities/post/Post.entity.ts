import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToOne,
  OneToMany,
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/User.entity';
import { Article } from '../article/Article.entity';

@Entity()
export class Post {
  @PrimaryKey()
  @ApiProperty({ type: 'number', description: 'Primary ID of the Post' })
  id!: number;

  @Property()
  @ApiProperty({
    type: 'string',
    description: 'Creation date',
    format: 'date-time',
  })
  createdAt: Date = new Date();

  @Property()
  @ApiProperty({
    type: 'string',
    description: 'Creation date',
    format: 'date-time',
  })
  updatedAt: Date = new Date();

  @Property()
  @ApiProperty({ type: 'string', description: 'title field of type string' })
  title!: string;

  @ManyToOne(() => User)
  @ApiProperty({ type: () => User, description: 'Reference to a related User' })
  author!: User;

  @Property()
  @ApiProperty({ type: 'number', description: 'Foreign key for the User' })
  authorId!: number;

  @ManyToOne(() => Article)
  @ApiProperty({
    type: () => Article,
    description: 'Reference to a related Article',
  })
  article!: Article;

  @Property()
  @ApiProperty({ type: 'number', description: 'Foreign key for the Article' })
  articleId!: number;
}
