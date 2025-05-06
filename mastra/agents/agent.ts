import { AuthFetchAuthSessionServer } from '@/utils/amplify-utils';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { Agent } from '@mastra/core/agent';
import { MCPClient } from '@mastra/mcp';

let agent: Agent | undefined = undefined;

export async function getAgent() {
  if (agent !== undefined) {
    return agent;
  }

  const session = await AuthFetchAuthSessionServer();

  const bedrock = createAmazonBedrock({
    accessKeyId: session?.credentials?.accessKeyId,
    secretAccessKey: session?.credentials?.secretAccessKey,
    sessionToken: session?.credentials?.sessionToken,
    region: 'ap-northeast-1',
  });

  const mcp = new MCPClient({
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

  agent = new Agent({
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
