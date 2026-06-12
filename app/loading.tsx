'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarField } from '@/components/ui/StarField';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function useCounter(target: number, duration: number) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    let animationFrame: number;
    const updateCounter = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = timestamp - startTime.current;
      
      // Cubic bezier easing approximation (ease-out cubic)
      const t = Math.min(progress / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - t, 3);
      
      setCount(Math.floor(easeOutCubic * target));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(updateCounter);
      }
    };
    
    animationFrame = requestAnimationFrame(updateCounter);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

export default function GlobalLoading() {
  const count = useCounter(100, 2500); // 0 to 100 over 2.5s
  const [nickname, setNickname] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('nickname').eq('id', session.user.id).single();
          if (data?.nickname) {
            setNickname(data.nickname);
          }
        }
      } catch (err) {
        console.error("Failed to fetch session for loading screen:", err);
      }
    };
    fetchSession();
  }, [supabase]);

  const getStatusText = () => {
    if (count <= 20) return "Initializing your world...";
    if (count <= 50) return "Loading your connections...";
    if (count <= 80) return nickname ? `Waking up for ${nickname}...` : "Waking up...";
    if (count <= 99) return "Almost there...";
    return nickname ? `Welcome back, ${nickname}. ✨` : "Welcome to Sensory Engine. ✨";
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[9999] bg-[radial-gradient(circle_at_center,_#0a0f2e_0%,_#000000_100%)] flex flex-col items-center justify-center overflow-hidden"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <StarField count={150} />

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center">
          
          {/* Glass Counter Container */}
          <div className="relative flex items-center justify-center">
            {/* Background Glass Rect */}
            <div className="absolute inset-0 -m-8 rounded-3xl bg-white/[0.04] backdrop-blur-[20px] border border-white/10" />
            
            <h1 
              className="relative text-white font-space-grotesk font-bold tabular-nums"
              style={{
                fontSize: 'clamp(80px, 15vw, 180px)',
                textShadow: '0 0 40px rgba(99, 102, 241, 0.8), 0 0 80px rgba(99, 102, 241, 0.4)'
              }}
            >
              {count}%
            </h1>
          </div>

          {/* Thin Progress Bar */}
          <div className="mt-16 w-[300px] h-1.5 rounded-full bg-white/5 border border-white/10 overflow-hidden backdrop-blur-md">
            <motion.div 
              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: `${count}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>

          {/* Status Text */}
          <motion.p 
            key={getStatusText()} // Key change forces animation re-trigger
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-sm font-inter tracking-widest text-indigo-200/80 uppercase h-6"
          >
            {getStatusText()}
          </motion.p>
        </div>

        {/* 100% White Flash */}
        {count === 100 && (
          <motion.div 
            className="absolute inset-0 bg-white z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
