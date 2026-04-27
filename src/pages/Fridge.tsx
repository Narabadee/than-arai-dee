import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INGREDIENTS, ING } from '../data/ingredients';
import { useAllDishes } from '../hooks/useAllDishes';
import { getMatchStats } from '../utils/match-math';
import { Icon } from '../components/shared/Icon';
import { motion, AnimatePresence } from 'framer-motion';

interface FridgeProps {
  fridge: string[];
  setFridge: (f: string[] | ((prev: string[]) => string[])) => void;
}

export const Fridge: React.FC<FridgeProps> = ({ fridge, setFridge }) => {
  const navigate = useNavigate();
  const { dishes } = useAllDishes();
  const [query, setQuery] = useState('');

  const cats = [...new Set(INGREDIENTS.map(i => i.cat))];

  const toggle = (id: string) => {
    setFridge(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };

  const matched = dishes.filter(d => getMatchStats(fridge, d).pct >= 60).length;
  
  const filtered = INGREDIENTS.filter(i =>
    !query || i.en.toLowerCase().includes(query.toLowerCase()) || i.th.includes(query)
  );

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* MAIN CONTENT */}
      <div className="flex-1 p-7 md:p-8 overflow-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-2 uppercase">01 / MY FRIDGE</div>
          <div className="font-display font-black italic text-4xl md:text-5xl leading-tight">
            Tell us what's <span className="text-nm-yellow glow-yellow">inside.</span>
          </div>
          <p className="text-nm-inkDim text-[14px] mt-2 max-w-lg">
            Tap tags below to add ingredients to your digital fridge. The more you add, the better our recipe matches will be.
          </p>
        </motion.div>

        {/* SEARCH BAR */}
        <div className="relative mb-8 max-w-2xl">
          <div className="absolute top-1/2 left-4 -translate-y-1/2 text-nm-inkDim">
            <Icon.Search size={18}/>
          </div>
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            placeholder="Search ingredients  ·  พิมพ์เช่น ไก่, กระเทียม..." 
            className="w-full bg-nm-card border border-nm-line rounded-xl py-4 pl-12 pr-6 text-nm-ink text-[15px] focus:outline-none focus:border-nm-yellow transition-colors shadow-inner"
          />
        </div>

        {/* INGREDIENT CATEGORIES */}
        <div className="space-y-10">
          {cats.map(cat => {
            const items = filtered.filter(i => i.cat === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-4 uppercase flex items-center gap-3">
                  <span>{cat}</span>
                  <span className="opacity-40">·</span>
                  <span className="font-thai">{cat === 'protein' ? 'โปรตีน' : cat === 'produce' ? 'ผัก' : 'เครื่องแห้ง'}</span>
                  <div className="flex-1 h-px bg-nm-line ml-2" />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {items.map(i => {
                    const on = fridge.includes(i.id);
                    return (
                      <button 
                        key={i.id} 
                        onClick={() => toggle(i.id)} 
                        className={`
                          group flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 transition-all active:scale-95
                          ${on ? 'bg-nm-yellow border-nm-yellow text-nm-bg font-bold shadow-lg shadow-nm-yellow/20' : 'bg-nm-card border-nm-line text-nm-ink hover:border-nm-inkDim'}
                        `}
                      >
                        <span className="text-[18px] group-hover:scale-125 transition-transform">{i.emoji}</span>
                        <span className="text-[14px]">{i.en}</span>
                        <span className="font-thai text-[11px] opacity-60">{i.th}</span>
                        {on && <Icon.Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIDE PANEL */}
      <div className="w-full lg:w-[360px] bg-nm-card border-t lg:border-t-0 lg:border-l border-nm-line p-8 flex flex-col gap-8 shadow-2xl z-10">
        <div>
          <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-4 uppercase">YOUR FRIDGE CONTENTS</div>
          <div className="bg-nm-bg/50 border-2 border-dashed border-nm-line rounded-2xl p-5 min-h-[200px] flex flex-wrap gap-2 content-start relative overflow-hidden">
             <div className="absolute top-3 right-4 font-mono text-[10px] text-nm-inkDim opacity-60">
              {fridge.length} items
            </div>
            
            <AnimatePresence>
              {fridge.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="m-auto text-center max-w-[180px]"
                >
                  <p className="text-nm-inkDim text-[13px]">
                    Your fridge is currently empty. Tap tags on the left to stock it up!
                  </p>
                </motion.div>
              ) : (
                fridge.map(id => {
                  const i = ING[id];
                  if (!i) return null;
                  return (
                    <motion.span 
                      key={id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      onClick={() => setFridge(f => f.filter(x => x !== id))}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nm-cardHi border border-nm-line text-nm-ink text-[12px] font-semibold cursor-pointer hover:bg-nm-red/20 hover:border-nm-red/40 hover:text-nm-red transition-colors group"
                    >
                      <span>{i.emoji}</span>
                      <span>{i.en}</span>
                      <Icon.X size={12} className="opacity-40 group-hover:opacity-100" />
                    </motion.span>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-auto space-y-6">
          <div>
            <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-3 uppercase">MATCH RESULTS</div>
            <div className="bg-nm-bg border border-nm-line rounded-2xl p-6 shadow-xl group">
              <div className="font-display font-black italic text-6xl text-nm-yellow leading-none mb-2 glow-yellow group-hover:scale-110 transition-transform origin-left inline-block">
                {matched}
              </div>
              <div className="text-[14px] text-nm-ink leading-tight">
                dishes you can cook right now <span className="text-nm-inkDim opacity-60">(≥60% ingredient match)</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/recs')}
            disabled={matched === 0}
            className="w-full py-4 rounded-xl bg-nm-red text-nm-cream font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none shadow-xl shadow-nm-red/20"
          >
            See what I can cook <Icon.Arrow size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
