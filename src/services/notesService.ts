
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Note {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

// Create a new note
export async function createNote(title: string, content?: string): Promise<Note | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to create notes');
      return null;
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title,
        content: content || ''
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error(`Failed to create note: ${error.message}`);
    return null;
  }
}

// Get all notes for the current user
export async function getUserNotes(): Promise<Note[]> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to view notes');
      return [];
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error(`Failed to fetch notes: ${error.message}`);
    return [];
  }
}

// Update a note
export async function updateNote(id: string, title: string, content?: string): Promise<Note | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to update notes');
      return null;
    }

    const { data, error } = await supabase
      .from('notes')
      .update({
        title,
        content: content || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error(`Failed to update note: ${error.message}`);
    return null;
  }
}

// Delete a note
export async function deleteNote(id: string): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to delete notes');
      return false;
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    toast.error(`Failed to delete note: ${error.message}`);
    return false;
  }
}

// Search notes
export async function searchNotes(query: string): Promise<Note[]> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to search notes');
      return [];
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error(`Failed to search notes: ${error.message}`);
    return [];
  }
}
