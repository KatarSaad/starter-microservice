import * as fs from 'fs';
import * as path from 'path';

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
export const isPrimitive = (type: string) =>
  ['string', 'number', 'boolean', 'Date', 'Array', 'object'].includes(type);

export const writeFile = (filePath: string, content: string) => {
  fs.writeFileSync(filePath, content.trim());
  console.log(`Overwritten: ${filePath}`);
};

export const ensureDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};
export const swaggerTypeMap = (tsType: string) => {
  const typeMap: Record<string, { swaggerType: string; options?: string }> = {
    string: { swaggerType: 'string' },
    number: { swaggerType: 'number' },
    boolean: { swaggerType: 'boolean' },
    Date: { swaggerType: 'string', options: ", format: 'date-time'" },
    object: { swaggerType: 'object' },
    Array: { swaggerType: 'array' }, // Arrays are handled contextually
  };

  return typeMap[tsType] || { swaggerType: tsType }; // Default to provided type for custom classes
};

export const parseFields = (
  entityName: string,
  fields: string[],
  entitiesMap: Map<string, string[]>,
) => {
  const relatedEntities = new Map<string, string[]>();

  const parsedFields = fields
    .map((field) => {
      const [fieldName, type] = field.split(':');
      if (!fieldName || !type) {
        console.error(`Invalid field definition: ${field}`);
        return null;
      }

      const isArray = type.endsWith('[]');
      const normalizedType = type.replace('[]', '');
      const typeInfo = swaggerTypeMap(normalizedType);

      let importStatement = '';
      let fieldDeclaration = '';

      if (!isPrimitive(normalizedType)) {
        const relatedEntity = capitalize(normalizedType);

        // Map related entity if it doesn't exist
        if (!entitiesMap.has(relatedEntity)) {
          console.log(`Mapping new related entity: ${relatedEntity}`);
          entitiesMap.set(relatedEntity, ['id:number']);
        }

        relatedEntities.set(
          relatedEntity,
          entitiesMap.get(relatedEntity) || [],
        );

        importStatement = `import { ${relatedEntity} } from '../${normalizedType.toLowerCase()}/${relatedEntity}.entity';`;

        if (isArray) {
          fieldDeclaration = `
  @OneToMany(() => ${relatedEntity}, entity => entity.${entityName}, { cascade: [Cascade.ALL] })
  @ApiProperty({ type: () => [${relatedEntity}], description: 'List of related ${relatedEntity}s' })
  ${fieldName}!: ${relatedEntity}[];
        `;
        } else {
          fieldDeclaration = `
  @ManyToOne(() => ${relatedEntity})
  @ApiProperty({ type: () => ${relatedEntity}, description: 'Reference to a related ${relatedEntity}' })
  ${fieldName}!: ${relatedEntity};

  @Property()
  @ApiProperty({ type: 'number', description: 'Foreign key for the ${relatedEntity}' })
  ${fieldName}Id!: number;
        `;
        }
      } else {
        const { swaggerType, options = '' } = typeInfo;

        fieldDeclaration = `
  @Property()
  @ApiProperty({ type: '${swaggerType}'${options}, description: '${fieldName} field of type ${normalizedType}' })
  ${fieldName}!: ${isArray ? `${normalizedType}[]` : normalizedType};
      `;
      }

      return {
        fieldName,
        importStatement,
        fieldDeclaration: fieldDeclaration.trim(),
      };
    })
    .filter(Boolean);

  const imports = parsedFields
    .map((f) => f!.importStatement)
    .filter(Boolean)
    .join('\n');
  const fieldDeclarations = parsedFields
    .map((f) => f!.fieldDeclaration)
    .join('\n\n  ');

  return { imports, fieldDeclarations, relatedEntities };
};
