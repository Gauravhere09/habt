
import ActivityChart from '@/components/Stats/ActivityChart';
import ActivityCountsChart from '@/components/Stats/ActivityCountsChart';
import { Activity } from '@/services/activityService';
import { TimePeriod } from '@/components/Stats/TimePeriodTabs';

interface ChartSectionProps {
  chartConfig: Record<string, { label?: React.ReactNode; color?: string; }>;
  activityCounts: Array<{ name: string; count: number; emoji: string }>;
  dayOfWeekData: Array<{ name: string; count: number }>;
  hourOfDayData: Array<{ name: string; count: number }>;
  isEmpty: boolean;
}

export default function ChartSection({ 
  chartConfig, 
  activityCounts, 
  dayOfWeekData, 
  hourOfDayData, 
  isEmpty 
}: ChartSectionProps) {
  return (
    <>
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
    </>
  );
}
