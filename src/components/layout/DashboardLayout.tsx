'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useReviewStore } from '@/lib/stores/reviewStore';
import { useThemeStore } from '@/lib/stores/themeStore';
import { CommandPalette } from '@/components/ui/CommandPalette';
import {
  Home,
  BarChart3,
  Inbox,
  Workflow,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Search,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LarkIcon } from '@/components/ui/Logo';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

function useNavItems(): NavItem[] {
  const pendingCount = useReviewStore((state) => state.getPendingCount());

  return [
    { id: 'dashboard', label: 'Home', href: '/dashboard', icon: Home },
    { id: 'data', label: 'Intelligence', href: '/dashboard/data', icon: BarChart3 },
    {
      id: 'review',
      label: 'Review',
      href: '/dashboard/review',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'digest', label: 'Digest', href: '/dashboard/digest', icon: FileText },
    { id: 'automation', label: 'Automation', href: '/dashboard/automation', icon: Workflow },
    { id: 'insights', label: 'Pipeline', href: '/dashboard/insights', icon: Sparkles },
  ];
}

function NavLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link href={item.href} className="block">
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative',
          active
            ? 'bg-stone-100 text-stone-900 font-medium'
            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
        )}
      >
        <Icon size={18} strokeWidth={1.5} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && (
              <span className="text-[10px] font-medium text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge !== undefined && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full" />
        )}
      </div>
    </Link>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const navItems = useNavItems();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-stone-200/60 hidden md:flex flex-col"
        initial={false}
        animate={{ width: sidebarCollapsed ? 60 : 220 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-stone-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center shrink-0">
              <LarkIcon size={17} className="text-white" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-semibold text-sm text-stone-900"
                >
                  Lark
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              collapsed={sidebarCollapsed}
              active={
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-stone-100 space-y-0.5">
          <NavLink
            item={{ id: 'settings', label: 'Settings', href: '/settings', icon: Settings }}
            collapsed={sidebarCollapsed}
            active={pathname === '/settings'}
          />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} strokeWidth={1.5} />
            {!sidebarCollapsed && <span>Log out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[220px] z-50 bg-white border-r border-stone-200 md:hidden flex flex-col"
            >
              <div className="h-14 flex items-center justify-between px-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
                    <LarkIcon size={17} className="text-white" />
                  </div>
                  <span className="font-semibold text-sm text-stone-900">Lark</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 hover:bg-stone-100 rounded-md">
                  <X size={16} className="text-stone-500" />
                </button>
              </div>
              <nav className="flex-1 px-2 py-3 space-y-0.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    collapsed={false}
                    active={
                      item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname === item.href || pathname.startsWith(`${item.href}/`)
                    }
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main
        className={cn(
          'flex-1 min-h-screen transition-all duration-200',
          sidebarCollapsed ? 'md:ml-[60px]' : 'md:ml-[220px]'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 px-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-stone-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden md:flex p-1.5 hover:bg-stone-100 rounded-md transition-colors"
            >
              <Menu size={18} className="text-stone-500" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 hover:bg-stone-100 rounded-md transition-colors"
            >
              <Menu size={18} className="text-stone-500" />
            </button>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-stone-400 bg-stone-50 hover:bg-stone-100 rounded-md transition-colors"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline px-1 py-0.5 text-[10px] font-mono bg-white rounded border border-stone-200 ml-2">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-stone-100 rounded-md transition-colors"
            >
              {theme === 'light' ? (
                <Moon size={16} className="text-stone-400" />
              ) : (
                <Sun size={16} className="text-stone-400" />
              )}
            </button>
            <div className="w-7 h-7 rounded-md bg-stone-200 flex items-center justify-center text-stone-600 text-[10px] font-medium ml-1">
              {getUserInitials()}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
