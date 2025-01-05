import { writeFile } from './generate-utils';

export const generateDtoFiles = (
  dtoDir: string,
  entityName: string,
  fields: string,
) => {
  const capitalizedEntityName =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const createDtoPath = `${dtoDir}/create-${entityName}.dto.ts`;
  const updateDtoPath = `${dtoDir}/update-${entityName}.dto.ts`;

  const createDtoContent = `
import { ApiProperty } from '@nestjs/swagger';

export class Create${capitalizedEntityName}Dto {
  ${fields}
}
  `;
  writeFile(createDtoPath, createDtoContent);

  const updateDtoContent = `
import { ApiProperty } from '@nestjs/swagger';

export class Update${capitalizedEntityName}Dto {
  @ApiProperty({ type: 'number' })
  id!: number;

  ${fields}
}
  `;
  writeFile(updateDtoPath, updateDtoContent);
};
