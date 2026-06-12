"use client";

import { useEffect, useRef, useState } from "react";

export function useAudioPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context
    const audio = new Audio(src);
    audio.volume = 0; // start at 0 for fade in
    audioRef.current = audio;

    audio.play().catch(e => console.error("Audio play failed, likely due to browser autoplay policies", e));

    // Fade in
    let fadeInt = setInterval(() => {
      if (audio.volume < 0.9) {
        audio.volume += 0.1;
      } else {
        clearInterval(fadeInt);
      }
    }, 150); // 1.5s fade in

    return () => {
      clearInterval(fadeInt);
      // Fade out on unmount
      if (audioRef.current) {
        let fadeOut = setInterval(() => {
          if (audioRef.current!.volume > 0.1) {
            audioRef.current!.volume -= 0.1;
          } else {
            clearInterval(fadeOut);
            audioRef.current!.pause();
            audioRef.current = null;
          }
        }, 100); // 1s fade out
      }
    };
  }, [src]);
}
