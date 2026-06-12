"use client";

import RippleWrapper from "@/components/ui/RippleWrapper";

interface Props {
  options: string[];
  selected: string[];
  onSelect: (val: string[]) => void;
  colorTheme: string;
}

export default function MultiSelect({ options, selected, onSelect, colorTheme }: Props) {
  const toggleSelect = (opt: string) => {
    if (selected.includes(opt)) {
      onSelect(selected.filter((s) => s !== opt));
    } else {
      onSelect([...selected, opt]);
    }
  };

  const getThemeClasses = (isSelected: boolean) => {
    if (!isSelected) return "border-white/10 bg-white/5 hover:bg-white/10 text-white/70";
    if (colorTheme === "Parent") return "border-yellow-500/50 bg-yellow-500/20 text-white scale-[1.02]";
    if (colorTheme === "Partner") return "border-rose-500/50 bg-rose-500/20 text-white scale-[1.02]";
    if (colorTheme === "Friend") return "border-blue-500/50 bg-blue-500/20 text-white scale-[1.02]";
    return "border-amber-500/50 bg-amber-500/20 text-white scale-[1.02]";
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
      {options.map((opt) => (
        <RippleWrapper
          key={opt}
          onClick={() => toggleSelect(opt)}
          className={`
            w-full px-6 py-4 rounded-xl border cursor-pointer 
            transition-all duration-300 ease-out glass-interactive flex justify-between items-center
            ${getThemeClasses(selected.includes(opt))}
          `}
        >
          <span className="font-inter font-medium">{opt}</span>
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selected.includes(opt) ? 'border-white/50 bg-white/20' : 'border-white/20'}`}>
             {selected.includes(opt) && <span className="text-white text-xs">✓</span>}
          </div>
        </RippleWrapper>
      ))}
    </div>
  );
}
