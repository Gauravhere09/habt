
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface StatsHeaderProps {
  onShareStats: () => void;
  timePeriod: string;
}

export default function StatsHeader({ onShareStats, timePeriod }: StatsHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  
  const handleLogin = () => {
    navigate('/auth');
  };

  const handleLogout = async () => {
    setShowSignOutDialog(false);
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-xl font-bold">Statistics</h2>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onShareStats}
          title="Share Stats"
        >
          <Share2 size={18} />
        </Button>
        {user ? (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Logged in as:</p>
            <p className="text-sm font-medium truncate max-w-[120px]">{user.email}</p>
            <Button variant="ghost" size="sm" onClick={() => setShowSignOutDialog(true)} className="mt-0.5 h-7 text-xs">
              Sign Out
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={handleLogin}>Login</Button>
        )}

        <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Do you really want to sign out?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Yes, Sign Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
