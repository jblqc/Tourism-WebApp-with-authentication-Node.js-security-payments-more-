// src/store/useTourStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getAllTours, getTour } from '../api/tourApi';

export const useTourStore = create(
  devtools(
    persist(
      (set) => ({
        tours: [],
        currentTour: null,
        loading: false,
        error: null,

        fetchTours: async () => {
          set({ loading: true, error: null });
          try {
            const data = await getAllTours();
            set({ tours: data });
            console.log(`✅ Loaded ${data.length} tours`);
          } catch (err) {
            console.error('❌ Error fetching tours:', err);
            set({ error: err.message });
          } finally {
            set({ loading: false });
          }
        },

        fetchTour: async (slug) => {
          set({ loading: true, error: null });
          try {
            const data = await getTour(slug);
            set({ currentTour: data });
          } catch (err) {
            set({ error: err.message });
          } finally {
            set({ loading: false });
          }
        },
        setCurrentTour: (tour) => set({ currentTour: tour }),
      }),
      {
        name: 'tour-storage', // localStorage key
        getStorage: () => localStorage,
      },
    ),
    { name: 'TourStore' }, // shows up as "TourStore" in Redux DevTools
  ),
);
