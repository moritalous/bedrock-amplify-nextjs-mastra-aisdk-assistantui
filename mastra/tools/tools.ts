import { createTool } from '@mastra/core/tools';
import { SEQUENTIAL_THINKING_TOOL, SequentialThinkingServer } from './sequentialthinking';
import { convertToolDefinition } from './schemaConverter';
import {
  READ_DOCUMENTATION_TOOL,
  SEARCH_DOCUMENTATION_TOOL,
  RECOMMEND_TOOL,
  readDocumentation,
  searchDocumentation,
  recommend,
} from './awsdocumentation';

// MCPツール定義をMastraツール定義に変換
const convertedSequentialThinking = convertToolDefinition(SEQUENTIAL_THINKING_TOOL);
const convertedReadDocumentation = convertToolDefinition(READ_DOCUMENTATION_TOOL);
const convertedSearchDocumentation = convertToolDefinition(SEARCH_DOCUMENTATION_TOOL);
const convertedRecommend = convertToolDefinition(RECOMMEND_TOOL);

// デバッグ用：ツール定義の構造をログ出力
console.log('Sequential Thinking Tool Definition:', JSON.stringify(convertedSequentialThinking, null, 2));
console.log('Read Documentation Tool Definition:', JSON.stringify(convertedReadDocumentation, null, 2));

// Sequential Thinking Tool
const sequentialThinking = createTool({
  id: convertedSequentialThinking.id,
  description: convertedSequentialThinking.description,
  inputSchema: convertedSequentialThinking.inputSchema,
  execute: async (input: any) => {
    console.log('Sequential Thinking - Input object structure:', JSON.stringify(input, null, 2));
    
    try {
      const server = new SequentialThinkingServer();
      // input.contextからパラメータを取得
      return server.processThought(input.context || input);
    } catch (error) {
      console.error('Error in sequentialThinking tool execution:', error);
      throw error;
    }
  },
});

// AWS Documentation Read Tool
const awsReadDocumentation = createTool({
  id: convertedReadDocumentation.id,
  description: convertedReadDocumentation.description,
  inputSchema: convertedReadDocumentation.inputSchema,
  execute: async (input: any) => {
    console.log('AWS Read Documentation - Input object structure:', JSON.stringify(input, null, 2));
    
    try {
      // input.contextからパラメータを取得
      const context = input.context || {};
      const url = context.url;
      const max_length = context.max_length ?? 5000;
      const start_index = context.start_index ?? 0;
      
      console.log('Extracted parameters - url:', url, 'max_length:', max_length, 'start_index:', start_index);
      
      if (!url) {
        throw new Error('URL parameter is required but was not provided');
      }
      
      const result = await readDocumentation(url, max_length, start_index);
      console.log('Read documentation result type:', typeof result);
      console.log('Read documentation result length:', result ? result.length : 0);
      
      return result;
    } catch (error) {
      console.error('Error in awsReadDocumentation tool execution:', error);
      throw error;
    }
  },
});

// AWS Documentation Search Tool
const awsSearchDocumentation = createTool({
  id: convertedSearchDocumentation.id,
  description: convertedSearchDocumentation.description,
  inputSchema: convertedSearchDocumentation.inputSchema,
  execute: async (input: any) => {
    console.log('AWS Search Documentation - Input object structure:', JSON.stringify(input, null, 2));
    
    try {
      // input.contextからパラメータを取得
      const context = input.context || {};
      const search_phrase = context.search_phrase;
      const limit = context.limit ?? 10;
      
      console.log('Extracted parameters - search_phrase:', search_phrase, 'limit:', limit);
      
      if (!search_phrase) {
        throw new Error('search_phrase parameter is required but was not provided');
      }
      
      return await searchDocumentation(search_phrase, limit);
    } catch (error) {
      console.error('Error in awsSearchDocumentation tool execution:', error);
      throw error;
    }
  },
});

// AWS Documentation Recommend Tool
const awsRecommend = createTool({
  id: convertedRecommend.id,
  description: convertedRecommend.description,
  inputSchema: convertedRecommend.inputSchema,
  execute: async (input: any) => {
    console.log('AWS Recommend - Input object structure:', JSON.stringify(input, null, 2));
    
    try {
      // input.contextからパラメータを取得
      const context = input.context || {};
      const url = context.url;
      
      console.log('Extracted parameters - url:', url);
      
      if (!url) {
        throw new Error('URL parameter is required but was not provided');
      }
      
      return await recommend(url);
    } catch (error) {
      console.error('Error in awsRecommend tool execution:', error);
      throw error;
    }
  },
});

// Export all tools
export { sequentialThinking, awsReadDocumentation, awsSearchDocumentation, awsRecommend };
