import { writeFile } from './generate-utils';

export const generateResponse = (
  responsePath: string,
  entityName: string,
  fields: string,
) => {
  const capitalizedEntityName =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const content = `
import { ApiProperty } from '@nestjs/swagger';

export class ${capitalizedEntityName}Response {
  @ApiProperty({ type: 'number' })
  id!: number;

  @ApiProperty({ type: 'Date' })
  createdAt!: Date;

  @ApiProperty({ type: 'Date' })
  updatedAt!: Date;

  ${fields}

  constructor(partial: Partial<${capitalizedEntityName}Response>) {
    Object.assign(this, partial);
  }
}
  `;

  writeFile(responsePath, content);
};
