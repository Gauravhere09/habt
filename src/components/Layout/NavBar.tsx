
import { Link, useLocation } from 'react-router-dom';
import { Home, History, BarChart2, MessageSquare } from 'lucide-react';

export default function NavBar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/stats', icon: BarChart2, label: 'Stats' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <nav className="fixed bottom-2 left-2 right-2 bg-card border border-border/30 rounded-xl shadow-lg">
      <div className="flex justify-around p-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
