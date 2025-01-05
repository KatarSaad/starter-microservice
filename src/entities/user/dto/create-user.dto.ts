import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @Property()
  @ApiProperty({ type: 'number', description: 'id field of type number' })
  id!: number;
}