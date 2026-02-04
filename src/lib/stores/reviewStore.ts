import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DraftedTicket,
  FeedbackItem,
  ClassificationResult,
  ReviewFilters,
  ReviewStatus,
  QueueStats,
  PipelineJob,
  PipelineNotification,
  FeedbackCategory,
  Priority,
  createDraftId,
} from '@/types/pipeline';

interface ReviewStore {
  // State
  drafts: DraftedTicket[];
  filters: ReviewFilters;
  selectedIds: string[];
  pipelineJobs: PipelineJob[];
  notifications: PipelineNotification[];

  // Draft actions
  addDraft: (draft: DraftedTicket) => void;
  addDrafts: (drafts: DraftedTicket[]) => void;
  updateDraft: (id: string, updates: Partial<DraftedTicket>) => void;
  removeDraft: (id: string) => void;
  clearDrafts: () => void;

  // Review actions
  approveDraft: (id: string, platform: 'linear' | 'jira' | 'github' | 'notion', ticketResult?: { ticketId: string; ticketUrl: string }) => void;
  rejectDraft: (id: string, reason?: string) => void;
  editDraft: (id: string, editedDraft: DraftedTicket['editedDraft']) => void;

  // Bulk actions
  selectDraft: (id: string) => void;
  deselectDraft: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  bulkApprove: (platform: 'linear' | 'jira' | 'github' | 'notion') => void;
  bulkReject: (reason?: string) => void;

  // Filter actions
  setFilters: (filters: Partial<ReviewFilters>) => void;
  clearFilters: () => void;

  // Pipeline job actions
  addJob: (job: PipelineJob) => void;
  updateJob: (id: string, updates: Partial<PipelineJob>) => void;
  clearJobs: () => void;

  // Notification actions
  addNotification: (notification: Omit<PipelineNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Computed / Getters
  getFilteredDrafts: () => DraftedTicket[];
  getStats: () => QueueStats;
  getPendingCount: () => number;
  getUrgentCount: () => number;
  getUnreadNotificationCount: () => number;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      // Initial state
      drafts: [],
      filters: {},
      selectedIds: [],
      pipelineJobs: [],
      notifications: [],

      // Draft actions
      addDraft: (draft) =>
        set((state) => ({
          drafts: [draft, ...state.drafts],
        })),

      addDrafts: (drafts) =>
        set((state) => ({
          drafts: [...drafts, ...state.drafts],
        })),

      updateDraft: (id, updates) =>
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        })),

      removeDraft: (id) =>
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        })),

      clearDrafts: () => set({ drafts: [], selectedIds: [] }),

      // Review actions
      approveDraft: (id, platform, ticketResult) =>
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: 'approved' as ReviewStatus,
                  reviewedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdTicket: ticketResult
                    ? { platform, ...ticketResult }
                    : undefined,
                }
              : d
          ),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        })),

      rejectDraft: (id, reason) =>
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: 'rejected' as ReviewStatus,
                  rejectionReason: reason,
                  reviewedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        })),

      editDraft: (id, editedDraft) =>
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: 'edited' as ReviewStatus,
                  editedDraft,
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        })),

      // Bulk actions
      selectDraft: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds
            : [...state.selectedIds, id],
        })),

      deselectDraft: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        })),

      selectAll: () =>
        set((state) => ({
          selectedIds: get()
            .getFilteredDrafts()
            .filter((d) => d.status === 'pending')
            .map((d) => d.id),
        })),

      deselectAll: () => set({ selectedIds: [] }),

      bulkApprove: (platform) => {
        const { selectedIds, approveDraft } = get();
        selectedIds.forEach((id) => approveDraft(id, platform));
      },

      bulkReject: (reason) => {
        const { selectedIds, rejectDraft } = get();
        selectedIds.forEach((id) => rejectDraft(id, reason));
      },

      // Filter actions
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      clearFilters: () => set({ filters: {} }),

      // Pipeline job actions
      addJob: (job) =>
        set((state) => ({
          pipelineJobs: [job, ...state.pipelineJobs.slice(0, 19)], // Keep last 20
        })),

      updateJob: (id, updates) =>
        set((state) => ({
          pipelineJobs: state.pipelineJobs.map((j) =>
            j.id === id ? { ...j, ...updates } : j
          ),
        })),

      clearJobs: () => set({ pipelineJobs: [] }),

      // Notification actions
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...state.notifications.slice(0, 49), // Keep last 50
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),

      // Computed / Getters
      getFilteredDrafts: () => {
        const { drafts, filters } = get();

        return drafts.filter((draft) => {
          // Status filter
          if (filters.status && filters.status !== 'all' && draft.status !== filters.status) {
            return false;
          }

          // Category filter
          if (
            filters.category &&
            filters.category !== 'all' &&
            draft.classification.category !== filters.category
          ) {
            return false;
          }

          // Priority filter
          if (
            filters.priority &&
            filters.priority !== 'all' &&
            draft.classification.priority !== filters.priority
          ) {
            return false;
          }

          // Source filter
          if (
            filters.source &&
            filters.source !== 'all' &&
            draft.feedbackItem.source !== filters.source
          ) {
            return false;
          }

          // Search filter
          if (filters.search) {
            const search = filters.search.toLowerCase();
            const matchesContent =
              draft.feedbackItem.content.toLowerCase().includes(search) ||
              draft.feedbackItem.title?.toLowerCase().includes(search) ||
              draft.draft.title.toLowerCase().includes(search) ||
              draft.draft.description.toLowerCase().includes(search);
            if (!matchesContent) {
              return false;
            }
          }

          // Date range filter
          if (filters.dateRange) {
            const createdAt = new Date(draft.createdAt);
            const start = new Date(filters.dateRange.start);
            const end = new Date(filters.dateRange.end);
            if (createdAt < start || createdAt > end) {
              return false;
            }
          }

          return true;
        });
      },

      getStats: () => {
        const { drafts } = get();

        const stats: QueueStats = {
          total: drafts.length,
          pending: 0,
          approved: 0,
          rejected: 0,
          byCategory: {
            bug: 0,
            feature_request: 0,
            praise: 0,
            question: 0,
            complaint: 0,
            other: 0,
          },
          byPriority: {
            urgent: 0,
            high: 0,
            medium: 0,
            low: 0,
          },
          bySource: {},
        };

        drafts.forEach((draft) => {
          // Status counts
          if (draft.status === 'pending' || draft.status === 'edited') {
            stats.pending++;
          } else if (draft.status === 'approved') {
            stats.approved++;
          } else if (draft.status === 'rejected') {
            stats.rejected++;
          }

          // Category counts
          stats.byCategory[draft.classification.category]++;

          // Priority counts
          stats.byPriority[draft.classification.priority]++;

          // Source counts
          const source = draft.feedbackItem.source;
          stats.bySource[source] = (stats.bySource[source] || 0) + 1;
        });

        return stats;
      },

      getPendingCount: () => {
        const { drafts } = get();
        return drafts.filter((d) => d.status === 'pending' || d.status === 'edited').length;
      },

      getUrgentCount: () => {
        const { drafts } = get();
        return drafts.filter(
          (d) =>
            (d.status === 'pending' || d.status === 'edited') &&
            d.classification.priority === 'urgent'
        ).length;
      },

      getUnreadNotificationCount: () => {
        const { notifications } = get();
        return notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: 'lark-review-store',
      partialize: (state) => ({
        drafts: state.drafts,
        notifications: state.notifications.slice(0, 20), // Only persist recent notifications
      }),
    }
  )
);

// Helper function to create a draft from feedback and classification
export function createDraftFromFeedback(
  feedbackItem: FeedbackItem,
  classification: ClassificationResult,
  draft: { title: string; description: string; suggestedLabels: string[]; suggestedPriority: Priority }
): DraftedTicket {
  const now = new Date().toISOString();
  return {
    id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    feedbackItem,
    classification,
    draft,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}
