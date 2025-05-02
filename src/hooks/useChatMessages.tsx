
import { useState, useEffect } from 'react';
import { 
  getChatMessages, 
  createChatMessage, 
  getAIResponse, 
  ChatMessage 
} from '@/services/chatService';
import { toast } from 'sonner';
import { getUserActivities } from '@/services/activityService';

export default function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

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

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    
    // Add user message to chat
    const userMessage = await createChatMessage(message, false);
    if (userMessage) {
      setMessages(prev => [...prev, userMessage]);
    }
    
    try {
      let prompt = `User's question: ${message}`;
      let contextAdded = false;
      
      if (includeContext) {
        // Fetch user activities for context
        const activities = await getUserActivities();
        const recentActivities = activities.slice(0, 20);
        
        if (recentActivities.length > 0) {
          // Format recent activities for the AI with more detail
          const activitiesContext = recentActivities.length > 0 
            ? `Recent activities: ${recentActivities.map(a => 
                `${a.emoji} ${a.activity_type}${a.value ? ` (${a.value})` : ''} at ${new Date(a.created_at).toLocaleString()}`
              ).join(', ')}`
            : 'No recent activities tracked.';
          
          // Activity counts for better insights
          const activityCounts: Record<string, number> = {};
          const activityValues: Record<string, number[]> = {};
          
          activities.forEach(activity => {
            if (!activityCounts[activity.activity_type]) {
              activityCounts[activity.activity_type] = 0;
              activityValues[activity.activity_type] = [];
            }
            activityCounts[activity.activity_type]++;
            if (activity.value && !isNaN(parseFloat(activity.value))) {
              activityValues[activity.activity_type].push(parseFloat(activity.value));
            }
          });
          
          // Activity statistics for better insights
          const activityStats = Object.entries(activityCounts)
            .map(([type, count]) => {
              const values = activityValues[type];
              const avgValue = values.length > 0 
                ? (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1) 
                : null;
              return `${type}: ${count} times${avgValue ? `, avg ${avgValue}` : ''}`;
            }).join('; ');
          
          prompt += `\n\nContext: ${activitiesContext}\n\nActivity Statistics: ${activityStats}\n\nPlease provide a helpful response as a wellness assistant based on this data.`;
          contextAdded = true;
          setIncludeContext(false); // Reset after use
        }
      }
      
      if (!contextAdded) {
        prompt += "\n\nPlease provide a helpful response as a wellness assistant.";
      }
      
      // Send message to AI
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

  const toggleContextInclusion = () => {
    setIncludeContext(prev => !prev);
    if (!includeContext) {
      toast.info('Health data will be included with your next message');
    } else {
      toast.info('Health data will not be included');
    }
  };

  return {
    messages,
    isLoading,
    includeContext,
    sendMessage: handleSendMessage,
    toggleContext: toggleContextInclusion,
    refresh: loadMessages
  };
}
