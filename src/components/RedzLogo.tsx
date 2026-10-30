import React, { useState } from 'react';
import { REDZ_LOGO_BASE64 } from '../lib/mockData';

interface RedzLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'icon' | 'horizontal';
  theme?: 'dark' | 'light';
}

export const RedzLogo: React.FC<RedzLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'horizontal',
  theme = 'light',
}) => {
  const [imgSrc, setImgSrc] = useState<string>('/redz-logo.jpg');

  const imageSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-11 h-11 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  };

  const textSizes = {
    sm: { title: 'text-base', sub: 'text-[9px]', kicker: 'text-[7px]' },
    md: { title: 'text-xl', sub: 'text-[10px]', kicker: 'text-[8px]' },
    lg: { title: 'text-2xl', sub: 'text-[11px]', kicker: 'text-[9px]' },
    xl: { title: 'text-3xl', sub: 'text-[13px]', kicker: 'text-[10px]' },
  };

  // Sleek frame for the logo emblem that blends naturally into both dark and light modes
  const LogoImage = (
    <div
      className={`relative shrink-0 overflow-hidden bg-[#0c1017] p-0.5 border border-slate-800/80 shadow-sm shadow-red-950/20 transition-transform duration-200 hover:scale-105 ${imageSizes[size]}`}
    >
      <img
        src={imgSrc}
        alt="REDZ Recruitment Agency"
        className="w-full h-full object-cover rounded-[inherit]"
        onError={() => {
          if (imgSrc !== REDZ_LOGO_BASE64) {
            setImgSrc(REDZ_LOGO_BASE64);
          }
        }}
      />
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{LogoImage}</div>;
  }

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {LogoImage}
        <div className="flex flex-col text-left font-sans">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight ${textSizes[size].title} text-red-600 drop-shadow-2xs`}>
              REDZ
            </span>
          </div>
          {showSubtitle && (
            <>
              <span className={`font-bold tracking-wider uppercase ${textSizes[size].sub} ${subColor} mt-0.5 leading-none`}>
                Recruitment Agency
              </span>
              <span className={`font-semibold tracking-widest uppercase text-slate-400 ${textSizes[size].kicker} mt-0.5 leading-none`}>
                Hiring · Talent · Careers
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Full stacked variant
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {LogoImage}
      <div className="mt-3">
        <span className={`font-black tracking-wider ${textSizes[size].title} text-red-600 block leading-tight`}>
          REDZ
        </span>
        {showSubtitle && (
          <>
            <span className={`font-bold tracking-widest uppercase ${textSizes[size].sub} ${subColor} block mt-0.5`}>
              Recruitment Agency
            </span>
            <span className={`font-semibold tracking-widest uppercase text-slate-400 ${textSizes[size].kicker} block mt-0.5`}>
              Hiring · Talent · Careers
            </span>
          </>
        )}
      </div>
    </div>
  );
};
