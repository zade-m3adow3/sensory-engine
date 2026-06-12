import React from 'react';

interface SliderInputProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  labels: string[];
}

export const SliderInput: React.FC<SliderInputProps> = ({ min, max, value, onChange, labels }) => {
  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="relative pt-6 pb-2">
        <span 
          className="absolute -top-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-bold border border-white/20 transition-all duration-200"
          style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 16px)` }}
        >
          {value}
        </span>
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>
      <div className="flex justify-between text-white/60 text-sm font-medium">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
};
