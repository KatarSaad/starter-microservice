import { writeFile } from './generate-utils';

export const generateController = (
  controllerPath: string,
  entityName: string,
) => {
  const capitalizedEntityName =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const content = `
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ${capitalizedEntityName}Service } from './${entityName}.service';
import { Create${capitalizedEntityName}Dto } from './dto/create-${entityName}.dto';

@ApiTags('${capitalizedEntityName}')
@Controller('${entityName}')
export class ${capitalizedEntityName}Controller {
  constructor(private readonly service: ${capitalizedEntityName}Service) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ${capitalizedEntityName}' })
  async create(@Body() dto: Create${capitalizedEntityName}Dto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ${capitalizedEntityName}s' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${capitalizedEntityName} by ID' })
  async findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }
}
  `;
  writeFile(controllerPath, content);
};
