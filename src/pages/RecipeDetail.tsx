import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../hooks/useReviews';
import { ING } from '../data/ingredients';
import { Dish } from '../data/types';
import { fetchDish } from '../api/dishes';
import { getMatchStats } from '../utils/match-math';
import { Icon } from '../components/shared/Icon';
import { FoodPlaceholder } from '../components/shared/FoodPlaceholder';
import { Stars } from '../components/shared/Stars';
import { motion, AnimatePresence } from 'framer-motion';

interface RecipeDetailProps {
  fridge: string[];
  saved: string[];
  toggleSaved: (id: string) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ fridge, saved, toggleSaved }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth, user, isAdmin } = useAuth();
  const [d, setD] = useState<Dish | null>(null);
  const { localReviews, addReview } = useReviews(id ?? '');

  useEffect(() => {
    if (id) fetchDish(id).then(setD).catch(() => setD(null));
  }, [id]);

  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Review form state
  const [reviewStars, setReviewStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Admin-deleted review indices stored in localStorage
  const [deletedReviews, setDeletedReviews] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('nm-deleted-reviews') || '[]'); } catch { return []; }
  });

  const adminDeleteReview = (key: string) => {
    const next = [...deletedReviews, key];
    setDeletedReviews(next);
    localStorage.setItem('nm-deleted-reviews', JSON.stringify(next));
  };

  if (!d) return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-4xl mb-4">🍽️</div>
      <div className="text-xl font-bold">Dish not found.</div>
      <button onClick={() => navigate('/')} className="mt-4 text-nm-yellow underline">Go back home</button>
    </div>
  );

  const m = getMatchStats(fridge, d);
  const isSaved = saved.includes(d.id);

  // Reviews come from DB (seeded + user-submitted)
  const allReviews = [...localReviews].filter((r, i) => {
    const key = `${id}-${r.user}-${i}`;
    return !deletedReviews.includes(key);
  });
  const visibleReviews = showAllReviews ? allReviews : allReviews.slice(0, 3);

  const submitReview = () => {
    requireAuth(() => {
      const text = reviewText.trim();
      if (text.length < 10) { setReviewError('Please write at least 10 characters.'); return; }
      setReviewError('');
      addReview({
        user: user ? `@${user.username}` : '@you',
        avatar: user ? user.username[0].toUpperCase() : 'Y',
        stars: reviewStars,
        when: 'just now',
        text,
      });
      setReviewText('');
      setReviewStars(5);
    });
  };

  const startCooking = () => {
    setCurrentStep(0);
    setCookingMode(true);
  };

  const exitCooking = () => {
    setCookingMode(false);
    setCurrentStep(0);
  };

  return (
    <div className="p-6 md:p-10 lg:p-12 overflow-auto h-full scrollbar-hide">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-[11px] text-nm-inkDim uppercase tracking-widest mb-8 hover:text-nm-yellow transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to matches
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
        {/* LEFT: HERO IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative h-[300px] md:h-[480px] rounded-[24px] overflow-hidden shadow-2xl border border-nm-line"
        >
          {d.image ? (
            <img 
              src={d.image} 
              alt={d.en} 
              className="w-full h-full object-cover"
            />
          ) : (
            <FoodPlaceholder label={`${d.en} · hero`} style="wavy" bg={d.color} fg="#1a0a04" radius={0} />
          )}
          <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-nm-bg/90 backdrop-blur-md text-nm-yellow text-[10px] font-mono font-black tracking-widest shadow-lg">
            #{d.trending || '—'} TRENDING
          </div>
        </motion.div>

        {/* RIGHT: HEADER INFO */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-8">
            <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.3em] uppercase mb-3">RECIPE · {d.tag}</div>
            <h1 className="font-display font-black italic text-5xl md:text-7xl text-nm-yellow leading-[1] mb-2">{d.en}</h1>
            <div className="font-display font-bold text-3xl md:text-4xl text-nm-cream opacity-90">{d.th}</div>
          </div>

          <p className="text-nm-ink text-[16px] leading-relaxed mb-8 opacity-80 max-w-lg">
            {d.desc}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              { k: 'TIME', v: `${d.time} min`, icon: Icon.Clock },
              { k: 'CALORIES', v: `${d.kcal} kcal`, icon: null },
              { k: 'RATING', v: `★ ${d.rating}`, icon: null },
              { k: 'DIFFICULTY', v: '▲'.repeat(d.difficulty) + '△'.repeat(3 - d.difficulty), icon: null },
            ].map(stat => (
              <div key={stat.k} className="bg-nm-card border border-nm-line rounded-xl p-4 flex flex-col justify-center shadow-md">
                <div className="font-mono text-[9px] text-nm-inkDim tracking-widest uppercase mb-1">{stat.k}</div>
                <div className="text-[16px] font-black text-nm-cream">{stat.v}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-auto">
            <button
              onClick={startCooking}
              className="flex-1 min-w-[200px] py-4 rounded-full bg-nm-red text-nm-cream font-black text-[16px] shadow-xl shadow-nm-red/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Start cooking →
            </button>

            {d.youtube && (
              <a
                href={d.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-[58px] h-[58px] rounded-full bg-[#FF0000] text-white shadow-xl shadow-red-600/20 hover:brightness-110 active:scale-95 transition-all"
                title="Watch tutor clip on YouTube"
              >
                <Icon.Youtube size={28} />
              </a>
            )}

            <button
              onClick={() => requireAuth(() => toggleSaved(d.id))}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-full border-2 font-black text-[16px] transition-all active:scale-95
                ${isSaved ? 'border-nm-red text-nm-red bg-nm-red/5 shadow-nm-red/10 shadow-lg' : 'border-nm-line text-nm-ink hover:border-nm-inkDim'}
              `}
            >
              <Icon.Heart size={20} filled={isSaved} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        {/* INGREDIENTS LIST */}
        <div className="lg:col-span-5">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-mono text-[11px] text-nm-inkDim tracking-[0.3em] uppercase">INGREDIENTS</h2>
            <div className="font-mono text-[10px] font-bold text-nm-yellow bg-nm-yellow/10 px-2 py-0.5 rounded">
              {m.have.length}/{m.total} IN FRIDGE
            </div>
          </div>

          <div className="bg-nm-card border border-nm-line rounded-[24px] overflow-hidden shadow-xl">
            {d.ingredients.map((ingId) => {
              const ing = ING[ingId];
              const have = fridge.includes(ingId);
              if (!ing) return null;
              return (
                <div
                  key={ingId}
                  className={`
                    flex items-center gap-4 px-5 py-4 border-b border-nm-line last:border-0 transition-colors
                    ${have ? 'bg-transparent' : 'bg-nm-bg/20 opacity-70'}
                  `}
                >
                  <div className="w-9 h-9 rounded-xl bg-nm-cardHi border border-nm-line flex items-center justify-center text-[20px] shadow-inner">
                    {ing.emoji}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[15px] font-bold ${have ? 'text-nm-ink' : 'text-nm-inkDim'}`}>{ing.en}</div>
                    <div className="font-thai text-[12px] text-nm-inkDim/60">{ing.th}</div>
                  </div>
                  {have ? (
                    <div className="flex items-center gap-1.5 text-nm-lime font-mono text-[10px] font-black tracking-widest bg-nm-lime/10 px-2 py-1 rounded">
                      <Icon.Check size={12} /> HAVE
                    </div>
                  ) : (
                    <div className="text-nm-red font-mono text-[10px] font-black tracking-widest bg-nm-red/10 px-2 py-1 rounded">
                      MISSING
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {m.missing.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-5 rounded-2xl bg-nm-red/5 border-2 border-dashed border-nm-red/30"
            >
              <div className="flex items-center gap-2 text-nm-red font-black text-[13px] mb-2 uppercase tracking-wider">
                <Icon.X size={14} /> Shopping list
              </div>
              <div className="text-[14px] text-nm-ink leading-relaxed opacity-90">
                You're missing <span className="font-bold underline">{m.missing.length} items</span>: {m.missing.map(id => ING[id].en).join(', ')}
              </div>
            </motion.div>
          )}
        </div>

        {/* METHOD / STEPS */}
        <div className="lg:col-span-7">
          <h2 className="font-mono text-[11px] text-nm-inkDim tracking-[0.3em] uppercase mb-6">METHOD · {d.steps.length} STEPS</h2>
          <div className="space-y-6">
            {d.steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex gap-6 p-6 bg-nm-card border border-nm-line rounded-[24px] shadow-lg hover:border-nm-inkDim/30 transition-all"
              >
                <div className="font-display font-black italic text-[48px] text-nm-yellow leading-[0.8] shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h4 className="text-[16px] font-black text-nm-cream mb-2 uppercase tracking-wide group-hover:text-nm-yellow transition-colors">{s.t}</h4>
                  <p className="text-nm-ink text-[15px] leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* REVIEWS SECTION */}
          <div className="mt-16">
            <div className="flex items-baseline justify-between mb-8 border-b border-nm-line pb-4">
              <h2 className="font-mono text-[11px] text-nm-inkDim tracking-[0.3em] uppercase">COMMUNITY REVIEWS</h2>
              <div className="flex items-center gap-3">
                <Stars value={d.rating} size={10} color="#F4C13D" className="mr-1" />
                <span className="font-mono text-[11px] font-bold text-nm-yellow">{d.rating}</span>
                <span className="font-mono text-[11px] text-nm-inkDim">({(d.reviews + localReviews.length).toLocaleString()})</span>
              </div>
            </div>

            {/* WRITE A REVIEW */}
            <div className="mb-6 p-6 bg-nm-card border border-nm-line rounded-2xl shadow-md">
              <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-4">Write a review</div>

              {/* Star picker */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverStars(star)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setReviewStars(star)}
                    className="text-[26px] leading-none transition-transform hover:scale-110"
                    style={{ color: star <= (hoverStars || reviewStars) ? '#F4C13D' : '#3B2E23' }}
                  >
                    ★
                  </button>
                ))}
                <span className="font-mono text-[11px] text-nm-inkDim ml-2">{reviewStars}.0</span>
              </div>

              <textarea
                value={reviewText}
                onChange={e => { setReviewText(e.target.value); setReviewError(''); }}
                placeholder="Share your experience with this dish…"
                rows={3}
                className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors resize-none mb-3"
              />

              <AnimatePresence>
                {reviewError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-nm-red font-mono text-[11px] mb-3"
                  >
                    {reviewError}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={submitReview}
                className="px-6 py-2.5 rounded-full bg-nm-yellow text-nm-bg font-black text-[13px] hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                Post review →
              </button>
            </div>

            {/* REVIEW LIST */}
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {visibleReviews.map((r, i) => {
                  const reviewKey = `${id}-${r.user}-${i}`;
                  return (
                    <motion.div
                      key={`${r.user}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: Math.min(i * 0.05, 0.3) }}
                      className="p-6 bg-nm-card border border-nm-line rounded-2xl shadow-md"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] text-white shadow-lg"
                          style={{ backgroundColor: user && r.user === `@${user.username}` ? user.color : '#F4C13D' }}
                        >
                          {r.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="text-[13px] font-bold text-nm-ink">{r.user}</div>
                          <div className="font-mono text-[9px] text-nm-inkDim uppercase tracking-widest">{r.when} ago</div>
                        </div>
                        <Stars value={r.stars} size={10} />
                        {isAdmin && (
                          <button
                            onClick={() => adminDeleteReview(reviewKey)}
                            className="ml-2 p-1.5 rounded-full text-nm-inkDim hover:text-nm-red hover:bg-nm-red/10 transition-all"
                            title="Admin: delete review"
                          >
                            <Icon.X size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-[13px] text-nm-ink/80 leading-relaxed italic border-l-2 border-nm-yellow/30 pl-4 py-1">
                        "{r.text}"
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {allReviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(prev => !prev)}
                  className="w-full py-4 mt-4 rounded-xl border border-nm-line border-dashed text-nm-inkDim font-bold text-[13px] hover:bg-nm-cardHi hover:text-nm-yellow transition-all"
                >
                  {showAllReviews
                    ? 'Show fewer reviews'
                    : `Read all ${(d.reviews + localReviews.length).toLocaleString()} reviews`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COOKING MODE OVERLAY */}
      <AnimatePresence>
        {cookingMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-nm-bg z-50 flex flex-col"
          >
            {/* TOP BAR */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-nm-line shrink-0">
              <div>
                <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">COOKING MODE</div>
                <div className="font-display font-black italic text-xl text-nm-yellow">{d.en}</div>
              </div>
              <button
                onClick={exitCooking}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-nm-line text-nm-inkDim font-bold text-[12px] hover:border-nm-red hover:text-nm-red transition-colors"
              >
                <Icon.X size={14} /> Exit
              </button>
            </div>

            {/* PROGRESS BAR */}
            <div className="h-1 bg-nm-card shrink-0">
              <motion.div
                className="h-full bg-nm-red"
                animate={{ width: `${((currentStep + 1) / d.steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* STEP CONTENT */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-2xl"
                >
                  <div className="font-display font-black italic text-[80px] md:text-[120px] text-nm-yellow leading-[0.8] mb-8 opacity-20 select-none">
                    {String(currentStep + 1).padStart(2, '0')}
                  </div>
                  <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.3em] uppercase mb-4">
                    STEP {currentStep + 1} OF {d.steps.length}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-nm-cream uppercase tracking-wide mb-6">
                    {d.steps[currentStep].t}
                  </h2>
                  <p className="text-nm-ink text-[18px] md:text-[20px] leading-relaxed opacity-80">
                    {d.steps[currentStep].d}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* NAVIGATION */}
            <div className="flex items-center gap-4 px-6 py-5 border-t border-nm-line shrink-0">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-6 py-3 rounded-full border border-nm-line text-nm-inkDim font-bold text-[14px] hover:border-nm-inkDim hover:text-nm-ink transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <div className="flex-1 flex justify-center gap-1.5">
                {d.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'bg-nm-yellow w-6' : 'bg-nm-line w-1.5'}`}
                  />
                ))}
              </div>
              {currentStep < d.steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-6 py-3 rounded-full bg-nm-red text-nm-cream font-black text-[14px] hover:brightness-110 transition-all"
                >
                  Next step →
                </button>
              ) : (
                <button
                  onClick={exitCooking}
                  className="px-6 py-3 rounded-full bg-nm-lime text-nm-bg font-black text-[14px] hover:brightness-110 transition-all"
                >
                  Done! 🎉
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
