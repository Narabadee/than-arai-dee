import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllDishes } from '../hooks/useAllDishes';
import { ING } from '../data/ingredients';
import { getMatchStats } from '../utils/match-math';
import { Icon } from '../components/shared/Icon';
import { FoodPlaceholder } from '../components/shared/FoodPlaceholder';
import { Stars } from '../components/shared/Stars';
import { motion } from 'framer-motion';

interface RecommendationsProps {
  fridge: string[];
}

export const Recommendations: React.FC<RecommendationsProps> = ({ fridge }) => {
  const navigate = useNavigate();
  const { dishes } = useAllDishes();
  const [sort, setSort] = useState<'match' | 'fast' | 'rating'>('match');

  const scored = dishes.map(d => ({ ...d, stats: getMatchStats(fridge, d) }))
    .sort((a, b) => {
      if (sort === 'match') return b.stats.pct - a.stats.pct;
      if (sort === 'fast') return a.time - b.time;
      return b.rating - a.rating;
    });

  const matchedCount = scored.filter(d => d.stats.pct >= 60).length;

  return (
    <div className="p-7 md:p-8 lg:p-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-2 uppercase">02 / MATCHED FOR YOU</div>
          <div className="font-display font-black italic text-4xl md:text-5xl leading-[1.1] max-w-2xl">
            With what you have,<br/>
            you can make <span className="text-nm-lime glow-lime">{matchedCount} delicious dishes.</span>
          </div>
        </motion.div>

        <div className="flex gap-1 p-1 bg-nm-card border border-nm-line rounded-full shadow-inner self-start md:self-auto">
          {[
            { id: 'match', label: 'Best match' },
            { id: 'fast', label: 'Fastest' },
            { id: 'rating', label: 'Top rated' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id as any)}
              className={`
                px-5 py-2 rounded-full text-[12px] font-bold transition-all
                ${sort === s.id ? 'bg-nm-yellow text-nm-bg shadow-md' : 'text-nm-ink hover:text-nm-yellow'}
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scored.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/recipe/${d.id}`)}
            className="group flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-nm-card border border-nm-line hover:border-nm-inkDim/50 transition-all text-left shadow-lg hover:shadow-2xl"
          >
            <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 relative overflow-hidden">
              {d.image ? (
                <img 
                  src={d.image} 
                  alt={d.en} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <FoodPlaceholder label={d.en} style="stripes" bg={d.color} fg="#1a0a04" radius={0}/>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                <span className="text-[11px] font-bold text-white bg-nm-red px-3 py-1 rounded-full shadow-lg">View Recipe</span>
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <div className="text-[19px] font-extrabold group-hover:text-nm-yellow transition-colors leading-tight">{d.en}</div>
                  <div className="font-thai text-[13px] text-nm-inkDim mt-0.5">{d.th}</div>
                </div>
                <div className={`
                  font-display font-black italic text-[28px] leading-none shrink-0
                  ${d.stats.pct >= 70 ? 'text-nm-lime glow-lime' : d.stats.pct >= 40 ? 'text-nm-yellow glow-yellow' : 'text-nm-inkDim opacity-40'}
                `}>
                  {d.stats.pct}%
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 my-4">
                {d.ingredients.map(ingId => {
                  const have = fridge.includes(ingId);
                  const ing = ING[ingId];
                  if (!ing) return null;
                  return (
                    <span 
                      key={ingId} 
                      className={`
                        text-[10px] px-2.5 py-1 rounded-full border transition-colors
                        ${have 
                          ? 'bg-nm-lime/10 text-nm-lime border-nm-lime/30 font-bold' 
                          : 'bg-nm-cardHi text-nm-inkDim border-nm-line line-through opacity-60'}
                      `}
                    >
                      {have && '✓ '}{ing.en}
                    </span>
                  );
                })}
              </div>

              <div className="mt-auto pt-4 border-t border-nm-line/50 flex items-center gap-4 font-mono text-[11px] text-nm-inkDim">
                <div className="flex items-center gap-1.5">
                   <span className={d.stats.pct >= 70 ? 'text-nm-lime font-bold' : 'text-nm-inkDim'}>
                    {d.stats.have.length}/{d.stats.total} in fridge
                   </span>
                </div>
                <span className="opacity-30">·</span>
                <span>{d.time}min</span>
                <span className="opacity-30">·</span>
                <span className="flex items-center gap-1.5"><Stars value={d.rating} size={10} color="#F4C13D"/> {d.rating}</span>
                <span className="opacity-30 hidden sm:inline">·</span>
                <span className="hidden sm:inline">{d.kcal}kcal</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      
      {scored.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-nm-line rounded-3xl mt-10">
          <Icon.Fridge size={40} className="mx-auto mb-4 text-nm-inkDim opacity-30" />
          <div className="text-xl font-bold text-nm-inkDim">No matches found.</div>
          <p className="text-nm-inkDim opacity-60 mt-2">Try adding more ingredients to your fridge!</p>
          <button 
            onClick={() => navigate('/fridge')}
            className="mt-6 px-8 py-3 rounded-full bg-nm-yellow text-nm-bg font-bold text-[14px]"
          >
            Go to Fridge
          </button>
        </div>
      )}
    </div>
  );
};
