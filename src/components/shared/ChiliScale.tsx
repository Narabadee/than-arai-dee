import React from 'react';

interface ChiliScaleProps {
  n?: number;
  value?: number;
  size?: number;
  color?: string;
  muted?: string;
  className?: string;
}

export const ChiliScale: React.FC<ChiliScaleProps> = ({ 
  n = 5, 
  value = 0, 
  size = 11, 
  color = '#E84A2A', 
  muted = 'rgba(0,0,0,0.1)',
  className
}) => {
  return (
    <span className={`inline-flex gap-0.5 ${className}`}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < value ? color : muted}>
          <path d="M7 3c3 0 5 2 5 5 3 2 7 6 7 11 0 3-2 5-5 5-5 0-11-4-11-12 0-4 1-9 4-9z"/>
        </svg>
      ))}
    </span>
  );
};
