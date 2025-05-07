
import { useState, useEffect } from 'react';
import ActivityButton from '@/components/ActivityTracker/ActivityButton';
import { Activity, defaultActivities } from '@/types/activity';
import { Card, CardContent } from '@/components/ui/card';
import { getUserActivities } from '@/services/activityService';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddTaskDialog } from '@/components/ActivityTracker/AddTaskDialog';

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [todaysCount, setTodaysCount] = useState<Record<string, number>>({});
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [customActivities, setCustomActivities] = useState<Activity[]>([]);

  const fetchActivities = async () => {
    try {
      // Get custom activities from localStorage
      const storedActivities = localStorage.getItem('customActivities');
      if (storedActivities) {
        setCustomActivities(JSON.parse(storedActivities));
      }
    } catch (error) {
      console.error("Error loading custom activities:", error);
    }
  };

  const fetchTodaysActivities = async () => {
    const allActivities = await getUserActivities();
    
    // Get today's date in ISO format (just the date part)
    const today = new Date().toISOString().split('T')[0];
    
    // Filter for activities from today
    const todayActivities = allActivities.filter(activity => {
      const activityDate = new Date(activity.created_at).toISOString().split('T')[0];
      return activityDate === today;
    });
    
    // Count activities by type
    const counts: Record<string, number> = {};
    todayActivities.forEach(activity => {
      if (!counts[activity.activity_type]) {
        counts[activity.activity_type] = 0;
      }
      counts[activity.activity_type]++;
    });
    
    setTodaysCount(counts);
  };

  useEffect(() => {
    fetchTodaysActivities();
    fetchActivities();
  }, []);

  const handleActivityTrack = () => {
    fetchTodaysActivities();
  };
  
  const handleTaskAdded = (newActivity: Activity) => {
    setCustomActivities(prev => {
      const updated = [...prev, newActivity];
      localStorage.setItem('customActivities', JSON.stringify(updated));
      return updated;
    });
    fetchTodaysActivities();
  };

  // Combine default and custom activities
  const allActivities = [...activities, ...customActivities];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Track Activity</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsAddTaskDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>
      
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allActivities.map((activity) => (
              <ActivityButton 
                key={activity.id}
                activity={activity}
                onTrack={handleActivityTrack}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">Today's Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(todaysCount).length > 0 ? (
              Object.entries(todaysCount).map(([activityName, count]) => (
                <div key={activityName} className="flex items-center gap-2 p-2 rounded-lg border border-border/30">
                  <span className="text-xl">
                    {allActivities.find(a => a.name === activityName)?.emoji || '📝'}
                  </span>
                  <div>
                    <p className="font-medium">{activityName}</p>
                    <p className="text-muted-foreground text-sm">{count} times today</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground col-span-2">No activities tracked yet today.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AddTaskDialog 
        open={isAddTaskDialogOpen} 
        onOpenChange={setIsAddTaskDialogOpen} 
        onTaskAdded={handleTaskAdded}
      />

      <div className="fixed bottom-16 right-4">
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsAddTaskDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
