"use client";

import { useScrollProgress } from "@/hooks/useScrollProgress";
import TreeCanvas from "@/components/tree/TreeCanvas";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";

export default function TreePage() {
  const progress = useScrollProgress();
  const profile = useUserStore((state) => state.profile);
  const [label, setLabel] = useState("");

  // Labels based on scroll progress
  useEffect(() => {
    if (progress < 0.1) setLabel("");
    else if (progress < 0.3) setLabel("Your Roots 🌱");
    else if (progress < 0.5) setLabel("");
    else if (progress < 0.7) setLabel("Your Circle 🌿");
    else if (progress < 0.9) setLabel("Your World 🌸");
    else setLabel("Your Heart 🌺");
  }, [progress]);

  return (
    <main className="relative w-full">
      {/* The 500vh container to enable scrolling */}
      <div className="h-[500vh] w-full" />
      
      {/* Fixed 3D Canvas */}
      <div className="fixed inset-0 z-0 bg-black">
        <TreeCanvas scrollProgress={progress} />
      </div>

      {/* Fixed Label Overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center">
        {label && (
          <div className="glass-panel px-6 py-3 transition-opacity duration-1000">
            <h2 className="text-white/80 font-space-grotesk text-2xl tracking-widest uppercase">{label}</h2>
          </div>
        )}
      </div>
    </main>
  );
}
