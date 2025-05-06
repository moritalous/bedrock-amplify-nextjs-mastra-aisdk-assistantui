/**
 * AWS Documentation Client
 *
 * A TypeScript client for accessing AWS documentation, searching for content, and getting recommendations.
 */

// Export models
export * from './models';

// Export utility functions
export * from './utils';

// Export services
export { readDocumentation } from './services/documentationService';
export { searchDocumentation } from './services/searchService';
export { recommend } from './services/recommendService';

// Export tool definitions
export {
  default as AWS_DOCUMENTATION_TOOLS,
  READ_DOCUMENTATION_TOOL,
  SEARCH_DOCUMENTATION_TOOL,
  RECOMMEND_TOOL,
} from './tools';
