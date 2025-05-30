import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getUserActivities, deleteActivity, Activity as ActivityType } from '@/services/activityService';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { StickyNote, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddTaskDialog } from '@/components/ActivityTracker/AddTaskDialog';
import { formatShortDate } from '@/lib/date-utils';

export default function HistoryPage() {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityType[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadActivities = async () => {
    const data = await getUserActivities();
    setActivities(data);
    setFilteredActivities(data);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    const success = await deleteActivity(deleteId);
    if (success) {
      toast.success('Activity deleted successfully');
      loadActivities();
    }
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const navigateToNotes = () => {
    navigate('/notes');
  };

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    
    if (value === 'all') {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter(activity => activity.activity_type.toLowerCase() === value.toLowerCase());
      setFilteredActivities(filtered);
    }
  };

  // Get unique activity types for filter tabs
  const activityTypes = ['all', ...Array.from(new Set(activities.map(a => a.activity_type.toLowerCase())))];

  // Map emojis to activity types
  const getEmojiForType = (type: string) => {
    const emojiMap: Record<string, string> = {
      'all': '🔍',
      'water': '💧',
      'bathroom': '💩',
      'screen': '📱',
    };
    
    // For custom activities, try to find their emoji from the activities list
    if (!emojiMap[type.toLowerCase()]) {
      const activity = activities.find(a => a.activity_type.toLowerCase() === type.toLowerCase());
      if (activity) return activity.emoji;
    }
    
    return emojiMap[type.toLowerCase()] || '📝';
  };

  // Group activities by date
  const groupedActivities: Record<string, ActivityType[]> = {};
  filteredActivities.forEach(activity => {
    // Format the date as "1 Jan 2025" for grouping
    const date = formatShortDate(activity.created_at);
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity History</h2>
        <div className="flex gap-2">
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={navigateToNotes} 
              title="Notes"
            >
              <StickyNote size={18} />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsAddTaskDialogOpen(true)}
            title="Add New Task"
            className="rounded-full"
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>
      
      <Tabs value={activeFilter} onValueChange={handleFilterChange} className="w-full">
        <TabsList className="w-full overflow-x-auto flex flex-nowrap mb-4 pb-1" style={{ scrollbarWidth: 'none' }}>
          {activityTypes.map((type) => (
            <TabsTrigger 
              key={type} 
              value={type} 
              className="capitalize whitespace-nowrap"
            >
              {getEmojiForType(type)} {type === 'all' ? 'All Activities' : type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {Object.keys(groupedActivities).length > 0 ? (
        Object.entries(groupedActivities).map(([date, dayActivities]) => (
          <div key={date} className="space-y-2">
            <h3 className="text-lg font-semibold">{date}</h3>
            {dayActivities.map((activity) => (
              <Card key={activity.id} className="bg-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{activity.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{activity.activity_type}</h3>
                          {activity.value && (
                            <span className="text-sm bg-primary/20 py-0.5 px-2 rounded-full">
                              {activity.value}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => handleDeleteClick(activity.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {activeFilter === 'all' ? 'No activity recorded yet.' : `No ${activeFilter} activities found.`}
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your activity record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddTaskDialog 
        open={isAddTaskDialogOpen} 
        onOpenChange={setIsAddTaskDialogOpen} 
        onTaskAdded={loadActivities}
      />

      <div className="fixed bottom-16 right-4">
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsAddTaskDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
