
import { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogCancel, 
  AlertDialogAction, 
  AlertDialogFooter,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  deleteAllChatMessages, 
  getGeminiApiKey, 
  setGeminiApiKey
} from '@/services/chatService';
import { toast } from 'sonner';
import { Trash2, Key, Share2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/Chat/ChatMessage';
import ChatInput from '@/components/Chat/ChatInput';
import useChatMessages from '@/hooks/useChatMessages';

export default function ChatPage() {
  const { messages, isLoading, includeContext, sendMessage, toggleContext, refresh } = useChatMessages();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setGeminiApiKey(apiKeyInput.trim());
      toast.success('API key saved successfully');
      setApiKeyInput('');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const handleDeleteAllMessages = async () => {
    const success = await deleteAllChatMessages();
    if (success) {
      toast.success('Chat history deleted successfully');
      refresh(); // Reload with welcome message
    }
    setIsDeleteDialogOpen(false);
  };

  const handleShareChat = async () => {
    if (!messages.length) {
      toast.error('No chat messages to share');
      return;
    }

    try {
      const chatText = messages.map(msg => 
        `${msg.is_ai ? 'Assistant' : 'Me'} (${new Date(msg.created_at).toLocaleString()}):\n${msg.message}`
      ).join('\n\n');
      
      const shareTitle = 'My Health Assistant Chat';
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: chatText,
        });
        toast.success('Chat shared successfully');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareTitle}\n\n${chatText}`);
        toast.success('Chat copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing chat:', error);
      toast.error('Failed to share chat');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleShareChat}
            title="Share Chat"
          >
            <Share2 size={18} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                title="Set API Key"
              >
                <Key size={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90%] max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Gemini API Key</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter your custom Gemini API key (optional)
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex items-center gap-2 pt-2 pb-4">
                <Input
                  placeholder="Enter Gemini API Key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  type="password"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveApiKey}>Save</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost"
                size="icon"
                title="Delete All Messages"
              >
                <Trash2 size={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90%] max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all chat messages?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your entire chat history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllMessages}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <ScrollArea className="flex-1 mb-3 pr-3">
        <div className="space-y-3">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      <ChatInput 
        onSendMessage={sendMessage} 
        onAttachContext={toggleContext} 
        isLoading={isLoading} 
      />
    </div>
  );
}
