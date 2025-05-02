
import { useState } from 'react';
import ActivityButton from '@/components/ActivityTracker/ActivityButton';
import { Activity, defaultActivities } from '@/types/activity';
import { Card, CardContent } from '@/components/ui/card';

export default function ActivityPage() {
  const [activities] = useState<Activity[]>(defaultActivities);

  const handleActivityClick = (activity: Activity) => {
    // In a real app with Supabase integration, we would save this to the database
    console.log(`Activity logged: ${activity.name} at ${new Date().toISOString()}`);
    
    // For now, we'll just log to console
    // Later we'll replace this with actual Supabase integration
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
                onClick={handleActivityClick}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">Today's Summary</h3>
          <p className="text-muted-foreground">Connect to Supabase to track and analyze your habits!</p>
        </CardContent>
      </Card>
    </div>
  );
}
