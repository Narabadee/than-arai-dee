import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllDishes } from '../hooks/useAllDishes';
import { DISH_TYPES } from '../data/dishes';
import { ING } from '../data/ingredients';
import { getMatchStats } from '../utils/match-math';
import { Icon } from '../components/shared/Icon';
import { FoodPlaceholder } from '../components/shared/FoodPlaceholder';
import { ChiliScale } from '../components/shared/ChiliScale';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchProps {
  fridge: string[];
}

export const Search: React.FC<SearchProps> = ({ fridge }) => {
  const navigate = useNavigate();
  const { dishes } = useAllDishes();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [vegan, setVegan] = useState(false);
  const [timeMax, setTimeMax] = useState(60);
  const [kcalMax, setKcalMax] = useState(800);
  const [spicy, setSpicy] = useState(5);
  const [meal, setMeal] = useState('any');
  const [avoid, setAvoid] = useState<string[]>([]);

  const results = dishes.filter(d =>
    (type === 'all' || d.tag === type) &&
    (!vegan || d.vegan) &&
    d.time <= timeMax &&
    d.kcal <= kcalMax &&
    d.spicy <= spicy &&
    (meal === 'any' || d.meal === meal) &&
    !d.ingredients.some(i => avoid.includes(i)) &&
    (!q || d.en.toLowerCase().includes(q.toLowerCase()) || d.th.includes(q))
  );

  const FilterBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8 last:mb-0">
      <div className="font-mono text-[9px] text-nm-inkDim tracking-[0.25em] mb-3 uppercase flex items-center gap-2">
        {title}
        <div className="flex-1 h-px bg-nm-line/40" />
      </div>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* SIDEBAR FILTERS */}
      <div className="w-full lg:w-[280px] shrink-0 bg-nm-card border-b lg:border-b-0 lg:border-r border-nm-line p-6 overflow-auto scrollbar-hide">
        <div className="font-display font-black italic text-2xl mb-8 text-nm-yellow">Filters</div>
        
        <FilterBlock title="Dish type">
          <div className="flex flex-wrap gap-1.5">
            {DISH_TYPES.map(t => (
              <button 
                key={t.id} 
                onClick={() => setType(t.id)} 
                className={`
                  px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all
                  ${type === t.id ? 'bg-nm-yellow border-nm-yellow text-nm-bg shadow-lg shadow-nm-yellow/20' : 'bg-nm-bg/30 border-nm-line text-nm-ink hover:border-nm-inkDim'}
                `}
              >
                {t.en}
              </button>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Meal">
          <div className="flex flex-wrap gap-1.5">
            {['any', 'breakfast', 'lunch', 'dinner', 'dessert'].map(m => (
              <button 
                key={m} 
                onClick={() => setMeal(m)} 
                className={`
                  px-3 py-1.5 rounded-full text-[11px] font-bold border capitalize transition-all
                  ${meal === m ? 'bg-nm-yellow border-nm-yellow text-nm-bg shadow-lg shadow-nm-yellow/20' : 'bg-nm-bg/30 border-nm-line text-nm-ink hover:border-nm-inkDim'}
                `}
              >
                {m}
              </button>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title={`Cook time · ≤ ${timeMax} min`}>
          <input 
            type="range" min="5" max="60" step="5" value={timeMax}
            onChange={e => setTimeMax(+e.target.value)}
            className="w-full accent-nm-red h-1.5 bg-nm-bg rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between font-mono text-[9px] text-nm-inkDim mt-2">
            <span>5m</span>
            <span>60m</span>
          </div>
        </FilterBlock>

        <FilterBlock title={`Calories · ≤ ${kcalMax} kcal`}>
          <input 
            type="range" min="200" max="800" step="20" value={kcalMax}
            onChange={e => setKcalMax(+e.target.value)}
            className="w-full accent-nm-red h-1.5 bg-nm-bg rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between font-mono text-[9px] text-nm-inkDim mt-2">
            <span>200</span>
            <span>800</span>
          </div>
        </FilterBlock>

        <FilterBlock title={`Spice · up to ${spicy} 🌶`}>
          <input 
            type="range" min="0" max="5" step="1" value={spicy}
            onChange={e => setSpicy(+e.target.value)}
            className="w-full accent-nm-red h-1.5 bg-nm-bg rounded-lg appearance-none cursor-pointer"
          />
           <div className="flex justify-between font-mono text-[9px] text-nm-inkDim mt-2">
            <span>None</span>
            <span>Fire</span>
          </div>
        </FilterBlock>

        <FilterBlock title="Diet">
          <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
            <div className={`
              w-5 h-5 rounded border flex items-center justify-center transition-all
              ${vegan ? 'bg-nm-lime border-nm-lime text-nm-bg' : 'bg-nm-bg/30 border-nm-line text-transparent group-hover:border-nm-inkDim'}
            `}>
              <Icon.Check size={12} />
            </div>
            <input 
              type="checkbox" className="hidden"
              checked={vegan} onChange={e => setVegan(e.target.checked)} 
            />
            <span className="text-[13px] font-semibold text-nm-ink">Vegetarian / Vegan</span>
          </label>
        </FilterBlock>

        <FilterBlock title="Exclude ingredients">
          <div className="flex flex-wrap gap-1.5">
            {['shrimp', 'chili', 'coconut', 'egg', 'beef'].map(ingId => {
              const on = avoid.includes(ingId);
              const ing = ING[ingId];
              if (!ing) return null;
              return (
                <button 
                  key={ingId} 
                  onClick={() => setAvoid(a => on ? a.filter(x => x !== ingId) : [...a, ingId])} 
                  className={`
                    px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all
                    ${on ? 'bg-nm-red border-nm-red text-nm-cream shadow-lg shadow-nm-red/20' : 'bg-nm-bg/30 border-nm-line text-nm-inkDim hover:border-nm-inkDim'}
                  `}
                >
                  {on ? '✗ ' : ''}{ing.en}
                </button>
              );
            })}
          </div>
        </FilterBlock>
      </div>

      {/* RESULTS AREA */}
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="relative mb-8 max-w-3xl">
          <div className="absolute top-1/2 left-4 -translate-y-1/2 text-nm-inkDim">
            <Icon.Search size={20}/>
          </div>
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="Search dishes by name or ingredients..." 
            className="w-full bg-nm-card border border-nm-line rounded-2xl py-4.5 pl-14 pr-6 text-nm-ink text-[16px] font-medium focus:outline-none focus:border-nm-yellow transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="font-mono text-[11px] text-nm-inkDim uppercase tracking-widest">
            {results.length} dishes match your filters
          </div>
          {(q || type !== 'all' || vegan || meal !== 'any' || avoid.length > 0) && (
            <button 
              onClick={() => {
                setQ(''); setType('all'); setVegan(false); setTimeMax(60); setKcalMax(800); setSpicy(5); setMeal('any'); setAvoid([]);
              }}
              className="text-[11px] font-bold text-nm-red hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {results.map((d, i) => {
              const m = getMatchStats(fridge, d);
              return (
                <motion.button
                  layout
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => navigate(`/recipe/${d.id}`)}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-nm-card border border-nm-line hover:border-nm-yellow/40 transition-all text-left shadow-md hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="h-32 sm:h-40 shrink-0 relative overflow-hidden">
                    {d.image ? (
                      <img 
                        src={d.image} 
                        alt={d.en} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <FoodPlaceholder label={d.en} style="dotgrid" bg={d.color} fg="#1a0a04" radius={0} className="group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                       {d.vegan && <span className="bg-nm-lime/80 text-nm-bg text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Vegan</span>}
                       {d.tag === 'noodle' && <span className="bg-nm-yellow/80 text-nm-bg text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Noodle</span>}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col h-full">
                    <div className="text-[16px] font-extrabold group-hover:text-nm-yellow transition-colors leading-tight mb-0.5">{d.en}</div>
                    <div className="font-thai text-[12px] text-nm-inkDim mb-4">{d.th}</div>
                    
                    <div className="mt-auto flex items-center justify-between gap-3 font-mono text-[10px] text-nm-inkDim">
                      <div className="flex items-center gap-2.5">
                        <span className={`font-black ${m.pct >= 60 ? 'text-nm-lime' : 'text-nm-inkDim'}`}>{m.pct}% MATCH</span>
                        <span className="opacity-30">·</span>
                        <span>{d.time}m</span>
                      </div>
                      <ChiliScale n={5} value={d.spicy} size={8} />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {results.length === 0 && (
          <div className="text-center py-24">
            <div className="text-4xl mb-4 opacity-20">🔍</div>
            <div className="text-xl font-bold text-nm-inkDim">No dishes found matching those criteria.</div>
            <p className="text-nm-inkDim opacity-60 mt-2">Try loosening your filters or changing your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};
