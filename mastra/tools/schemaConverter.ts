import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * JSONスキーマのプロパティ型
 */
interface JsonSchemaProperty {
  type: string;
  description?: string;
  minimum?: number;
  maximum?: number;
  items?: JsonSchema;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  enum?: string[];
}

/**
 * JSONスキーマ型
 */
interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  description?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  items?: JsonSchema;
}

/**
 * JSONスキーマからZodスキーマに変換する関数
 * @param schema JSONスキーマ
 * @returns Zodスキーマ
 */
export function jsonSchemaToZod(schema: JsonSchema): z.ZodTypeAny {
  if (!schema) return z.any();

  switch (schema.type) {
    case 'string':
      let stringSchema = z.string();
      if (schema.description) {
        stringSchema = stringSchema.describe(schema.description);
      }
      if (schema.enum) {
        return z.enum(schema.enum as [string, ...string[]]);
      }
      return stringSchema;

    case 'number':
    case 'integer':
      let numberSchema = z.number();
      if (schema.description) {
        numberSchema = numberSchema.describe(schema.description);
      }
      if (typeof schema.minimum === 'number') {
        numberSchema = numberSchema.min(schema.minimum);
      }
      if (typeof schema.maximum === 'number') {
        numberSchema = numberSchema.max(schema.maximum);
      }
      return numberSchema;

    case 'boolean':
      let booleanSchema = z.boolean();
      if (schema.description) {
        booleanSchema = booleanSchema.describe(schema.description);
      }
      return booleanSchema;

    case 'array':
      if (schema.items) {
        const itemSchema = jsonSchemaToZod(schema.items);
        let arraySchema = z.array(itemSchema);
        if (schema.description) {
          arraySchema = arraySchema.describe(schema.description);
        }
        return arraySchema;
      }
      return z.array(z.any());

    case 'object':
      if (schema.properties) {
        const shape: Record<string, z.ZodTypeAny> = {};

        for (const [key, prop] of Object.entries(schema.properties)) {
          shape[key] = jsonSchemaToZod(prop as JsonSchema);
        }

        let objectSchema = z.object(shape);

        // 必須プロパティの処理
        if (schema.required && schema.required.length > 0) {
          const requiredShape: Record<string, z.ZodTypeAny> = {};

          for (const requiredKey of schema.required) {
            if (shape[requiredKey]) {
              requiredShape[requiredKey] = shape[requiredKey];
            }
          }

          const optionalShape: Record<string, z.ZodTypeAny> = {};

          for (const [key, value] of Object.entries(shape)) {
            if (!schema.required.includes(key)) {
              optionalShape[key] = value.optional();
            }
          }

          objectSchema = z.object({
            ...requiredShape,
            ...optionalShape,
          });
        } else {
          // すべてのプロパティをオプショナルにする
          const optionalShape: Record<string, z.ZodTypeAny> = {};

          for (const [key, value] of Object.entries(shape)) {
            optionalShape[key] = value.optional();
          }

          objectSchema = z.object(optionalShape);
        }

        if (schema.description) {
          objectSchema = objectSchema.describe(schema.description);
        }

        return objectSchema;
      }
      return z.object({});

    default:
      return z.any();
  }
}

/**
 * MCPツール定義をMastraツール定義に変換する関数
 * @param tool MCPツール定義
 * @returns Mastraツール定義に適した形式のオブジェクト
 */
export function convertToolDefinition(tool: Tool) {
  return {
    id: tool.name,
    description: tool.description || '',
    inputSchema: jsonSchemaToZod(tool.inputSchema as JsonSchema),
  };
}
