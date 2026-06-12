'use client';

import React from 'react';
import { useRipple } from '../../hooks/useRipple';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ children, className = '', onClick, ...props }) => {
  const { ripples, addRipple } = useRipple();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    addRipple(e);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`ripple-container glass-panel glass-interactive px-6 py-3 font-semibold text-white ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </button>
  );
};
