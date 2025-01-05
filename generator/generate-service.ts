import { writeFile } from './generate-utils';

export const generateService = (servicePath: string, entityName: string) => {
  const capitalizedEntityName =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const content = `
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ${capitalizedEntityName} } from './${entityName}.entity';
import { Create${capitalizedEntityName}Dto } from './dto/create-${entityName}.dto';
import { Update${capitalizedEntityName}Dto } from './dto/update-${entityName}.dto';
import { ${capitalizedEntityName}Response } from './response/${entityName}.response';

@Injectable()
export class ${capitalizedEntityName}Service {
  constructor(private readonly em: EntityManager) {}

  async create(data: Create${capitalizedEntityName}Dto): Promise<${capitalizedEntityName}Response> {
    const entity = this.em.create(${capitalizedEntityName}, data);
    await this.em.persistAndFlush(entity);
    return new ${capitalizedEntityName}Response(entity);
  }

  async findAll(): Promise<${capitalizedEntityName}Response[]> {
    const entities = await this.em.find(${capitalizedEntityName}, {});
    return entities.map((entity) => new ${capitalizedEntityName}Response(entity));
  }

  async findOne(id: number): Promise<${capitalizedEntityName}Response | null> {
    const entity = await this.em.findOne(${capitalizedEntityName}, { id });
    return entity ? new ${capitalizedEntityName}Response(entity) : null;
  }

  async update(id: number, data: Update${capitalizedEntityName}Dto): Promise<${capitalizedEntityName}Response | null> {
    const entity = await this.em.findOne(${capitalizedEntityName}, { id });
    if (!entity) {
      return null;
    }
    this.em.assign(entity, data);
    await this.em.persistAndFlush(entity);
    return new ${capitalizedEntityName}Response(entity);
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.em.findOne(${capitalizedEntityName}, { id });
    if (!entity) {
      return false;
    }
    await this.em.removeAndFlush(entity);
    return true;
  }
}
  `;

  writeFile(servicePath, content);
};
