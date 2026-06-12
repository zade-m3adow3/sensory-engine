"use client";

import React, { HTMLAttributes } from "react";
import { useRipple } from "@/hooks/useRipple";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RippleWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  disabled?: boolean;
  type?: "submit" | "reset" | "button";
}

export default function RippleWrapper({ children, className, as: Component = "div", onClick, disabled, ...props }: RippleWrapperProps) {
  const { ripples, addRipple } = useRipple();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    addRipple(e);
    if (onClick) onClick(e);
  };

  const Element = Component as any;

  return (
    <Element
      className={cn("ripple-container relative overflow-hidden", className)}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple absolute rounded-full bg-white/30 pointer-events-none translate-x-[-50%] translate-y-[-50%]"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </Element>
  );
}
