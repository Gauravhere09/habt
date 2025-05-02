
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Activity {
  id: string;
  activity_type: string;
  value?: string | null;
  emoji: string;
  created_at: string;
}

// Create a new activity record
export async function createActivity(
  activity_type: string, 
  emoji: string, 
  value?: string
): Promise<Activity | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Handle offline storage when user is not logged in
      const offlineActivities = JSON.parse(localStorage.getItem('offlineActivities') || '[]');
      const newActivity = {
        id: crypto.randomUUID(),
        activity_type,
        emoji,
        value: value || null,
        created_at: new Date().toISOString(),
      };
      offlineActivities.push(newActivity);
      localStorage.setItem('offlineActivities', JSON.stringify(offlineActivities));
      return newActivity;
    }

    // If user is logged in, store in Supabase
    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        activity_type,
        emoji,
        value: value || null
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error(`Failed to record activity: ${error.message}`);
    return null;
  }
}

// Get all activities for the current user
export async function getUserActivities(): Promise<Activity[]> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return offline data when user is not logged in
      return JSON.parse(localStorage.getItem('offlineActivities') || '[]');
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error(`Failed to fetch activities: ${error.message}`);
    return [];
  }
}

// Get activities by type for the current user
export async function getActivitiesByType(activity_type: string): Promise<Activity[]> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return filtered offline data when user is not logged in
      const offlineActivities = JSON.parse(localStorage.getItem('offlineActivities') || '[]');
      return offlineActivities.filter((a: Activity) => a.activity_type === activity_type);
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('activity_type', activity_type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error(`Failed to fetch ${activity_type} activities: ${error.message}`);
    return [];
  }
}

// Delete an activity
export async function deleteActivity(id: string): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Handle offline deletion
      const offlineActivities = JSON.parse(localStorage.getItem('offlineActivities') || '[]');
      const filteredActivities = offlineActivities.filter((a: Activity) => a.id !== id);
      localStorage.setItem('offlineActivities', JSON.stringify(filteredActivities));
      return true;
    }

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    toast.error(`Failed to delete activity: ${error.message}`);
    return false;
  }
}

// Function to sync offline activities once user logs in
export async function syncOfflineActivities(): Promise<void> {
  const offlineActivities = JSON.parse(localStorage.getItem('offlineActivities') || '[]');
  if (!offlineActivities.length) return;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Prepare activities for insertion with user_id
    const activitiesToInsert = offlineActivities.map((activity: any) => ({
      activity_type: activity.activity_type,
      emoji: activity.emoji,
      value: activity.value,
      created_at: activity.created_at,
      user_id: user.id
    }));

    // Insert all activities in bulk
    const { error } = await supabase
      .from('activities')
      .insert(activitiesToInsert);

    if (error) throw error;
    
    // Clear offline storage after successful sync
    localStorage.removeItem('offlineActivities');
    toast.success('Successfully synced your offline activities');
  } catch (error: any) {
    toast.error(`Failed to sync offline activities: ${error.message}`);
  }
}
