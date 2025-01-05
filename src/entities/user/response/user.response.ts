import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ type: 'number' })
  id!: number;

  @ApiProperty({ type: 'Date' })
  createdAt!: Date;

  @ApiProperty({ type: 'Date' })
  updatedAt!: Date;

  @Property()
  @ApiProperty({ type: 'number', description: 'id field of type number' })
  id!: number;

  constructor(partial: Partial<UserResponse>) {
    Object.assign(this, partial);
  }
}