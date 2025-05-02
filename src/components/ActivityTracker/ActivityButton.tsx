
import { useState } from 'react';
import { toast } from 'sonner';
import { Activity } from '@/types/activity';

interface ActivityButtonProps {
  activity: Activity;
  onClick: (activity: Activity) => void;
}

export default function ActivityButton({ activity, onClick }: ActivityButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleClick = () => {
    setIsAnimating(true);
    onClick(activity);
    
    // Show toast
    toast(`${activity.name} tracked!`, {
      description: new Date().toLocaleTimeString(),
    });
    
    // Reset animation
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  return (
    <div 
      className={`activity-card ${isAnimating ? 'animate-scale-in' : ''}`}
      onClick={handleClick}
    >
      <span className="activity-icon">{activity.emoji}</span>
      <span className="mt-2 font-medium">{activity.name}</span>
    </div>
  );
}
