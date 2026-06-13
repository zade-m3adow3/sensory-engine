"use client";

import { useEffect, useState } from "react";
import { motion, animate, AnimatePresence } from "framer-motion";

export default function LoadingCounter({ nickname }: { nickname?: string }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initialising your world...");

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 3.2,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (v) => setProgress(Math.round(v)),
    });
    return controls.stop;
  }, []);

  useEffect(() => {
    if (progress <= 20)       setStatusText("Initialising your world...");
    else if (progress <= 50)  setStatusText("Loading your connections...");
    else if (progress <= 80)  setStatusText(nickname ? `Waking up for ${nickname}...` : "Building your experience...");
    else if (progress < 100)  setStatusText("Almost there...");
    else                      setStatusText(nickname ? `Welcome back, ${nickname}. ✨` : "Welcome. ✨");
  }, [progress, nickname]);

  // SVG circular progress
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // 12 tendril angles
  const tendrils = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen fixed inset-0 z-[100] bg-black">
      {/* Deep navy radial backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(3,15,40,0.96) 0%, transparent 70%)",
        }}
      />

      {/* Gauge assembly */}
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative flex items-center justify-center"
        style={{ width: 340, height: 340 }}
      >
        <svg
          width="340"
          height="340"
          viewBox="0 0 340 340"
          style={{ overflow: "visible", position: "absolute", inset: 0 }}
        >
          {/* Tendrils / rays */}
          {tendrils.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const innerR = 138;
            const isMajor = i % 3 === 0;
            const outerR = innerR + (isMajor ? 34 : i % 3 === 1 ? 20 : 12);
            const x1 = 170 + innerR * Math.cos(rad);
            const y1 = 170 + innerR * Math.sin(rad);
            const x2 = 170 + outerR * Math.cos(rad);
            const y2 = 170 + outerR * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#22d3ee"
                strokeWidth={isMajor ? 2.5 : 1.2}
                strokeLinecap="round"
                opacity={(progress / 100) * (isMajor ? 0.85 : 0.45)}
                style={{ filter: isMajor ? "drop-shadow(0 0 5px #22d3ee)" : undefined }}
              />
            );
          })}

          {/* Track ring */}
          <circle cx="170" cy="170" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="18" />

          {/* Progress arc */}
          <motion.circle
            cx="170" cy="170" r={radius}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.06 }}
            transform="rotate(-90 170 170)"
            style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.9))" }}
          />

          {/* Inner decorative rings */}
          <circle cx="170" cy="170" r="90"  fill="none" stroke="rgba(34,211,238,0.06)" strokeWidth="1" />
          <circle cx="170" cy="170" r="130" fill="none" stroke="rgba(34,211,238,0.04)" strokeWidth="1" />

          {/* 60 tick marks */}
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i * 6 * Math.PI) / 180 - Math.PI / 2;
            const isMajorTick = i % 5 === 0;
            const r1 = 128, r2 = isMajorTick ? 121 : 125;
            return (
              <line
                key={i}
                x1={170 + r1 * Math.cos(a)} y1={170 + r1 * Math.sin(a)}
                x2={170 + r2 * Math.cos(a)} y2={170 + r2 * Math.sin(a)}
                stroke={`rgba(34,211,238,${isMajorTick ? 0.38 : 0.13})`}
                strokeWidth={isMajorTick ? 2 : 1}
              />
            );
          })}

          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#6366f1" />
              <stop offset="50%"  stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Central frosted glass disc */}
        <div
          className="absolute flex flex-col items-center justify-center rounded-full"
          style={{
            width: 176, height: 176,
            background: "rgba(4,12,35,0.88)",
            backdropFilter: "blur(22px)",
            border: "1px solid rgba(34,211,238,0.18)",
            boxShadow: "0 0 50px rgba(34,211,238,0.12), inset 0 0 28px rgba(34,211,238,0.06)",
          }}
        >
          {/* Hatched pattern */}
          <svg className="absolute inset-0 opacity-[0.08] rounded-full" width="176" height="176">
            {Array.from({ length: 22 }, (_, i) => (
              <line
                key={i}
                x1={0}   y1={i * 8}
                x2={176} y2={i * 8 - 176}
                stroke="#22d3ee" strokeWidth="1"
              />
            ))}
          </svg>

          {/* Counter */}
          <AnimatePresence mode="wait">
            <motion.span
              key={progress}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.07 }}
              className="relative z-10 font-bold text-white"
              style={{
                fontFamily: "Orbitron, monospace",
                fontSize: "3.8rem",
                lineHeight: 1,
                textShadow: "0 0 30px rgba(34,211,238,1), 0 0 60px rgba(34,211,238,0.45)",
              }}
            >
              {progress}
            </motion.span>
          </AnimatePresence>
          <span
            className="relative z-10 mt-1"
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: "0.75rem",
              color: "rgba(34,211,238,0.55)",
              letterSpacing: "0.2em",
            }}
          >
            %
          </span>
        </div>
      </motion.div>

      {/* Progress bar + status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <div className="w-[300px] h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #6366f1, #22d3ee)",
              boxShadow: "0 0 14px rgba(34,211,238,0.85)",
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.28 }}
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: "0.68rem",
              letterSpacing: "0.22em",
              color: "rgba(34,211,238,0.65)",
              textTransform: "uppercase",
            }}
          >
            {statusText}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
