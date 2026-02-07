'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createAuthClient, AuthUser, toAuthUser, getProfile, Profile } from '@/lib/auth/supabase-auth';

const DEMO_USER_KEY = 'lark-demo-user';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  setDemoUser: () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const DEMO_AUTH_USER: AuthUser = {
  id: 'demo-user-001',
  email: 'demo@lark.pm',
  fullName: 'Demo User',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const isDemoModeRef = useRef(false);

  const loadProfile = useCallback(async (userId: string) => {
    const profileData = await getProfile(userId);
    setProfile(profileData);
    return profileData;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

  // Check for demo user on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        setUser(DEMO_AUTH_USER);
        setIsDemoMode(true);
        isDemoModeRef.current = true;
      }
    } catch {}
  }, []);

  useEffect(() => {
    const supabase = createAuthClient();

    // If Supabase is not configured, skip auth initialization
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession?.user) {
          const profileData = await loadProfile(initialSession.user.id);
          setUser(toAuthUser(initialSession.user, profileData || undefined));
          setSession(initialSession);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (newSession?.user) {
          const profileData = await loadProfile(newSession.user.id);
          setUser(toAuthUser(newSession.user, profileData || undefined));
          setSession(newSession);
        } else if (!isDemoModeRef.current) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDemoUser = useCallback(() => {
    setUser(DEMO_AUTH_USER);
    setIsDemoMode(true);
    isDemoModeRef.current = true;
    setIsLoading(false);
    try {
      localStorage.setItem(DEMO_USER_KEY, 'true');
    } catch {}
  }, []);

  const handleSignOut = async () => {
    // Clear demo mode
    if (isDemoMode || isDemoModeRef.current) {
      setIsDemoMode(false);
      isDemoModeRef.current = false;
      try {
        localStorage.removeItem(DEMO_USER_KEY);
      } catch {}
    }

    // Clear Supabase session
    const supabase = createAuthClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }

    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!session || isDemoMode,
    signOut: handleSignOut,
    refreshProfile,
    setDemoUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
