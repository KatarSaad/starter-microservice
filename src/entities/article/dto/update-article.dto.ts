import { Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiProperty({ type: 'number' })
  id!: number;
}
