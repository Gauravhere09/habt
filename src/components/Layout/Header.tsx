
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Header() {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/':
        return 'Activity Tracker';
      case '/history':
        return 'Activity History';
      case '/stats':
        return 'Statistics';
      case '/chat':
        return 'AI Insights';
      case '/notes':
        return 'Notes';
      default:
        return 'Habit Hue Haven';
    }
  };

  return (
    <header className="p-2 border-b border-border/30">
      <h1 className={`font-semibold text-center ${isMobile ? 'text-lg' : 'text-xl'}`}>{getPageTitle()}</h1>
    </header>
  );
}
