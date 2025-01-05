import { Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @Property()
  @ApiProperty({ type: 'number', description: 'id field of type number' })
  id!: number;
}
