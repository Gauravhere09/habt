
import { Outlet } from 'react-router-dom';
import Header from './Header';
import NavBar from './NavBar';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as RadixToaster } from '@/components/ui/toaster';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
      <Header />
      <main className="flex-1 p-4 overflow-auto">
        <Outlet />
      </main>
      <NavBar />
      <RadixToaster />
      <Toaster position="top-center" />
    </div>
  );
}
