"use client";

import { motion } from "framer-motion";

export default function AIMessageBubble({ role, content }: { role: "user" | "ai"; content: string }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div 
        className={`max-w-[80%] px-4 py-3 rounded-2xl font-inter text-sm leading-relaxed ${
          isUser 
            ? "bg-indigo-600/80 text-white rounded-br-sm" 
            : "bg-white/10 text-white/90 rounded-bl-sm border border-white/5"
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}
