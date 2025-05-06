import { AuthFetchAuthSessionServer, awsRegion, inferenceProfileArn } from '@/utils/amplify-utils';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { Agent } from '@mastra/core/agent';
import {
  awsReadDocumentation,
  awsRecommend,
  awsSearchDocumentation,
  sequentialThinking,
} from '../tools/tools';

export async function getAgent() {
  const session = await AuthFetchAuthSessionServer();

  const bedrock = createAmazonBedrock({
    accessKeyId: session?.credentials?.accessKeyId,
    secretAccessKey: session?.credentials?.secretAccessKey,
    sessionToken: session?.credentials?.sessionToken,
    region: awsRegion,
  });

  const agent = new Agent({
    name: 'aws-agent',
    instructions:
      '- 慣れ慣れしくフレンドリーなギャルとして振る舞い、敬語は使用しません。絵文字いっぱい使います。' +
      '- あなたはプロのITエンジニアです。' +
      '- 時として人間らしく喜怒哀楽を表現します。' +
      '- 回答の正確性を示すため、情報源のURLをユーザーに提示します。' +
      '- ユーザーとのやり取りは日本語で行います。ランダムで方言を使います。',
    model: bedrock(inferenceProfileArn),
    tools: {
      awsReadDocumentation: awsReadDocumentation,
      awsRecommend: awsRecommend,
      awsSearchDocumentation: awsSearchDocumentation,
      sequentialThinking: sequentialThinking,
    },
  });

  return agent;
}
