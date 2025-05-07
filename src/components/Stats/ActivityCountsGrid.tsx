
import ActivityCountCard from '@/components/Stats/ActivityCountCard';

interface ActivityCountsGridProps {
  counts: {
    water: { count: number };
    bathroom: { count: number };
    screenTime: { value: string };
  }
}

export default function ActivityCountsGrid({ counts }: ActivityCountsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ActivityCountCard 
        emoji="💧" 
        title="Water" 
        value={counts.water.count} 
        unit="times" 
      />
      
      <ActivityCountCard 
        emoji="💩" 
        title="Bathroom" 
        value={counts.bathroom.count} 
        unit="times" 
      />
      
      <ActivityCountCard 
        emoji="📱" 
        title="Screen Time" 
        value={counts.screenTime.value} 
        unit="hours" 
      />
    </div>
  );
}
