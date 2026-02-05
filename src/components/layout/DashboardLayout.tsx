'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Home,
  BarChart3,
  Inbox,
  Workflow,
  Target,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Zap,
  Bell,
  Search,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo, LarkIcon } from '@/components/ui/Logo';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: 'indigo' | 'amber' | 'emerald' | 'rose';
  description?: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    href: '/dashboard',
    icon: Home,
    description: 'AI Assistant & Overview',
  },
  {
    id: 'data',
    label: 'Intelligence',
    href: '/dashboard/data',
    icon: BarChart3,
    badge: '12 new',
    badgeColor: 'indigo',
    description: 'Feedback & Insights',
  },
  {
    id: 'review',
    label: 'Review Queue',
    href: '/dashboard/review',
    icon: Inbox,
    badge: '5 pending',
    badgeColor: 'amber',
    description: 'Approve & Create Tickets',
  },
  {
    id: 'automation',
    label: 'Automation',
    href: '/dashboard/automation',
    icon: Workflow,
    description: 'Workflows & Pipelines',
  },
  {
    id: 'insights',
    label: 'Magic Pipeline',
    href: '/dashboard/insights',
    icon: Sparkles,
    description: 'One-Click Analysis',
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    href: '/dashboard/roadmap',
    icon: Target,
    badge: 'Beta',
    badgeColor: 'emerald',
    description: 'Feature Planning',
  },
];

const bottomNavItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    id: 'help',
    label: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
  },
];

function NavItemComponent({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link href={item.href} className="group relative block">
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
          active
            ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/20'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
        )}
      >
        <div className="relative shrink-0">
          <Icon size={20} strokeWidth={1.5} />
        </div>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex items-center justify-between overflow-hidden"
            >
              <div className="flex flex-col">
                <span className={cn('text-sm font-medium', active && 'text-white')}>
                  {item.label}
                </span>
                {item.description && !active && (
                  <span className="text-[10px] text-stone-400">{item.description}</span>
                )}
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0',
                    item.badgeColor === 'indigo' && 'bg-indigo-100 text-indigo-700',
                    item.badgeColor === 'amber' && 'bg-amber-100 text-amber-700',
                    item.badgeColor === 'emerald' && 'bg-emerald-100 text-emerald-700',
                    item.badgeColor === 'rose' && 'bg-rose-100 text-rose-700',
                    active && 'bg-white/20 text-white'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-stone-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {item.label}
            {item.badge && <span className="ml-2 text-stone-400">{item.badge}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

function TopHeader({
  onMenuToggle,
  onSidebarToggle,
  collapsed,
  userInitials,
}: {
  onMenuToggle: () => void;
  onSidebarToggle: () => void;
  collapsed: boolean;
  userInitials: string;
}) {
  return (
    <header className="sticky top-0 z-30 h-16 px-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-stone-200/50">
      <div className="flex items-center gap-4">
        {/* Desktop: toggle sidebar collapse */}
        <button
          onClick={onSidebarToggle}
          className="hidden md:flex p-2 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={20} className="text-stone-600" />
        </button>
        {/* Mobile: open mobile menu */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-stone-600" />
        </button>

        {/* Global Search */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-stone-200">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors">
          <Bell size={20} className="text-stone-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 p-1.5 hover:bg-stone-100 rounded-xl transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white text-sm font-medium">
            {userInitials}
          </div>
          <ChevronRight size={14} className="text-stone-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Desktop Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 bottom-0 z-40 bg-white/90 backdrop-blur-xl border-r border-stone-200/50 hidden md:flex flex-col"
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-stone-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center shrink-0">
              <LarkIcon size={20} className="text-white" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-semibold text-lg text-stone-900"
                >
                  Lark
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItemComponent
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

        {/* Pro Badge */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-3 mb-4"
            >
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} />
                  <span className="text-xs font-semibold">Pro Plan</span>
                </div>
                <p className="text-[10px] text-white/80 mb-2">
                  You have 2,000 credits remaining
                </p>
                <button className="w-full py-1.5 text-[10px] font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                  Upgrade
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className="px-3 py-4 border-t border-stone-100 space-y-1">
          {bottomNavItems.map((item) => (
            <NavItemComponent
              key={item.id}
              item={item}
              collapsed={sidebarCollapsed}
              active={pathname === item.href}
            />
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 bg-white border-r border-stone-200 md:hidden flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-stone-100">
                <Logo size="sm" />
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={20} className="text-stone-600" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <NavItemComponent
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

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'
        )}
      >
        <TopHeader
          onMenuToggle={() => setMobileMenuOpen(true)}
          onSidebarToggle={() => setSidebarCollapsed(prev => !prev)}
          collapsed={sidebarCollapsed}
          userInitials={getUserInitials()}
        />
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
