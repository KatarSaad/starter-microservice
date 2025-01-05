import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToOne,
  OneToMany,
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryKey()
  @ApiProperty({ type: 'number', description: 'Primary ID of the User' })
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
}
