"use client";

import { useState, useRef, useEffect } from "react";
import RippleWrapper from "../ui/RippleWrapper";
import AIMessageBubble from "./AIMessageBubble";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIChatPanel({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hey there! I'm here. What's on your mind?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const newHistory = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(newHistory);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages })
      });

      if (!res.ok) throw new Error("API Error");

      // Handle streaming text
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      setMessages([...newHistory, { role: "ai", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          aiResponse += chunk;
          
          setMessages(prev => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, content: aiResponse }];
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "ai", content: "I need a little break — come back in a bit!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/5 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <AIMessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-1 text-white/40 p-3 bg-white/5 rounded-2xl w-fit">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Say something..."
            className="flex-1 bg-transparent text-white placeholder-white/30 px-3 py-2 focus:outline-none font-inter text-sm"
          />
          <RippleWrapper
            as="button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-full bg-indigo-500/80 hover:bg-indigo-400 flex items-center justify-center text-white disabled:opacity-50 transition-colors"
          >
            ↑
          </RippleWrapper>
        </div>
      </div>
    </div>
  );
}
