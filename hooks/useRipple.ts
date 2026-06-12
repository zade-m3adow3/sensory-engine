'use client';

import { MouseEvent, useState, useEffect } from 'react';

export const useRipple = () => {
  const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([]);

  useEffect(() => {
    if (ripples.length > 0) {
      const timeout = setTimeout(() => {
        setRipples([]);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [ripples]);

  const addRipple = (event: MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    setRipples((prev) => [
      ...prev,
      { x, y, size, id: Date.now() },
    ]);
  };

  return { ripples, addRipple };
};
