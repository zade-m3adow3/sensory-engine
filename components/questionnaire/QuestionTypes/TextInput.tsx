import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isLong?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, placeholder, isLong }) => {
  const baseClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all glass-interactive shadow-inner";
  
  return (
    <div className="mt-6 w-full">
      {isLong ? (
        <textarea
          rows={5}
          className={`${baseClasses} resize-none`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className={baseClasses}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};
