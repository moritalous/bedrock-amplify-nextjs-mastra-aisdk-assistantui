'use client';

import { Thread } from '@/components/assistant-ui/thread';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';

export default function Chat() {
  const runtime = useChatRuntime({
    api: '/api/chat',
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-dvh gap-x-2 px-4 py-4">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
