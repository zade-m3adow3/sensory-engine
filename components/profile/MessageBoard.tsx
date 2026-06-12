"use client";

import { useState } from "react";
import RippleWrapper from "../ui/RippleWrapper";

export default function MessageBoard({ userId, isOwner }: { userId: string, isOwner?: boolean }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "I'm so glad we built this place.", date: "Today" }
  ]);
  const [newMsg, setNewMsg] = useState("");

  const handlePost = () => {
    if (!newMsg.trim()) return;
    setMessages([{ id: Date.now(), text: newMsg, date: "Just now" }, ...messages]);
    setNewMsg("");
  };

  return (
    <div className="flex flex-col gap-4">
      {isOwner && (
        <div className="glass-panel p-4 flex flex-col gap-3">
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Leave a message..."
            rows={3}
          />
          <RippleWrapper
            as="button"
            onClick={handlePost}
            className="self-end px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors"
          >
            Post
          </RippleWrapper>
        </div>
      )}

      {messages.map(m => (
        <div key={m.id} className="glass-panel p-5 hover:bg-white/10 transition-colors">
          <p className="text-white/90 font-inter leading-relaxed">{m.text}</p>
          <div className="text-right text-white/40 text-xs mt-3">{m.date}</div>
        </div>
      ))}
    </div>
  );
}
