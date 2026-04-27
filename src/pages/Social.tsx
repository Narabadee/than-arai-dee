import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cook } from '../data/social';
import { Post } from '../data/types';
import { Stars } from '../components/shared/Stars';
import { FoodPlaceholder } from '../components/shared/FoodPlaceholder';
import { Icon } from '../components/shared/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAllDishes } from '../hooks/useAllDishes';
import { fetchPosts, deletePost as apiDeletePost, createPost, deleteOwnPost, editPost, likePost, commentOnPost, ratePostApi } from '../api/posts';
import { fetchCooks } from '../api/users';

// Per-post image style (visual variety)
const POST_STYLES: Record<string, 'stripes' | 'dotgrid' | 'wavy'> = {
  p1: 'stripes', p2: 'dotgrid', p3: 'wavy',
  p4: 'stripes', p5: 'dotgrid', p6: 'wavy',
  p7: 'stripes', p8: 'dotgrid',
};

// Per-post timestamp
const POST_TIMES: Record<string, string> = {
  p1: '3h ago', p2: '1d ago', p3: '2d ago', p4: '5d ago',
  p5: '1w ago', p6: '6h ago', p7: 'just now', p8: '4d ago',
};

// Seed comments removed - now uses database.

export const Social: React.FC = () => {
  const navigate = useNavigate();
  const { requireAuth, user, isAdmin } = useAuth();
  const { dishes } = useAllDishes();
  const trendingDishes = [...dishes].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const [cooks, setCooks] = useState<Cook[]>([]);

  // Feed state
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts().then(ps => {
      setPosts(ps);
      const likedSet = new Set<string>();
      ps.forEach(p => { if (p.hasLiked) likedSet.add(p.id); });
      setLiked(likedSet);
    }).catch(console.error);
    fetchCooks().then(setCooks).catch(console.error);
  }, []);

  const [adminDeleteConfirm, setAdminDeleteConfirm] = useState<string | null>(null);

  const adminDeletePost = async (id: string) => {
    await apiDeletePost(id).catch(console.error);
    setPosts(prev => prev.filter(p => p.id !== id));
    setAdminDeleteConfirm(null);
  };
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [localComments, setLocalComments] = useState<Record<string, { user: string; text: string }[]>>({});

  // Post ratings
  const [postRatings, setPostRatings] = useState<Record<string, number>>({});
  const [ratingOpen, setRatingOpen] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);

  // Post expansion state
  const [expandedCaptions, setExpandedCaptions] = useState<Set<string>>(new Set());
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());

  const toggleCaption = (id: string) => setExpandedCaptions(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleRecipe = (id: string) => setExpandedRecipes(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Follow state
  const [followedCooks, setFollowedCooks] = useState<Set<string>>(new Set());

  // Fetch comments when expanded
  useEffect(() => {
    if (expandedComments && !localComments[expandedComments]) {
      import('../api/posts').then(({ fetchPostComments }) => {
        fetchPostComments(expandedComments)
          .then(comments => {
            setLocalComments(prev => ({ ...prev, [expandedComments]: comments }));
          })
          .catch(console.error);
      });
    }
  }, [expandedComments]);


  // Cook search
  const [cookSearch, setCookSearch] = useState('');
  const filteredCooks = cookSearch.trim()
    ? cooks.filter(c => c.username.toLowerCase().includes(cookSearch.toLowerCase().replace('@', '')))
    : [];

  // Sort / filter
  const [sortBy, setSortBy] = useState<'newest' | 'likes' | 'rating'>('newest');

  // Three-dot post menu
  const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);

  // Edit post state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editIngredients, setEditIngredients] = useState<string>('');
  const [editSteps, setEditSteps] = useState<{ t: string; d: string }[]>([]);

  // Post / upgrade modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newPostDish, setNewPostDish] = useState('');
  const [customDishName, setCustomDishName] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostComplexity, setNewPostComplexity] = useState(1);
  const [newPostTime, setNewPostTime] = useState(30);
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostIngredients, setNewPostIngredients] = useState<string>('');
  const [newPostSteps, setNewPostSteps] = useState<{ t: string; d: string }[]>([]);

  // --- handlers ---

  const toggleLike = (postId: string) => {
    requireAuth(() => {
      const isLiked = liked.has(postId);
      setLiked(prev => {
        const next = new Set(prev);
        isLiked ? next.delete(postId) : next.add(postId);
        return next;
      });
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes: (p.likes ?? 0) + (isLiked ? -1 : 1) } : p
      ));
      likePost(postId, isLiked ? 'unlike' : 'like').catch(console.error);
    });
  };

  const ratePost = (postId: string, stars: number) => {
    requireAuth(() => {
      setPostRatings(prev => ({ ...prev, [postId]: stars }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, rating: stars } : p));
      setRatingOpen(null);
      setHoverRating(0);
      ratePostApi(postId, stars)
        .then(r => setPosts(prev => prev.map(p => p.id === postId ? { ...p, rating: r.rating } : p)))
        .catch(console.error);
    });
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => (prev === postId ? null : postId));
  };

  const submitComment = (postId: string) => {
    requireAuth(() => {
      const text = (commentInputs[postId] || '').trim();
      if (!text) return;
      const handle = user ? `@${user.username}` : '@you';
      setLocalComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), { user: handle, text }],
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments ?? 0) + 1 } : p));
      commentOnPost(postId, text).catch(console.error);
    });
  };

  const toggleFollow = (username: string) => {
    setFollowedCooks(prev => {
      const next = new Set(prev);
      next.has(username) ? next.delete(username) : next.add(username);
      return next;
    });
  };

  const openCookProfile = (username: string) => {
    // Navigate to the dedicated profile page instead of opening a panel
    navigate(`/profile/${username.replace('@', '')}`);
  };

  const handleDeleteOwnPost = async (id: string) => {
    await deleteOwnPost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setPostMenuOpen(null);
  };

  const openEditPost = (p: Post) => {
    setEditingPostId(p.id);
    setEditCaption(p.caption);
    setEditIngredients((p.ingredients || []).join(', '));
    setEditSteps((p.steps || []).map(s => ({ ...s })));
    setPostMenuOpen(null);
  };

  const saveEditPost = async () => {
    if (!editingPostId) return;
    const ingredients = editIngredients.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const steps = editSteps.filter(s => s.t.trim() || s.d.trim());
    await editPost(editingPostId, { caption: editCaption, ingredients, steps });
    setPosts(prev => prev.map(p =>
      p.id === editingPostId ? { ...p, caption: editCaption, ingredients, steps } : p
    ));
    setEditingPostId(null);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // 'newest' — server already returns rowid DESC
  });

  const openPostModal = () => requireAuth(() => setShowPostModal(true));
  const openUpgradeModal = () => requireAuth(() => setShowUpgradeModal(true));

  const submitPost = async () => {
    if (!newPostDish || !newPostCaption.trim()) return;
    const dish = dishes.find(d => d.id === newPostDish);
    const dishTitle = newPostDish === 'original' ? customDishName : (dish?.en || '');
    if (!dishTitle.trim()) return;

    try {
      const data = {
        dish: dishTitle,
        caption: newPostCaption.trim(),
        ingredients: newPostIngredients.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
        steps: newPostSteps.filter(s => s.t.trim() || s.d.trim()),
        image: newPostImage.trim() || undefined,
        rating: 4.5
      };

      const created = await createPost(data);
      setPosts(prev => [created, ...prev]);

      setNewPostDish('');
      setCustomDishName('');
      setNewPostCaption('');
      setNewPostComplexity(1);
      setNewPostTime(30);
      setNewPostImage('');
      setNewPostIngredients('');
      setNewPostSteps([]);
      setShowPostModal(false);
    } catch (err) {
      console.error('Failed to post:', err);
    }
  };

  return (
    <div className="p-7 md:p-10 lg:p-12 overflow-auto h-full scrollbar-hide">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-2 uppercase">05 / COMMUNITY</div>
          <div className="font-display font-black italic text-4xl md:text-5xl leading-tight">
            Home cooks sharing <span className="text-nm-red glow-red">remixes.</span>
          </div>
        </motion.div>
        <button
          onClick={openPostModal}
          className="flex items-center gap-2.5 px-6 py-4 rounded-full bg-nm-yellow text-nm-bg font-black text-[14px] shadow-xl hover:scale-105 active:scale-95 transition-transform self-start md:self-auto"
        >
          <Icon.Plus size={16} /> Post your recipe
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FEED */}
        <div className="lg:col-span-2 space-y-8">

          {/* SORT BAR */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">Sort by</span>
            {(['newest', 'likes', 'rating'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all ${
                  sortBy === opt
                    ? 'bg-nm-yellow text-nm-bg border-nm-yellow shadow-md'
                    : 'border-nm-line text-nm-inkDim hover:border-nm-yellow/50 hover:text-nm-ink'
                }`}
              >
                {opt === 'newest' ? '🕐 Newest' : opt === 'likes' ? '♥ Most Liked' : '★ Top Rated'}
              </button>
            ))}
          </div>

          {sortedPosts.map((p, i) => {
            const isLiked = liked.has(p.id);
            const comments = localComments[p.id as keyof typeof localComments] || [];
            const commentsOpen = expandedComments === p.id;
            const myRating = postRatings[p.id];
            const isRatingOpen = ratingOpen === p.id;
            const isFollowing = followedCooks.has(p.user);
            const style = POST_STYLES[p.id] ?? (i % 2 === 0 ? 'dotgrid' : 'wavy');
            const timestamp = POST_TIMES[p.id] ?? '2h ago';

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.08, 0.5) }}
                className="bg-nm-card border border-nm-line rounded-[24px] overflow-hidden shadow-2xl"
              >
                {/* POST HEADER */}
                <div className="p-5 flex items-center gap-4 border-b border-nm-line/40">
                  <button
                    onClick={() => openCookProfile(p.user)}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px] hover:ring-2 hover:ring-nm-yellow/40 transition-all shrink-0"
                    style={{ backgroundColor: p.color, color: '#fff' }}
                  >
                    {p.avatar}
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => openCookProfile(p.user)}
                      className="text-[14px] font-extrabold text-nm-ink hover:text-nm-yellow transition-colors text-left"
                    >
                      {p.user}
                    </button>
                    <div className="font-mono text-[10px] text-nm-inkDim uppercase tracking-wider">
                      posted · {timestamp}
                    </div>
                  </div>
                  {/* Follow — only show for other users' posts */}
                  {user?.username && p.user !== `@${user.username}` && p.user !== user.username && (
                    <button
                      onClick={() => toggleFollow(p.user)}
                      className={`text-[11px] font-black px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                        isFollowing
                          ? 'border-nm-line text-nm-inkDim'
                          : 'border-nm-yellow/60 text-nm-yellow hover:bg-nm-yellow hover:text-nm-bg'
                      }`}
                    >
                      {isFollowing ? '✓' : '+ Follow'}
                    </button>
                  )}

                  {/* Three-dot menu: own post or admin */}
                  {(p.user_id === (user as any)?.id || isAdmin) && (
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setPostMenuOpen(postMenuOpen === p.id ? null : p.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-nm-inkDim hover:text-nm-ink hover:bg-white/5 transition-all font-black text-[16px] leading-none"
                      >
                        ···
                      </button>
                      <AnimatePresence>
                        {postMenuOpen === p.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            className="absolute right-0 top-10 bg-nm-card border border-nm-line rounded-2xl shadow-2xl z-10 overflow-hidden min-w-[150px]"
                          >
                            {p.user_id === user?.id && (
                              <button
                                onClick={() => openEditPost(p)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-nm-ink hover:bg-white/5 transition-colors text-left"
                              >
                                ✏️ Edit post
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOwnPost(p.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-nm-red hover:bg-nm-red/10 transition-colors text-left"
                            >
                              🗑️ Delete post
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* IMAGE */}
                <div className="h-[240px] md:h-[300px] relative overflow-hidden">
                  {p.image ? (
                    <img 
                      src={p.image} 
                      alt={p.dish} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FoodPlaceholder label={p.dish} style={style} bg={p.color} fg="#1a0a04" radius={0} />
                  )}
                </div>

                {/* BODY */}
                <div className="p-6">
                  <h3 className="font-display font-black italic text-2xl text-nm-yellow mb-2">{p.dish}</h3>
                  
                  <div className="relative">
                    <p className={`text-nm-ink text-[14px] leading-relaxed mb-4 opacity-80 ${!expandedCaptions.has(p.id) && p.caption.length > 180 ? 'line-clamp-3' : ''}`}>
                      {p.caption}
                    </p>
                    {p.caption.length > 180 && (
                      <button 
                        onClick={() => toggleCaption(p.id)}
                        className="text-[12px] font-bold text-nm-yellow hover:underline mb-4 block"
                      >
                        {expandedCaptions.has(p.id) ? 'Show less' : 'Show more...'}
                      </button>
                    )}
                  </div>

                  {/* RECIPE DETAILS (Ingredients & Steps) */}
                  {(p.ingredients?.length || p.steps?.length) ? (
                    <div className="mb-6">
                      <button 
                        onClick={() => toggleRecipe(p.id)}
                        className="flex items-center gap-2 text-[12px] font-black text-nm-ink tracking-widest uppercase py-2.5 px-4 bg-nm-bg/40 border border-nm-line/40 rounded-xl hover:bg-nm-bg/60 transition-all"
                      >
                        <Icon.Chef size={14} className="text-nm-yellow" />
                        {expandedRecipes.has(p.id) ? 'Hide Recipe Remix' : 'View Full Recipe Remix'}
                        <Icon.Arrow size={10} className={`ml-1 transition-transform ${expandedRecipes.has(p.id) ? 'rotate-180' : 'rotate-90'}`} />
                      </button>

                      <AnimatePresence>
                        {expandedRecipes.has(p.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4 space-y-6"
                          >
                            {/* Ingredients */}
                            {p.ingredients && p.ingredients.length > 0 && (
                              <div>
                                <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2">Ingredients used</div>
                                <div className="flex flex-wrap gap-2">
                                  {p.ingredients.map(ing => (
                                    <span key={ing} className="px-2.5 py-1 rounded-lg bg-white/5 border border-nm-line/30 text-[11px] text-nm-ink/90 font-medium">
                                      • {ing}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Steps */}
                            {p.steps && p.steps.length > 0 && (
                              <div>
                                <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-3">Method Remix</div>
                                <div className="space-y-3">
                                  {p.steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-nm-bg/20 p-3 rounded-xl border border-nm-line/20">
                                      <div className="font-mono text-[10px] text-nm-yellow font-bold shrink-0 mt-0.5">{String(idx + 1).padStart(2, '0')}</div>
                                      <div>
                                        <div className="text-[12px] font-bold text-nm-ink mb-0.5">{step.t}</div>
                                        <div className="text-[11px] text-nm-inkDim leading-relaxed">{step.d}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : null}

                  {/* INLINE EDIT MODE */}
                  {editingPostId === p.id && (
                    <div className="mb-5 space-y-4 bg-nm-bg/30 p-4 rounded-2xl border border-nm-yellow/20">
                      <div className="font-mono text-[10px] text-nm-yellow tracking-widest uppercase">Editing Post</div>

                      {/* Caption */}
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">Story / Caption</label>
                        <textarea
                          value={editCaption}
                          onChange={e => setEditCaption(e.target.value)}
                          rows={3}
                          className="w-full bg-nm-card border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink focus:outline-none focus:border-nm-yellow/40 resize-none transition-all"
                        />
                      </div>

                      {/* Ingredients */}
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">Ingredients (comma-separated)</label>
                        <input
                          value={editIngredients}
                          onChange={e => setEditIngredients(e.target.value)}
                          placeholder="chicken, garlic, holy basil..."
                          className="w-full bg-nm-card border border-nm-line rounded-xl px-4 py-3 text-[13px] text-nm-ink focus:outline-none focus:border-nm-yellow/40 transition-all"
                        />
                      </div>

                      {/* Steps */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">Method Steps</label>
                          <button
                            onClick={() => setEditSteps(prev => [...prev, { t: '', d: '' }])}
                            className="text-[10px] font-black text-nm-yellow uppercase hover:underline"
                          >
                            + Add Step
                          </button>
                        </div>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                          {editSteps.map((s, idx) => (
                            <div key={idx} className="bg-nm-bg/40 p-2.5 rounded-xl border border-nm-line/40 flex gap-2">
                              <div className="flex-1 space-y-1">
                                <input
                                  value={s.t}
                                  onChange={e => setEditSteps(prev => prev.map((item, i) => i === idx ? { ...item, t: e.target.value } : item))}
                                  placeholder="Step title"
                                  className="w-full bg-transparent border-b border-nm-line/40 text-[12px] font-bold text-nm-ink outline-none pb-0.5"
                                />
                                <textarea
                                  value={s.d}
                                  onChange={e => setEditSteps(prev => prev.map((item, i) => i === idx ? { ...item, d: e.target.value } : item))}
                                  placeholder="Instruction"
                                  rows={1}
                                  className="w-full bg-transparent text-[11px] text-nm-inkDim outline-none resize-none"
                                />
                              </div>
                              <button
                                onClick={() => setEditSteps(prev => prev.filter((_, i) => i !== idx))}
                                className="text-nm-inkDim hover:text-nm-red p-1 shrink-0"
                              >
                                <Icon.X size={12} />
                              </button>
                            </div>
                          ))}
                          {editSteps.length === 0 && (
                            <div className="text-center py-3 border border-dashed border-nm-line/30 rounded-xl text-nm-inkDim text-[11px] italic">
                              No steps yet.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button onClick={saveEditPost} className="px-5 py-2 bg-nm-yellow text-nm-bg font-black text-[12px] rounded-full hover:brightness-110 transition-all">
                          Save Changes
                        </button>
                        <button onClick={() => setEditingPostId(null)} className="px-5 py-2 border border-nm-line text-nm-inkDim font-bold text-[12px] rounded-full hover:border-nm-inkDim transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="flex items-center justify-between pt-5 border-t border-nm-line/40 font-mono text-[12px] text-nm-inkDim">
                    <div className="flex items-center gap-5">
                      {/* Like */}
                      <button
                        onClick={() => toggleLike(p.id)}
                        className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-nm-red' : 'hover:text-nm-red'}`}
                      >
                        <Icon.Heart size={15} filled={isLiked} /> {(p.likes ?? 0).toLocaleString()}
                      </button>
                      {/* Comment */}
                      <button
                        onClick={() => toggleComments(p.id)}
                        className={`flex items-center gap-1.5 transition-colors ${commentsOpen ? 'text-nm-yellow' : 'hover:text-nm-yellow'}`}
                      >
                        💬 {p.comments ?? 0}
                      </button>
                    </div>

                    {/* Rating area */}
                    <div className="flex items-center gap-2">
                      {isRatingOpen ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => ratePost(p.id, star)}
                              className="text-[20px] leading-none transition-transform hover:scale-125"
                              style={{ color: star <= (hoverRating || myRating || 0) ? '#F4C13D' : '#3B2E23' }}
                            >
                              ★
                            </button>
                          ))}
                          <button
                            onClick={() => { setRatingOpen(null); setHoverRating(0); }}
                            className="ml-1 text-nm-inkDim hover:text-nm-ink"
                          >
                            <Icon.X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (myRating) return;
                            setRatingOpen(isRatingOpen ? null : p.id);
                          }}
                          className={`flex items-center gap-1.5 font-bold transition-colors ${myRating ? 'text-nm-yellow cursor-default' : 'text-nm-inkDim hover:text-nm-yellow'
                            }`}
                          title={myRating ? `You rated ${myRating}★` : 'Rate this post'}
                        >
                          <span className="text-[14px]">★</span>
                          <span>{p.rating.toFixed(1)}</span>
                          {!myRating && <span className="text-[10px] opacity-60 ml-0.5">Rate</span>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* COMMENTS */}
                <AnimatePresence>
                  {commentsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-nm-line/40"
                    >
                      <div className="p-5 space-y-3">
                        {comments.length === 0 && (
                          <p className="text-nm-inkDim text-[12px] italic">No comments yet. Be the first!</p>
                        )}
                        {comments.map((c, ci) => (
                          <div key={ci} className="flex gap-3 items-start">
                            <div className="w-7 h-7 rounded-full bg-nm-cardHi border border-nm-line flex items-center justify-center font-black text-[11px] text-nm-yellow shrink-0">
                              {c.user[1]?.toUpperCase() ?? '?'}
                            </div>
                            <div className="flex-1 bg-nm-bg/30 rounded-xl px-3 py-2">
                              <div className="font-mono text-[10px] text-nm-inkDim mb-0.5">{c.user}</div>
                              <div className="text-[13px] text-nm-ink">{c.text}</div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-3 border-t border-nm-line/20">
                          <input
                            value={commentInputs[p.id] || ''}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && submitComment(p.id)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-nm-bg border border-nm-line rounded-full px-4 py-2 text-[13px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors"
                          />
                          <button
                            onClick={() => submitComment(p.id)}
                            className="px-4 py-2 rounded-full bg-nm-yellow text-nm-bg font-black text-[11px] hover:brightness-110 transition-all"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Click-away to close post menu */}
        {postMenuOpen && (
          <div className="fixed inset-0 z-[5]" onClick={() => setPostMenuOpen(null)} />
        )}

        {/* SIDEBAR */}
        <div className="space-y-8">
          {/* COOK SEARCH */}
          <section>
            <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-3 uppercase"> Search cooks</div>
            <div className="relative">
              <input
                value={cookSearch}
                onChange={e => setCookSearch(e.target.value)}
                placeholder="Search by username..."
                className="w-full bg-nm-card border border-nm-line rounded-xl px-4 py-3 text-[13px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors pr-10"
              />
              {cookSearch && (
                <button
                  onClick={() => setCookSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nm-inkDim hover:text-nm-ink"
                >
                  <Icon.X size={14} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {cookSearch.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2 bg-nm-card border border-nm-line rounded-xl overflow-hidden shadow-xl"
                >
                  {filteredCooks.length === 0 ? (
                    <div className="px-4 py-4 text-nm-inkDim text-[13px] italic">
                      No cooks found for "{cookSearch}"
                    </div>
                  ) : (
                    filteredCooks.map(cook => (
                      <button
                        key={cook.id}
                        onClick={() => { navigate(`/profile/${cook.username.replace('@', '')}`); setCookSearch(''); }}
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-nm-line/40 last:border-0 hover:bg-white/[0.03] transition-colors text-left group"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[13px] text-white shrink-0"
                          style={{ backgroundColor: cook.color }}
                        >
                          {cook.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-nm-ink group-hover:text-nm-yellow transition-colors">{cook.username}</div>
                          <div className="font-mono text-[10px] text-nm-inkDim truncate">{cook.specialty}</div>
                        </div>
                        <div className="font-mono text-[10px] text-nm-yellow shrink-0">★ {cook.avgRating}</div>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* TRENDING DISHES */}
          <section>
            <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-4 uppercase"> TRENDING THIS WEEK</div>
            <div className="bg-nm-card border border-nm-line rounded-[20px] overflow-hidden shadow-xl">
              {trendingDishes.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => navigate(`/recipe/${d.id}`)}
                  className="w-full flex items-center gap-4 p-4 border-b border-nm-line/40 last:border-0 hover:bg-white/[0.02] transition-colors text-left group"
                >
                  <div className="font-display font-black italic text-[24px] text-nm-yellow w-6 shrink-0 group-hover:scale-125 transition-transform">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-nm-ink group-hover:text-nm-yellow transition-colors truncate">{d.en}</div>
                    <div className="font-thai text-[11px] text-nm-inkDim">{d.th}</div>
                  </div>
                  <div className="font-mono text-[10px] text-nm-red font-black shrink-0">
                    ↑ {85 + (i * 3)}%
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* TOP COOKS */}
          <section>
            <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] mb-4 uppercase">TOP COOKS</div>
            <div className="bg-nm-card border border-nm-line rounded-[20px] p-5 space-y-4 shadow-xl">
              {[
                { u: '@nim_eats', c: '#D64528', r: 14820 },
                { u: '@bangkok.boy', c: '#E8823A', r: 9340 },
                { u: '@dad.cooks', c: '#E8B13A', r: 22100 },
                { u: '@thai_mom', c: '#4A7A3E', r: 31400 },
              ].map(cook => (
                <button
                  key={cook.u}
                  onClick={() => openCookProfile(cook.u)}
                  className="w-full flex items-center gap-3 group text-left"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] text-white shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: cook.c }}
                  >
                    {cook.u[1].toUpperCase()}
                  </div>
                  <div className="flex-1 text-[13px] font-bold text-nm-ink group-hover:text-nm-yellow transition-colors">{cook.u}</div>
                  <div className="font-mono text-[10px] text-nm-inkDim">{cook.r.toLocaleString()} ♥</div>
                </button>
              ))}
            </div>
          </section>

          {/* UPGRADE PROMO */}
          <div className="p-6 rounded-[20px] bg-gradient-to-br from-nm-red to-nm-redDeep border border-nm-line text-nm-cream shadow-xl">
            <div className="font-mono text-[9px] tracking-widest uppercase opacity-60 mb-2">Sponsored</div>
            <div className="text-[18px] font-black leading-tight mb-4 italic font-display">
              Upgrade to <span className="text-nm-yellow">Night Market+</span>
            </div>
            <p className="text-[12px] opacity-80 mb-6">
              Unlock meal planning, detailed macros, and 100+ exclusive "secret" street food recipes.
            </p>
            <button
              onClick={openUpgradeModal}
              className="w-full py-2.5 rounded-lg bg-nm-yellow text-nm-bg font-black text-[12px] hover:brightness-110 transition-all shadow-lg"
            >
              Join the Market
            </button>
          </div>
        </div>
      </div>


      {/* POST MODAL */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-nm-bg/85 backdrop-blur-md z-50 flex items-center justify-center p-6"
            onClick={e => e.target === e.currentTarget && setShowPostModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-nm-card border border-nm-line rounded-[32px] p-8 w-full max-w-lg shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
            >
              <div className="flex-shrink-0 flex items-center justify-between mb-8">
                <div>
                  <div className="font-display font-black italic text-3xl text-nm-yellow leading-none mb-1">New Remix</div>
                  <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">Share your cooking story</div>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="w-10 h-10 rounded-full bg-nm-bg border border-nm-line flex items-center justify-center text-nm-inkDim hover:text-nm-ink hover:border-nm-inkDim transition-all"
                >
                  <Icon.X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                {/* DISH SELECTION */}
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase ml-1">Choose your dish</label>
                  <div className="relative">
                    <select
                      value={newPostDish}
                      onChange={e => setNewPostDish(e.target.value)}
                      className="w-full bg-nm-cardHi border border-nm-line rounded-2xl px-5 py-4 text-[15px] text-nm-ink focus:outline-none focus:border-nm-yellow/40 transition-all appearance-none shadow-inner"
                    >
                      <option value="">Select a recipe to remix...</option>
                      <option value="original">✨ Original Recipe / Other</option>
                      {dishes.map(d => (
                        <option key={d.id} value={d.id}>{d.en} ({d.th})</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-nm-inkDim">
                      <Icon.Arrow size={16} />
                    </div>
                  </div>
                </div>

                {/* CUSTOM DISH NAME (Conditional) */}
                <AnimatePresence>
                  {newPostDish === 'original' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="font-mono text-[10px] text-nm-yellow tracking-widest uppercase ml-1">What's the dish name?</label>
                      <input
                        value={customDishName}
                        onChange={e => setCustomDishName(e.target.value)}
                        placeholder="e.g. My Secret Spicy Fried Chicken"
                        className="w-full bg-nm-cardHi border border-nm-yellow/40 rounded-2xl px-5 py-4 text-[15px] text-nm-ink focus:outline-none focus:border-nm-yellow transition-all shadow-inner"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* STORY AREA */}
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase ml-1">The Story</label>
                  <textarea
                    value={newPostCaption}
                    onChange={e => setNewPostCaption(e.target.value)}
                    placeholder="Tell the story behind this cook. Any secrets or substitutions?"
                    rows={4}
                    className="w-full bg-nm-cardHi border border-nm-line rounded-2xl px-5 py-4 text-[15px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/40 transition-all resize-none shadow-inner"
                  />
                </div>

                {/* ATTRIBUTES GRID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase ml-1">Complexity</label>
                    <div className="bg-nm-cardHi border border-nm-line rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-inner">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(v => (
                          <button
                            key={v}
                            onClick={() => setNewPostComplexity(v)}
                            className={`text-xl transition-transform hover:scale-125 ${v <= newPostComplexity ? 'opacity-100' : 'opacity-20 grayscale'}`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#E84A2A">
                              <path d="M7 3c3 0 5 2 5 5 3 2 7 6 7 11 0 3-2 5-5 5-5 0-11-4-11-12 0-4 1-9 4-9z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                      <span className="font-mono text-[12px] text-nm-inkDim font-bold">{newPostComplexity}/5</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase ml-1">Time (mins)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={newPostTime}
                        onChange={e => setNewPostTime(Number(e.target.value))}
                        className="w-full bg-nm-cardHi border border-nm-line rounded-2xl px-5 py-3.5 text-[15px] text-nm-ink focus:outline-none focus:border-nm-yellow/40 transition-all shadow-inner pr-12"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-nm-inkDim uppercase">min</div>
                    </div>
                  </div>
                </div>

                {/* IMAGE URL */}
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase ml-1">Image URL / Path</label>
                  <input
                    value={newPostImage}
                    onChange={e => setNewPostImage(e.target.value)}
                    placeholder="e.g. images/dishes/my-cook.png"
                    className="w-full bg-nm-cardHi border border-nm-line rounded-2xl px-5 py-4 text-[15px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/40 transition-all shadow-inner"
                  />
                </div>

                {/* INGREDIENTS */}
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase ml-1">Your Ingredients (comma-separated)</label>
                  <input
                    value={newPostIngredients}
                    onChange={e => setNewPostIngredients(e.target.value)}
                    placeholder="chicken, garlic, holy basil, fish sauce..."
                    className="w-full bg-nm-cardHi border border-nm-line rounded-2xl px-5 py-4 text-[15px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/40 transition-all shadow-inner"
                  />
                </div>

                {/* STEPS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">Method Steps</label>
                    <button 
                      onClick={() => setNewPostSteps(prev => [...prev, { t: '', d: '' }])}
                      className="text-[10px] font-black text-nm-yellow uppercase hover:underline"
                    >
                      + Add Step
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {newPostSteps.map((s, idx) => (
                      <div key={idx} className="bg-nm-bg/40 p-3 rounded-xl border border-nm-line/40 flex gap-3">
                        <div className="flex-1 space-y-2">
                          <input 
                            value={s.t}
                            onChange={e => setNewPostSteps(prev => prev.map((item, i) => i === idx ? { ...item, t: e.target.value } : item))}
                            placeholder="Step title"
                            className="w-full bg-transparent border-b border-nm-line/40 text-[12px] font-bold text-nm-ink outline-none"
                          />
                          <textarea 
                            value={s.d}
                            onChange={e => setNewPostSteps(prev => prev.map((item, i) => i === idx ? { ...item, d: e.target.value } : item))}
                            placeholder="Instruction"
                            rows={1}
                            className="w-full bg-transparent text-[11px] text-nm-inkDim outline-none resize-none"
                          />
                        </div>
                        <button 
                          onClick={() => setNewPostSteps(prev => prev.filter((_, i) => i !== idx))}
                          className="text-nm-inkDim hover:text-nm-red p-1"
                        >
                          <Icon.X size={12} />
                        </button>
                      </div>
                    ))}
                    {newPostSteps.length === 0 && (
                      <div className="text-center py-4 border border-dashed border-nm-line/40 rounded-xl text-nm-inkDim text-[11px] italic">
                        No custom steps added yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 flex gap-4 mt-10">
                <button
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-4 rounded-full border-2 border-nm-line text-nm-inkDim font-black text-[14px] hover:border-nm-inkDim hover:text-nm-ink transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPost}
                  disabled={!newPostDish || (newPostDish === 'original' && !customDishName.trim()) || !newPostCaption.trim()}
                  className="flex-1 py-4 rounded-full bg-nm-yellow text-nm-bg font-black text-[15px] hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                >
                  Post it →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPGRADE MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-nm-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={e => e.target === e.currentTarget && setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-nm-card border border-nm-line rounded-[24px] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🌙</div>
                <div className="font-display font-black italic text-3xl mb-2">
                  Night Market<span className="text-nm-yellow">+</span>
                </div>
                <div className="font-mono text-[11px] text-nm-inkDim uppercase tracking-widest">Unlock the full experience</div>
              </div>
              <div className="space-y-3 mb-8">
                {[
                  { icon: '📅', label: 'Meal planning & weekly prep', sub: 'Auto-generate shopping lists' },
                  { icon: '💪', label: 'Detailed macros & nutrition', sub: 'Protein, carbs, fats per serving' },
                  { icon: '🔒', label: '100+ secret street food recipes', sub: 'From real Bangkok vendors' },
                  { icon: '📸', label: 'Recipe photo uploads', sub: 'Share your actual cook' },
                  { icon: '🏆', label: 'Community leaderboard', sub: 'Compete with top cooks' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-4 p-3 rounded-xl bg-nm-bg/30 border border-nm-line/40">
                    <span className="text-xl">{f.icon}</span>
                    <div>
                      <div className="text-[13px] font-bold text-nm-ink">{f.label}</div>
                      <div className="font-mono text-[10px] text-nm-inkDim">{f.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3.5 rounded-full bg-nm-yellow text-nm-bg font-black text-[15px] hover:brightness-110 transition-all shadow-xl"
              >
                Coming soon — stay tuned!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
