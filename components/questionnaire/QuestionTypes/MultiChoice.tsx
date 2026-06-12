import React from 'react';
import { useRipple } from '../../../hooks/useRipple';

interface MultiChoiceProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  multiSelect?: boolean;
  selectedValues?: string[];
  onMultiChange?: (vals: string[]) => void;
}

export const MultiChoice: React.FC<MultiChoiceProps> = ({ options, value, onChange, multiSelect, selectedValues, onMultiChange }) => {
  const { ripples, addRipple } = useRipple();

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>, opt: string) => {
    addRipple(e);
    if (multiSelect && selectedValues && onMultiChange) {
      if (selectedValues.includes(opt)) {
        onMultiChange(selectedValues.filter(v => v !== opt));
      } else {
        onMultiChange([...selectedValues, opt]);
      }
    } else {
      onChange(opt);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      {options.map((opt) => {
        const isSelected = multiSelect ? selectedValues?.includes(opt) : value === opt;
        return (
          <button
            key={opt}
            onClick={(e) => handleSelect(e, opt)}
            className={`ripple-container glass-interactive w-full text-left px-6 py-4 rounded-xl border transition-all ${
              isSelected 
                ? 'bg-white/20 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-white text-lg">{opt}</span>
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="ripple"
                style={{ top: ripple.y, left: ripple.x, width: ripple.size, height: ripple.size }}
              />
            ))}
          </button>
        );
      })}
    </div>
  );
};
