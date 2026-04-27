import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COOKS, POSTS } from '../data/social';
import { useAllDishes } from '../hooks/useAllDishes';
import { Icon } from '../components/shared/Icon';
import { Stars } from '../components/shared/Stars';
import { FoodPlaceholder } from '../components/shared/FoodPlaceholder';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { fetchUserProfile, updateProfile, changePassword } from '../api/users';

export const Profile: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: authUser, requireAuth, updateUser } = useAuth();
  const { openChat } = useChat();
  const { dishes } = useAllDishes();

  // --- Profile Data ---
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'recipes' | 'stats'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  // Insights panel
  const [showInsights, setShowInsights] = useState(false);

  // Edit profile modal
  const [showEdit, setShowEdit] = useState(false);
  const [editTab, setEditTab] = useState<'info' | 'security'>('info');
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Post interactions
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [localComments, setLocalComments] = useState<Record<string, { user: string; text: string }[]>>({});
  const [likeDelta, setLikeDelta] = useState<Record<string, number>>({});
  const [commentDelta, setCommentDelta] = useState<Record<string, number>>({});

  // Expansion states
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

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetchUserProfile(username)
      .then(p => {
        setProfile(p);
        const likedSet = new Set<string>();
        (p.posts || []).forEach((post: any) => { if (post.hasLiked) likedSet.add(post.id); });
        setLikedPosts(likedSet);
      })
      .catch(() => {
        // Fallback to mock data if user not found in DB yet
        const mock = COOKS.find(c => c.username === `@${username}` || c.username === username);
        if (mock) {
          setProfile({ 
            ...mock, 
            display_name: mock.username.replace('@', ''),
            dish_offset: mock.dishOffset,
            total_likes: mock.totalLikes,
            avg_rating: mock.avgRating
          });
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

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

  if (loading) return <div className="text-nm-inkDim font-mono text-[13px] py-20 text-center">Loading profile...</div>;

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-nm-inkDim">
        <div className="text-5xl mb-4">👤</div>
        <div className="text-xl font-bold">Cook not found.</div>
        <button onClick={() => navigate('/social')} className="mt-4 text-nm-yellow underline">Back to Community</button>
      </div>
    );
  }

  const isOwnProfile = authUser?.username === profile.username.replace('@', '') || authUser?.id === profile.id;
  const userPosts = profile.posts || [];
  const favDishes = dishes.slice(profile.dish_offset || 0, (profile.dish_offset || 0) + 4);

  // --- handlers ---
  const handleFollow = () => {
    requireAuth(() => setIsFollowing(f => !f));
  };

  const toggleLike = (postId: string) => {
    requireAuth(() => {
      const isLiked = likedPosts.has(postId);
      setLikedPosts(prev => {
        const next = new Set(prev);
        isLiked ? next.delete(postId) : next.add(postId);
        return next;
      });
      setLikeDelta(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (isLiked ? -1 : 1) }));
      import('../api/posts').then(({ likePost }) => likePost(postId, isLiked ? 'unlike' : 'like'));
    });
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => (prev === postId ? null : postId));
  };

  const submitComment = (postId: string) => {
    requireAuth(() => {
      const text = (commentInputs[postId] || '').trim();
      if (!text) return;
      const handle = authUser ? `@${authUser.username}` : '@you';
      setLocalComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), { user: handle, text }],
      }));
      setCommentDelta(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      import('../api/posts').then(({ commentOnPost }) => commentOnPost(postId, text));
    });
  };

  const openEdit = () => {
    setEditName(profile.display_name || '');
    setEditBio(profile.bio || '');
    setEditSpecialty(profile.specialty || '');
    setEditLocation(profile.location || '');
    setEditAvatar(profile.avatar || '');
    setEditError('');
    setEditSuccess('');
    setShowEdit(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    setEditError('');
    try {
      const updates = { 
        display_name: editName, 
        bio: editBio, 
        specialty: editSpecialty, 
        avatar: editAvatar,
        location: editLocation
      };
      const updated = await updateProfile(updates);
      setProfile(updated);
      updateUser(updates); // Update local Auth state
      setEditSuccess('Profile updated successfully!');
      setTimeout(() => setShowEdit(false), 800);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setEditError('New passwords do not match.');
      return;
    }
    setSaving(true);
    setEditError('');
    try {
      await changePassword(oldPassword, newPassword);
      setEditSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setEditError(err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  // Insight chart points seeded per cook
  const insightPoints = Array.from({ length: 14 }, (_, i) => {
    const base = 40 + ((profile.dish_offset || 0) * 2);
    return Math.max(10, Math.min(95, base + Math.sin((i + (profile.dish_offset || 0)) / 2.5) * 25 + (i % 3 === 0 ? 15 : 0)));
  });
  const insightMax = Math.max(...insightPoints);
  const svgPts = insightPoints.map((v, i) => `${i * (300 / 13)},${90 - (v / insightMax) * 80}`).join(' ');
  const svgArea = `0,90 ${svgPts} 300,90`;

  return (
    <div className="bg-nm-bg min-h-full pb-20 overflow-auto scrollbar-hide">
      {/* HEADER */}
      <div className="bg-nm-card border-b border-nm-line">
        <div className="max-w-6xl mx-auto">
          {/* Cover photo */}
          <div className="relative h-48 md:h-72 w-full overflow-hidden rounded-b-3xl border-x border-b border-nm-line shadow-2xl">
            <FoodPlaceholder label={`${profile.username} cover`} style="stripes" bg={profile.color} fg="#1a0a04" radius={0} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <button
              onClick={() => setShowInsights(true)}
              className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-lg text-[12px] font-bold border border-white/20 flex items-center gap-2 hover:bg-black/60 active:scale-95 transition-all"
            >
              <Icon.Chart size={14} /> View Insights
            </button>
          </div>

          {/* Profile info */}
          <div className="px-6 md:px-12 pb-0 relative">
            <div className="flex flex-col md:flex-row items-end gap-6 -mt-12 md:-mt-16 mb-6">
              {/* Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-nm-bg bg-nm-bg p-1 shadow-2xl relative z-10 shrink-0">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-4xl md:text-6xl font-black text-white overflow-hidden"
                  style={{ backgroundColor: profile.color }}
                >
                  {profile.avatar && profile.avatar.length > 2 ? (
                    <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    profile.avatar || profile.username[0].toUpperCase()
                  )}
                </div>
              </div>

              {/* Name + stats */}
              <div className="flex-1 mb-2">
                <h1 className="font-display font-black italic text-4xl md:text-5xl text-nm-yellow glow-yellow mb-1">
                  {profile.display_name || profile.username}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-nm-inkDim font-mono text-[12px]">
                  <span className="font-bold text-nm-cream">{profile.username}</span>
                  <span className="opacity-30">·</span>
                  <span className="font-bold text-nm-cream">{(profile.total_likes || 0).toLocaleString()} Likes</span>
                  <span className="opacity-30">·</span>
                  <span className="flex items-center gap-1"><Stars value={profile.avg_rating || 5} size={11} /> {profile.avg_rating || 5}</span>
                  <span className="opacity-30">·</span>
                  <span>{profile.specialty}</span>
                  {isFollowing && <span className="text-nm-yellow font-bold">· You follow this cook</span>}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-2 w-full md:w-auto shrink-0">
                {isOwnProfile ? (
                  <button
                    onClick={openEdit}
                    className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-nm-cardHi border border-nm-line text-nm-cream font-black text-[14px] hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2 justify-center"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-[14px] active:scale-95 transition-all ${
                        isFollowing
                          ? 'bg-nm-cardHi border-2 border-nm-yellow text-nm-yellow hover:border-nm-red hover:text-nm-red'
                          : 'bg-nm-yellow text-nm-bg shadow-xl hover:brightness-110'
                      }`}
                    >
                      {isFollowing ? '✓ Following' : '+ Follow'}
                    </button>
                    <button
                      onClick={() => requireAuth(() => openChat(profile.username, profile.avatar || profile.username[0].toUpperCase(), profile.color))}
                      className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-nm-cardHi border border-nm-line text-nm-cream font-bold text-[14px] hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2 justify-center"
                    >
                      💬 Message
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="max-w-2xl text-nm-ink text-[15px] leading-relaxed opacity-80 mb-6 border-l-2 border-nm-yellow/30 pl-5 py-1">
              {profile.bio}
              {profile.location && (
                <div className="flex items-center gap-1.5 mt-2 font-mono text-[10px] text-nm-inkDim uppercase tracking-widest">
                  📍 {profile.location}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-t border-nm-line/50 pt-2">
              {[
                { id: 'posts', label: 'Feed' },
                { id: 'recipes', label: 'Recipes' },
                { id: 'stats', label: 'Stats' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as 'posts' | 'recipes' | 'stats')}
                  className={`px-6 py-4 font-bold text-[14px] transition-all relative ${
                    activeTab === t.id ? 'text-nm-yellow' : 'text-nm-inkDim hover:text-nm-ink'
                  }`}
                >
                  {t.label}
                  {activeTab === t.id && (
                    <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-nm-yellow rounded-t-full shadow-[0_0_10px_#F4C13D]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-nm-card border border-nm-line rounded-2xl p-6 shadow-xl">
              <h3 className="font-mono text-[11px] text-nm-inkDim tracking-[0.25em] mb-6 uppercase">ABOUT THE COOK</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-nm-bg flex items-center justify-center text-nm-yellow border border-nm-line">
                    <Icon.Flame size={18} />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-nm-cream">{profile.specialty}</div>
                    <div className="font-mono text-[10px] text-nm-inkDim uppercase tracking-widest">primary specialty</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-nm-bg flex items-center justify-center text-nm-lime border border-nm-line">
                    <Icon.Check size={18} />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-nm-cream">Verified Cook</div>
                    <div className="font-mono text-[10px] text-nm-inkDim uppercase tracking-widest">since apr 2024</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-nm-bg flex items-center justify-center text-nm-red border border-nm-line">
                    <Icon.Heart size={18} filled />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-nm-cream">Top 1% Reviewer</div>
                    <div className="font-mono text-[10px] text-nm-inkDim uppercase tracking-widest">for {profile.specialty}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-nm-card border border-nm-line rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-[11px] text-nm-inkDim tracking-[0.25em] uppercase">FAVOURITE RECIPES</h3>
                <button
                  onClick={() => navigate('/search')}
                  className="text-[10px] text-nm-yellow font-bold uppercase tracking-widest hover:underline"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {favDishes.map(d => (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/recipe/${d.id}`)}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-nm-line shadow-lg"
                  >
                    {d.image ? (
                      <img 
                        src={d.image} 
                        alt={d.en} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <FoodPlaceholder label={d.en} style="dotgrid" bg={d.color} fg="#1a0a04" radius={0} className="group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <div className="text-[10px] font-black text-nm-yellow uppercase leading-tight line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">{d.en}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* MAIN AREA */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {/* FEED TAB */}
              {activeTab === 'posts' && (
                <motion.div key="posts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {/* Post something box */}
                  <button
                    onClick={() => navigate('/social')}
                    className="w-full bg-nm-card border border-nm-line rounded-2xl p-5 flex items-center gap-4 hover:border-nm-yellow/30 transition-all text-left group"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px] text-white shrink-0"
                      style={{ backgroundColor: profile.color }}
                    >
                      {profile.avatar && profile.avatar.length > 2 ? (
                        <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                      ) : (
                        profile.avatar || profile.username[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 bg-nm-bg border border-nm-line rounded-full px-5 py-3 text-[14px] text-nm-inkDim group-hover:border-nm-yellow/40 transition-colors">
                      Share a recipe or cook story…
                    </div>
                    <div className="text-nm-yellow opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon.Arrow size={18} />
                    </div>
                  </button>

                  {userPosts.length === 0 ? (
                    <div className="text-center py-20 bg-nm-card border border-nm-line rounded-3xl opacity-50">
                      <div className="text-4xl mb-4">📭</div>
                      <div className="font-bold text-nm-inkDim">No posts yet.</div>
                      <button onClick={() => navigate('/social')} className="mt-4 text-nm-yellow text-[13px] hover:underline">Go to community →</button>
                    </div>
                  ) : (
                    userPosts.map((p, i) => {
                      const isLiked = likedPosts.has(p.id);
                      const commentsOpen = expandedComments === p.id;
                      const comments = localComments[p.id] ?? [];
                      const totalLikes = p.likes + (likeDelta[p.id] ?? 0);
                      const totalComments = p.comments + (commentDelta[p.id] ?? 0);
                      return (
                        <div key={p.id} className="bg-nm-card border border-nm-line rounded-[24px] overflow-hidden shadow-2xl">
                          <div className="p-5 flex items-center gap-4 border-b border-nm-line/40">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px]" style={{ backgroundColor: p.color, color: '#fff' }}>
                              {p.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="text-[14px] font-extrabold text-nm-ink">{p.user}</div>
                              <div className="font-mono text-[10px] text-nm-inkDim uppercase tracking-wider">posted · {i + 1}d ago</div>
                            </div>
                            <Stars value={p.rating} size={11} />
                          </div>
                          <div className="h-[280px] relative overflow-hidden">
                            {p.image ? (
                              <img 
                                src={p.image} 
                                alt={p.dish} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FoodPlaceholder label={p.dish} style={i % 2 === 0 ? 'stripes' : 'dotgrid'} bg={p.color} fg="#1a0a04" radius={0} />
                            )}
                          </div>
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
                                            {p.ingredients.map((ing: string) => (
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
                                            {p.steps.map((step: any, idx: number) => (
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

                            <div className="flex items-center gap-6 pt-5 border-t border-nm-line/40 font-mono text-[12px] text-nm-inkDim">
                              <button
                                onClick={() => toggleLike(p.id)}
                                className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-nm-red' : 'hover:text-nm-red'}`}
                              >
                                <Icon.Heart size={15} filled={isLiked} /> {totalLikes.toLocaleString()}
                              </button>
                              <button
                                onClick={() => toggleComments(p.id)}
                                className={`flex items-center gap-1.5 transition-colors ${commentsOpen ? 'text-nm-yellow' : 'hover:text-nm-yellow'}`}
                              >
                                💬 {totalComments}
                              </button>
                              <div className="ml-auto flex items-center gap-1.5 font-bold text-nm-yellow">
                                <Stars n={1} value={1} size={10} color="#F4C13D" />
                                <span>{p.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
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
                                  {comments.length === 0 && <p className="text-nm-inkDim text-[12px] italic">No comments yet. Be the first!</p>}
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
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* RECIPES TAB */}
              {activeTab === 'recipes' && (
                <motion.div key="recipes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favDishes.map(d => (
                    <button
                      key={d.id}
                      onClick={() => navigate(`/recipe/${d.id}`)}
                      className="group flex flex-col bg-nm-card border border-nm-line rounded-2xl overflow-hidden hover:border-nm-yellow/40 transition-all shadow-lg hover:-translate-y-1"
                    >
                      <div className="h-40 relative overflow-hidden">
                        {d.image ? (
                          <img 
                            src={d.image} 
                            alt={d.en} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FoodPlaceholder label={d.en} style="stripes" bg={d.color} fg="#1a0a04" radius={0} />
                        )}
                      </div>
                      <div className="p-5 text-left">
                        <div className="text-[17px] font-extrabold group-hover:text-nm-yellow transition-colors leading-tight mb-1">{d.en}</div>
                        <div className="font-thai text-[12px] text-nm-inkDim mb-4">{d.th}</div>
                        <div className="flex items-center justify-between font-mono text-[11px] text-nm-inkDim border-t border-nm-line/40 pt-4">
                          <span>{d.time} min</span>
                          <span className="flex items-center gap-1.5"><Stars value={d.rating} size={10} /> {d.rating}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* STATS TAB */}
              {activeTab === 'stats' && (
                <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { k: 'RECIPES SHARED', v: String(userPosts.length || 0), color: '#F4C13D' },
                      { k: 'TOTAL LIKES', v: (profile.total_likes || 0).toLocaleString(), color: '#E84A2A' },
                      { k: 'AVG RATING', v: (profile.avg_rating || 5).toFixed(1), color: '#B8D63D' },
                      { k: 'FOLLOWERS', v: isFollowing ? '1' : '0', color: '#F8EAD0' },
                    ].map(s => (
                      <div key={s.k} className="bg-nm-card border border-nm-line rounded-2xl p-5 shadow-lg text-center">
                        <div className="font-mono text-[9px] text-nm-inkDim tracking-widest uppercase mb-2">{s.k}</div>
                        <div className="font-display font-black italic text-3xl" style={{ color: s.color }}>{s.v}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-nm-card border border-nm-line rounded-2xl p-6 shadow-xl">
                    <div className="text-[14px] font-extrabold text-nm-ink mb-6">Activity — last 14 days</div>
                    <div className="h-32 relative">
                      <svg viewBox="0 0 300 100" width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
                        {[0, 1, 2].map(i => (
                          <line key={i} x1="0" x2="300" y1={30 * i + 10} y2={30 * i + 10} stroke="rgba(59,46,35,0.5)" strokeWidth="1" />
                        ))}
                        <motion.polygon initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ duration: 1 }} points={svgArea} fill="#F4C13D" />
                        <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} points={svgPts} fill="none" stroke="#F4C13D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-nm-card border border-nm-line rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-nm-ink">Community Reputation</span>
                      <span className="font-mono text-[11px] text-nm-lime font-bold">Legendary · Level 5</span>
                    </div>
                    <div className="h-3 bg-nm-bg rounded-full overflow-hidden border border-nm-line">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-nm-yellow to-nm-lime shadow-[0_0_12px_rgba(184,214,61,0.5)]"
                      />
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-nm-inkDim mt-2">
                      <span>Level 5</span>
                      <span>850 / 1000 XP</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── INSIGHTS PANEL ── */}
      <AnimatePresence>
        {showInsights && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-nm-bg/60 backdrop-blur-sm z-40" onClick={() => setShowInsights(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-nm-bg border-l border-nm-line z-50 overflow-y-auto scrollbar-hide shadow-2xl"
            >
              <div className="sticky top-0 bg-nm-bg/90 backdrop-blur-md border-b border-nm-line px-6 py-4 flex items-center justify-between z-10">
                <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">Profile Insights</div>
                <button onClick={() => setShowInsights(false)} className="text-nm-inkDim hover:text-nm-ink transition-colors"><Icon.X size={18} /></button>
              </div>
              <div className="p-6 space-y-8">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: 'TOTAL REACH', v: ((profile.total_likes || 0) * 4).toLocaleString(), color: '#F4C13D' },
                    { k: 'PROFILE VIEWS', v: ((profile.total_likes || 0) * 12).toLocaleString(), color: '#B8D63D' },
                    { k: 'AVG ENGAGEMENT', v: `${((profile.avg_rating || 5) * 18).toFixed(0)}%`, color: '#E84A2A' },
                    { k: 'SAVED RECIPES', v: ((profile.dish_offset || 0) * 340 + 840).toLocaleString(), color: '#F8EAD0' },
                  ].map(s => (
                    <div key={s.k} className="bg-nm-card border border-nm-line rounded-xl p-4 shadow-md">
                      <div className="font-mono text-[9px] text-nm-inkDim tracking-widest uppercase mb-1">{s.k}</div>
                      <div className="font-display font-black italic text-2xl" style={{ color: s.color }}>{s.v}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-4">ACTIVITY — 14 DAYS</div>
                  <div className="h-36 bg-nm-card border border-nm-line rounded-xl p-4">
                    <svg viewBox="0 0 300 100" width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
                      {[0, 1, 2].map(i => (
                        <line key={i} x1="0" x2="300" y1={30 * i + 10} y2={30 * i + 10} stroke="rgba(59,46,35,0.5)" strokeWidth="1" />
                      ))}
                      <polygon points={svgArea} fill="#F4C13D" fillOpacity={0.12} />
                      <polyline points={svgPts} fill="none" stroke="#F4C13D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-4">TOP PERFORMING POST</div>
                  {userPosts[0] ? (
                    <div className="bg-nm-card border border-nm-line rounded-xl overflow-hidden flex shadow-md">
                      <div className="w-20 h-20 shrink-0 relative overflow-hidden">
                        {userPosts[0].image ? (
                          <img 
                            src={userPosts[0].image} 
                            alt={userPosts[0].dish} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FoodPlaceholder label={userPosts[0].dish} style="stripes" bg={userPosts[0].color} fg="#1a0a04" radius={0} />
                        )}
                      </div>
                      <div className="flex-1 px-4 py-3">
                        <div className="text-[13px] font-bold text-nm-ink mb-1">{userPosts[0].dish}</div>
                        <div className="font-mono text-[10px] text-nm-inkDim">♥ {userPosts[0].likes.toLocaleString()} · ★ {userPosts[0].rating}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-nm-inkDim text-[13px] italic">No posts yet.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* ── EDIT PROFILE MODAL ── */}
      <AnimatePresence>
        {showEdit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-nm-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-nm-card border border-nm-line rounded-[24px] overflow-hidden w-full max-w-xl shadow-2xl">
              <div className="flex items-center justify-between p-8 pb-4">
                <div className="font-display font-black italic text-2xl">Edit Profile</div>
                <button onClick={() => setShowEdit(false)} className="text-nm-inkDim hover:text-nm-ink transition-colors"><Icon.X size={20} /></button>
              </div>

              {/* MODAL TABS */}
              <div className="flex px-8 border-b border-nm-line/40">
                {[
                  { id: 'info', label: 'Public Profile', icon: '👤' },
                  { id: 'security', label: 'Account Security', icon: '🔒' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setEditTab(t.id as any); setEditError(''); setEditSuccess(''); }}
                    className={`px-4 py-3 font-bold text-[13px] border-b-2 transition-all flex items-center gap-2 ${
                      editTab === t.id ? 'border-nm-yellow text-nm-yellow' : 'border-transparent text-nm-inkDim hover:text-nm-ink'
                    }`}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>

              <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {editTab === 'info' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2 block">DISPLAY NAME</label>
                        <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Chef Poy" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2 block">LOCATION</label>
                        <input value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Bangkok, Thailand" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2 block">SPECIALTY</label>
                      <input value={editSpecialty} onChange={e => setEditSpecialty(e.target.value)} placeholder="e.g. Isaan food & fusion" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2 block">AVATAR URL / PRESET</label>
                      <input value={editAvatar} onChange={e => setEditAvatar(e.target.value)} placeholder="https://image.com/avatar.png" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" />
                      <p className="font-mono text-[9px] text-nm-inkDim mt-2 uppercase tracking-tight">Pro tip: Use a link to your best food photo or leave blank for initials.</p>
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2 block">BIO (MAX 160)</label>
                      <textarea value={editBio} onChange={e => setEditBio(e.target.value.slice(0, 160))} placeholder="Tell the community about yourself…" rows={3} className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors resize-none" />
                      <div className="text-right font-mono text-[9px] text-nm-inkDim">{editBio.length}/160</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-nm-yellow/5 border border-nm-yellow/20 rounded-xl p-4 mb-2">
                      <p className="text-[12px] text-nm-yellow leading-relaxed">
                        To change your password, please verify your current password first.
                      </p>
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2 block">CURRENT PASSWORD</label>
                      <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2 block">NEW PASSWORD</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2 block">CONFIRM NEW</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-3 text-[14px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" />
                      </div>
                    </div>
                  </>
                )}

                {editError && <div className="text-nm-red font-mono text-[11px] bg-nm-red/10 p-3 rounded-xl border border-nm-red/20">{editError}</div>}
                {editSuccess && <div className="text-nm-lime font-mono text-[11px] bg-nm-lime/10 p-3 rounded-xl border border-nm-lime/20">{editSuccess}</div>}
              </div>

              <div className="p-8 pt-4 flex gap-3">
                <button onClick={() => setShowEdit(false)} className="flex-1 py-3 rounded-full border border-nm-line text-nm-inkDim font-bold text-[14px] hover:border-nm-inkDim transition-colors">
                  Cancel
                </button>
                {editTab === 'info' ? (
                  <button onClick={saveEdit} disabled={saving} className="flex-1 py-3 rounded-full bg-nm-yellow text-nm-bg font-black text-[14px] hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                ) : (
                  <button onClick={handlePasswordChange} disabled={saving} className="flex-1 py-3 rounded-full bg-nm-red text-white font-black text-[14px] hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50">
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
