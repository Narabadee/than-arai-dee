import React from 'react';

interface PageFrameProps {
  children: React.ReactNode;
}

export const PageFrame: React.FC<PageFrameProps> = ({ children }) => {
  return (
    <div className="w-full h-full bg-nm-bg text-nm-ink font-sans overflow-hidden relative selection:bg-nm-yellow selection:text-nm-bg">
      {/* grain effect */}
      <div className="grain-overlay" />
      {children}
    </div>
  );
};
