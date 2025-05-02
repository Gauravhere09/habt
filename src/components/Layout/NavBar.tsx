
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, MessageSquare, StickyNote } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function NavBar() {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { path: '/', icon: Home, label: '🏠', fullLabel: 'Home' },
    { path: '/history', icon: null, label: '📜', fullLabel: 'History' },
    { path: '/stats', icon: BarChart2, label: '📊', fullLabel: 'Stats' },
    { path: '/chat', icon: MessageSquare, label: '💬', fullLabel: 'Chat' },
  ];

  // Add Notes page only for authenticated users
  if (user) {
    navItems.push({ path: '/notes', icon: StickyNote, label: '📝', fullLabel: 'Notes' });
  }

  return (
    <nav className="fixed bottom-1 left-2 right-2 bg-card border border-border/30 rounded-xl shadow-lg">
      <div className="flex justify-around py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-1 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.fullLabel}
            >
              {item.icon ? <item.icon size={18} /> : <span className="text-lg">{item.label}</span>}
              <span className="text-xs">{item.fullLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
