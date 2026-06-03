import React from 'react';
// @ts-ignore
import logoImage from '../assets/images/logo_rene.png';

interface LogoProps {
  className?: string; // Optional styling overrides
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  // Determine scales based on size prop (150% bigger)
  const imgSizes = {
    sm: 'h-[45px] w-auto',
    md: 'h-[63px] w-auto',
    lg: 'h-[90px] w-auto'
  };

  const badgeSizes = {
    sm: 'w-[45px] h-[45px] text-[22px]',
    md: 'w-[54px] h-[54px] text-[27px]',
    lg: 'w-[72px] h-[72px] text-[33px]'
  };

  // We can track error state locally to handle fallback rendering without direct DOM queries
  const [hasError, setHasError] = React.useState(false);

  return (
    <div id="rt-logo-container" className={`inline-flex items-center select-none ${className}`}>
      {!hasError ? (
        <img 
          src={logoImage} 
          alt="Milestone" 
          className={`${imgSizes[size]} object-contain`}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className={`bg-slate-900 rounded-lg flex items-center justify-center font-extrabold text-white shadow-xs ${badgeSizes[size]}`}>
          M
        </div>
      )}
    </div>
  );
}
