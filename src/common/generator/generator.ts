import * as fs from 'fs';
import { execSync } from 'child_process';

// Function to generate the module
const generateModule = async (moduleName: string) => {
  console.log(`Generating module: ${moduleName}...`);

  // Run Nest CLI to generate a module
  execSync(`nest generate module modules/${moduleName}`);
  execSync(`nest generate service modules/${moduleName}`);
  execSync(`nest generate controller modules/${moduleName}`);

  const modulePath = `src/modules/${moduleName}`;
  const dtoPath = `${modulePath}/dto`;
  const responsePath = `${modulePath}/response`;
  const eventsPath = `${modulePath}/events`;
  const enumsPath = `${modulePath}/enums`;
  const servicePath = `${modulePath}`;

  // Create necessary folders
  fs.mkdirSync(dtoPath, { recursive: true });
  fs.mkdirSync(responsePath, { recursive: true });
  fs.mkdirSync(eventsPath, { recursive: true });
  fs.mkdirSync(enumsPath, { recursive: true });
  fs.mkdirSync(servicePath, { recursive: true });

  // Generate files
  generateDtoFiles(moduleName, dtoPath);
  generateResponseFiles(moduleName, responsePath);
  generateEventEnum(moduleName, enumsPath);
  generateEventHandler(moduleName, eventsPath);
  generateService(moduleName, servicePath);

  console.log(`Module ${moduleName} generated successfully! 🚀`);
};

// Generate DTO files
const generateDtoFiles = (moduleName: string, dtoPath: string) => {
  const createDto = `
import { IsString, IsNotEmpty } from 'class-validator';
import { ${capitalize(moduleName)} } from '@prisma/client';

export class Create${capitalize(moduleName)}Dto implements  Omit<${capitalize(moduleName)},"id" >{
 
}
`;

  const updateDto = `
import { PartialType } from '@nestjs/mapped-types';
import { Create${capitalize(moduleName)}Dto } from './create-${moduleName}.dto';

export class Update${capitalize(moduleName)}Dto extends PartialType(Create${capitalize(moduleName)}Dto) {
id: number;
}
`;

  fs.writeFileSync(`${dtoPath}/create-${moduleName}.dto.ts`, createDto);
  fs.writeFileSync(`${dtoPath}/update-${moduleName}.dto.ts`, updateDto);
};

// Generate Response files
const generateResponseFiles = (moduleName: string, responsePath: string) => {
  const responseDto = `
import { ${capitalize(moduleName)} } from '@prisma/client';

export class ${capitalize(moduleName)}ResponseDto implements ${capitalize(moduleName)}{}
`;

  fs.writeFileSync(`${responsePath}/${moduleName}-response.dto.ts`, responseDto);
};

// Generate Event Enum
const generateEventEnum = (moduleName: string, enumsPath: string) => {
  const eventEnum = `
export enum ${capitalize(moduleName)}EventNames {
  Created = '${moduleName}.created',
  Updated = '${moduleName}.updated',
  Deleted = '${moduleName}.deleted',
  Get = '${moduleName}.get',
  GetAll = '${moduleName}.getAll',
}
`;

  fs.writeFileSync(`${enumsPath}/${moduleName}-event-names.enum.ts`, eventEnum);
};
const generateEventHandler = (moduleName: string, eventsPath: string) => {
  const eventHandler = `
import { Injectable, Logger, Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices';
import { ${capitalize(moduleName)}Service } from '../${moduleName}.service';
import { ${capitalize(moduleName)}EventNames } from '../enums/${moduleName}-event-names.enum';
import * as CircuitBreaker from 'opossum';

@Controller()
export class ${capitalize(moduleName)}EventHandler {
  private readonly logger = new Logger(${capitalize(moduleName)}EventHandler.name);

  constructor(private readonly ${moduleName}Service: ${capitalize(moduleName)}Service) {}

  private readonly circuitBreaker = new CircuitBreaker(
    async (fn, args) => fn(...args),
    {
      timeout: 10000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    },
  );

  @MessagePattern(${capitalize(moduleName)}EventNames.Created)
  async handleCreatedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    return await this.processEvent(
      'created',
      data,
      context,
      this.${moduleName}Service.create.bind(this.${moduleName}Service),
    );
  }

  @MessagePattern(${capitalize(moduleName)}EventNames.Updated)
  async handleUpdatedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    const { id, ...updateData } = data;
    return await this.processEvent(
      'updated',
      { id, updateData },
      context,
      this.${moduleName}Service.update.bind(this.${moduleName}Service),
    );
  }

  @MessagePattern(${capitalize(moduleName)}EventNames.Deleted)
  async handleDeletedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    return await this.processEvent(
      'deleted',
      data,
      context,
      this.${moduleName}Service.delete.bind(this.${moduleName}Service),
    );
  }

  @MessagePattern(${capitalize(moduleName)}EventNames.GetAll)
  async handleGetAllEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    return await this.processEvent(
      'getAll',
      data,
      context,
      this.${moduleName}Service.getAll.bind(this.${moduleName}Service),
    );
  }

  @MessagePattern(${capitalize(moduleName)}EventNames.Get)
  async handleGetEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    const { id } = data;
    return await this.processEvent(
      'get',
      { id },
      context,
      this.${moduleName}Service.get.bind(this.${moduleName}Service),
    );
  }

  private async processEvent(
    event: string,
    data: any,
    context: RmqContext,
    serviceMethod: (...args: any[]) => Promise<any>,
  ) {
    try {
      this.logger.log(\`Processing '\${event}' event: \${JSON.stringify(data)}\`);
      const result = await this.circuitBreaker.fire(serviceMethod, [data]);
      this.acknowledgeMessage(context);
      return result;  // Return result after processing event
    } catch (error) {
      this.handleError(context, error, event, data);
    }
  }

  private acknowledgeMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
    this.logger.log('Message acknowledged');
  }

  private handleError(
    context: RmqContext,
    error: any,
    event: string,
    data: any,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.nack(originalMessage, false, false);
    this.logger.error(
      \`Failed to process '\${event}' event for data: \${JSON.stringify(data)}\`,
      error.stack,
    );
    throw new RpcException({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error',
      metadata: { event, data },
    });
  }
}
  `;

  fs.writeFileSync(`${eventsPath}/${moduleName}.events.ts`, eventHandler);
};

// Generate Service with Delete Method and Error Handling
const generateService = (moduleName: string, modulePath: string) => {
  const serviceContent = `
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Create${capitalize(moduleName)}Dto } from './dto/create-${moduleName}.dto';
import { Update${capitalize(moduleName)}Dto } from './dto/update-${moduleName}.dto';
import { ${capitalize(moduleName)}ResponseDto } from './response/${moduleName}-response.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ${capitalize(moduleName)}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Create${capitalize(moduleName)}Dto): Promise<${capitalize(moduleName)}ResponseDto> {
    try {
      return await this.prisma.${moduleName}.create({ data });
    } catch (error) {
      throw this.buildError('create', data, error);
    }
  }

  async findAll(): Promise<${capitalize(moduleName)}ResponseDto[]> {
    try {
      return await this.prisma.${moduleName}.findMany();
    } catch (error) {
      throw this.buildError('findAll', {}, error);
    }
  }

  async findOne(id: number): Promise<${capitalize(moduleName)}ResponseDto> {
    try {
      const result = await this.prisma.${moduleName}.findUnique({ where: { id } });
      if (!result) {
        throw new RpcException({
          statusCode: 404,
          message: \`${moduleName} with ID \${id} not found\`,
          metadata: { id },
        });
      }
      return result;
    } catch (error) {
      throw this.buildError('findOne', { id }, error);
    }
  }

  async update(id: number, data: Update${capitalize(moduleName)}Dto): Promise<${capitalize(moduleName)}ResponseDto> {
    try {
      return await this.prisma.${moduleName}.update({ where: { id }, data });
    } catch (error) {
      throw this.buildError('update', { id, data }, error);
    }
  }

  async delete(id: number): Promise<${capitalize(moduleName)}ResponseDto> {
    try {
      return await this.prisma.${moduleName}.delete({ where: { id } });
    } catch (error) {
      throw this.buildError('delete', { id }, error);
    }
  }

  private buildError(action: string, details: any, error: any): RpcException {
    return new RpcException({
      statusCode: error?.statusCode || 500,
      message: error?.message || \`Failed to \${action} resource\`,
      metadata: { action, details },
    });
  }
}
`;

  fs.writeFileSync(`${modulePath}/${moduleName}.service.ts`, serviceContent);
};

// Utility function to capitalize the first letter of a string
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// Get module name from command line argument
const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Please provide a module name as an argument.');
  process.exit(1);
}

// Generate the module
generateModule(moduleName).catch((err) => console.error(err));
