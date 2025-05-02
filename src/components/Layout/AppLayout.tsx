
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import NavBar from './NavBar';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as RadixToaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AppLayout() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  
  const handleLogin = () => {
    navigate('/auth');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-14">
      <Header />
      <main className="flex-1 p-2 sm:p-3 overflow-auto">
        {isHomePage && !user && (
          <div className="mb-4 flex justify-end">
            <Button onClick={handleLogin} variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        )}
        <Outlet />
      </main>
      <NavBar />
      <RadixToaster />
      <Toaster position="top-center" />
    </div>
  );
}
