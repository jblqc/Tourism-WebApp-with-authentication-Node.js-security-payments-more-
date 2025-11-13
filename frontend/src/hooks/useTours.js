// src/hooks/useTours.js
import { useMemo } from 'react';
import { useTourStore } from '../store/useTourStore';

/**
 * useTours - derived data and logic from global store.
 * Keeps Home.jsx, Tours.jsx, and TourDetail.jsx clean.
 */
export const useTours = () => {
  const { tours, loading, error, fetchTours } = useTourStore();

  // ✅ handle cases where image is an embedded URL
  const normalizeImage = (img) => {
    if (!img) return '/img/default.jpg';
    if (img.startsWith('http') || img.startsWith('data:image')) return img; // remote or base64
    return `/img/tours/${img}`; // fallback to local public folder
  };

  // ✅ Random hero background (safe when empty)
  const hero = useMemo(() => {
    if (!tours.length) return 'default-hero.jpg';
    const randomIndex = Math.floor(Math.random() * tours.length);
    return normalizeImage(tours[randomIndex].imageCover);
  }, [tours]);

  // ✅ Random shuffle (memoized)
  const shuffled = useMemo(() => {
    return [...tours].sort(() => 0.5 - Math.random());
  }, [tours]);

  // ✅ Derived lists
  const featured = shuffled.slice(0, 3);
  const miniGrid = shuffled.slice(3, 7);

  // ✅ Normalized tours (auto-resolve image paths)
  const normalizedTours = useMemo(
    () =>
      tours.map((tour) => ({
        ...tour,
        imageCover: normalizeImage(tour.imageCover),
        images: tour.images?.map(normalizeImage) ?? [],
      })),
    [tours],
  );

  return {
    tours: normalizedTours,
    featured,
    miniGrid,
    hero,
    loading,
    error,
    fetchTours,
  };
};
