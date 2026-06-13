"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function BirthdayOverlay() {
  useEffect(() => {
    const end = Date.now() + 8000;
    const colors = ["#f43f5e", "#3b82f6", "#eab308", "#ffffff", "#a855f7", "#22d3ee"];

    function frame() {
      confetti({ particleCount: 7, angle: 60,  spread: 72, origin: { x: 0, y: 0.58 }, colors, zIndex: 9999 });
      confetti({ particleCount: 7, angle: 120, spread: 72, origin: { x: 1, y: 0.58 }, colors, zIndex: 9999 });
      if (Date.now() < end) requestAnimationFrame(frame);
    }
    frame();
  }, []);

  return null; // canvas-confetti manages its own canvas element
}
