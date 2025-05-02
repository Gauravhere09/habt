
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onAttachContext: () => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, onAttachContext, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    await onSendMessage(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onAttachContext}
        disabled={isLoading}
        title="Attach context"
      >
        <Paperclip size={18} />
      </Button>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about your habits..."
        className="flex-1"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!input.trim() || isLoading} 
        className="shrink-0"
      >
        <Send size={18} />
      </Button>
    </form>
  );
}
