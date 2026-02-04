import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Flag to track if we've loaded from Supabase
let supabaseLoaded = false;

export interface CompanyContext {
  // Basic info
  productName: string;
  productDescription?: string;
  industry?: string;
  targetAudience?: string;

  // Search terms for monitoring
  searchTerms: string[];
  competitors: string[];

  // Subreddits to monitor
  subreddits: string[];

  // Twitter hashtags/accounts to monitor
  twitterKeywords: string[];

  // Data sources enabled
  enabledSources: string[];

  // Integrations selected
  selectedIntegrations: string[];

  // Onboarding completed
  onboardingCompleted: boolean;
}

interface CompanyStore {
  company: CompanyContext;

  // Actions
  setCompany: (company: Partial<CompanyContext>) => void;
  setProductName: (name: string) => void;
  setSearchTerms: (terms: string[]) => void;
  addSearchTerm: (term: string) => void;
  removeSearchTerm: (term: string) => void;
  setSubreddits: (subreddits: string[]) => void;
  setCompetitors: (competitors: string[]) => void;
  setEnabledSources: (sources: string[]) => void;
  setSelectedIntegrations: (integrations: string[]) => void;
  completeOnboarding: () => void;
  resetCompany: () => void;

  // Getters
  getSearchQuery: () => string;
  getRedditSearchTerms: () => string[];
  getTwitterSearchTerms: () => string[];
}

const DEFAULT_COMPANY: CompanyContext = {
  productName: '',
  productDescription: '',
  industry: '',
  targetAudience: '',
  searchTerms: [],
  competitors: [],
  subreddits: ['SaaS', 'startups', 'ProductManagement', 'Entrepreneur'],
  twitterKeywords: [],
  enabledSources: ['reddit', 'twitter'],
  selectedIntegrations: [],
  onboardingCompleted: false,
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      company: DEFAULT_COMPANY,

      setCompany: (updates) =>
        set((state) => ({
          company: { ...state.company, ...updates },
        })),

      setProductName: (name) =>
        set((state) => {
          // Auto-generate search terms from product name
          const searchTerms = name
            ? [name, `${name} feedback`, `${name} review`, `${name} alternative`]
            : [];

          return {
            company: {
              ...state.company,
              productName: name,
              searchTerms: searchTerms,
              twitterKeywords: name ? [name, `#${name.replace(/\s+/g, '')}`] : [],
            },
          };
        }),

      setSearchTerms: (terms) =>
        set((state) => ({
          company: { ...state.company, searchTerms: terms },
        })),

      addSearchTerm: (term) =>
        set((state) => ({
          company: {
            ...state.company,
            searchTerms: [...state.company.searchTerms, term],
          },
        })),

      removeSearchTerm: (term) =>
        set((state) => ({
          company: {
            ...state.company,
            searchTerms: state.company.searchTerms.filter((t) => t !== term),
          },
        })),

      setSubreddits: (subreddits) =>
        set((state) => ({
          company: { ...state.company, subreddits },
        })),

      setCompetitors: (competitors) =>
        set((state) => ({
          company: { ...state.company, competitors },
        })),

      setEnabledSources: (sources) =>
        set((state) => ({
          company: { ...state.company, enabledSources: sources },
        })),

      setSelectedIntegrations: (integrations) =>
        set((state) => ({
          company: { ...state.company, selectedIntegrations: integrations },
        })),

      completeOnboarding: () =>
        set((state) => ({
          company: { ...state.company, onboardingCompleted: true },
        })),

      resetCompany: () => set({ company: DEFAULT_COMPANY }),

      // Get combined search query for APIs
      getSearchQuery: () => {
        const { productName, searchTerms } = get().company;
        if (searchTerms.length > 0) {
          return searchTerms[0];
        }
        return productName || 'product feedback';
      },

      // Get search terms for Reddit
      getRedditSearchTerms: () => {
        const { productName, searchTerms, competitors } = get().company;
        const terms = [...searchTerms];

        // Add competitor-related searches
        competitors.forEach((comp) => {
          terms.push(`${comp} vs`);
          terms.push(`${comp} alternative`);
        });

        // Fallback
        if (terms.length === 0 && productName) {
          terms.push(productName);
        }

        return terms.length > 0 ? terms : ['product feedback', 'feature request'];
      },

      // Get search terms for Twitter
      getTwitterSearchTerms: () => {
        const { productName, twitterKeywords, competitors } = get().company;
        const terms = [...twitterKeywords];

        // Add competitor mentions
        competitors.forEach((comp) => {
          terms.push(comp);
        });

        // Fallback
        if (terms.length === 0 && productName) {
          terms.push(productName);
        }

        return terms.length > 0 ? terms : ['product feedback'];
      },
    }),
    {
      name: 'lark-company-store',
    }
  )
);

// Helper to get company context for AI prompts
export function getCompanyContextForAI(): string {
  const store = useCompanyStore.getState();
  const { productName, productDescription, industry, targetAudience, competitors } = store.company;

  if (!productName) {
    return '';
  }

  let context = `Product: ${productName}`;
  if (productDescription) context += `\nDescription: ${productDescription}`;
  if (industry) context += `\nIndustry: ${industry}`;
  if (targetAudience) context += `\nTarget Audience: ${targetAudience}`;
  if (competitors.length > 0) context += `\nCompetitors: ${competitors.join(', ')}`;

  return context;
}

// Load company settings from Supabase
export async function loadCompanyFromSupabase(): Promise<boolean> {
  if (supabaseLoaded) return true;

  try {
    const response = await fetch('/api/company');
    const result = await response.json();

    if (result.success && result.data) {
      const data = result.data;
      const store = useCompanyStore.getState();

      store.setCompany({
        productName: data.product_name || '',
        productDescription: data.product_description || '',
        competitors: data.competitors || [],
        searchTerms: data.search_terms || [],
        subreddits: data.subreddits || [],
        twitterKeywords: data.twitter_keywords || [],
        enabledSources: data.enabled_sources || [],
        selectedIntegrations: data.selected_integrations || [],
        onboardingCompleted: data.onboarding_completed || false,
      });

      supabaseLoaded = true;
      console.log('Loaded company settings from Supabase:', data.product_name);
      return true;
    }
  } catch (err) {
    console.error('Error loading from Supabase:', err);
  }

  return false;
}

// Save company settings to Supabase
export async function saveCompanyToSupabase(): Promise<boolean> {
  const store = useCompanyStore.getState();
  const { company } = store;

  try {
    const response = await fetch('/api/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: company.productName,
        productDescription: company.productDescription,
        competitors: company.competitors,
        searchTerms: company.searchTerms,
        subreddits: company.subreddits,
        twitterKeywords: company.twitterKeywords,
        enabledSources: company.enabledSources,
        selectedIntegrations: company.selectedIntegrations,
        onboardingCompleted: company.onboardingCompleted,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (err) {
    console.error('Error saving to Supabase:', err);
    return false;
  }
}
