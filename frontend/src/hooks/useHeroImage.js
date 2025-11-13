// src/hooks/useHeroImage.js
import { useMemo } from 'react';

export const useHeroImage = (tours) => {
  return useMemo(() => {
    if (!tours.length) return 'default-hero.jpg';
    const random = Math.floor(Math.random() * tours.length);
    return `tour-${random}-1.jpg`;
  }, [tours]);
};
