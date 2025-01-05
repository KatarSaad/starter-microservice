import { Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

export class ArticleResponse {
  @ApiProperty({ type: 'number' })
  id!: number;

  @ApiProperty({ type: 'string' })
  createdAt!: Date;

  @ApiProperty({ type: 'string' })
  updatedAt!: Date;

  constructor(partial: Partial<ArticleResponse>) {
    Object.assign(this, partial);
  }
}
