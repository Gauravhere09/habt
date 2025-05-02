
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  getChatMessages, 
  createChatMessage, 
  getAIResponse, 
  deleteAllChatMessages, 
  getGeminiApiKey, 
  setGeminiApiKey, 
  ChatMessage 
} from '@/services/chatService';
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
import { toast } from 'sonner';
import { getUserActivities } from '@/services/activityService';
import { Trash2, Key, Share2 } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    const fetchedMessages = await getChatMessages();
    
    // If no messages, add a welcome message
    if (fetchedMessages.length === 0) {
      setMessages([
        {
          id: '1',
          message: "Hello! I'm your wellness assistant. I can provide insights about your health habits and answer your questions.",
          is_ai: true,
          created_at: new Date().toISOString()
        }
      ]);
    } else {
      setMessages(fetchedMessages);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    
    // Add user message to chat
    const userMessage = await createChatMessage(input, false);
    if (userMessage) {
      setMessages(prev => [...prev, userMessage]);
    }
    
    setInput('');
    
    try {
      // Fetch user activities for context
      const activities = await getUserActivities();
      const recentActivities = activities.slice(0, 10);
      
      // Format recent activities for the AI
      const activitiesContext = recentActivities.length > 0 
        ? `Recent activities: ${recentActivities.map(a => 
            `${a.emoji} ${a.activity_type}${a.value ? ` (${a.value})` : ''} at ${new Date(a.created_at).toLocaleString()}`
          ).join(', ')}`
        : 'No recent activities tracked.';
      
      // Send message to Gemini AI - now hardcoded API key
      const prompt = `User's question: ${input}\n\nContext: ${activitiesContext}\n\nPlease provide a helpful response as a wellness assistant.`;
      const aiResponseText = await getAIResponse(prompt);
      
      // Add AI response to chat
      const aiMessage = await createChatMessage(aiResponseText, true);
      if (aiMessage) {
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setGeminiApiKey(apiKeyInput.trim());
      toast.success('API key saved successfully');
      setShowApiKeyInput(false);
      setApiKeyInput('');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const handleDeleteAllMessages = async () => {
    const success = await deleteAllChatMessages();
    if (success) {
      toast.success('Chat history deleted successfully');
      loadMessages(); // Reload with welcome message
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
        `${msg.is_ai ? 'Assistant' : 'Me'}: ${msg.message}`
      ).join('\n\n');
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'My Health Assistant Chat',
          text: chatText,
        });
        toast.success('Chat shared successfully');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(chatText);
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
      
      <div className="flex-1 overflow-y-auto mb-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.is_ai ? 'justify-start' : 'justify-end'}`}
          >
            <Card className={`max-w-[85%] ${message.is_ai ? 'bg-card' : 'bg-primary text-primary-foreground'}`}>
              <CardContent className="p-2.5">
                <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your habits..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={!input.trim() || isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
