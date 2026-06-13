"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import RippleWrapper from "@/components/ui/RippleWrapper";

interface Memory {
  id: string;
  title: string;
  description: string | null;
  memory_date: string | null;
  media_url: string | null;
  created_at: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function MemoryTimeline({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner?: boolean;
}) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("memory_timeline")
      .select("*")
      .eq("user_id", userId)
      .order("memory_date", { ascending: true })
      .then(({ data }) => {
        setMemories(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("memory_timeline")
      .insert({
        user_id: userId,
        title: title.trim(),
        description: desc.trim() || null,
        memory_date: dateStr || null,
      })
      .select()
      .single();

    if (!error && data) {
      setMemories((prev) => {
        const newArr = [...prev, data];
        newArr.sort((a, b) => {
          if (!a.memory_date) return 1;
          if (!b.memory_date) return -1;
          return new Date(a.memory_date).getTime() - new Date(b.memory_date).getTime();
        });
        return newArr;
      });
      // Background embed
      fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Memory titled "${title}": ${desc}`,
          contextType: "memory",
        }),
      }).catch(() => {});
    }
    setTitle(""); setDesc(""); setDateStr("");
    setShowForm(false);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {memories.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-[2.5rem] mb-4">📸</div>
          <p className="text-white/40 font-inter text-sm">No memories yet...</p>
          <p className="text-white/25 text-xs mt-1.5">The story starts whenever you add the first one.</p>
        </div>
      )}

      {/* Timeline */}
      <div className="relative pl-7 border-l border-white/10 ml-2 mt-2">
        <AnimatePresence>
          {memories.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative mb-9"
            >
              {/* Timeline Dot */}
              <div
                className="absolute -left-[35.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-400"
                style={{ background: "rgba(99,102,241,0.25)", boxShadow: "0 0 12px rgba(99,102,241,0.5)" }}
              />
              <h3 className="text-white font-space-grotesk text-base font-semibold">{m.title}</h3>
              {m.description && (
                <p className="text-white/55 font-inter text-sm mt-1.5 leading-relaxed">{m.description}</p>
              )}
              {m.memory_date && (
                <span className="text-white/30 text-[0.68rem] uppercase tracking-[0.1em] mt-2 block font-medium">
                  {formatDate(m.memory_date)}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel p-4 flex flex-col gap-3 mb-6 relative overflow-hidden"
            >
              <input
                type="text"
                placeholder="Memory title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
              />
              <input
                type="month"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
              />
              <textarea
                placeholder="What happened? Paint the scene..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all resize-none"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-1.5 text-white/40 text-sm hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
                <RippleWrapper
                  as="button"
                  onClick={handleAdd}
                  disabled={!title.trim() || saving}
                  className="px-5 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
                >
                  {saving ? "Saving..." : "Save Memory"}
                </RippleWrapper>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isOwner && !showForm && (
        <RippleWrapper
          as="button"
          onClick={() => setShowForm(true)}
          className="mt-3 ml-2 px-5 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          + Add a memory
        </RippleWrapper>
      )}
    </div>
  );
}
