"use client";

import { useEffect, useState } from "react";
import { motion, animate, AnimatePresence } from "framer-motion";

export default function LoadingCounter({ nickname }: { nickname?: string }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALISING...");

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 3.2,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (v) => setProgress(Math.round(v)),
    });
    return controls.stop;
  }, []);

  useEffect(() => {
    if (progress <= 20)       setStatusText("INITIALISING...");
    else if (progress <= 50)  setStatusText("LOADING MODULES...");
    else if (progress <= 80)  setStatusText(nickname ? `WAKING UP ${nickname.toUpperCase()}...` : "BUILDING UNIVERSE...");
    else if (progress < 100)  setStatusText("ALMOST THERE...");
    else                      setStatusText(nickname ? `WELCOME BACK, ${nickname.toUpperCase()}` : "WELCOME TO ROUNAK'S WORLD");
  }, [progress, nickname]);

  // SVG circular progress
  const radius = 160;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen fixed inset-0 z-[100] bg-[#020612]">
      {/* Deep dark backdrop with subtle glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(6,182,212,0.08) 0%, transparent 100%)",
        }}
      />

      <div className="relative flex flex-col items-start justify-center" style={{ width: 440, height: 440 }}>
        {/* The SVG HUD */}
        <svg
          width="440"
          height="440"
          viewBox="0 0 440 440"
          className="absolute inset-0 overflow-visible"
        >
          {/* Faint background track circle */}
          <circle 
            cx="220" cy="220" r={radius} 
            fill="none" stroke="rgba(34,211,238,0.05)" strokeWidth="32" 
          />
          
          {/* Thick cyan progress arc */}
          <motion.circle
            cx="220" cy="220" r={radius}
            fill="none"
            stroke="url(#glowGrad)"
            strokeWidth="32"
            strokeLinecap="butt"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.06 }}
            transform="rotate(-90 220 220)"
            style={{ filter: "drop-shadow(0 0 25px rgba(34,211,238,0.7))" }}
          />

          {/* HUD tick marks on the outside */}
          {Array.from({ length: 36 }, (_, i) => {
            const a = (i * 10 * Math.PI) / 180 - Math.PI / 2;
            const isMajorTick = i % 3 === 0;
            const r1 = 188;
            const r2 = isMajorTick ? 204 : 194;
            return (
              <line
                key={i}
                x1={220 + r1 * Math.cos(a)} y1={220 + r1 * Math.sin(a)}
                x2={220 + r2 * Math.cos(a)} y2={220 + r2 * Math.sin(a)}
                stroke={`rgba(34,211,238,${isMajorTick ? 0.6 : 0.2})`}
                strokeWidth={isMajorTick ? 2 : 1}
                style={{ filter: isMajorTick ? "drop-shadow(0 0 5px rgba(34,211,238,0.8))" : "none" }}
              />
            );
          })}

          {/* Thin inner ring */}
          <circle cx="220" cy="220" r="132" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="1" strokeDasharray="4 8" />

          <defs>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#0ea5e9" />
              <stop offset="50%"  stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Counter & Text Overlays */}
        <div className="relative z-10 pl-[40px] pt-[60px] pointer-events-none flex items-center">


          {/* The Number */}
          <div className="relative flex items-end">
            <span
              className="font-bold text-white leading-none tracking-tighter mix-blend-plus-lighter"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "8.5rem",
                textShadow: "0 0 40px rgba(255,255,255,0.4), 0 0 20px rgba(34,211,238,0.8)",
                letterSpacing: "-0.05em",
              }}
            >
              {progress}
            </span>
            <span
              className="text-cyan-400 font-bold ml-2 mb-4 text-3xl"
              style={{
                fontFamily: "Orbitron, monospace",
                textShadow: "0 0 15px rgba(34,211,238,0.8)",
              }}
            >
              %
            </span>
          </div>
        </div>

        {/* Status Text positioned below like in screenshot */}
        <div className="absolute bottom-6 left-[40px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusText}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                fontFamily: "Orbitron, monospace",
                fontSize: "0.9rem",
                letterSpacing: "0.25em",
                color: "rgba(34,211,238,0.8)",
                textTransform: "uppercase",
                textShadow: "0 0 10px rgba(34,211,238,0.5)",
              }}
            >
              {statusText}
            </motion.p>
          </AnimatePresence>
          {/* Subtle dots beneath text */}
          <div className="flex gap-2 mt-3 ml-1">
             <div className="w-1 h-1 rounded-full bg-cyan-400 opacity-80" style={{boxShadow: "0 0 5px #22d3ee"}}/>
             <div className="w-1 h-1 rounded-full bg-cyan-400 opacity-40"/>
             <div className="w-1 h-1 rounded-full bg-cyan-400 opacity-20"/>
          </div>
        </div>

      </div>
    </div>
  );
}
