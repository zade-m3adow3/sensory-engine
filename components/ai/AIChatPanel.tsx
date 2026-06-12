'use client';

import React, { useState } from 'react';

interface AIChatPanelProps {
  relationshipType: string;
  nickname: string;
}

export function AIChatPanel({ relationshipType, nickname }: AIChatPanelProps) {
  const [input, setInput] = useState('');
  
  // Dynamic Initial Greeting
  const getGreeting = (type: string, name: string) => {
    if (type === 'parent') return `Hello ${name}, how are you doing today?`;
    if (type === 'friend') return `Hey ${name}! What's up?`;
    if (type === 'romantic_partner') return `Hey love. Thinking of you, ${name}.`;
    return `Hi ${name}, how can I help you today?`;
  };

  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: getGreeting(relationshipType, nickname) }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), role: 'user', content: input }]);
    setInput('');
    // TODO: Wire up actual useChat stream from ai/react
  };

  return (
    <div className="flex flex-col h-full bg-white/[0.02] rounded-xl overflow-hidden backdrop-blur-md border border-white/5 pointer-events-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-blue-600/30 border border-blue-400/20 text-white rounded-tr-sm backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'bg-black/40 border border-white/10 text-white/90 shadow-[0_0_15px_rgba(255,255,255,0.05)] rounded-tl-sm backdrop-blur-xl'
            }`}>
              <p className="text-sm font-inter leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {/* Placeholder typing indicator could go here */}
      </div>
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex gap-2">
          <input 
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
          />
          <button 
            onClick={handleSend}
            className="bg-indigo-600/80 hover:bg-indigo-500/80 text-white rounded-full px-5 py-2 text-sm transition-colors shadow-[0_0_10px_rgba(79,70,229,0.5)] border border-indigo-400/30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
