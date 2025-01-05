import {
  capitalize,
  isPrimitive,
  swaggerTypeMap,
} from 'generator/generate-utils';

export const parseFields = (
  entityName: string,
  fields: string[],
  entitiesMap: Map<string, string[]>,
) => {
  const relatedEntities = new Map<string, string[]>(); // Track related entities

  const parsedFields = fields
    .map((field) => {
      const [fieldName, type] = field.split(':');
      if (!fieldName || !type) {
        console.error(`Invalid field definition: ${field}`);
        return null;
      }

      const isArray = type.endsWith('[]');
      const normalizedType = type.replace('[]', '');
      const { swaggerType, options = '' } = swaggerTypeMap(normalizedType);

      let importStatement = '';
      let fieldDeclaration = '';

      if (!isPrimitive(normalizedType)) {
        const relatedEntity = capitalize(normalizedType);

        // Add to related entities if missing
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
          // Generate @ManyToOne and foreign key
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
