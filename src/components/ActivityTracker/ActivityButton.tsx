
import { useState } from 'react';
import { toast } from 'sonner';
import { Activity } from '@/types/activity';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createActivity } from '@/services/activityService';

interface ActivityButtonProps {
  activity: Activity;
  onTrack: () => void;
}

export default function ActivityButton({ activity, onTrack }: ActivityButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [value, setValue] = useState('');
  
  const needsValue = ['water', 'screen', 'sleep', 'exercise'].includes(activity.id);
  
  const handleClick = () => {
    setIsAnimating(true);
    
    if (needsValue) {
      setShowDialog(true);
    } else {
      trackActivity();
    }
    
    // Reset animation
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  const trackActivity = async (valueToTrack?: string) => {
    try {
      await createActivity(activity.name, activity.emoji, valueToTrack);
      
      toast(`${activity.name} tracked!`, {
        description: valueToTrack 
          ? `${valueToTrack} at ${new Date().toLocaleTimeString()}` 
          : new Date().toLocaleTimeString(),
      });
      
      onTrack();
      setShowDialog(false);
      setValue('');
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const getPlaceholder = () => {
    switch(activity.id) {
      case 'water': return 'Enter amount in ml/oz';
      case 'screen': return 'Enter time in minutes';
      case 'sleep': return 'Enter duration in hours';
      case 'exercise': return 'Enter duration in minutes';
      default: return 'Enter value';
    }
  };
  
  return (
    <>
      <div 
        className={`activity-card bg-card/50 border border-border/50 flex flex-col items-center justify-center w-full p-4 rounded-xl cursor-pointer hover:bg-card/70 transition-all ${isAnimating ? 'animate-scale-in' : ''}`}
        onClick={handleClick}
      >
        <span className="activity-icon text-4xl mb-2">{activity.emoji}</span>
        <span className="text-base font-medium">{activity.name}</span>
      </div>

      {needsValue && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Track {activity.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder={getPlaceholder()}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="text"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => trackActivity(value)}>
                Track
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
