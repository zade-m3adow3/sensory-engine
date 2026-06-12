'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useTreeStore } from '@/stores/treeStore';

export function ScrollController() {
  const setTargetScrollProgress = useTreeStore((state) => state.setTargetScrollProgress);
  const setScrollProgress = useTreeStore((state) => state.setScrollProgress);
  const [label, setLabel] = useState('Your Roots 🌱');

  // RequestAnimationFrame loop for smoothing momentum
  useEffect(() => {
    let animationFrameId: number;
    
    const loop = () => {
      const state = useTreeStore.getState();
      const current = state.scrollProgress;
      const target = state.targetScrollProgress;
      
      // Lerp actual progress towards target at 0.08 per frame
      const next = current + (target - current) * 0.08;
      
      // Only set state if the change is significant enough to avoid React spamming
      if (Math.abs(target - current) > 0.0001) {
        setScrollProgress(next);
      }
      
      // Update label based on smoothed progress
      if (next < 0.3) {
        setLabel('Your Roots 🌱');
      } else if (next < 0.5) {
        setLabel('Your Circle 🌿');
      } else if (next < 0.8) {
        setLabel('Your World 🌸');
      } else {
        setLabel('Your Heart 🌺');
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [setScrollProgress]);

  // Scroll event listener sets the raw target
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const trackHeight = document.body.scrollHeight - window.innerHeight;
      let progress = scrollY / trackHeight;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      setTargetScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setTargetScrollProgress]);

  // Spring animation for floating label section reveals
  const springProps = useSpring({
    to: { opacity: 1, transform: 'translateY(0px)' },
    from: { opacity: 0, transform: 'translateY(20px)' },
    reset: true,
    key: label, // Forces the animation to restart when label string changes
    config: { tension: 120, friction: 14 }
  });

  return (
    <>
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '500vh',
          pointerEvents: 'none',
          zIndex: -1
        }} 
      />
      
      {/* Floating section reveal label */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center">
        <animated.div 
          style={springProps}
          className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white font-space-grotesk tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          {label}
        </animated.div>
      </div>
    </>
  );
}
