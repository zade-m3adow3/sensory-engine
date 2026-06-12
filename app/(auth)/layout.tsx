import React from 'react';
import { StarField } from '@/components/ui/StarField';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(circle_at_center,_#0a0f2e_0%,_#000000_100%)] flex items-center justify-center overflow-hidden">
      <StarField count={150} />
      
      <div className="relative z-10 w-full max-w-md p-10 bg-white/[0.04] backdrop-blur-[24px] border border-white/10 rounded-[24px] shadow-[0_0_60px_rgba(99,102,241,0.2),_0_0_120px_rgba(99,102,241,0.08)]">
        {children}
      </div>
    </div>
  );
}
