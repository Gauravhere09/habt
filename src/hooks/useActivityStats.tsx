import { useState, useEffect, useMemo } from 'react';
import { getUserActivities, Activity } from '@/services/activityService';
import { TimePeriod } from '@/components/Stats/TimePeriodTabs';
import { formatShortDate } from '@/lib/date-utils';

export default function useActivityStats(timePeriod: TimePeriod) {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  useEffect(() => {
    loadActivities();
  }, []);
  
  const loadActivities = async () => {
    const fetchedActivities = await getUserActivities();
    setActivities(fetchedActivities);
  };

  // Filter activities based on time period
  const filteredActivities = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timePeriod) {
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
  }, [activities, timePeriod]);
  
  // Get counts by activity type
  const activityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
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
  }, [filteredActivities, activities]);
  
  // Generate chart data for activity distribution by day of week
  const dayOfWeekData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = Array(7).fill(0);
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.created_at);
      dayCounts[date.getDay()]++;
    });
    
    return days.map((day, index) => ({
      name: day.substring(0, 3),
      count: dayCounts[index]
    }));
  }, [filteredActivities]);
  
  // Generate chart data for activity distribution by hour of day
  const hourOfDayData = useMemo(() => {
    const hourCounts = Array(24).fill(0);
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.created_at);
      hourCounts[date.getHours()]++;
    });
    
    return hourCounts.map((count, hour) => ({
      name: `${hour}:00`,
      count
    }));
  }, [filteredActivities]);
  
  // Get counts for different activity types
  const getActivityTypeCount = (type: string) => {
    return filteredActivities.filter(a => 
      a.activity_type === type
    ).length;
  };
  
  const getActivityValue = (type: string) => {
    const activitiesOfType = filteredActivities
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

  const activityTypeCounts = useMemo(() => ({
    water: { count: getActivityTypeCount('Water') },
    bathroom: { count: getActivityTypeCount('Bathroom') },
    screenTime: { value: getActivityValue('Screen Time') }
  }), [filteredActivities]);

  const isEmpty = filteredActivities.length === 0;

  return {
    activityCounts,
    dayOfWeekData,
    hourOfDayData,
    activityTypeCounts,
    filteredActivities,
    isEmpty,
    refresh: loadActivities
  };
}
