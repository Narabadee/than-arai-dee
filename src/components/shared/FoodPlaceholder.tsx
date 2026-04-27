import React, { useMemo } from 'react';

interface FoodPlaceholderProps {
  label?: string;
  style?: 'stripes' | 'dotgrid' | 'wavy' | 'solid-label';
  bg?: string;
  fg?: string;
  w?: string | number;
  h?: string | number;
  radius?: number;
  mono?: boolean;
  className?: string;
}

export const FoodPlaceholder: React.FC<FoodPlaceholderProps> = ({
  label,
  style = 'stripes',
  bg = '#E8B13A',
  fg = '#2A1A12',
  w = '100%',
  h = '100%',
  radius = 12,
  mono = true,
  className,
}) => {
  const id = useMemo(() => 'pat-' + Math.random().toString(36).slice(2, 8), []);

  let pattern = null;
  if (style === 'stripes') {
    pattern = (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(45)">
          <rect width="14" height="14" fill={bg}/>
          <line x1="0" y1="0" x2="0" y2="14" stroke={fg} strokeOpacity="0.14" strokeWidth="7"/>
        </pattern>
      </defs>
    );
  } else if (style === 'dotgrid') {
    pattern = (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="16" height="16">
          <rect width="16" height="16" fill={bg}/>
          <circle cx="8" cy="8" r="1.8" fill={fg} fillOpacity="0.22"/>
        </pattern>
      </defs>
    );
  } else if (style === 'wavy') {
    pattern = (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="36" height="18">
          <rect width="36" height="18" fill={bg}/>
          <path d="M0,9 Q9,2 18,9 T36,9" fill="none" stroke={fg} strokeOpacity="0.18" strokeWidth="2"/>
        </pattern>
      </defs>
    );
  } else {
    pattern = (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill={bg}/>
        </pattern>
      </defs>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ width: w, height: h, borderRadius: radius }}
    >
      <svg width="100%" height="100%" preserveAspectRatio="none" className="absolute inset-0">
        {pattern}
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
        <div className={`
          ${mono ? 'font-mono' : 'font-inherit'} 
          text-[10px] tracking-[0.12em] uppercase text-nm-ink
          bg-white/40 backdrop-blur-sm px-2 py-1 rounded font-semibold
        `} style={{ color: fg }}>
          {label || 'food photo'}
        </div>
      </div>
    </div>
  );
};
