import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Stars } from '../components/shared/Stars';
import { Icon } from '../components/shared/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { Dish } from '../data/types';
import { fetchDishes, createDish, updateDish, deleteDish, updateDishStatus } from '../api/dishes';
import { fetchPosts, deletePost, restorePost } from '../api/posts';
import { fetchUsers, toggleBan } from '../api/users';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type AdminTab = 'dashboard' | 'recipes' | 'community' | 'users';

const DISH_TAGS = ['stirfry', 'soup', 'rice', 'noodle', 'salad', 'curry', 'dessert', 'snack'];
const STATUS_OPTIONS = ['Rising', 'Stable', 'Featured', 'Hidden'];

const CHART_DATA: Record<TimeRange, { points: number[]; label: string; peak: string; avg: string }> = {
  '7d': { label: 'Daily active cooks · 7 days', peak: '9,841', avg: '7,203', points: [62, 71, 55, 80, 90, 68, 74] },
  '30d': { label: 'Daily active cooks · 30 days', peak: '11,204', avg: '8,442', points: [50, 58, 65, 72, 60, 55, 80, 70, 65, 90, 85, 75, 68, 72, 80, 65, 70, 88, 92, 75, 68, 72, 65, 80, 85, 70, 75, 68, 80, 72] },
  '90d': { label: 'Daily active cooks · 90 days', peak: '13,560', avg: '8,891', points: Array.from({ length: 90 }, (_, i) => Math.round(45 + Math.sin(i / 7) * 15 + Math.sin(i / 30) * 20 + ((i % 7 === 0 || i % 7 === 6) ? 25 : 0))) },
  '1y': { label: 'Weekly active cooks · 1 year', peak: '14,200', avg: '9,104', points: [60,55,62,68,72,65,70,75,80,85,78,72,68,74,80,85,90,88,82,75,70,72,68,65,70,75,80,82,78,72,68,65,70,75,80,85,88,84,78,74,70,72,68,65,70,75,80,82,78,72,68,65] },
};

const STATS_BY_RANGE: Record<TimeRange, { k: string; v: string; d: string; color: string }[]> = {
  '7d': [{ k:'TOTAL USERS',v:'24,891',d:'+2.1% vs last week',color:'#F4C13D' },{ k:'RECIPES',v:'1,204',d:'+8 this week',color:'#B8D63D' },{ k:'DAILY COOKS',v:'7,203',d:'-1.4%',color:'#E84A2A' },{ k:'AVG RATING',v:'4.71',d:'stable',color:'#F8EAD0' }],
  '30d': [{ k:'TOTAL USERS',v:'24,891',d:'+12.4%',color:'#F4C13D' },{ k:'RECIPES',v:'1,204',d:'+48 this week',color:'#B8D63D' },{ k:'DAILY COOKS',v:'8,442',d:'+3.2%',color:'#E84A2A' },{ k:'AVG RATING',v:'4.74',d:'stable',color:'#F8EAD0' }],
  '90d': [{ k:'TOTAL USERS',v:'22,104',d:'+34.1%',color:'#F4C13D' },{ k:'RECIPES',v:'1,156',d:'+102 this quarter',color:'#B8D63D' },{ k:'DAILY COOKS',v:'8,891',d:'+9.7%',color:'#E84A2A' },{ k:'AVG RATING',v:'4.70',d:'+0.04',color:'#F8EAD0' }],
  '1y': [{ k:'TOTAL USERS',v:'18,340',d:'+82.6% YoY',color:'#F4C13D' },{ k:'RECIPES',v:'1,054',d:'+430 this year',color:'#B8D63D' },{ k:'DAILY COOKS',v:'9,104',d:'+22.1% YoY',color:'#E84A2A' },{ k:'AVG RATING',v:'4.68',d:'+0.12 YoY',color:'#F8EAD0' }],
};

const MOCK_ACTIVITY = [
  { id:1,type:'user',text:'@nim_eats joined the market',time:'2m ago',color:'#F4C13D' },
  { id:2,type:'post',text:'New remix: "Secret Tom Yum"',time:'5m ago',color:'#E84A2A' },
  { id:3,type:'admin',text:'Daily stats compiled',time:'12m ago',color:'#B8D63D' },
  { id:4,type:'match',text:'1,200 matches generated',time:'15m ago',color:'#F8EAD0' },
  { id:5,type:'user',text:'@chef_poy signed up',time:'22m ago',color:'#F4C13D' },
  { id:6,type:'post',text:'Trending: Pad Thai Remix',time:'30m ago',color:'#E84A2A' },
  { id:7,type:'system',text:'Backup completed',time:'45m ago',color:'#C8A878' },
];

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${i * (100 / (data.length - 1))},${30 - (v / max) * 25}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" width="100%" height="30" className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const DashboardTab: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => { fetchDishes().then(d => setDishes(d.slice(0,8).sort((a,b) => b.reviews - a.reviews))); }, []);

  const chartData = CHART_DATA[timeRange];
  const stats = STATS_BY_RANGE[timeRange];
  const svgPoints = useMemo(() => {
    const vals = chartData.points; const max = Math.max(...vals); const w = 400; const h = 140;
    const pts = vals.map((v, i) => `${i * (w / (vals.length - 1))},${h - (v / max) * 120}`).join(' ');
    return { pts, area: `0,${h} ${pts} ${w},${h}` };
  }, [chartData]);

  const handleExportCSV = () => {
    const headers = ['#','Dish','Thai Name','Cooks','Rating','Avg Time (min)','Status'];
    const rows = dishes.map((d, i) => [String(i+1).padStart(2,'0'),d.en,d.th,d.reviews,d.rating,d.time,i%3===0?'Rising':i%3===1?'Stable':'Featured']);
    const csv = [headers,...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `night-market-dishes-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={`${timeRange}-${s.k}`} initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
            className="group bg-nm-card border border-nm-line rounded-3xl p-6 shadow-xl hover:border-nm-yellow/40 transition-all relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] uppercase">{s.k}</div>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-nm-inkDim">{s.d}</div>
              </div>
              <div className="font-display font-black italic text-4xl leading-none mb-6" style={{ color:s.color }}>{s.v}</div>
              <Sparkline data={CHART_DATA['7d'].points} color={s.color} />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <motion.div key={timeRange} initial={{ opacity:0,scale:0.98 }} animate={{ opacity:1,scale:1 }}
            className="bg-nm-card border border-nm-line rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 relative z-10">
              <div>
                <h3 className="text-[18px] font-black text-nm-ink mb-1">Kitchen Pulse</h3>
                <p className="font-mono text-[10px] text-nm-inkDim uppercase tracking-widest">{chartData.label}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[16px] font-black text-nm-yellow leading-tight">{chartData.peak}</div>
                  <div className="font-mono text-[8px] text-nm-inkDim uppercase tracking-widest">Peak Cooks</div>
                </div>
                <div className="h-8 w-px bg-nm-line" />
                <div className="text-right">
                  <div className="text-[16px] font-black text-nm-lime leading-tight">{chartData.avg}</div>
                  <div className="font-mono text-[8px] text-nm-inkDim uppercase tracking-widest">Avg Pulse</div>
                </div>
                <div className="flex gap-1 p-1 bg-nm-bg/40 border border-nm-line rounded-full ml-2">
                  {(['7d','30d','90d','1y'] as TimeRange[]).map(r => (
                    <button key={r} onClick={() => setTimeRange(r)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black transition-all ${r===timeRange?'bg-nm-yellow text-nm-bg':'text-nm-inkDim hover:text-nm-ink'}`}>
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-64 relative z-10">
              <svg viewBox="0 0 400 160" width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
                {[0,1,2,3].map(i => <line key={i} x1="0" x2="400" y1={40*i+10} y2={40*i+10} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />)}
                <motion.polygon initial={{ opacity:0 }} animate={{ opacity:0.1 }} transition={{ duration:1 }} points={svgPoints.area} fill="#E84A2A" />
                <motion.polyline initial={{ pathLength:0 }} animate={{ pathLength:1 }} transition={{ duration:1.5,ease:'easeInOut' }}
                  points={svgPoints.pts} fill="none" stroke="#E84A2A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {chartData.points.map((v, i) => {
                  const max = Math.max(...chartData.points); const step = Math.max(1,Math.floor(chartData.points.length/6));
                  if (i%step!==0) return null;
                  return (<g key={i}><circle cx={i*(400/(chartData.points.length-1))} cy={140-(v/max)*120} r="6" fill="#1a1a1a" stroke="#F4C13D" strokeWidth="2" /><text x={i*(400/(chartData.points.length-1))} y={140-(v/max)*120-12} textAnchor="middle" className="font-mono text-[8px] fill-nm-yellow font-bold">{v}%</text></g>);
                })}
              </svg>
            </div>
          </motion.div>

          <div className="bg-nm-card border border-nm-line rounded-[32px] overflow-hidden shadow-2xl">
            <div className="px-8 py-5 border-b border-nm-line flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-[15px] font-black text-nm-ink">Top Market Performers</h3>
              <button onClick={handleExportCSV} className="px-4 py-1.5 rounded-full border border-nm-line text-[10px] font-black text-nm-yellow hover:bg-nm-yellow hover:text-nm-bg transition-all tracking-widest uppercase">EXPORT DATA</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="font-mono text-[9px] text-nm-inkDim uppercase tracking-widest border-b border-nm-line/40"><th className="px-8 py-4 font-normal">#</th><th className="px-8 py-4 font-normal">RECIPE</th><th className="px-8 py-4 font-normal">PULSE</th><th className="px-8 py-4 font-normal">STABILITY</th></tr></thead>
                <tbody className="divide-y divide-nm-line/20">
                  {dishes.map((d, i) => (
                    <tr key={d.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-5 font-mono text-nm-inkDim text-[11px]">{String(i+1).padStart(2,'0')}</td>
                      <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl shrink-0 border border-nm-line/50 p-1 bg-nm-bg shadow-inner"><div className="w-full h-full rounded-lg" style={{ backgroundColor:d.color }} /></div><div><button onClick={() => navigate(`/recipe/${d.id}`)} className="text-[14px] font-bold text-nm-ink hover:text-nm-yellow transition-colors leading-tight text-left">{d.en}</button><div className="font-thai text-[11px] text-nm-inkDim">{d.th}</div></div></div></td>
                      <td className="px-8 py-5"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-nm-yellow animate-pulse" /><span className="font-mono text-[13px] font-bold text-nm-cream">{d.reviews.toLocaleString()}</span></div></td>
                      <td className="px-8 py-5"><div className="w-24 h-1.5 bg-nm-bg rounded-full overflow-hidden border border-nm-line"><motion.div initial={{ width:0 }} animate={{ width:`${60+(d.trending||1)*3}%` }} transition={{ duration:1,delay:i*0.1 }} className="h-full bg-nm-lime shadow-[0_0_8px_rgba(184,214,61,0.4)]" /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-nm-card border border-nm-line rounded-[32px] p-8 shadow-2xl flex flex-col h-full sticky top-10 max-h-[calc(100vh-180px)] overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[16px] font-black text-nm-ink">Live Activity</h3>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-nm-lime animate-ping" /><span className="font-mono text-[9px] text-nm-lime font-black uppercase tracking-widest">Live</span></div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
              {MOCK_ACTIVITY.map((act, i) => (
                <motion.div key={act.id} initial={{ opacity:0,x:10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.1 }} className="relative pl-6 border-l border-nm-line/40 pb-2">
                  <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-nm-card" style={{ backgroundColor:act.color }} />
                  <div className="font-mono text-[11px] text-nm-ink leading-relaxed mb-1">{act.text}</div>
                  <div className="font-mono text-[9px] text-nm-inkDim uppercase tracking-wider">{act.time}</div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-nm-line/40">
              <div className="bg-nm-bg/40 border border-nm-line rounded-2xl p-4">
                <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-3">System Health</div>
                <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold">API Response</span><span className="font-mono text-[11px] text-nm-lime">14ms</span></div>
                <div className="h-1.5 bg-nm-bg rounded-full overflow-hidden"><div className="h-full bg-nm-lime w-[94%]" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecipesTab: React.FC = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formEn, setFormEn] = useState('');
  const [formTh, setFormTh] = useState('');
  const [formTag, setFormTag] = useState('stirfry');
  const [formTime, setFormTime] = useState(20);
  const [formSpicy, setFormSpicy] = useState(2);
  const [formDiff, setFormDiff] = useState(1);
  const [formKcal, setFormKcal] = useState(400);
  const [formDesc, setFormDesc] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formYoutube, setFormYoutube] = useState('');
  const [formStatus, setFormStatus] = useState('Stable');
  const [formSteps, setFormSteps] = useState<{ t: string; d: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadDishes = () => {
    // Admin sees all including hidden — fetch with admin token
    fetchDishes().then(setDishes).finally(() => setLoading(false));
  };

  useEffect(() => { loadDishes(); }, []);

  const setStatus = async (id: string, status: string) => {
    await updateDishStatus(id, status);
    setDishes(prev => prev.map(d => d.id === id ? { ...d, status } as any : d));
  };

  const handleDeleteDish = async (id: string) => {
    await deleteDish(id);
    setDishes(prev => prev.filter(d => d.id !== id));
    setDeleteConfirm(null);
  };

  const submitRecipe = async () => {
    if (!formEn.trim() || !formDesc.trim() || !formIngredients.trim()) {
      setFormError('Name (EN), description, and ingredients are required.');
      return;
    }
    setFormError('');
    try {
      const data = {
        en: formEn.trim(), th: formTh.trim() || formEn.trim(), tag: formTag,
        time: formTime, spicy: formSpicy, difficulty: formDiff, kcal: formKcal,
        desc: formDesc.trim(), ingredients: formIngredients.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
        steps: formSteps.filter(s => s.t.trim() || s.d.trim()),
        image: formImage.trim() || undefined,
        youtube: formYoutube.trim() || undefined,
        status: formStatus,
      };

      if (editingId) {
        const updated = await updateDish(editingId, data);
        setDishes(prev => prev.map(d => d.id === editingId ? updated : d));
        setEditingId(null);
      } else {
        const newDish = await createDish(data);
        setDishes(prev => [...prev, newDish]);
      }
      
      resetForm();
      setShowAddForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save recipe.');
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => setFormSteps(prev => [...prev, { t: '', d: '' }]);
  const removeStep = (index: number) => setFormSteps(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ t: '', d: '' }]);
  const updateStep = (index: number, field: 't' | 'd', value: string) => {
    setFormSteps(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormEn(''); setFormTh(''); setFormTag('stirfry'); setFormTime(20);
    setFormSpicy(2); setFormDiff(1); setFormKcal(400); setFormDesc(''); 
    setFormIngredients(''); setFormImage(''); setFormYoutube(''); setFormStatus('Stable');
    setFormSteps([{ t: '', d: '' }]);
    setEditingId(null); setFormError('');
  };

  const handleEdit = (dish: Dish) => {
    setFormEn(dish.en);
    setFormTh(dish.th);
    setFormTag(dish.tag);
    setFormTime(dish.time);
    setFormSpicy(dish.spicy);
    setFormDiff(dish.difficulty);
    setFormKcal(dish.kcal);
    setFormDesc(dish.desc);
    setFormIngredients(dish.ingredients.join(', '));
    setFormImage(dish.image || '');
    setFormYoutube(dish.youtube || '');
    setFormStatus((dish as any).status || 'Stable');
    setFormSteps(dish.steps && dish.steps.length > 0 ? dish.steps : [{ t: '', d: '' }]);
    setEditingId(dish.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = (dish: Dish) => {
    handleEdit(dish);
    setEditingId(null); // Clear ID to make it a "new" dish
    setFormEn(`${dish.en} (Copy)`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDishes.length) setSelectedIds([]);
    else setSelectedIds(filteredDishes.map(d => d.id));
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (!selectedIds.length) return;
    await Promise.all(selectedIds.map(id => updateDishStatus(id, newStatus)));
    setDishes(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status: newStatus } as any : d));
    setSelectedIds([]);
  };

  const filteredDishes = dishes.filter(d => {
    const matchesSearch = d.en.toLowerCase().includes(searchQuery.toLowerCase()) || d.th.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter === 'all' || d.tag === tagFilter;
    const matchesStatus = statusFilter === 'all' || ((d as any).status || 'Stable') === statusFilter;
    return matchesSearch && matchesTag && matchesStatus;
  });

  if (loading) return <div className="text-nm-inkDim font-mono text-[13px] py-12 text-center">Loading recipes…</div>;

  const adminAdded = dishes.filter(d => (d as any).source === 'admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[20px] font-black text-nm-ink">Recipe Management</div>
          <div className="font-mono text-[11px] text-nm-inkDim">{dishes.length} total recipes · {adminAdded.length} admin-added</div>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mr-4 bg-nm-red/10 border border-nm-red/30 px-4 py-2 rounded-xl">
              <span className="font-mono text-[11px] text-nm-red font-bold">{selectedIds.length} selected</span>
              <div className="h-4 w-px bg-nm-red/20 mx-1" />
              <select onChange={e => handleBulkStatus(e.target.value)} className="bg-transparent text-[11px] font-bold text-nm-red outline-none">
                <option value="">Set Status...</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button onClick={() => { if(showAddForm) resetForm(); setShowAddForm(v => !v); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-nm-yellow text-nm-bg font-black text-[13px] hover:brightness-110 active:scale-95 transition-all shadow-lg">
            <Icon.Plus size={14} className={showAddForm && editingId ? 'rotate-45 transition-transform' : ''} /> {editingId ? 'Editing Recipe' : 'Add Recipe'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Icon.Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-nm-inkDim" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search recipes..." 
            className="w-full bg-nm-card border border-nm-line rounded-xl pl-10 pr-4 py-2.5 text-[13px] focus:border-nm-yellow/50 outline-none transition-all" />
        </div>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} 
          className="bg-nm-card border border-nm-line rounded-xl px-4 py-2.5 text-[13px] focus:border-nm-yellow/50 outline-none">
          <option value="all">All Categories</option>
          {DISH_TAGS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} 
          className="bg-nm-card border border-nm-line rounded-xl px-4 py-2.5 text-[13px] focus:border-nm-yellow/50 outline-none">
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }} className="overflow-hidden">
            <div className="bg-nm-card border border-nm-yellow/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-mono text-[10px] text-nm-yellow tracking-widest uppercase">{editingId ? 'Edit Recipe' : 'New Recipe'}</div>
                {editingId && <button onClick={resetForm} className="text-[10px] font-bold text-nm-inkDim hover:text-nm-ink uppercase">Reset to New</button>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Name (EN) *</label><input value={formEn} onChange={e => setFormEn(e.target.value)} placeholder="e.g. Pad See Ew" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-2.5 text-[13px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" /></div>
                <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Name (TH)</label><input value={formTh} onChange={e => setFormTh(e.target.value)} placeholder="e.g. ผัดซีอิ๊ว" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-2.5 text-[13px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" /></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Category</label><select value={formTag} onChange={e => setFormTag(e.target.value)} className="w-full bg-nm-bg border border-nm-line rounded-xl px-3 py-2.5 text-[13px] text-nm-ink focus:outline-none focus:border-nm-yellow/50 transition-colors">{DISH_TAGS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Cook time (min)</label><input type="number" value={formTime} onChange={e => setFormTime(Number(e.target.value))} min={1} className="w-full bg-nm-bg border border-nm-line rounded-xl px-3 py-2.5 text-[13px] text-nm-ink focus:outline-none focus:border-nm-yellow/50 transition-colors" /></div>
                <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Spice (1–5)</label><input type="number" value={formSpicy} onChange={e => setFormSpicy(Math.max(1,Math.min(5,Number(e.target.value))))} min={1} max={5} className="w-full bg-nm-bg border border-nm-line rounded-xl px-3 py-2.5 text-[13px] text-nm-ink focus:outline-none focus:border-nm-yellow/50 transition-colors" /></div>
                <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Calories</label><input type="number" value={formKcal} onChange={e => setFormKcal(Number(e.target.value))} min={0} className="w-full bg-nm-bg border border-nm-line rounded-xl px-3 py-2.5 text-[13px] text-nm-ink focus:outline-none focus:border-nm-yellow/50 transition-colors" /></div>
                <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Status</label><select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full bg-nm-bg border border-nm-line rounded-xl px-3 py-2.5 text-[13px] text-nm-ink focus:outline-none focus:border-nm-yellow/50 transition-colors">{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Image URL / Path</label><input value={formImage} onChange={e => setFormImage(e.target.value)} placeholder="images/dishes/new.png" className="w-full bg-nm-bg border border-nm-line rounded-xl px-3 py-2.5 text-[13px] text-nm-ink focus:outline-none focus:border-nm-yellow/50 transition-colors" /></div>
                <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">YouTube Tutor Link</label><input value={formYoutube} onChange={e => setFormYoutube(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-nm-bg border border-nm-line rounded-xl px-3 py-2.5 text-[13px] text-nm-ink focus:outline-none focus:border-nm-yellow/50 transition-colors" /></div>
              </div>
              <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Ingredients * <span className="normal-case tracking-normal text-[10px]">(comma-separated IDs: chicken, garlic, chili)</span></label><input value={formIngredients} onChange={e => setFormIngredients(e.target.value)} placeholder="chicken, garlic, chili, fishsauce" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-2.5 text-[13px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors" /></div>
              <div><label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-1 block">Description *</label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} placeholder="Brief description of the dish…" className="w-full bg-nm-bg border border-nm-line rounded-xl px-4 py-2.5 text-[13px] text-nm-ink placeholder-nm-inkDim focus:outline-none focus:border-nm-yellow/50 transition-colors resize-none" /></div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase">Method Steps</label>
                  <button onClick={addStep} className="text-[10px] font-black text-nm-yellow hover:underline uppercase tracking-widest">+ Add Step</button>
                </div>
                <div className="space-y-3">
                  {formSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-nm-bg/30 p-4 rounded-xl border border-nm-line/30 group">
                      <div className="pt-2 font-mono text-[10px] text-nm-yellow font-bold shrink-0">{String(idx + 1).padStart(2, '0')}</div>
                      <div className="flex-1 space-y-2">
                        <input
                          value={step.t}
                          onChange={e => updateStep(idx, 't', e.target.value)}
                          placeholder="Step title (e.g. Prep, Sear, Simmer)"
                          className="w-full bg-transparent border-b border-nm-line/40 focus:border-nm-yellow/50 outline-none py-1 text-[13px] font-bold text-nm-ink transition-colors"
                        />
                        <textarea
                          value={step.d}
                          onChange={e => updateStep(idx, 'd', e.target.value)}
                          rows={2}
                          placeholder="Detailed instructions..."
                          className="w-full bg-transparent outline-none text-[12px] text-nm-inkDim placeholder-nm-inkDim resize-none"
                        />
                      </div>
                      <button 
                        onClick={() => removeStep(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-nm-inkDim hover:text-nm-red transition-all"
                      >
                        <Icon.X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {formError && <div className="text-nm-red font-mono text-[11px]">{formError}</div>}
              <div className="flex gap-3">
                <button onClick={() => { setShowAddForm(false); resetForm(); }} className="px-5 py-2 rounded-full border border-nm-line text-nm-inkDim font-bold text-[13px] hover:border-nm-inkDim transition-all">Cancel</button>
                <button onClick={submitRecipe} disabled={saving} className="px-6 py-2 rounded-full bg-nm-yellow text-nm-bg font-black text-[13px] hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update Recipe' : 'Add Recipe →'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-nm-card border border-nm-line rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="font-mono text-[10px] text-nm-inkDim uppercase tracking-widest bg-nm-bg/30">
                <th className="px-5 py-3 font-normal">
                  <input type="checkbox" checked={selectedIds.length === filteredDishes.length && filteredDishes.length > 0} onChange={toggleSelectAll} className="accent-nm-yellow" />
                </th>
                <th className="px-5 py-3 font-normal">DISH</th>
                <th className="px-5 py-3 font-normal">INFO</th>
                <th className="px-5 py-3 font-normal">★</th>
                <th className="px-5 py-3 font-normal">STATUS</th>
                <th className="px-5 py-3 font-normal">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nm-line/40">
              {filteredDishes.map(d => {
                const status = (d as any).status || 'Stable';
                const isAdminAdded = (d as any).source === 'admin';
                const isSelected = selectedIds.includes(d.id);
                return (
                  <tr key={d.id} className={`hover:bg-white/[0.02] transition-colors group ${isSelected ? 'bg-nm-yellow/[0.03]' : ''}`}>
                    <td className="px-5 py-3"><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(d.id)} className="accent-nm-yellow" /></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden bg-nm-bg border border-nm-line/50 p-0.5">{d.image ? <img src={d.image} alt={d.en} className="w-full h-full object-cover rounded-md" /> : <div className="w-full h-full rounded-md" style={{ backgroundColor:d.color }} />}</div><div><button onClick={() => navigate(`/recipe/${d.id}`)} className="text-[14px] font-bold text-nm-ink hover:text-nm-yellow transition-colors text-left block">{d.en}</button><div className="font-thai text-[11px] text-nm-inkDim">{d.th}</div></div></div></td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-mono text-[10px] text-nm-inkDim">
                          <Icon.Clock size={10} /> {d.time}m
                          <span className="mx-1">·</span>
                          <span className="text-nm-red">{'🔥'.repeat(d.spicy)}</span>
                        </div>
                        <span className={`w-fit px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${isAdminAdded ? 'bg-nm-yellow/10 text-nm-yellow border border-nm-yellow/30' : 'bg-nm-line/30 text-nm-inkDim'}`}>{isAdminAdded ? 'Admin' : 'Core'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-nm-yellow font-bold">{d.rating}</td>
                    <td className="px-5 py-3"><select value={status} onChange={e => setStatus(d.id, e.target.value)} className="bg-nm-bg border border-nm-line rounded-lg px-2 py-1 text-[11px] text-nm-ink focus:outline-none focus:border-nm-yellow/50 transition-colors">{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg text-nm-inkDim hover:text-nm-yellow hover:bg-nm-yellow/10 transition-all" title="Edit Recipe"><Icon.Settings size={14} /></button>
                        <button onClick={() => handleDuplicate(d)} className="p-1.5 rounded-lg text-nm-inkDim hover:text-nm-lime hover:bg-nm-lime/10 transition-all" title="Duplicate Recipe"><Icon.Plus size={14} /></button>
                        {isAdminAdded && (deleteConfirm === d.id ? (
                          <div className="flex items-center gap-2 bg-nm-red/10 px-2 py-1 rounded-lg">
                            <button onClick={() => handleDeleteDish(d.id)} className="text-[10px] text-nm-red font-black hover:underline">Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-[10px] text-nm-inkDim hover:underline">X</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(d.id)} className="p-1.5 rounded-lg text-nm-inkDim hover:text-nm-red hover:bg-nm-red/10 transition-all" title="Delete Recipe"><Icon.Trash size={14} /></button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDishes.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-nm-inkDim font-mono text-[13px]">No recipes found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CommunityTab: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'deleted'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts(true).then(setPosts).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await deletePost(id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, deleted: true } : p));
    setConfirmDelete(null);
  };

  const handleRestore = async (id: string) => {
    await restorePost(id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, deleted: false } : p));
  };

  const filteredPosts = posts.filter(p => {
    if (filter === 'active') return !p.deleted;
    if (filter === 'deleted') return p.deleted;
    return true;
  });

  const deletedCount = posts.filter(p => p.deleted).length;

  if (loading) return <div className="text-nm-inkDim font-mono text-[13px] py-12 text-center">Loading posts…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-[20px] font-black text-nm-ink">Community Moderation</div>
          <div className="font-mono text-[11px] text-nm-inkDim">{posts.length} total posts · {deletedCount} deleted</div>
        </div>
        <div className="flex gap-1 p-1 bg-nm-card border border-nm-line rounded-full">
          {(['all','active','deleted'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all ${f===filter?'bg-nm-yellow text-nm-bg shadow-md':'text-nm-ink hover:text-nm-yellow'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredPosts.map(p => {
          const isDeleted = !!p.deleted;
          return (
            <motion.div key={p.id} layout initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
              className={`bg-nm-card border rounded-2xl p-5 flex items-start gap-4 shadow-md transition-opacity ${isDeleted?'border-nm-red/30 opacity-50':'border-nm-line'}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[15px] text-white shrink-0" style={{ backgroundColor:p.color }}>{p.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[14px] font-bold text-nm-ink">{p.user_id}</span>
                  <span className="font-display italic text-nm-yellow text-[13px]">· {p.dish}</span>
                  {isDeleted && <span className="px-2 py-0.5 rounded-full bg-nm-red/15 text-nm-red text-[9px] font-black uppercase tracking-widest border border-nm-red/30">Deleted</span>}
                </div>
                <p className="text-[12px] text-nm-inkDim leading-relaxed line-clamp-2">{p.caption}</p>
                <div className="flex items-center gap-4 mt-2 font-mono text-[10px] text-nm-inkDim">
                  <span>♥ {p.likes?.toLocaleString()}</span>
                  <span>💬 {p.comments_count}</span>
                  <span>★ {p.rating}</span>
                </div>
              </div>
              <div className="shrink-0">
                {isDeleted ? (
                  <button onClick={() => handleRestore(p.id)} className="px-3 py-1.5 rounded-full border border-nm-lime/40 text-nm-lime text-[11px] font-bold hover:bg-nm-lime/10 transition-all">Restore</button>
                ) : confirmDelete === p.id ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-nm-red font-bold">Delete post?</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(p.id)} className="text-[11px] text-nm-red font-black hover:underline">Delete</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-[11px] text-nm-inkDim hover:underline">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(p.id)} className="p-2 rounded-full text-nm-inkDim hover:text-nm-red hover:bg-nm-red/10 transition-all" title="Delete post"><Icon.X size={16} /></button>
                )}
              </div>
            </motion.div>
          );
        })}
        {filteredPosts.length === 0 && <div className="text-center py-12 text-nm-inkDim font-mono text-[13px]">No posts in this filter.</div>}
      </div>
    </div>
  );
};

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<{ id:string; username:string; color:string; banned:number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers().then(setUsers).finally(() => setLoading(false)); }, []);

  const handleToggleBan = async (id: string) => {
    const { banned } = await toggleBan(id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, banned: banned ? 1 : 0 } : u));
  };

  if (loading) return <div className="text-nm-inkDim font-mono text-[13px] py-12 text-center">Loading users…</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[20px] font-black text-nm-ink">User Management</div>
        <div className="font-mono text-[11px] text-nm-inkDim">{users.length} registered users · {users.filter(u => u.banned).length} banned</div>
      </div>

      {users.length === 0 ? (
        <div className="bg-nm-card border border-nm-line rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">👤</div>
          <div className="text-nm-inkDim font-mono text-[13px]">No registered users yet. Users will appear here once they sign up.</div>
        </div>
      ) : (
        <div className="bg-nm-card border border-nm-line rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead><tr className="font-mono text-[10px] text-nm-inkDim uppercase tracking-widest bg-nm-bg/30"><th className="px-5 py-3 font-normal">USER</th><th className="px-5 py-3 font-normal">STATUS</th><th className="px-5 py-3 font-normal">ACTIONS</th></tr></thead>
            <tbody className="divide-y divide-nm-line/40">
              {users.map(u => {
                const isBanned = !!u.banned;
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] text-white shrink-0" style={{ backgroundColor:u.color }}>{u.username[0].toUpperCase()}</div><div className="font-mono text-[13px] font-bold text-nm-ink">@{u.username}</div></div></td>
                    <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isBanned?'bg-nm-red/10 text-nm-red border-nm-red/30':'bg-nm-lime/10 text-nm-lime border-nm-lime/30'}`}>{isBanned?'Banned':'Active'}</span></td>
                    <td className="px-5 py-4"><button onClick={() => handleToggleBan(u.id)} className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all ${isBanned?'border-nm-lime/40 text-nm-lime hover:bg-nm-lime/10':'border-nm-red/40 text-nm-red hover:bg-nm-red/10'}`}>{isBanned?'Unban':'Ban'}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-nm-card border border-nm-line/50 rounded-2xl p-5">
        <div className="font-mono text-[10px] text-nm-inkDim tracking-widest uppercase mb-2">Admin account</div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-nm-red flex items-center justify-center font-black text-[12px] text-white">A</div>
          <div><div className="font-mono text-[13px] font-bold text-nm-ink">@admin</div><div className="font-mono text-[10px] text-nm-inkDim">Hardcoded · cannot be banned</div></div>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-nm-red/10 text-nm-red border border-nm-red/30 tracking-widest">ADMIN</span>
        </div>
      </div>
    </div>
  );
};

// ---- MAIN COMPONENT ----
const TAB_LABELS: Record<AdminTab, string> = {
  dashboard: 'Kitchen Control Room',
  recipes: 'Recipe Management',
  community: 'Community Moderation',
  users: 'User Management',
};

export const Admin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as AdminTab) || 'dashboard';

  return (
    <div className="p-7 md:p-8 lg:p-10 overflow-auto h-full scrollbar-hide">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="font-mono text-[10px] text-nm-inkDim tracking-[0.25em] uppercase">ADMIN PANEL · {tab.toUpperCase()}</div>
          <span className="px-2 py-0.5 rounded-full bg-nm-red/20 border border-nm-red/40 text-nm-red font-mono text-[8px] font-black tracking-widest uppercase">ADMIN MODE</span>
        </div>
        <div className="font-display font-black italic text-4xl md:text-5xl">{TAB_LABELS[tab]}</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }} transition={{ duration:0.18 }}>
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'recipes' && <RecipesTab />}
          {tab === 'community' && <CommunityTab />}
          {tab === 'users' && <UsersTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
