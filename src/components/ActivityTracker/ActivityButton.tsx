
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Activity } from '@/types/activity';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createActivity, getActivitiesByType } from '@/services/activityService';
import { useAuth } from '@/context/AuthContext';

interface ActivityButtonProps {
  activity: Activity;
  onTrack: () => void;
}

export default function ActivityButton({ activity, onTrack }: ActivityButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [value, setValue] = useState('');
  const [canTrack, setCanTrack] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { user } = useAuth();
  
  const needsValue = activity.valueType && activity.valueType !== 'click';
  
  // Check if the activity was tracked in the last 30 minutes
  useEffect(() => {
    const checkLastTracked = async () => {
      const activities = await getActivitiesByType(activity.name);
      
      if (activities.length > 0) {
        const lastTracked = new Date(activities[0].created_at);
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        if (lastTracked > thirtyMinutesAgo) {
          setCanTrack(false);
          
          // Calculate remaining time in seconds
          const remainingTime = Math.ceil((lastTracked.getTime() + 30 * 60 * 1000 - Date.now()) / 1000);
          setTimeRemaining(remainingTime);
          
          // Set up countdown timer
          const timer = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                setCanTrack(true);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
        }
      }
    };
    
    checkLastTracked();
  }, [activity.name]);
  
  const handleClick = () => {
    // If user is not logged in, show a toast message
    if (!user) {
      toast.error("You need to log in to track activities");
      return;
    }
    
    // If cannot track yet due to 30-minute restriction
    if (!canTrack) {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      toast.error(`Please wait ${minutes}:${seconds < 10 ? '0' + seconds : seconds} before tracking ${activity.name} again`);
      return;
    }
    
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
      setCanTrack(false);
      setTimeRemaining(30 * 60); // 30 minutes in seconds
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const getPlaceholder = () => {
    switch(activity.valueType) {
      case 'number': return 'Enter a number';
      case 'duration': return 'Enter duration';
      case 'text': return 'Enter text';
      default: return 'Enter value';
    }
  };
  
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };
  
  return (
    <>
      <div 
        className={`activity-card bg-card/50 border border-border/50 flex flex-col items-center justify-center w-full p-4 rounded-xl cursor-pointer hover:bg-card/70 transition-all ${isAnimating ? 'animate-scale-in' : ''} ${!canTrack ? 'opacity-50' : ''}`}
        onClick={handleClick}
      >
        <span className="activity-icon text-4xl mb-2">{activity.emoji}</span>
        <span className="text-base font-medium">{activity.name}</span>
        {!canTrack && (
          <span className="text-xs text-muted-foreground mt-1">
            Wait {formatTimeRemaining()}
          </span>
        )}
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
                type={activity.valueType === 'number' ? 'number' : 'text'}
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
