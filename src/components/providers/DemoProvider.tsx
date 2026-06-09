'use client';

import { useEffect } from 'react';
// Importing this module installs the `/api/*` fetch interceptor at eval time,
// before any child component effect can fire a request.
import { installDemoApi } from '@/lib/demo/demoApi';
import { DEMO_MODE } from '@/lib/demo/config';
import { useReviewStore } from '@/lib/stores/reviewStore';
import { buildSeedDrafts } from '@/lib/demo/mockData';

// Defensive: ensure the interceptor is active even if tree-shaking reorders imports.
installDemoApi();

export function DemoProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!DEMO_MODE) return;
    // Seed the review queue with realistic sample tickets on first visit so the
    // dashboard is alive out of the box. Respects anything the user already has.
    const { drafts } = useReviewStore.getState();
    if (drafts.length === 0) {
      useReviewStore.setState({ drafts: buildSeedDrafts() });
    }
  }, []);

  return <>{children}</>;
}
