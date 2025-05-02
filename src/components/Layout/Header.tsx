
import { useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  
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
      case '/settings':
        return 'Settings';
      default:
        return 'Habit Hue Haven';
    }
  };

  return (
    <header className="p-4 border-b border-border/30">
      <h1 className="text-xl font-semibold text-center">{getPageTitle()}</h1>
    </header>
  );
}
