"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/userStore";
import MessageBoard from "./MessageBoard";
import MemoryTimeline from "./MemoryTimeline";
import InsideJokesSection from "./InsideJokesSection";
import AIChatPanel from "@/components/ai/AIChatPanel";
import BirthdayOverlay from "./BirthdayOverlay";

interface ProfileData {
  id: string;
  nickname: string;
  relationship_type: string;
  avatar_url: string | null;
  birthdate: string | null;
  song_url: string | null;
  priority_score: number;
}

type TabType = "Messages" | "Memories" | "Inside Jokes" | "Chat";

const REL_COLORS: Record<string, { ring: string; glow: string; tabClass: string; label: string }> = {
  parent:          { ring: "ring-yellow-500", glow: "rgba(234,179,8,0.22)",   tabClass: "tab-gold",  label: "Parent"  },
  relative:        { ring: "ring-amber-500",  glow: "rgba(245,158,11,0.22)",  tabClass: "tab-amber", label: "Relative"},
  cousin:          { ring: "ring-amber-400",  glow: "rgba(251,191,36,0.22)",  tabClass: "tab-amber", label: "Cousin"  },
  friend:          { ring: "ring-blue-500",   glow: "rgba(59,130,246,0.22)",  tabClass: "tab-blue",  label: "Friend"  },
  romantic_partner:{ ring: "ring-rose-500",   glow: "rgba(244,63,94,0.22)",   tabClass: "tab-rose",  label: "Partner" },
};

function isTodayBirthday(birthdate: string | null): boolean {
  if (!birthdate) return false;
  const today = new Date();
  const bd    = new Date(birthdate);
  return today.getMonth() === bd.getMonth() && today.getDate() === bd.getDate();
}

interface Props { userId: string; onClose: () => void; }

export default function ProfileModal({ userId, onClose }: Props) {
  const currentUser  = useUserStore((s) => s.profile);
  const isSuperadmin = currentUser?.is_superadmin;
  const isOwner      = currentUser?.id === userId;

  const [activeTab, setActiveTab] = useState<TabType>("Messages");
  const [profile,   setProfile]   = useState<ProfileData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);

  const isBirthday = isTodayBirthday(profile?.birthdate ?? null);
  const rel        = profile?.relationship_type ?? "friend";
  const colors     = REL_COLORS[rel] ?? REL_COLORS.friend;

  /* Load real profile from Supabase */
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,nickname,relationship_type,avatar_url,birthdate,song_url,priority_score")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
        if (data.avatar_url) {
          const { data: signed } = await supabase.storage
            .from("avatars")
            .createSignedUrl(data.avatar_url, 3600);
          if (signed?.signedUrl) setAvatarUrl(signed.signedUrl);
        }
      }
      setLoading(false);
    })();
  }, [userId]);

  /* Audio: fade in on open, fade out on close */
  useEffect(() => {
    if (!profile) return;

    const songPath = isBirthday
      ? "/sounds/birthday.mp3"
      : profile.song_url && !profile.song_url.startsWith("http")
        ? `/sounds/${profile.song_url}`
        : "/sounds/default-ambient.mp3";

    const audio   = new Audio(songPath);
    audio.loop    = true;
    audio.volume  = 0;
    audio.play().catch(() => {});

    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.04, 0.38);
      audio.volume = vol;
      if (vol >= 0.38) clearInterval(fadeIn);
    }, 90);

    return () => {
      clearInterval(fadeIn);
      let v = audio.volume;
      const fadeOut = setInterval(() => {
        v = Math.max(v - 0.05, 0);
        audio.volume = v;
        if (v <= 0) { clearInterval(fadeOut); audio.pause(); }
      }, 55);
    };
  }, [profile, isBirthday]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)" }}
        onClick={onClose}
      />

      {/* Birthday confetti */}
      {isBirthday && <BirthdayOverlay />}

      {/* Modal panel */}
      <motion.div
        className="glass-panel w-full md:max-w-3xl h-[88vh] md:h-[82vh] flex flex-col relative overflow-hidden z-10"
        initial={{ y: "100%", scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        style={{ boxShadow: `0 -30px 90px ${colors.glow}, 0 0 0 1px rgba(255,255,255,0.06)` }}
      >
        {/* Birthday banner */}
        {isBirthday && profile && (
          <div
            className="w-full py-2.5 text-center relative overflow-hidden flex-shrink-0"
            style={{ background: "linear-gradient(90deg, #f43f5e, #a855f7, #6366f1, #22d3ee, #f43f5e)", backgroundSize: "200% auto", animation: "shimmer 4s linear infinite" }}
          >
            <span className="font-space-grotesk font-bold text-white text-sm tracking-wide">
              🎂 Happy Birthday, {profile.nickname}! 🎂
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col items-center pt-7 pb-5 px-6 relative flex-shrink-0">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 left-5 w-8 h-8 rounded-full flex items-center justify-center text-white/35 hover:text-white hover:bg-white/8 transition-all"
          >✕</button>

          {/* Request photo (superadmin only) */}
          {isSuperadmin && (
            <button
              className="absolute top-5 right-5 px-3 py-1.5 text-xs rounded-full text-white/55 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Request Photo
            </button>
          )}

          {/* Avatar */}
          <div
            className={`w-28 h-28 rounded-full ring-4 ${isBirthday ? "ring-white animate-pulse" : colors.ring} overflow-hidden flex-shrink-0 mb-4`}
            style={{
              background: "rgba(255,255,255,0.05)",
              boxShadow: `0 0 35px ${colors.glow}`,
            }}
          >
            {loading ? (
              <div className="w-full h-full bg-white/8 animate-pulse" />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt={profile?.nickname} className="w-full h-full object-cover" />
            ) : (
              <img
                src="/defaults/profile-placeholder.png"
                alt={profile?.nickname ?? "User"}
                className="w-full h-full object-cover opacity-65"
              />
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-2 mt-1">
              <div className="h-7 w-36 bg-white/8 rounded-lg animate-pulse" />
              <div className="h-3.5 w-20 bg-white/5 rounded-md animate-pulse mt-1" />
            </div>
          ) : (
            <>
              <h2 className="text-[1.85rem] font-space-grotesk font-bold text-white">{profile?.nickname}</h2>
              <span
                className="text-white/38 text-[0.65rem] uppercase mt-1.5 font-inter"
                style={{ letterSpacing: "0.32em" }}
              >
                {colors.label}
              </span>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex px-6 gap-1.5 border-b border-white/[0.06] pb-3 flex-shrink-0 overflow-x-auto hide-scrollbar">
          {(["Messages", "Memories", "Inside Jokes", "Chat"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? `text-white ${colors.tabClass}`
                  : "text-white/38 hover:text-white/65 hover:bg-white/5"
              }`}
              style={
                activeTab === tab
                  ? { background: "rgba(255,255,255,0.07)", border: "1px solid" }
                  : { border: "1px solid transparent" }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!loading && profile && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === "Messages"     && <MessageBoard userId={userId} isOwner={isOwner || !!isSuperadmin} />}
                {activeTab === "Memories"     && <MemoryTimeline userId={userId} isOwner={isOwner || !!isSuperadmin} />}
                {activeTab === "Inside Jokes" && <InsideJokesSection userId={userId} isOwner={isOwner || !!isSuperadmin} />}
                {activeTab === "Chat"         && <AIChatPanel userId={userId} nickname={profile.nickname} relationshipType={profile.relationship_type} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
