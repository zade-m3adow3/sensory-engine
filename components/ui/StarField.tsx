'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export function StarField({ count = 150 }: { count?: number }) {
  // Memoize random values so they don't jump around on re-renders
  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1 + 1, // 1px to 2px
        duration: Math.random() * 3 + 2, // 2s to 5s
        delay: Math.random() * 5, // 0 to 5s delay
      });
    }
    return arr;
  }, [count]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
