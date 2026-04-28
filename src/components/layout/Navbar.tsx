import React, { useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../shared/Icon';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

interface NavbarProps {
  fridgeCount: number;
}

// Admin-only tabs — link to /admin?tab=X
const ADMIN_TABS = [
  { tab: 'dashboard', en: 'Dashboard', icon: Icon.Chart },
  { tab: 'recipes',   en: 'Recipes',   icon: Icon.Plus },
  { tab: 'community', en: 'Community', icon: Icon.Users },
  { tab: 'users',     en: 'Users',     icon: Icon.Person },
];

// User nav items
const USER_ITEMS = [
  { id: '',       en: 'Home',      icon: Icon.Home },
  { id: 'fridge', en: 'Fridge',    icon: Icon.Fridge },
  { id: 'recs',   en: 'Matches',   icon: Icon.Flame },
  { id: 'search', en: 'Search',    icon: Icon.Search },
  { id: 'random', en: 'Random',    icon: Icon.Shuffle },
  { id: 'social', en: 'Community', icon: Icon.Users },
  { id: 'saved',  en: 'Saved',     icon: Icon.Heart },
];

export const Navbar: React.FC<NavbarProps> = ({ fridgeCount }) => {
  const { user, isAdmin, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Which admin tab is active (read from ?tab= param)
  const activeAdminTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-nm-line bg-gradient-to-b from-nm-bg to-nm-bg/90 sticky top-0 z-50 gap-4">

      {/* LOGO */}
      <Link to={isAdmin ? '/admin' : '/'} className="flex items-baseline gap-2.5 no-underline shrink-0">
        <div className="font-display font-black italic text-[26px] text-nm-yellow leading-none glow-yellow">
          ทานอะไรดี
        </div>
        {isAdmin ? (
          <span className="px-1.5 py-0.5 rounded-full bg-nm-red/20 border border-nm-red/40 text-nm-red font-mono text-[8px] font-black tracking-widest uppercase">
            ADMIN
          </span>
        ) : (
          <div className="font-mono text-[9px] tracking-[0.2em] text-nm-inkDim uppercase">
            / than a rai dee
          </div>
        )}
      </Link>

      {/* NAV */}
      <nav className="hidden md:flex gap-0.5 overflow-x-auto scrollbar-hide ml-auto">
        {isAdmin ? (
          // Admin tabs — use Link + manual active detection
          ADMIN_TABS.map(t => (
            <Link
              key={t.tab}
              to={`/admin?tab=${t.tab}`}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold transition-all duration-150 whitespace-nowrap',
                activeAdminTab === t.tab ? 'bg-nm-red text-nm-cream' : 'text-nm-ink hover:bg-white/5'
              )}
            >
              <t.icon size={13} />
              <span>{t.en}</span>
            </Link>
          ))
        ) : (
          // User nav
          USER_ITEMS.map(it => (
            <NavLink
              key={it.id}
              to={`/${it.id}`}
              className={({ isActive }) => clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold transition-all duration-150 whitespace-nowrap',
                isActive ? 'bg-nm-yellow text-nm-bg' : 'text-nm-ink hover:bg-white/5'
              )}
            >
              {({ isActive }) => (
                <>
                  <it.icon size={13} />
                  <span>{it.en}</span>
                  {it.id === 'fridge' && fridgeCount > 0 && (
                    <span className={clsx(
                      'text-[9px] px-1.5 py-0.5 rounded-full',
                      isActive ? 'bg-nm-bg text-nm-yellow' : 'bg-nm-red text-nm-cream'
                    )}>
                      {fridgeCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))
        )}
      </nav>

      {/* USER SECTION */}
      <div className="shrink-0 relative" ref={dropdownRef}>
        {user ? (
          <>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[13px] text-white shrink-0"
                style={{ backgroundColor: user.color }}
              >
                {user.username[0].toUpperCase()}
              </div>
              <span className="font-mono text-[11px] text-nm-ink font-bold hidden sm:block">
                @{user.username}
              </span>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-nm-card border border-nm-line rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-nm-line/60">
                      <div className="flex items-center gap-2">
                        <div className="text-[13px] font-bold text-nm-ink">@{user.username}</div>
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 rounded-full bg-nm-red/20 border border-nm-red/40 text-nm-red font-mono text-[8px] font-black tracking-widest uppercase">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-nm-inkDim">
                        {isAdmin ? 'Administrator' : 'Night Market member'}
                      </div>
                    </div>

                    {/* My Profile — only for regular users */}
                    {!isAdmin && (
                      <div className="py-1 border-b border-nm-line/60">
                        <Link
                          to={`/profile/${user.username}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 w-full px-4 py-3 text-left text-[13px] font-bold text-nm-ink hover:bg-white/5 transition-colors"
                        >
                          <div className="w-4 h-4 flex items-center justify-center bg-nm-yellow text-nm-bg rounded-full text-[8px] font-black">👤</div>
                          My Profile
                        </Link>
                      </div>
                    )}

                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full px-4 py-3 text-left text-[13px] font-bold text-nm-red hover:bg-nm-red/5 transition-colors"
                    >
                      Log out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        ) : (
          <button
            onClick={() => openAuthModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-nm-line text-nm-ink text-[12px] font-bold hover:border-nm-yellow hover:text-nm-yellow transition-colors"
          >
            Log in
          </button>
        )}
      </div>
    </div>
  );
};
