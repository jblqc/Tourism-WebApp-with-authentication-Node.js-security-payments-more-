import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getReviewsByTour } from '../api/reviewApi';

export const useReviewStore = create(
  devtools(
    persist(
      (set, get) => ({
        reviews: [],
        loading: false,
        error: null,

        fetchReviews: async (tourId) => {
          set({ loading: true, error: null });
          try {
            const data = await getReviewsByTour(tourId);
            set({ reviews: data });
          } catch (err) {
            console.error('Error fetching reviews:', err);
            set({ error: err.message || 'Failed to load reviews' });
          } finally {
            set({ loading: false });
          }
        },

        clearReviews: () => set({ reviews: [] }),
      }),
      {
        name: 'review-storage',
        getStorage: () => localStorage,
      },
    ),
    { name: 'ReviewStore' },
  ),
);
