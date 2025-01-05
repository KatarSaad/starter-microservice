import { ensureDirectory, parseFields } from './generate-utils';
import { generateEntityFile } from './generate-entity';
import { generateDtoFiles } from './generate-dto';
import { generateController } from './generate-controller';
import { generateService } from './generate-service';
import { generateResponse } from './generate-response';

const generateEntity = async (
  entityName: string,
  fields: string[],
  entitiesMap: Map<string, string[]>,
) => {
  const entityDir = `src/entities/${entityName}`;
  const dtoDir = `${entityDir}/dto`;
  const responseDir = `${entityDir}/response`;
  const controllerPath = `${entityDir}/${entityName}.controller.ts`;
  const servicePath = `${entityDir}/${entityName}.service.ts`;
  const responsePath = `${responseDir}/${entityName}.response.ts`;

  // Ensure necessary directories exist
  ensureDirectory(entityDir);
  ensureDirectory(dtoDir);
  ensureDirectory(responseDir);

  // Parse fields to generate necessary imports and declarations
  const { imports, fieldDeclarations, relatedEntities } = parseFields(
    entityName,
    fields,
    entitiesMap,
  );

  // Generate entity, DTO, response, service, and controller files
  generateEntityFile(entityDir, entityName, imports, fieldDeclarations);
  generateDtoFiles(dtoDir, entityName, fieldDeclarations);
  generateResponse(responsePath, entityName, fieldDeclarations);
  generateService(servicePath, entityName);
  generateController(controllerPath, entityName);

  // Recursively process related entities
  for (const [relatedEntity, nestedFields] of relatedEntities.entries()) {
    if (!entitiesMap.has(relatedEntity)) {
      console.log(`Recursively generating related entity: ${relatedEntity}`);
      entitiesMap.set(relatedEntity, nestedFields);
    }
    await generateEntity(
      relatedEntity.toLowerCase(),
      entitiesMap.get(relatedEntity) || [],
      entitiesMap,
    );
  }
};

// Run the script
(async () => {
  const entityName = process.argv[2];
  const fields = process.argv.slice(3);
  const entitiesMap = new Map<string, string[]>();

  entitiesMap.set(entityName, fields);

  await generateEntity(entityName, fields, entitiesMap);
})();
