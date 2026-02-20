'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, List, Bookmark, Search, Zap, Plus, Settings, ChevronRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Lists', href: '/lists', icon: List },
  { name: 'Saved Searches', href: '/saved', icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 border-r bg-background h-screen fixed left-0 top-0 z-10">
      <div className="flex items-center h-16 px-6 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tighter">Scout AI</span>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4 space-y-8">
        <div className="px-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Quick search..."
              className="pl-9 bg-muted/40 border-none focus-visible:ring-1 h-9 text-sm"
            />
          </div>
        </div>

        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Main Menu</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-[inset_4px_0_0_0_var(--color-primary)]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="h-3 w-3" />}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Lists</p>
            <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground" asChild>
              <Link href="/lists">
                <Plus className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="space-y-0.5">
            <Link href="/lists" className="group flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-3 shrink-0" />
              Series A Fintech
            </Link>
            <Link href="/lists" className="group flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-3 shrink-0" />
              Developer Tools
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-sm">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground leading-tight">Jane Doe</span>
              <span className="text-[10px] text-muted-foreground">Associate</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
