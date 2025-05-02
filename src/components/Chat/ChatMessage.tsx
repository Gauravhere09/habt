
import { Card, CardContent } from '@/components/ui/card';
import { ChatMessage as ChatMessageType } from '@/services/chatService';
import { formatMessageDate } from '@/lib/date-utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.is_ai ? 'justify-start' : 'justify-end'}`}>
      <Card className={`max-w-[85%] ${message.is_ai ? 'bg-card' : 'bg-primary text-primary-foreground'}`}>
        <CardContent className="p-2.5">
          <p className="whitespace-pre-wrap text-sm">{message.message}</p>
          <div className="text-xs opacity-70 mt-1">
            {formatMessageDate(message.created_at)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
