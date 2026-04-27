import React from 'react';

interface StarsProps {
  n?: number;
  value?: number;
  size?: number;
  color?: string;
  muted?: string;
  className?: string;
}

export const Stars: React.FC<StarsProps> = ({ 
  n = 5, 
  value = 0, 
  size = 12, 
  color = '#F4C13D', 
  muted = 'rgba(0,0,0,0.15)',
  className
}) => {
  return (
    <span className={`inline-flex gap-0.5 ${className}`}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.round(value) ? color : muted}>
          <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6L12 2z"/>
        </svg>
      ))}
    </span>
  );
};
