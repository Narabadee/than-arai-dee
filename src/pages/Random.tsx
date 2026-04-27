import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllDishes } from '../hooks/useAllDishes';
import { DISH_TYPES } from '../data/dishes';
import { Icon } from '../components/shared/Icon';
import { FoodPlaceholder } from '../components/shared/FoodPlaceholder';
import { motion, AnimatePresence } from 'framer-motion';

interface RandomProps {
  fridge: string[];
}

export const Random: React.FC<RandomProps> = ({ fridge }) => {
  const navigate = useNavigate();
  const { dishes, loading } = useAllDishes();
  const [vegan, setVegan] = useState(false);
  const [timeMax, setTimeMax] = useState(60);
  const [type, setType] = useState('all');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<(typeof dishes)[0] | null>(null);
  const [reels, setReels] = useState([0, 1, 2]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-nm-yellow border-t-transparent rounded-full mb-6"
        />
        <div className="font-display font-black italic text-3xl text-nm-yellow glow-yellow mb-2">Heating the wok...</div>
        <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.2em] uppercase">Gathering ingredients from the market</div>
      </div>
    );
  }

  const pool = dishes.filter(d =>
    (!vegan || d.vegan) && d.time <= timeMax && (type === 'all' || d.tag === type)
  );

  const spin = () => {
    if (!pool.length || spinning) return;
    
    setSpinning(true);
    setResult(null);
    
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const chosenIdx = dishes.findIndex(d => d.id === chosen.id);
    
    let ticks = 0;
    const maxTicks = 20;
    const interval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * dishes.length),
        Math.floor(Math.random() * dishes.length),
        Math.floor(Math.random() * dishes.length),
      ]);
      
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        setReels([chosenIdx, chosenIdx, chosenIdx]);
        setSpinning(false);
        setResult(chosen);
      }
    }, 80);
  };

  return (
    <div className="p-7 md:p-12 lg:p-16 overflow-auto h-full scrollbar-hide">
      <div className="text-center mb-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-4 uppercase"
        >
          04 / CAN'T DECIDE?
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-display font-black italic text-5xl md:text-7xl leading-tight mb-4"
        >
          Let the <span className="text-nm-yellow glow-yellow">wok</span> decide.
        </motion.h1>
        <p className="text-nm-inkDim text-[15px] max-w-md mx-auto">
          Not sure what to cook tonight? Spin the reels and let the kitchen gods choose your fate.
        </p>
      </div>

      {/* SLOT MACHINE CABINET */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-nm-redDeep to-nm-red rounded-[32px] p-8 md:p-10 border-4 border-nm-yellow shadow-[0_24px_60px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.3)]"
      >
        <div className="font-mono text-[10px] text-white/50 tracking-[0.3em] text-center mb-6 flex items-center justify-center gap-4">
          <span className="animate-pulse">★</span>
          <span>TONIGHT'S SPIN</span>
          <span className="animate-pulse">★</span>
        </div>

        {/* THE REELS */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 mb-8">
          {reels.map((idx, rIdx) => {
            const dish = dishes[idx];
            return (
              <div 
                key={rIdx} 
                className="h-40 md:h-52 bg-nm-bg rounded-2xl overflow-hidden border-2 border-nm-yellow/60 relative group"
              >
                <motion.div 
                  key={`${rIdx}-${idx}`}
                  initial={spinning ? { y: -100, opacity: 0.5 } : { y: 0, opacity: 1 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="h-full"
                >
                  {dish?.image && !spinning ? (
                    <img 
                      src={dish.image} 
                      alt={dish.en} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FoodPlaceholder 
                      label={spinning ? '???' : (dish?.en || '???')} 
                      style="stripes" 
                      bg={dish?.color || '#333'} 
                      fg="#1a0a04" 
                      radius={0} 
                    />
                  )}
                </motion.div>
                
                <div className="absolute inset-x-2 bottom-3 bg-nm-bg/90 backdrop-blur-sm p-2 rounded-lg border border-nm-yellow/20 text-center">
                  <div className="font-mono text-[9px] md:text-[10px] font-bold text-nm-cream truncate uppercase">
                    {spinning ? 'Spinning...' : (dish?.en || '???')}
                  </div>
                </div>
                
                {/* Glass reflection */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />
              </div>
            );
          })}
        </div>

        {/* SPIN BUTTON */}
        <button 
          onClick={spin} 
          disabled={spinning}
          className={`
            w-full py-5 md:py-6 rounded-2xl font-display font-black italic text-2xl md:text-3xl tracking-wider uppercase transition-all
            ${spinning 
              ? 'bg-nm-cardHi text-nm-inkDim cursor-default' 
              : 'bg-nm-yellow text-nm-bg hover:scale-[1.02] active:scale-95 shadow-xl shadow-nm-yellow/20'}
          `}
        >
          {spinning ? 'Spinning...' : result ? 'SPIN AGAIN' : 'SPIN THE REELS'}
        </button>

        {/* FILTERS TRAY */}
        <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap gap-x-8 gap-y-4 items-center text-[12px] text-white/60 font-semibold">
           <div className="font-mono text-[9px] tracking-widest uppercase opacity-40">Constraints:</div>
           
           <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input 
                type="checkbox" 
                checked={vegan} 
                onChange={e => setVegan(e.target.checked)}
                className="w-4 h-4 accent-nm-yellow bg-transparent border border-white/40 rounded"
              />
              <span>Vegan Only</span>
           </label>

           <div className="flex items-center gap-2">
              <span>Time ≤</span>
              <input 
                type="number" 
                min="5" max="60" 
                value={timeMax} 
                onChange={e => setTimeMax(+e.target.value)}
                className="w-12 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-white font-mono text-center outline-none focus:border-nm-yellow"
              />
              <span>min</span>
           </div>

           <select 
             value={type} 
             onChange={e => setType(e.target.value)}
             className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white outline-none focus:border-nm-yellow cursor-pointer"
           >
             {DISH_TYPES.map(t => <option key={t.id} value={t.id} className="text-nm-bg">{t.en}</option>)}
           </select>

           <div className="ml-auto font-mono text-[10px] opacity-40">
             {pool.length} possible matches
           </div>
        </div>
      </motion.div>

      {/* RESULT CARD */}
      <AnimatePresence>
        {result && !spinning && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-10 bg-nm-card border-2 border-nm-line rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden"
          >
            <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-black/40">
              {result.image ? (
                <img 
                  src={result.image} 
                  alt={result.en} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FoodPlaceholder label={result.en} style="stripes" bg={result.color} fg="#1a0a04" radius={0}/>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="font-mono text-[10px] text-nm-lime tracking-[0.3em] uppercase mb-2">★ THE WOK HAS SPOKEN ★</div>
              <h2 className="font-display font-black italic text-3xl md:text-4xl text-nm-yellow mb-2">{result.en}</h2>
              <p className="text-nm-inkDim text-[14px] line-clamp-2 mb-4 md:mb-0">{result.desc}</p>
            </div>
            <button 
              onClick={() => navigate(`/recipe/${result.id}`)}
              className="px-8 py-4 rounded-full bg-nm-lime text-nm-bg font-black text-[14px] hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-nm-lime/20 shrink-0"
            >
              View Recipe →
            </button>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-nm-lime/5 blur-3xl rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
