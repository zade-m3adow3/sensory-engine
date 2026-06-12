"use client";

import { useState } from "react";
import RippleWrapper from "../ui/RippleWrapper";

export default function MemoryTimeline({ userId, isOwner }: { userId: string, isOwner?: boolean }) {
  const [memories, setMemories] = useState([
    { id: 1, title: "The beginning", description: "When everything started.", date: "June 2023" }
  ]);
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dateStr, setDateStr] = useState("");

  const handleAdd = () => {
    if (!title || !desc || !dateStr) return;
    setMemories([...memories, { id: Date.now(), title, description: desc, date: dateStr }]);
    setShowForm(false);
    setTitle(""); setDesc(""); setDateStr("");
  };

  return (
    <div className="flex flex-col relative pl-4 border-l border-white/20 ml-2">
      {memories.map((m) => (
        <div key={m.id} className="relative mb-8 pl-6">
          <div className="absolute w-3 h-3 bg-white rounded-full -left-[23px] top-1.5 shadow-[0_0_10px_#fff]" />
          <h3 className="text-white font-space-grotesk text-lg font-bold">{m.title}</h3>
          <p className="text-white/70 font-inter text-sm my-1 leading-relaxed">{m.description}</p>
          <span className="text-white/40 text-xs font-inter uppercase tracking-wider">{m.date}</span>
        </div>
      ))}

      {isOwner && !showForm && (
        <RippleWrapper
          as="button"
          onClick={() => setShowForm(true)}
          className="self-start px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors ml-6 mt-4"
        >
          Add a memory
        </RippleWrapper>
      )}

      {showForm && (
        <div className="glass-panel p-5 ml-6 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Title (e.g. The Roadtrip)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm"
          />
          <input
            type="text"
            placeholder="Date (e.g. June 2023)"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm"
          />
          <textarea
            placeholder="What happened?"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm"
            rows={2}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-white/50 text-sm">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md text-sm transition-colors">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
