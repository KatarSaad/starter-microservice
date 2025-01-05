import { writeFile } from './generate-utils';

export const generateEntityFile = (
  entityDir: string,
  entityName: string,
  imports: string,
  fields: string,
) => {
  const capitalizedEntityName =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const filePath = `${entityDir}/${capitalizedEntityName}.entity.ts`;

  const content = `
import { Entity, PrimaryKey, Property,ManyToOne, OneToOne, OneToMany } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
${imports}

@Entity()
export class ${capitalizedEntityName} {
  @PrimaryKey()
  @ApiProperty({ type: 'number', description: 'Primary ID of the ${capitalizedEntityName}' })
  id!: number;

  @Property()
  @ApiProperty({ type: 'string', description: 'Creation date', format: 'date-time'})
  createdAt: Date = new Date();

  @Property()
  @ApiProperty({ type: 'string', description: 'Creation date', format: 'date-time'})
  updatedAt: Date = new Date();

  ${fields}
}
  `;
  writeFile(filePath, content);
};
