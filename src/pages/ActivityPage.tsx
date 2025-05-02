
import { useState, useEffect } from 'react';
import ActivityButton from '@/components/ActivityTracker/ActivityButton';
import { Activity, defaultActivities } from '@/types/activity';
import { Card, CardContent } from '@/components/ui/card';
import { getUserActivities } from '@/services/activityService';

export default function ActivityPage() {
  const [activities] = useState<Activity[]>(defaultActivities);
  const [todaysCount, setTodaysCount] = useState<Record<string, number>>({});

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
  }, []);

  const handleActivityTrack = () => {
    fetchTodaysActivities();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Track Activity</h2>
      
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activities.map((activity) => (
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
                <div key={activityName} className="flex items-center gap-2">
                  <span className="text-xl">
                    {activities.find(a => a.name === activityName)?.emoji || '📝'}
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
    </div>
  );
}
