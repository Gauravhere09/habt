
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getUserActivities, deleteActivity, Activity as ActivityType } from '@/services/activityService';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadActivities = async () => {
    const data = await getUserActivities();
    setActivities(data);
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

  // Group activities by date
  const groupedActivities: Record<string, ActivityType[]> = {};
  activities.forEach(activity => {
    const date = new Date(activity.created_at).toLocaleDateString();
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity History</h2>
      </div>
      
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
                          {new Date(activity.created_at).toLocaleTimeString()}
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
            <p className="text-muted-foreground">No activity recorded yet.</p>
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
    </div>
  );
}
