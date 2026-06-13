"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import RippleWrapper from "@/components/ui/RippleWrapper";

interface Joke {
  id: string;
  title: string;
  story: string;
  created_at: string;
}

export default function InsideJokesSection({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner?: boolean;
}) {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("inside_jokes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setJokes(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  const handleAdd = async () => {
    if (!title.trim() || !story.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("inside_jokes")
      .insert({ user_id: userId, title: title.trim(), story: story.trim() })
      .select()
      .single();

    if (!error && data) {
      setJokes((prev) => [data, ...prev]);
      fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `Inside joke "${title}": ${story}`, contextType: "joke" }),
      }).catch(() => {});
    }
    setTitle(""); setStory(""); setShowForm(false); setSaving(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mt-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3
          className="font-space-grotesk text-white/60 text-sm italic"
          style={{ borderBottom: "1px solid rgba(59,130,246,0.3)", paddingBottom: 4 }}
        >
          Things only we would understand 😂
        </h3>
      </div>

      {jokes.length === 0 && !showForm && (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-2xl text-center"
          style={{ border: "1px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}
        >
          <p className="text-white/35 text-sm font-inter">No inside jokes yet...</p>
          <p className="text-white/20 text-xs mt-1.5">Start building the lore 🧩</p>
        </div>
      )}

      {/* Masonry grid via CSS columns */}
      {jokes.length > 0 && (
        <div className="columns-2 gap-3 space-y-3">
          <AnimatePresence>
            {jokes.map((joke, i) => (
              <motion.div
                key={joke.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="break-inside-avoid glass-panel p-4 cursor-pointer hover:bg-white/[0.08] transition-all mb-3 relative overflow-hidden group"
                onClick={() => setExpandedId(expandedId === joke.id ? null : joke.id)}
                style={{
                  borderColor: expandedId === joke.id ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)",
                  boxShadow: expandedId === joke.id ? "0 0 20px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08)" : undefined
                }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="font-space-grotesk text-white/90 font-semibold text-[0.95rem] mb-2">{joke.title}</h4>
                <p
                  className={`text-white/50 text-[0.8rem] font-inter leading-relaxed transition-all duration-300 ${
                    expandedId === joke.id ? "" : "line-clamp-4"
                  }`}
                >
                  {joke.story}
                </p>
                {expandedId !== joke.id && joke.story.length > 120 && (
                  <span className="text-blue-400/50 text-[0.65rem] uppercase tracking-wider mt-2.5 block font-medium">
                    tap to read
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-4 flex flex-col gap-3 overflow-hidden mt-1"
          >
            <input
              type="text"
              placeholder="The joke / reference name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
            />
            <textarea
              placeholder="The full story behind it... (only you two will understand)"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={3}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all resize-none"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-1.5 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
              <RippleWrapper
                as="button"
                onClick={handleAdd}
                disabled={!title.trim() || !story.trim() || saving}
                className="px-5 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-all"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              >
                {saving ? "Saving..." : "Add Joke"}
              </RippleWrapper>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOwner && !showForm && (
        <RippleWrapper
          as="button"
          onClick={() => setShowForm(true)}
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white transition-all self-start"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          + Add an inside joke
        </RippleWrapper>
      )}
    </div>
  );
}
