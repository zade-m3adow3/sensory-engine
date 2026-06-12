"use client";

import { useState, MouseEvent } from "react";

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    
    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    
    // Clean up ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600); // 600ms matches the globals.css animation
  };

  return { ripples, addRipple };
}
