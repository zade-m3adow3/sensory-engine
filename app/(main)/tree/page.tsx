"use client";

import { useScrollProgress } from "@/hooks/useScrollProgress";
import TreeCanvas from "@/components/tree/TreeCanvas";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import AIChatPanel from "@/components/ai/AIChatPanel";
import { MessageCircle, User as UserIcon } from "lucide-react";
import ProfileModal from "@/components/profile/ProfileModal";

export default function TreePage() {
  const progress = useScrollProgress();
  const profile = useUserStore((state) => state.profile);
  const [label, setLabel] = useState("");

  // Labels based on scroll progress
  useEffect(() => {
    if (progress < 0.1) setLabel("");
    else if (progress < 0.3) setLabel("Your Roots 🌱");
    else if (progress < 0.5) setLabel("");
    else if (progress < 0.7) setLabel("Your Circle 🌿");
    else if (progress < 0.9) setLabel("Your World 🌸");
    else setLabel("Your Heart 🌺");
  }, [progress]);

  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <main className="relative w-full">
      {/* The 500vh container to enable scrolling */}
      <div className="h-[500vh] w-full" />
      
      {/* Fixed 3D Canvas */}
      <div className="fixed inset-0 z-0 bg-black">
        <TreeCanvas scrollProgress={progress} />
      </div>

      {/* Fixed Label Overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center">
        {label && (
          <div className="glass-panel px-6 py-3 transition-opacity duration-1000" style={{ background: "rgba(0,0,0,0.5)" }}>
            <h2 className="text-white/80 font-space-grotesk text-2xl tracking-widest uppercase">{label}</h2>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
        <button 
          onClick={() => setProfileOpen(true)}
          className="w-14 h-14 rounded-full bg-[#09090b] border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all"
        >
          <UserIcon size={24} />
        </button>
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-900 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all relative"
        >
          <MessageCircle size={24} />
          {/* subtle glow ping */}
          <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-20" />
        </button>
      </div>

      {/* Overlays */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="w-full h-12 border-b border-white/10 flex items-center justify-between px-4 bg-black/50">
            <span className="font-space-grotesk font-bold text-cyan-400">Sensory AI</span>
            <button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white">✕</button>
          </div>
          <div className="flex-1 relative">
            <AIChatPanel />
          </div>
        </div>
      )}

      {profileOpen && profile?.id && (
        <ProfileModal userId={profile.id} onClose={() => setProfileOpen(false)} />
      )}
    </main>
  );
}
