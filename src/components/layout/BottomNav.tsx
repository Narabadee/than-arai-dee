import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../shared/Icon';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: '',       en: 'Home',    icon: Icon.Home },
  { id: 'fridge', en: 'Fridge',  icon: Icon.Fridge },
  { id: 'recs',   en: 'Matches', icon: Icon.Flame },
  { id: 'search', en: 'Search',  icon: Icon.Search },
  { id: 'social', en: 'Market',  icon: Icon.Users },
];

export const BottomNav: React.FC = () => {
  const { isAdmin } = useAuth();
  if (isAdmin) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-nm-bg/80 backdrop-blur-lg border-t border-nm-line z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
      {NAV_ITEMS.map(it => (
        <NavLink
          key={it.id}
          to={`/${it.id}`}
          className={({ isActive }) => clsx(
            'flex flex-col items-center gap-1 transition-all duration-200 py-1 flex-1 relative',
            isActive ? 'text-nm-yellow' : 'text-nm-inkDim'
          )}
        >
          {({ isActive }) => (
            <>
              <it.icon size={20} filled={isActive} className={clsx(
                'transition-transform duration-300',
                isActive && 'scale-110 -translate-y-0.5 glow-yellow'
              )} />
              <span className="text-[9px] font-black uppercase tracking-widest">{it.en}</span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-nm-yellow rounded-full shadow-[0_0_8px_#F4C13D]" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
