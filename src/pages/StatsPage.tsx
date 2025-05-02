
import { useState, useEffect } from 'react';
import { getUserActivities, Activity } from '@/services/activityService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import TimePeriodTabs, { TimePeriod } from '@/components/Stats/TimePeriodTabs';
import ActivityCountCard from '@/components/Stats/ActivityCountCard';
import ActivityChart from '@/components/Stats/ActivityChart';
import ActivityCountsChart from '@/components/Stats/ActivityCountsChart';
import StatsHeader from '@/components/Stats/StatsHeader';

// Chart configurations
const chartConfig = {
  water: { label: 'Water', color: '#0ea5e9' },
  bathroom: { label: 'Bathroom', color: '#8b5cf6' },
  sleep: { label: 'Sleep', color: '#10b981' },
  exercise: { label: 'Exercise', color: '#f97316' },
  screen: { label: 'Screen Time', color: '#6366f1' },
  meal: { label: 'Meal', color: '#f59e0b' },
};

export default function StatsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    const fetchedActivities = await getUserActivities();
    setActivities(fetchedActivities);
  };

  // Filter activities based on time period
  const filterActivitiesByTimePeriod = (activities: Activity[], period: TimePeriod): Activity[] => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        const day = now.getDay();
        startDate = new Date(now.setDate(now.getDate() - day));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }
    
    return activities.filter(activity => 
      new Date(activity.created_at) >= startDate
    );
  };

  // Get counts by activity type
  const getActivityCounts = () => {
    const counts: Record<string, number> = {};
    const filteredActivities = filterActivitiesByTimePeriod(activities, timePeriod);
    
    filteredActivities.forEach(activity => {
      if (!counts[activity.activity_type]) {
        counts[activity.activity_type] = 0;
      }
      counts[activity.activity_type]++;
    });
    
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      emoji: activities.find(a => a.activity_type === name)?.emoji || '📊'
    }));
  };

  // Generate chart data for activity distribution by day of week
  const getDayOfWeekData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = Array(7).fill(0);
    
    const filteredActivities = filterActivitiesByTimePeriod(activities, timePeriod);
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.created_at);
      dayCounts[date.getDay()]++;
    });
    
    return days.map((day, index) => ({
      name: day.substring(0, 3),
      count: dayCounts[index]
    }));
  };

  // Generate chart data for activity distribution by hour of day
  const getHourOfDayData = () => {
    const hourCounts = Array(24).fill(0);
    
    const filteredActivities = filterActivitiesByTimePeriod(activities, timePeriod);
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.created_at);
      hourCounts[date.getHours()]++;
    });
    
    return hourCounts.map((count, hour) => ({
      name: `${hour}:00`,
      count
    }));
  };

  // Get counts for different activity types
  const getActivityTypeCount = (type: string) => {
    return filterActivitiesByTimePeriod(activities, timePeriod).filter(a => 
      a.activity_type === type
    ).length;
  };

  const getActivityValue = (type: string) => {
    const activitiesOfType = filterActivitiesByTimePeriod(activities, timePeriod)
      .filter(a => a.activity_type === type && a.value);
    
    if (!activitiesOfType.length) return "0";
    
    // For numeric values, calculate sum
    const values = activitiesOfType
      .map(a => parseFloat(a.value || "0"))
      .filter(v => !isNaN(v));
      
    if (values.length) {
      return values.reduce((sum, val) => sum + val, 0).toFixed(1);
    }
    
    // Default to count if values aren't numeric
    return activitiesOfType.length.toString();
  };

  const handleShareStats = async () => {
    try {
      // Create stats summary text
      let statsText = `My Health Stats (${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})\n\n`;
      
      statsText += `Water: ${getActivityTypeCount('Water')} times\n`;
      statsText += `Sleep: ${getActivityValue('Sleep')} hours\n`;
      statsText += `Exercise: ${getActivityValue('Exercise')} minutes\n`;
      statsText += `Screen Time: ${getActivityValue('Screen Time')} hours\n`;
      statsText += `Bathroom: ${getActivityTypeCount('Bathroom')} times\n`;
      statsText += `Meal: ${getActivityTypeCount('Meal')} times\n\n`;
      
      statsText += `Total activities: ${filterActivitiesByTimePeriod(activities, timePeriod).length}`;
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'My Health Stats',
          text: statsText,
        });
        toast.success('Stats shared successfully');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(statsText);
        toast.success('Stats copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing stats:', error);
      toast.error('Failed to share stats');
    }
  };

  const filteredActivities = filterActivitiesByTimePeriod(activities, timePeriod);
  const activityCounts = getActivityCounts();
  const dayOfWeekData = getDayOfWeekData();
  const hourOfDayData = getHourOfDayData();
  const isEmpty = filteredActivities.length === 0;

  return (
    <div className="space-y-4">
      <StatsHeader onShareStats={handleShareStats} timePeriod={timePeriod} />
      
      <TimePeriodTabs value={timePeriod} onChange={setTimePeriod} />
      
      <div className="grid grid-cols-2 gap-3">
        <ActivityCountCard 
          emoji="💧" 
          title="Water" 
          value={getActivityTypeCount('Water')} 
          unit="times" 
        />
        
        <ActivityCountCard 
          emoji="💩" 
          title="Bathroom" 
          value={getActivityTypeCount('Bathroom')} 
          unit="times" 
        />
        
        <ActivityCountCard 
          emoji="😴" 
          title="Sleep" 
          value={getActivityValue('Sleep')} 
          unit="hours" 
        />
        
        <ActivityCountCard 
          emoji="📱" 
          title="Screen Time" 
          value={getActivityValue('Screen Time')} 
          unit="hours" 
        />

        <ActivityCountCard 
          emoji="🏋️" 
          title="Exercise" 
          value={getActivityValue('Exercise')} 
          unit="minutes" 
        />
        
        <ActivityCountCard 
          emoji="🍽️" 
          title="Meal" 
          value={getActivityTypeCount('Meal')} 
          unit="times" 
        />
      </div>
      
      <ActivityCountsChart 
        data={activityCounts} 
        chartConfig={chartConfig} 
        isEmpty={isEmpty} 
      />
      
      <ActivityChart 
        title="Activity by Day of Week" 
        data={dayOfWeekData} 
        dataKey="count" 
        color="#6366f1" 
        chartConfig={chartConfig} 
        isEmpty={isEmpty} 
      />
      
      <ActivityChart 
        title="Activity by Time of Day" 
        data={hourOfDayData} 
        dataKey="count" 
        color="#10b981" 
        chartConfig={chartConfig} 
        isEmpty={isEmpty} 
        xAxisInterval={3} 
      />
    </div>
  );
}
