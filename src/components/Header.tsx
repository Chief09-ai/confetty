import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { user, userProfile, signOut } = useAuth();

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-2 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <Link to="/" className="text-lg md:text-2xl font-bold text-primary flex-shrink-0">
            Confetty
          </Link>
          
          <div className="flex-1 max-w-xs md:max-w-md">
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 md:h-4 md:w-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-7 md:pl-10 rounded-full text-sm h-8 md:h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {user ? (
              <>
                <Button asChild variant="default" size="sm" className="rounded-full px-2 md:px-4">
                  <Link to="/create">
                    <Plus className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden md:inline">Create Post</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="sm" className="rounded-full px-2 md:px-4 hidden md:inline-flex">
                  <Link to="/create-sub">
                    Create Sub
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full px-2 md:px-4">
                      <User className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden md:inline">{userProfile?.username || 'Account'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 md:w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link to="/create-sub" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Sub
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="default" className="rounded-full text-sm px-3 md:px-4">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}