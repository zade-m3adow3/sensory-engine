import React from 'react';
import { StarField } from '@/components/ui/StarField';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(circle_at_center,_#0a0f2e_0%,_#000000_100%)] flex items-center justify-center overflow-hidden py-10 px-4">
      <StarField count={150} />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
