
import ActivityCountCard from '@/components/Stats/ActivityCountCard';

interface ActivityCountsGridProps {
  counts: {
    water: { count: number };
    bathroom: { count: number };
    sleep: { value: string };
    screenTime: { value: string };
    exercise: { value: string };
    meal: { count: number };
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
        emoji="😴" 
        title="Sleep" 
        value={counts.sleep.value} 
        unit="hours" 
      />
      
      <ActivityCountCard 
        emoji="📱" 
        title="Screen Time" 
        value={counts.screenTime.value} 
        unit="hours" 
      />

      <ActivityCountCard 
        emoji="🏋️" 
        title="Exercise" 
        value={counts.exercise.value} 
        unit="minutes" 
      />
      
      <ActivityCountCard 
        emoji="🍽️" 
        title="Meal" 
        value={counts.meal.count} 
        unit="times" 
      />
    </div>
  );
}
