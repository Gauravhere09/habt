
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TimePeriodTabs, { TimePeriod } from '@/components/Stats/TimePeriodTabs';
import StatsHeader from '@/components/Stats/StatsHeader';
import ActivityCountsGrid from '@/components/Stats/ActivityCountsGrid';
import ChartSection from '@/components/Stats/ChartSection';
import useActivityStats from '@/hooks/useActivityStats';

// Chart configurations
const chartConfig = {
  water: { label: 'Water', color: '#0ea5e9' },
  bathroom: { label: 'Bathroom', color: '#8b5cf6' },
  screen: { label: 'Screen Time', color: '#6366f1' },
};

export default function StatsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    activityCounts,
    dayOfWeekData,
    hourOfDayData,
    activityTypeCounts,
    filteredActivities,
    isEmpty
  } = useActivityStats(timePeriod);

  const handleShareStats = async () => {
    try {
      // Create stats summary text
      let statsText = `My Health Stats (${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})\n\n`;
      
      statsText += `Water: ${activityTypeCounts.water.count} times\n`;
      statsText += `Screen Time: ${activityTypeCounts.screenTime.value} hours\n`;
      statsText += `Bathroom: ${activityTypeCounts.bathroom.count} times\n\n`;
      
      statsText += `Total activities: ${filteredActivities.length}`;
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'My Health Stats',
          text: statsText,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(statsText);
      }
    } catch (error) {
      console.error('Error sharing stats:', error);
    }
  };

  return (
    <div className="space-y-4">
      <StatsHeader onShareStats={handleShareStats} timePeriod={timePeriod} />
      
      <TimePeriodTabs value={timePeriod} onChange={setTimePeriod} />
      
      <ActivityCountsGrid counts={activityTypeCounts} />
      
      <ChartSection 
        chartConfig={chartConfig}
        activityCounts={activityCounts}
        dayOfWeekData={dayOfWeekData}
        hourOfDayData={hourOfDayData}
        isEmpty={isEmpty}
      />
    </div>
  );
}
