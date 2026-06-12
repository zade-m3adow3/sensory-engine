'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface BirthdayOverlayProps {
  nickname: string;
  onDismiss: () => void;
}

export function BirthdayOverlay({ nickname, onDismiss }: BirthdayOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Launch confetti ribbons from top corners
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.2 },
        colors: ['#f59e0b', '#f43f5e', '#3b82f6', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.2 },
        colors: ['#f59e0b', '#f43f5e', '#3b82f6', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Play Web Audio API birthday sound
    audioRef.current = new Audio('/sounds/birthday.mp3');
    // Attempt autoplay, but fallback to interaction if blocked
    audioRef.current.play().catch((err) => {
      console.warn('Autoplay blocked. Waiting for first interaction.', err);
      const playOnInteract = () => {
        audioRef.current?.play();
        window.removeEventListener('click', playOnInteract);
      };
      window.addEventListener('click', playOnInteract);
    });

    // Auto fade out after 8 seconds if not manually dismissed
    const timer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 500); // Wait for AnimatePresence exit animation
  };

  return (
    <AnimatePresence>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <div className="absolute top-[10%] w-full flex justify-center pointer-events-auto">
            <motion.div 
              initial={{ y: -50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              className="relative px-12 py-6 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.4)] overflow-hidden"
            >
              {/* CSS Shimmer Animation via global styles or inline keyframe fallback */}
              <div 
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" 
                style={{ animation: 'shimmer 2s infinite' }}
              />
              
              <button 
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
              
              <h2 className="text-3xl sm:text-4xl font-space-grotesk font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                🎂 Happy Birthday, {nickname}! 🎂
              </h2>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
