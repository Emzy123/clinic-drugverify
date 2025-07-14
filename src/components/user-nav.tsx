'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Search, MessageSquare, History } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/types';

// A mock user to use when login is bypassed
const MOCK_USER: User = {
  id: 'mock-user-id',
  fullname: 'CUSTECH Staff (Test)',
  email: 'test@custech.edu.ng',
  photoURL: `https://i.pravatar.cc/150?u=custech-staff`,
};

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // We'll use a mock user to bypass login for testing
    setUser(MOCK_USER);
  }, []);

  const displayName = user?.fullname || 'CUSTECH Staff';
  const displayEmail = user?.email || 'staff@custech.edu.ng';
  const displayAvatar = user?.photoURL;
  const avatarFallback = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} />}
            <AvatarFallback>
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/scan">
            <Search className="mr-2 h-4 w-4" />
            <span>Verify Drug</span>
          </Link>
        </DropdownMenuItem>
         <DropdownMenuItem asChild>
          <Link href="/dashboard/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat with AI</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/history">
            <History className="mr-2 h-4 w-4" />
            <span>Scan History</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          Log out (disabled for testing)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
