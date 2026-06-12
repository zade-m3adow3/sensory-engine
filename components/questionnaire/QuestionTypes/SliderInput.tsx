"use client";

import { motion } from "framer-motion";

interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  colorTheme: string;
}

export default function SliderInput({ value, min = 1, max = 10, onChange, colorTheme }: Props) {
  const getGlowColor = () => {
    if (colorTheme === "Parent") return "rgba(234, 179, 8, 0.5)";
    if (colorTheme === "Partner") return "rgba(244, 63, 94, 0.5)";
    if (colorTheme === "Friend") return "rgba(59, 130, 246, 0.5)";
    return "rgba(245, 158, 11, 0.5)";
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full max-w-md mx-auto mt-8 relative pb-8">
      {/* Floating bubble */}
      <motion.div 
        className="absolute -top-12 -ml-5 w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white font-bold"
        animate={{ left: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ boxShadow: `0 0 15px ${getGlowColor()}` }}
      >
        {value}
      </motion.div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none"
        style={{
          background: `linear-gradient(to right, ${getGlowColor().replace('0.5', '1')} ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`
        }}
      />
      
      <div className="flex justify-between mt-3 text-white/50 text-sm font-inter">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
