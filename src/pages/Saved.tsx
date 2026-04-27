import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAllDishes } from '../hooks/useAllDishes';
import { getMatchStats } from '../utils/match-math';
import { Icon } from '../components/shared/Icon';
import { FoodPlaceholder } from '../components/shared/FoodPlaceholder';
import { Stars } from '../components/shared/Stars';
import { motion, AnimatePresence } from 'framer-motion';

interface SavedProps {
  saved: string[];
  fridge: string[];
  toggleSaved: (id: string) => void;
}

export const Saved: React.FC<SavedProps> = ({ saved, fridge, toggleSaved }) => {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const { dishes } = useAllDishes();
  const dishById = Object.fromEntries(dishes.map(d => [d.id, d]));
  const list = saved.map(id => dishById[id]).filter(Boolean);

  return (
    <div className="p-7 md:p-10 lg:p-12 overflow-auto h-full scrollbar-hide">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-2 uppercase">06 / SAVED</div>
        <div className="font-display font-black italic text-4xl md:text-5xl leading-tight mb-10">
          Your cookbook · <span className="text-nm-yellow glow-yellow">{list.length} dishes</span>
        </div>
      </motion.div>

      {list.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-nm-line rounded-[32px] text-nm-inkDim"
        >
          <div className="w-16 h-16 rounded-full bg-nm-card flex items-center justify-center mb-6 border border-nm-line">
            <Icon.Heart size={24} className="opacity-20" />
          </div>
          <div className="text-xl font-bold mb-2">Nothing saved yet.</div>
          <p className="max-w-xs text-center opacity-60 text-[14px]">
            Tap the heart on any recipe to add it to your personal cookbook.
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="mt-8 px-8 py-3 rounded-full bg-nm-yellow text-nm-bg font-black text-[14px]"
          >
            Explore Recipes
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {list.map((d, i) => {
              const stats = getMatchStats(fridge, d);
              return (
                <motion.div
                  layout
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-nm-card border border-nm-line rounded-[20px] overflow-hidden shadow-xl hover:shadow-2xl hover:border-nm-yellow/30 transition-all flex flex-col"
                >
                  {/* IMAGE SECTION */}
                  <div className="relative h-44 overflow-hidden shrink-0">
                    {d.image ? (
                      <img 
                        src={d.image} 
                        alt={d.en} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <FoodPlaceholder label={d.en} style="wavy" bg={d.color} fg="#1a0a04" radius={0} className="group-hover:scale-110 transition-transform duration-700" />
                    )}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); requireAuth(() => toggleSaved(d.id)); }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-nm-bg/80 backdrop-blur-md flex items-center justify-center text-nm-red shadow-lg hover:scale-110 active:scale-90 transition-transform"
                    >
                      <Icon.Heart size={16} filled={true} />
                    </button>
                    
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono font-bold text-nm-yellow uppercase tracking-widest">
                      {d.tag}
                    </div>
                  </div>

                  {/* INFO SECTION */}
                  <div className="p-6 flex-1 flex flex-col cursor-pointer" onClick={() => navigate(`/recipe/${d.id}`)}>
                    <div className="text-[18px] font-extrabold mb-0.5 group-hover:text-nm-yellow transition-colors leading-tight">{d.en}</div>
                    <div className="font-thai text-[12px] text-nm-inkDim mb-5">{d.th}</div>
                    
                    <div className="mt-auto pt-4 border-t border-nm-line/40 flex items-center justify-between font-mono text-[11px]">
                      <div className={`font-bold ${stats.pct >= 60 ? 'text-nm-lime' : 'text-nm-inkDim'}`}>
                        {stats.pct}% match
                      </div>
                      <div className="flex items-center gap-3 text-nm-inkDim">
                        <span>{d.time}min</span>
                        <span className="opacity-30">·</span>
                        <span className="flex items-center gap-1.5"><Stars value={d.rating} size={10} color="#F4C13D"/> {d.rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
