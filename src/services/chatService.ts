
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Hardcoded Gemini API key
const DEFAULT_GEMINI_API_KEY = "AIzaSyCFRdXWHmZI8i0l2krV16RYumqSAw4-Ncs";

export interface ChatMessage {
  id: string;
  message: string;
  is_ai: boolean;
  created_at: string;
}

// Get Gemini API key from localStorage or use default
export function getGeminiApiKey(): string {
  return localStorage.getItem('geminiApiKey') || DEFAULT_GEMINI_API_KEY;
}

// Set custom Gemini API key
export function setGeminiApiKey(key: string): void {
  localStorage.setItem('geminiApiKey', key);
}

// Create a new chat message
export async function createChatMessage(message: string, isAI: boolean): Promise<ChatMessage | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Store in local storage if user is not logged in
      const offlineChats = JSON.parse(localStorage.getItem('offlineChats') || '[]');
      const newMessage = {
        id: crypto.randomUUID(),
        message,
        is_ai: isAI,
        created_at: new Date().toISOString(),
      };
      offlineChats.push(newMessage);
      localStorage.setItem('offlineChats', JSON.stringify(offlineChats));
      return newMessage;
    }

    // If user is logged in, store in Supabase
    const { data, error } = await supabase
      .from('chats')
      .insert({
        user_id: user.id,
        message,
        is_ai: isAI
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error(`Failed to save chat message: ${error.message}`);
    return null;
  }
}

// Get all chat messages for the current user
export async function getChatMessages(): Promise<ChatMessage[]> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return offline chats when user is not logged in
      return JSON.parse(localStorage.getItem('offlineChats') || '[]');
    }

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error(`Failed to fetch chat messages: ${error.message}`);
    return [];
  }
}

// Delete all chat messages for the current user
export async function deleteAllChatMessages(): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Clear offline chats when user is not logged in
      localStorage.removeItem('offlineChats');
      return true;
    }

    const { error } = await supabase
      .from('chats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) throw error;
    return true;
  } catch (error: any) {
    toast.error(`Failed to delete chat history: ${error.message}`);
    return false;
  }
}

// Send a message to Gemini AI and get a response
export async function getAIResponse(message: string): Promise<string> {
  try {
    const key = getGeminiApiKey();
    
    // Make a request to Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error communicating with Gemini AI');
    }
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Invalid response from Gemini AI');
  } catch (error: any) {
    toast.error(`AI Error: ${error.message}`);
    return "Sorry, I couldn't generate a response. Please try again later.";
  }
}

// Function to sync offline chats once user logs in
export async function syncOfflineChats(): Promise<void> {
  const offlineChats = JSON.parse(localStorage.getItem('offlineChats') || '[]');
  if (!offlineChats.length) return;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Prepare chats for insertion with user_id
    const chatsToInsert = offlineChats.map((chat: any) => ({
      message: chat.message,
      is_ai: chat.is_ai,
      created_at: chat.created_at,
      user_id: user.id
    }));

    // Insert all chats in bulk
    const { error } = await supabase
      .from('chats')
      .insert(chatsToInsert);

    if (error) throw error;
    
    // Clear offline storage after successful sync
    localStorage.removeItem('offlineChats');
    toast.success('Successfully synced your offline chat history');
  } catch (error: any) {
    toast.error(`Failed to sync offline chats: ${error.message}`);
  }
}
