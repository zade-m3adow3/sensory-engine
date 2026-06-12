'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { useTreeStore } from '@/stores/treeStore';
import { ScrollController } from '@/components/tree/ScrollController';

// Dynamically import the TreeScene to avoid SSR issues with Three.js
const TreeScene = dynamic(() => import('@/components/tree/TreeScene').then((mod) => mod.TreeScene || mod.default), {
  ssr: false,
});

// Import ProfileModal
import { ProfileModal } from '@/components/profile/ProfileModal';

export default function TreePage() {
  const { selectedUserId, setSelectedUser } = useTreeStore();

  return (
    <div className="relative w-full bg-[#000000] text-white overflow-hidden">
      
      {/* 500vh scroll tracker with section reveal labels */}
      <ScrollController />

      {/* 3D Canvas fixed to viewport */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        <Canvas
          camera={{ position: [0, 5, 25], fov: 60 }}
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: false }}
          // Enable pointer events on canvas children
          style={{ pointerEvents: 'auto' }}
        >
          <TreeScene />
        </Canvas>
      </div>

      {/* Floating Glassmorphic UI Overlay (Top Right) */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4 p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_8px_32px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 cursor-pointer">
        <div className="flex flex-col items-end">
          <span className="text-sm font-space-grotesk font-bold text-white">My Tree</span>
          <span className="text-xs font-inter text-blue-300">My Profile</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-900 border border-white/20 flex items-center justify-center overflow-hidden">
          <span className="text-lg">✨</span>
        </div>
      </div>

      {/* Floating AI Chat Button (Bottom Right) */}
      <div className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full border border-blue-400/30 bg-blue-600/20 backdrop-blur-xl shadow-[0_0_20px_rgba(30,58,138,0.5)] cursor-pointer group">
        <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
        {/* Glowing pulse animation */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
      </div>

      {/* Profile Modal Overlay */}
      {selectedUserId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm">
          {ProfileModal ? (
            <ProfileModal 
              userId={selectedUserId} 
              onClose={() => setSelectedUser(null)} 
            />
          ) : (
            <div className="bg-[#0a0f2e] border border-white/10 p-8 rounded-xl shadow-2xl flex flex-col items-center">
              <h2 className="text-xl font-space-grotesk mb-4">Profile: {selectedUserId}</h2>
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Scroll instruction indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 opacity-50 pointer-events-none">
        <span className="text-sm font-inter tracking-widest uppercase">Scroll to Grow</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent"></div>
      </div>
    </div>
  );
}
