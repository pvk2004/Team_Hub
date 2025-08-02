import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';
import { mockAuth } from '../mock';
import { useToast } from '../hooks/use-toast';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = mockAuth.getCurrentUser();

  const handleLogout = () => {
    mockAuth.logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of Team Hub.",
    });
    navigate('/login');
  };

  const handleAdminClick = () => {
    if (currentUser.role === 'admin') {
      navigate('/admin');
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (email) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Team Hub
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 font-medium hidden sm:block">
                {currentUser?.email}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative h-10 w-10 rounded-full transition-all hover:shadow-md hover:scale-105"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-r from-slate-700 to-slate-500 text-white font-semibold">
                        {getInitials(currentUser?.email || '')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuItem
                    onClick={handleAdminClick}
                    className="cursor-pointer transition-colors hover:bg-slate-100 p-3 rounded-md"
                  >
                    <Settings className="mr-3 h-4 w-4 text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Admin Panel</span>
                      <span className="text-xs text-slate-500">
                        {currentUser?.role === 'admin' ? 'Manage users' : 'Access restricted'}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 p-3 rounded-md transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;