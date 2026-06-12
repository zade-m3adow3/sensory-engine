import React from 'react';

interface SlideProgressProps {
  current: number;
  total: number;
}

export const SlideProgress: React.FC<SlideProgressProps> = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex justify-between text-white/60 text-sm font-medium mb-3">
        <span>Question {current} of {total}</span>
        <span>{percentage}% Complete</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
