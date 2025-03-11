// // prisma-utils.service.ts
// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { PrismaService } from './prisma.service'; // Assume you have a PrismaService
// import { getSchema } from '@prisma/internals'; // Introspection method

// @Injectable()
// export class PrismaUtilsService implements OnModuleInit {
//   private modelFieldsCache: { [modelName: string]: string[] } = {};

//   constructor(private readonly prismaService: PrismaService) {}

//   // Fetch model fields dynamically and store them in cache
//   private async cacheModelFields(modelName: string) {
//     // Introspect the Prisma schema using @prisma/internals
//     const schema = await getSchema(this.prismaService.$engine); // Introspect schema directly
//     const model = schema.models.find((m) => m.name === modelName);

//     if (!model) throw new Error(`Model ${modelName} not found in schema`);

//     // Cache the model fields

//     this.modelFieldsCache[modelName] = model.fields.map((field) => field.name);
//   }

//   // Initialize cache for a specific model
//   async onModuleInit() {
//     await this.cacheModelFields('User'); // Cache for the User model, can be extended for others
//   }

//   // Get cached model fields
//   getCachedModelFields(modelName: string): string[] {
//     return this.modelFieldsCache[modelName] || [];
//   }
// }
