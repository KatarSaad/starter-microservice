import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @Property()
  @ApiProperty({ type: 'string', description: 'title field of type string' })
  title!: string;

  @Property()
  @ApiProperty({ type: 'string', format: 'date-time', description: 'createdAt field of type Date' })
  createdAt!: Date;

  @ManyToOne(() => User)
  @ApiProperty({ type: () => User, description: 'Reference to a related User' })
  author!: User;

  @Property()
  @ApiProperty({ type: 'number', description: 'Foreign key for the User' })
  authorId!: number;

  @ManyToOne(() => Article)
  @ApiProperty({ type: () => Article, description: 'Reference to a related Article' })
  article!: Article;

  @Property()
  @ApiProperty({ type: 'number', description: 'Foreign key for the Article' })
  articleId!: number;
}