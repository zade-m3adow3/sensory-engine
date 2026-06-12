"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation, useMotionValue, animate } from "framer-motion";

export default function LoadingCounter({
  nickname,
}: {
  nickname?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 3,
      ease: [0.25, 1, 0.5, 1], // "starts fast and slows as it approaches the end"
      onUpdate: (value) => {
        setProgress(Math.round(value));
      },
    });
    return controls.stop;
  }, []);

  let statusText = "Initialising your world...";
  if (progress > 20 && progress <= 50) statusText = "Loading your connections...";
  else if (progress > 50 && progress <= 80) statusText = nickname ? `Waking up for ${nickname}...` : "Building your experience...";
  else if (progress > 80 && progress < 100) statusText = "Almost there...";
  else if (progress === 100) statusText = nickname ? `Welcome back, ${nickname}. ✨` : "Welcome. ✨";

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen fixed inset-0 z-[100] bg-transparent">
      {/* Number Container */}
      <motion.div
        className="glass-panel p-8 mb-8 relative flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <span className="font-space-grotesk text-8xl md:text-9xl font-bold tracking-tighter text-white z-10 drop-shadow-lg">
          {progress}
        </span>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-[300px] h-[2px] bg-white/10 rounded-full overflow-hidden relative mb-4">
        <motion.div
          className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Text */}
      <motion.p
        className="text-white/60 font-inter text-sm tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={statusText} // Animates when text changes
      >
        {statusText}
      </motion.p>
      
      {/* White flash on completion handled by parent */}
    </div>
  );
}
