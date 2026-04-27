import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cook } from '../../data/social';
import { Post } from '../../data/types';
import { useAllDishes } from '../../hooks/useAllDishes';
import { Icon } from './Icon';
import { FoodPlaceholder } from './FoodPlaceholder';

interface CookProfileProps {
  cook: Cook;
  posts: Post[];
  isFollowing: boolean;
  onToggleFollow: () => void;
  onClose: () => void;
}

export const CookProfile: React.FC<CookProfileProps> = ({
  cook, posts, isFollowing, onToggleFollow, onClose,
}) => {
  const navigate = useNavigate();
  const { dishes } = useAllDishes();
  const cookPosts = posts.filter(p => p.user === cook.username);
  const favDishes = dishes.slice(cook.dishOffset, cook.dishOffset + 3);

  return (
    <>
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-nm-bg/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* slide-in panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-nm-bg border-l border-nm-line z-50 overflow-y-auto scrollbar-hide shadow-2xl flex flex-col"
      >
        {/* sticky header */}
        <div className="sticky top-0 bg-nm-bg/90 backdrop-blur-md border-b border-nm-line px-6 py-4 flex items-center justify-between shrink-0 z-10">
          <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">Cook profile</div>
          <button onClick={onClose} className="text-nm-inkDim hover:text-nm-ink transition-colors">
            <Icon.X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* IDENTITY */}
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-black text-[28px] text-white shrink-0 shadow-xl"
              style={{ backgroundColor: cook.color }}
            >
              {cook.avatar}
            </div>
            <div className="flex-1">
              <div className="text-[20px] font-black text-nm-ink mb-1">{cook.username}</div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-nm-yellow/10 border border-nm-yellow/20 text-nm-yellow font-mono text-[10px] tracking-widest uppercase mb-3">
                {cook.specialty}
              </div>
              <p className="text-[13px] text-nm-ink/70 leading-relaxed">{cook.bio}</p>
            </div>
          </div>

          {/* FOLLOW */}
          <button
            onClick={onToggleFollow}
            className={`w-full py-3 rounded-full font-black text-[14px] transition-all active:scale-95 ${
              isFollowing
                ? 'border-2 border-nm-line text-nm-inkDim hover:border-nm-red hover:text-nm-red'
                : 'bg-nm-yellow text-nm-bg hover:brightness-110 shadow-lg'
            }`}
          >
            {isFollowing ? '✓ Following' : '+ Follow'}
          </button>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { k: 'POSTS', v: cookPosts.length > 0 ? String(cookPosts.length) : '—' },
              { k: 'LIKES', v: cook.totalLikes.toLocaleString() },
              { k: 'AVG ★', v: cook.avgRating.toFixed(1) },
            ].map(stat => (
              <div key={stat.k} className="bg-nm-card border border-nm-line rounded-xl p-4 text-center shadow-md">
                <div className="font-mono text-[9px] text-nm-inkDim tracking-widest uppercase mb-1">{stat.k}</div>
                <div className="font-display font-black italic text-xl text-nm-yellow">{stat.v}</div>
              </div>
            ))}
          </div>

          {/* THEIR POSTS */}
          {cookPosts.length > 0 && (
            <section>
              <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-4">RECENT POSTS</div>
              <div className="space-y-3">
                {cookPosts.map(p => (
                  <div key={p.id} className="bg-nm-card border border-nm-line rounded-2xl overflow-hidden flex gap-0 shadow-md">
                    <div className="w-20 h-20 shrink-0 relative">
                      <FoodPlaceholder label={p.dish} style="stripes" bg={p.color} fg="#1a0a04" radius={0} />
                    </div>
                    <div className="flex-1 px-4 py-3">
                      <div className="text-[13px] font-bold text-nm-ink leading-tight mb-1">{p.dish}</div>
                      <div
                        className="text-[11px] text-nm-inkDim leading-snug opacity-80"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {p.caption}
                      </div>
                      <div className="flex items-center gap-3 mt-2 font-mono text-[10px] text-nm-inkDim">
                        <span>♥ {p.likes.toLocaleString()}</span>
                        <span>★ {p.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAV DISHES */}
          {favDishes.length > 0 && (
            <section>
              <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-4">FAVOURITE DISHES</div>
              <div className="space-y-2">
                {favDishes.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { navigate(`/recipe/${d.id}`); onClose(); }}
                    className="w-full flex items-center gap-4 p-3 rounded-xl bg-nm-card border border-nm-line hover:border-nm-yellow/40 hover:bg-nm-cardHi transition-all text-left group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg shrink-0 border border-white/10"
                      style={{ backgroundColor: d.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-nm-ink group-hover:text-nm-yellow transition-colors truncate">{d.en}</div>
                      <div className="font-thai text-[11px] text-nm-inkDim">{d.th}</div>
                    </div>
                    <div className="font-mono text-[11px] text-nm-yellow shrink-0">★ {d.rating}</div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </>
  );
};
