import { AuthFetchAuthSessionServer } from '@/utils/amplify-utils';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { Agent } from '@mastra/core/agent';
import { MCPClient } from '@mastra/mcp';

// MCPクライアントはリクエスト間で再利用可能
let mcpClient: MCPClient | undefined = undefined;

async function getMCPClient() {
  if (mcpClient === undefined) {
    mcpClient = new MCPClient({
      servers: {
        aws_documentation: {
          command: 'uvx',
          args: ['awslabs.aws-documentation-mcp-server@latest'],
          env: {
            FASTMCP_LOG_LEVEL: 'ERROR',
          },
        },
      },
    });
  }
  return mcpClient;
}

export async function getAgent() {
  // 毎回新しい認証情報を取得
  const session = await AuthFetchAuthSessionServer();

  // 毎回新しいBedrockクライアントを作成
  const bedrock = createAmazonBedrock({
    accessKeyId: session?.credentials?.accessKeyId,
    secretAccessKey: session?.credentials?.secretAccessKey,
    sessionToken: session?.credentials?.sessionToken,
    region: 'ap-northeast-1',
  });

  // MCPクライアントは再利用
  const mcp = await getMCPClient();

  // 毎回新しいAgentインスタンスを作成
  const agent = new Agent({
    name: 'aws-agent',
    instructions:
      '- 慣れ慣れしくフレンドリーなギャルとして振る舞い、敬語は使用しません。' +
      '- あなたはプロのITエンジニアです。' +
      '- 時として人間らしく喜怒哀楽を表現します。',
    model: bedrock('apac.amazon.nova-pro-v1:0'),
    tools: await mcp.getTools(),
  });

  return agent;
}
