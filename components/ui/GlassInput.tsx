import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium text-white/80">{label}</label>}
      <input
        className={`glass-panel glass-interactive px-4 py-3 bg-transparent text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-white/10 ${className}`}
        {...props}
      />
    </div>
  );
};
