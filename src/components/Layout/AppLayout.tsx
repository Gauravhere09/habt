
import { Outlet } from 'react-router-dom';
import Header from './Header';
import NavBar from './NavBar';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as RadixToaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-16">
      <Header />
      <main className="flex-1 p-3 sm:p-4 overflow-auto">
        <Outlet />
      </main>
      <NavBar />
      <RadixToaster />
      <Toaster position="top-center" />
    </div>
  );
}
