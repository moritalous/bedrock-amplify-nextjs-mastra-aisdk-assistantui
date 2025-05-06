import { Mastra } from '@mastra/core';

import { getAgent } from './agents/agent';

export async function getMastra() {
  const agent = await getAgent();
  return new Mastra({
    agents: { agent },
  });
}
