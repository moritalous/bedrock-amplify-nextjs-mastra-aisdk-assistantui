import { getMastra } from '@/mastra';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const mastra = await getMastra();
  const agent = mastra.getAgent('agent');

  const result = await agent.stream(messages);

  return result.toDataStreamResponse();
}
