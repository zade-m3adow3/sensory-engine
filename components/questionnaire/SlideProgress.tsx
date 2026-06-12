"use client";

import { motion } from "framer-motion";

export default function SlideProgress({ current, total, colorTheme }: { current: number; total: number; colorTheme: string }) {
  const percentage = ((current + 1) / total) * 100;
  
  const getGlowColor = () => {
    if (colorTheme === "Parent") return "bg-yellow-500 shadow-[0_0_10px_#eab308]";
    if (colorTheme === "Partner") return "bg-rose-500 shadow-[0_0_10px_#f43f5e]";
    if (colorTheme === "Friend") return "bg-blue-500 shadow-[0_0_10px_#3b82f6]";
    return "bg-amber-500 shadow-[0_0_10px_#f59e0b]";
  };

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
      <motion.div
        className={`h-full ${getGlowColor()}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ ease: "easeInOut", duration: 0.3 }}
      />
    </div>
  );
}
