
import { Link, useLocation } from 'react-router-dom';
import { Home, History, BarChart2, MessageSquare, StickyNote } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function NavBar() {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/stats', icon: BarChart2, label: 'Stats' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
  ];

  // Add Notes page only for authenticated users
  if (user) {
    navItems.push({ path: '/notes', icon: StickyNote, label: 'Notes' });
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
            >
              <item.icon size={18} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
