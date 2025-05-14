import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BookPlus,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Create Test',
      href: '/create-test',
      icon: <BookPlus className="h-5 w-5" />,
    },
    {
      title: 'Test Library',
      href: '/test-library',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: 'Students',
      href: '/students',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="block lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleSidebar} className="bg-white shadow-md">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary mr-3 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Test Generator</h1>
            </div>
          </div>

          <div className="px-3 py-4">
            <p className="text-sm font-medium text-muted-foreground mb-3 px-4 uppercase tracking-wider">
              Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', item.href);
                    const navEvent = new PopStateEvent('popstate');
                    window.dispatchEvent(navEvent);
                    closeSidebar();
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all",
                    location === item.href
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-primary"
                  )}
                >
                  {item.icon}
                  {item.title}
                </a>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-gray-50">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-sm">
                {user?.name?.[0] || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}