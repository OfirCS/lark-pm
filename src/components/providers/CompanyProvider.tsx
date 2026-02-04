'use client';

import { useEffect, useState } from 'react';
import { loadCompanyFromSupabase, useCompanyStore } from '@/lib/stores/companyStore';

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { company } = useCompanyStore();

  useEffect(() => {
    const init = async () => {
      // Try to load from Supabase
      const loaded = await loadCompanyFromSupabase();

      if (!loaded) {
        console.log('No Supabase data, using localStorage');
      }

      setIsLoading(false);
    };

    init();
  }, []);

  // Show nothing while loading (prevents flash of wrong content)
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
