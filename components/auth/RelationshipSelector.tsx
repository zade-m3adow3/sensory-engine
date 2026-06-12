"use client";

import { motion } from "framer-motion";
import { RelationshipType } from "@/stores/userStore";
import RippleWrapper from "@/components/ui/RippleWrapper";

const relationships: { id: RelationshipType; label: string; icon: string; color: string; bg: string }[] = [
  { id: "Parent", label: "Parent", icon: "👨👩👧", color: "border-yellow-500/50", bg: "bg-yellow-500/20" },
  { id: "Relative", label: "Relative", icon: "👨👩👦", color: "border-amber-500/50", bg: "bg-amber-500/20" },
  { id: "Cousin", label: "Cousin", icon: "🤝", color: "border-amber-400/50", bg: "bg-amber-400/20" },
  { id: "Friend", label: "Friend", icon: "🧑🤝🧑", color: "border-blue-500/50", bg: "bg-blue-500/20" },
  { id: "Partner", label: "Partner", icon: "💑", color: "border-rose-500/50", bg: "bg-rose-500/20" },
];

interface Props {
  selected: RelationshipType | null;
  onSelect: (r: RelationshipType) => void;
}

export default function RelationshipSelector({ selected, onSelect }: Props) {
  return (
    <div className="w-full overflow-x-auto pb-4 hide-scrollbar flex gap-3 snap-x snap-mandatory">
      {relationships.map((rel) => {
        const isSelected = selected === rel.id;
        
        return (
          <RippleWrapper
            key={rel.id}
            onClick={() => onSelect(rel.id)}
            className={`
              relative flex items-center justify-center gap-2 px-5 py-3 rounded-full 
              whitespace-nowrap cursor-pointer transition-all duration-300 ease-out
              border snap-center shrink-0
              ${isSelected ? `border-opacity-100 ${rel.color} ${rel.bg} scale-[1.02] shadow-lg` : 'border-white/10 bg-white/5 hover:bg-white/10'}
              glass-interactive
            `}
          >
            <span className="text-xl">{rel.icon}</span>
            <span className={`font-inter font-medium text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>
              {rel.label}
            </span>
          </RippleWrapper>
        );
      })}
    </div>
  );
}
