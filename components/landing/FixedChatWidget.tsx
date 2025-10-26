'use client';

import { ChatWidget } from '@/components/chat/ChatWidget';

interface FixedChatWidgetProps {
  practiceArea?: string;
  initialMessage?: string;
}

export function FixedChatWidget({ practiceArea, initialMessage }: FixedChatWidgetProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <ChatWidget 
        position="floating"
        practiceArea={practiceArea}
        initialMessage={initialMessage}
      />
    </div>
  );
}
