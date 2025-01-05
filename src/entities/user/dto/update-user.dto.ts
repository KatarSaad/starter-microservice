import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ type: 'number' })
  id!: number;

  @Property()
  @ApiProperty({ type: 'number', description: 'id field of type number' })
  id!: number;
}