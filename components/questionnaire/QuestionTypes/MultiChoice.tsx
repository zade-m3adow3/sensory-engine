"use client";

import RippleWrapper from "@/components/ui/RippleWrapper";

interface Props {
  options: string[];
  selected: string | null;
  onSelect: (val: string) => void;
  colorTheme: string; // e.g. "blue", "rose"
}

export default function MultiChoice({ options, selected, onSelect, colorTheme }: Props) {
  const getThemeClasses = (isSelected: boolean) => {
    if (!isSelected) return "border-white/10 bg-white/5 hover:bg-white/10 text-white/70";
    
    // Simplistic mapping for the requested dynamic colors
    if (colorTheme === "Parent") return "border-yellow-500/50 bg-yellow-500/20 text-white scale-[1.02]";
    if (colorTheme === "Partner") return "border-rose-500/50 bg-rose-500/20 text-white scale-[1.02]";
    if (colorTheme === "Friend") return "border-blue-500/50 bg-blue-500/20 text-white scale-[1.02]";
    return "border-amber-500/50 bg-amber-500/20 text-white scale-[1.02]"; // Relative/Cousin
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
      {options.map((opt) => (
        <RippleWrapper
          key={opt}
          onClick={() => onSelect(opt)}
          className={`
            w-full px-6 py-4 rounded-xl border cursor-pointer 
            transition-all duration-300 ease-out glass-interactive text-center
            ${getThemeClasses(selected === opt)}
          `}
        >
          <span className="font-inter font-medium">{opt}</span>
        </RippleWrapper>
      ))}
    </div>
  );
}
