"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import RippleWrapper from "@/components/ui/RippleWrapper";
import { useAudioPlayer } from "@/lib/audio/songPlayer";
import { useUserStore } from "@/stores/userStore";

// Replace these placeholders with actual DB fetching
import MessageBoard from "./MessageBoard";
import MemoryTimeline from "./MemoryTimeline";
import AIChatPanel from "@/components/ai/AIChatPanel";

interface Props {
  userId: string;
  onClose: () => void;
}

type TabType = "Messages" | "Memories" | "Inside Jokes" | "Chat";

export default function ProfileModal({ userId, onClose }: Props) {
  const currentUser = useUserStore((state) => state.profile);
  const isSuperadmin = currentUser?.is_superadmin;
  
  const [activeTab, setActiveTab] = useState<TabType>("Messages");
  
  // Dummy profile logic
  const isBirthday = userId === "user_partner"; // Fake for demo
  const relationship: string = userId === "user_partner" ? "Partner" : "Friend";
  const nickname = userId === "user_partner" ? "My Love" : "Friend";
  const songSrc = isBirthday ? "/sounds/birthday.mp3" : "/sounds/default-ambient.mp3";

  // Use the audio player
  useAudioPlayer(songSrc);

  const getGlowColor = () => {
    if (relationship === "Parent") return "rgba(234, 179, 8, 0.2)";
    if (relationship === "Partner") return "rgba(244, 63, 94, 0.2)";
    if (relationship === "Friend") return "rgba(59, 130, 246, 0.2)";
    return "rgba(245, 158, 11, 0.2)"; // Amber
  };

  const getRingColor = () => {
    if (relationship === "Parent") return "ring-yellow-500";
    if (relationship === "Partner") return "ring-rose-500";
    if (relationship === "Friend") return "ring-blue-500";
    return "ring-amber-500";
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Confetti Overlay */}
      {isBirthday && <BirthdayOverlay />}

      {/* Modal Content */}
      <motion.div
        className="glass-panel w-full md:max-w-3xl h-[85vh] md:h-[80vh] flex flex-col relative overflow-hidden"
        initial={{ y: "100%", scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{ boxShadow: `0 -20px 60px ${getGlowColor()}` }}
      >
        {isBirthday && (
          <div className="w-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 py-2 text-center overflow-hidden relative">
             <motion.div
               animate={{ x: ["-100%", "100%"] }}
               transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
               className="absolute inset-0 bg-white/20 skew-x-12"
             />
             <span className="text-white font-space-grotesk font-bold tracking-wide">🎂 Happy Birthday, {nickname}! 🎂</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-6 px-6 relative">
          <div className={`w-[120px] h-[120px] rounded-full bg-white/10 ring-4 ${isBirthday ? 'animate-pulse ring-white' : getRingColor()} flex items-center justify-center overflow-hidden mb-4`}>
            {/* Placeholder Image */}
            <img src="/defaults/profile-placeholder.png" alt={nickname} className="w-full h-full object-cover opacity-80" />
          </div>
          
          <h2 className="text-3xl font-space-grotesk font-bold text-white drop-shadow-md">{nickname}</h2>
          <span className="text-white/60 font-inter text-sm uppercase tracking-widest mt-1">{relationship}</span>

          {isSuperadmin && (
            <button className="absolute top-6 right-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs transition-colors border border-white/20">
              Request Photo
            </button>
          )}

          <button onClick={onClose} className="absolute top-6 left-6 text-white/50 hover:text-white p-2">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex w-full overflow-x-auto hide-scrollbar border-b border-white/10 px-6 snap-x pb-2">
          {["Messages", "Memories", "Inside Jokes", "Chat"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`
                px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all mr-2 snap-start
                ${activeTab === tab ? 'bg-white/20 text-white shadow-lg border border-white/20' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {activeTab === "Messages" && <MessageBoard userId={userId} isOwner={currentUser?.id === userId || isSuperadmin} />}
          {activeTab === "Memories" && <MemoryTimeline userId={userId} isOwner={currentUser?.id === userId || isSuperadmin} />}
          {activeTab === "Inside Jokes" && (
            <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-2xl">
               <p className="text-white/50 italic">No inside jokes yet... Start building the lore 🧩</p>
            </div>
          )}
          {activeTab === "Chat" && <AIChatPanel userId={userId} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

function BirthdayOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Basic pseudo-confetti effect for demo. In prod, use canvas-confetti */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: -20,
            backgroundColor: ["#f43f5e", "#3b82f6", "#eab308", "#ffffff"][Math.floor(Math.random() * 4)],
          }}
          animate={{
            y: ["0vh", "100vh"],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}
