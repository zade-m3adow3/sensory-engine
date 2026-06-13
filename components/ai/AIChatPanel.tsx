"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RippleWrapper from "@/components/ui/RippleWrapper";

interface Message {
  role: "user" | "ai";
  content: string;
  isStreaming?: boolean;
}

interface Props {
  userId: string;
  nickname?: string;
  relationshipType?: string;
}

const GREETINGS: Record<string, string> = {
  parent:          "Hello — it's so lovely to have you here. How are you doing today?",
  relative:        "Hey! Really glad you're here. What's on your mind?",
  cousin:          "Hey! Good to see you in here. What's up?",
  friend:          "Hey! What's good? 😄",
  romantic_partner:"Hey you. It's really nice to see you here.",
};

function buildGreeting(type?: string, name?: string): string {
  const base = GREETINGS[type ?? "friend"] ?? GREETINGS.friend;
  if (!name) return base;
  return base
    .replace("Hello —", `Hello, ${name} —`)
    .replace("Hey!", `Hey, ${name}!`)
    .replace("Hey you.", `Hey, ${name}.`);
}

export default function AIChatPanel({ userId, nickname, relationshipType }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: buildGreeting(relationshipType, nickname) },
  ]);
  const [input, setInput]     = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMsg: Message = { role: "user", content: text };

    setMessages((prev) => [...prev, userMsg, { role: "ai", content: "", isStreaming: true }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok || !res.body) throw new Error("Network error");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            setMessages((prev) =>
              prev.map((m, i) => (i === prev.length - 1 ? { ...m, isStreaming: false } : m))
            );
            setIsTyping(false);
            return;
          }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: m.content + parsed.text } : m
                )
              );
            } else if (parsed.error) {
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: parsed.error, isStreaming: false } : m
                )
              );
              setIsTyping(false);
              return;
            }
          } catch { /* malformed line — skip */ }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, content: "Something went wrong — try again in a moment.", isStreaming: false }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 420 }}>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[82%] px-4 py-3 text-sm leading-relaxed font-inter"
                style={{
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                      : "rgba(255,255,255,0.06)",
                  border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.08)" : "none",
                  color: msg.role === "user" ? "#fff" : "rgba(255,255,255,0.88)",
                }}
              >
                {msg.content || (msg.isStreaming ? null : "...")}
                {msg.isStreaming && msg.content === "" && (
                  /* typing dots while waiting for first token */
                  <span className="inline-flex items-center gap-1">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="w-1.5 h-1.5 bg-cyan-400/70 rounded-full inline-block"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: d * 0.14 }}
                      />
                    ))}
                  </span>
                )}
                {msg.isStreaming && msg.content !== "" && (
                  /* cursor blink while streaming */
                  <motion.span
                    className="inline-block w-0.5 h-3.5 bg-cyan-400 ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="flex items-center gap-3 p-3 rounded-2xl mt-2 flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <input
          ref={inputRef}
          id="ai-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          disabled={isTyping}
          className="flex-1 bg-transparent text-white text-sm placeholder-white/22 focus:outline-none"
        />
        <RippleWrapper
          as="button"
          id="ai-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
          className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-28 transition-all flex-shrink-0"
          style={{
            background:
              input.trim() && !isTyping
                ? "linear-gradient(135deg, #6366f1, #22d3ee)"
                : "rgba(255,255,255,0.08)",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </RippleWrapper>
      </div>
    </div>
  );
}
