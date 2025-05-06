import { cookies } from 'next/headers';

import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession } from 'aws-amplify/auth/server';

import outputs from '@/amplify_outputs.json';

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export async function AuthFetchAuthSessionServer() {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: contextSpec => fetchAuthSession(contextSpec),
    });
    return session;
  } catch (error) {
    console.error(error);
  }
}
