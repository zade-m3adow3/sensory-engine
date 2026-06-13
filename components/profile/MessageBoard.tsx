"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import RippleWrapper from "@/components/ui/RippleWrapper";

interface Message {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MessageBoard({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("profile_messages")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    const content = newMsg.trim();
    setNewMsg("");

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      content,
      created_at: new Date().toISOString(),
      author_id: userId,
    };
    setMessages((prev) => [tempMsg, ...prev]);

    const { data, error } = await supabase
      .from("profile_messages")
      .insert({ author_id: userId, content })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
      fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `Message: ${content}`, contextType: "message" }),
      }).catch(() => {});
    } else if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 mt-1">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 && (
        <div className="text-center py-14">
          <p className="text-white/30 text-sm font-inter">No messages yet — be the first to leave one.</p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-4 hover:bg-white/[0.06] transition-all group"
            style={{ borderRadius: "16px 16px 4px 16px" }}
          >
            <p className="text-white/80 font-inter text-[0.9rem] leading-relaxed whitespace-pre-wrap">{m.content}</p>
            <span className="text-white/25 text-[0.65rem] uppercase tracking-wider mt-3 block text-right group-hover:text-white/40 transition-colors">
              {formatTimestamp(m.created_at)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {isOwner && (
        <div
          className="flex flex-col gap-2 mt-2 p-3 rounded-2xl transition-all"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <textarea
            placeholder="Leave a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            rows={2}
            className="w-full bg-transparent text-white text-sm placeholder-white/25 focus:outline-none resize-none px-1"
          />
          <RippleWrapper
            as="button"
            onClick={handleSend}
            disabled={!newMsg.trim() || sending}
            className="self-end px-5 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-30 transition-all"
            style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
          >
            Send
          </RippleWrapper>
        </div>
      )}
    </div>
  );
}
