import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllDishes } from '../hooks/useAllDishes';
import { getMatchStats } from '../utils/match-math';
import { Icon } from '../components/shared/Icon';
import { Stars } from '../components/shared/Stars';
import { FoodPlaceholder } from '../components/shared/FoodPlaceholder';
import { motion } from 'framer-motion';

interface HomeProps {
  fridge: string[];
}

export const Home: React.FC<HomeProps> = ({ fridge }) => {
  const navigate = useNavigate();
  const { dishes } = useAllDishes();
  const trending = [...dishes].filter(d => d.trending !== undefined && d.trending <= 6).sort((a, b) => (a.trending || 0) - (b.trending || 0));

  const entries = [
    { id: 'fridge', th: 'ตู้เย็นของฉัน', en: 'My Fridge', sub: `${fridge.length} items · tap to manage`, color: '#F4C13D', icon: Icon.Fridge },
    { id: 'recs', th: 'แมตช์แล้ว', en: 'Matched for you', sub: `${dishes.filter(d => getMatchStats(fridge, d).pct >= 60).length} dishes ≥ 60%`, color: '#E84A2A', icon: Icon.Flame },
    { id: 'search', th: 'ค้นหา', en: 'Search & Filter', sub: 'noodle, vegan, <15 min…', color: '#B8D63D', icon: Icon.Search },
    { id: 'random', th: 'สุ่มเมนู', en: 'Spin the wheel', sub: 'when nothing sounds good', color: '#F8EAD0', icon: Icon.Shuffle },
  ];

  return (
    <div className="p-7 md:p-8 lg:p-10">
      {/* HERO */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[20px] overflow-hidden bg-gradient-to-br from-nm-redDeep via-nm-red to-[#E8823A] p-9 md:p-12 mb-8 border border-nm-line shadow-2xl"
      >
        <div className="absolute top-4 right-5 font-mono text-[9px] text-white/60 tracking-[0.2em]">
          NIGHT MARKET · 22:47
        </div>
        <div className="font-mono text-[10px] text-white/60 tracking-[0.3em] mb-4 uppercase">
          TONIGHT'S QUESTION —
        </div>
        <div className="font-display font-black italic text-5xl md:text-7xl leading-[0.95] text-nm-cream mb-4 drop-shadow-lg max-w-2xl">
          What's in your<br/>fridge, <span className="text-nm-yellow glow-yellow">friend?</span>
        </div>
        <div className="font-display font-bold text-xl md:text-2xl text-orange-100 mb-8">
          คุณมีวัตถุดิบอะไร เราจะบอกว่าทำอะไรดี
        </div>
        
        <div className="flex flex-wrap gap-3 relative z-10">
          <button 
            onClick={() => navigate('/fridge')}
            className="px-6 py-4 rounded-full bg-nm-yellow text-nm-bg font-extrabold text-[14px] flex items-center gap-2.5 transition-transform active:scale-95 hover:brightness-110 shadow-xl"
          >
            <Icon.Fridge size={15}/> Show me what to cook →
          </button>
          <button 
            onClick={() => navigate('/random')}
            className="px-6 py-4 rounded-full border-2 border-nm-cream text-nm-cream font-bold text-[14px] flex items-center gap-2.5 transition-transform active:scale-95 hover:bg-white/10 shadow-xl"
          >
            <Icon.Shuffle size={15}/> I can't decide — spin it
          </button>
        </div>

        {/* Floating food photo */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 md:w-64 md:h-64 opacity-90 rotate-[-8deg] pointer-events-none hidden md:block rounded-full overflow-hidden border-4 border-nm-cream/20 shadow-2xl">
          <img 
            src="images/dishes/krapow.png" 
            alt="Pad Krapow" 
            className="w-full h-full object-cover scale-110"
          />
        </div>
      </motion.div>

      {/* ENTRY TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {entries.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(`/${t.id}`)}
            className="group flex flex-col gap-3 p-5 rounded-2xl bg-nm-card border border-nm-line text-left transition-all hover:-translate-y-1 hover:border-opacity-100"
            style={{ borderColor: 'rgba(59, 46, 35, 1)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = t.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(59, 46, 35, 1)'}
          >
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: t.color, color: '#181310' }}
            >
              <t.icon size={18}/>
            </div>
            <div>
              <div className="font-thai text-[11px] text-nm-inkDim mb-0.5">{t.th}</div>
              <div className="text-[17px] font-bold mb-1 group-hover:text-nm-yellow transition-colors">{t.en}</div>
              <div className="font-mono text-[10px] text-nm-inkDim uppercase tracking-wider">{t.sub}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* TRENDING SECTION */}
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] uppercase mb-1">
            TRENDING · กำลังมาแรง
          </div>
          <div className="font-display font-black italic text-3xl md:text-4xl">
            What the city is cooking tonight
          </div>
        </div>
        <button 
          onClick={() => navigate('/search')}
          className="text-[12px] text-nm-yellow font-bold hover:underline"
        >
          see all 142 →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {trending.map((d, i) => {
          const stats = getMatchStats(fridge, d);
          return (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/recipe/${d.id}`)}
              className="flex flex-col rounded-2xl overflow-hidden bg-nm-card border border-nm-line hover:border-nm-line/60 transition-colors text-left"
            >
              <div className="relative h-40 overflow-hidden">
                {d.image ? (
                  <img 
                    src={d.image} 
                    alt={d.en} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <FoodPlaceholder label={d.en} style="stripes" bg={d.color} fg="#1a0a04" radius={0}/>
                )}
                <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-nm-bg/80 backdrop-blur-md text-nm-yellow text-[9px] font-mono font-bold">
                  #{d.trending} TRENDING
                </div>
                <div className={clsx(
                  "absolute bottom-2.5 right-2.5 px-2 py-1 rounded-full text-[10px] font-bold",
                  stats.pct >= 70 ? "bg-nm-lime text-nm-bg" : stats.pct >= 40 ? "bg-nm-yellow text-nm-bg" : "bg-nm-cardHi text-nm-inkDim"
                )}>
                  {stats.pct}% MATCH
                </div>
              </div>
              <div className="p-5">
                <div className="font-thai text-[12px] text-nm-inkDim mb-0.5">{d.th}</div>
                <div className="text-[18px] font-bold mb-3">{d.en}</div>
                <div className="flex items-center gap-4 font-mono text-[11px] text-nm-inkDim">
                  <span className="flex items-center gap-1.5"><Stars value={d.rating} size={10} color="#F4C13D"/> {d.rating}</span>
                  <span className="opacity-30">·</span>
                  <span>{d.time}min</span>
                  <span className="opacity-30">·</span>
                  <span>{d.kcal}kcal</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// Simple clsx replacement for this file
function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
