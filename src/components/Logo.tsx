import React from 'react';
// @ts-ignore
import logoImage from '../assets/images/logo_rene.png';

interface LogoProps {
  className?: string; // Optional styling overrides
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  // Determine scales based on size prop
  const heights = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <div id="rt-logo-container" className={`inline-flex items-center select-none ${className}`}>
      <img
        id="rt-logo-img"
        src={logoImage}
        alt="Reneturos Group"
        className={`${heights[size]} w-auto object-contain`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
