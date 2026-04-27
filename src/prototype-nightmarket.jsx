// Direction 1: "NIGHT MARKET"
// Bold street-food. Warm charcoal bg, paprika red + turmeric yellow + lime.
// Chunky display type. Neon sign energy. Dashed stall-style borders.

const NM = {
  bg: '#181310',
  card: '#231C17',
  cardHi: '#2A2219',
  ink: '#F8EAD0',
  inkDim: '#C8A878',
  line: '#3B2E23',
  red: '#E84A2A',
  redDeep: '#B5311A',
  yellow: '#F4C13D',
  lime: '#B8D63D',
  cream: '#F8EAD0',
  font: '"Space Grotesk", "Bai Jamjuree", system-ui, sans-serif',
  display: '"Fraunces", "Noto Serif Thai", serif',
  mono: '"JetBrains Mono", monospace',
};

function NmScreenFrame({ children }) {
  return (
    <div style={{
      width:'100%', height:'100%', background:NM.bg, color:NM.ink,
      fontFamily:NM.font, overflow:'hidden', position:'relative',
    }}>
      {/* grain */}
      <div style={{ position:'absolute', inset:0, opacity:.06, pointerEvents:'none',
        backgroundImage:'radial-gradient(#fff 1px, transparent 1px)', backgroundSize:'3px 3px' }} />
      {children}
    </div>
  );
}

function NmNav({ page, setPage, fridgeCount }) {
  const items = [
    { id:'home', th:'หน้าแรก', en:'Home', Icon:Icon.Home },
    { id:'fridge', th:'ตู้เย็น', en:'Fridge', Icon:Icon.Fridge },
    { id:'recs', th:'แนะนำ', en:'Matches', Icon:Icon.Flame },
    { id:'search', th:'ค้นหา', en:'Search', Icon:Icon.Search },
    { id:'random', th:'สุ่ม', en:'Random', Icon:Icon.Shuffle },
    { id:'social', th:'ชุมชน', en:'Community', Icon:Icon.Users },
    { id:'saved', th:'บันทึก', en:'Saved', Icon:Icon.Heart },
    { id:'admin', th:'ผู้ดูแล', en:'Admin', Icon:Icon.Chart },
  ];
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'16px 24px', borderBottom:`1px solid ${NM.line}`,
      background:`linear-gradient(180deg, ${NM.bg}, ${NM.bg}ee)`,
    }}>
      <button onClick={() => setPage('home')} style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'baseline', gap:10 }}>
        <div style={{ fontFamily:NM.display, fontWeight:900, fontStyle:'italic', fontSize:26, color:NM.yellow, lineHeight:1 }}>
          ทานอะไรดี
        </div>
        <div style={{ fontFamily:NM.mono, fontSize:9, letterSpacing:'0.2em', color:NM.inkDim, textTransform:'uppercase' }}>
          / than a rai dee
        </div>
      </button>
      <nav style={{ display:'flex', gap:2 }}>
        {items.map(it => {
          const active = it.id === page;
          return (
            <button key={it.id} onClick={() => setPage(it.id)} style={{
              all:'unset', cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
              padding:'8px 12px', borderRadius:999,
              fontSize:12, fontWeight:600,
              color: active ? NM.bg : NM.ink,
              background: active ? NM.yellow : 'transparent',
              transition:'all .15s',
            }}>
              <it.Icon size={13} />
              <span>{it.en}</span>
              {it.id === 'fridge' && fridgeCount > 0 && (
                <span style={{
                  fontSize:9, padding:'1px 6px', borderRadius:999,
                  background: active ? NM.bg : NM.red, color: active ? NM.yellow : NM.cream,
                }}>{fridgeCount}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── HOME ───
function NmHome({ setPage, fridge }) {
  const trending = DISHES.filter(d => d.trending <= 6).sort((a,b) => a.trending - b.trending);
  return (
    <div style={{ padding:'28px 32px 40px', overflow:'auto', height:'calc(100% - 65px)' }}>
      {/* HERO */}
      <div style={{ position:'relative', borderRadius:18, overflow:'hidden',
        background:`linear-gradient(135deg, ${NM.redDeep} 0%, ${NM.red} 60%, #E8823A 100%)`,
        padding:'36px 36px 32px', marginBottom:28,
        border:`1px solid ${NM.line}`,
      }}>
        <div style={{ position:'absolute', top:14, right:18, fontFamily:NM.mono, fontSize:9,
          color:'#ffd9', letterSpacing:'.2em', opacity:.75 }}>NIGHT MARKET · 22:47</div>
        <div style={{ fontFamily:NM.mono, fontSize:10, color:'#ffd9', letterSpacing:'.3em', marginBottom:16 }}>
          TONIGHT'S QUESTION —
        </div>
        <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:64, lineHeight:0.95,
          color:NM.cream, marginBottom:8, textShadow:'0 2px 0 rgba(0,0,0,.2)', maxWidth:720 }}>
          What's in your<br/>fridge, <span style={{ color:NM.yellow }}>friend?</span>
        </div>
        <div style={{ fontFamily:'Noto Serif Thai, serif', fontWeight:700, fontSize:22, color:'#ffe4b5', marginBottom:26 }}>
          คุณมีวัตถุดิบอะไร เราจะบอกว่าทำอะไรดี
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setPage('fridge')} style={{
            all:'unset', cursor:'pointer', padding:'14px 22px', borderRadius:999,
            background:NM.yellow, color:NM.bg, fontWeight:800, fontSize:14,
            display:'inline-flex', alignItems:'center', gap:8,
          }}>
            <Icon.Fridge size={15}/> Show me what to cook →
          </button>
          <button onClick={() => setPage('random')} style={{
            all:'unset', cursor:'pointer', padding:'14px 22px', borderRadius:999,
            border:`1.5px solid ${NM.cream}`, color:NM.cream, fontWeight:700, fontSize:14,
            display:'inline-flex', alignItems:'center', gap:8,
          }}>
            <Icon.Shuffle size={15}/> I can't decide — spin it
          </button>
        </div>
        {/* corner placeholder food photo */}
        <div style={{ position:'absolute', right:-30, bottom:-30, width:260, height:260, opacity:.85,
          transform:'rotate(-8deg)' }}>
          <FoodPlaceholder label="hero · krapow" style="wavy" bg="#E8823A" fg="#4a1a0a" radius={200} />
        </div>
      </div>

      {/* 4 ENTRY TILES */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:32 }}>
        {[
          { id:'fridge', th:'ตู้เย็นของฉัน', en:'My Fridge', sub:`${fridge.length} items · tap to manage`, color:NM.yellow, Icon:Icon.Fridge },
          { id:'recs', th:'แมตช์แล้ว', en:'Matched for you', sub:`${DISHES.filter(d => matchStats(fridge,d).pct >= 60).length} dishes ≥ 60%`, color:NM.red, Icon:Icon.Flame },
          { id:'search', th:'ค้นหา', en:'Search & Filter', sub:'noodle, vegan, <15 min…', color:NM.lime, Icon:Icon.Search },
          { id:'random', th:'สุ่มเมนู', en:'Spin the wheel', sub:'when nothing sounds good', color:NM.cream, Icon:Icon.Shuffle },
        ].map(t => (
          <button key={t.id} onClick={() => setPage(t.id)} style={{
            all:'unset', cursor:'pointer', padding:18, borderRadius:14,
            background:NM.card, border:`1px solid ${NM.line}`, color:NM.ink,
            display:'flex', flexDirection:'column', gap:10, minHeight:110,
            transition:'transform .15s, border-color .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.transform='translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = NM.line; e.currentTarget.style.transform='translateY(0)'; }}>
            <div style={{ width:36, height:36, borderRadius:10, background:t.color, color:NM.bg,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <t.Icon size={18}/>
            </div>
            <div>
              <div style={{ fontFamily:'Noto Sans Thai, sans-serif', fontSize:11, color:NM.inkDim, marginBottom:2 }}>{t.th}</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{t.en}</div>
              <div style={{ fontSize:11, color:NM.inkDim, fontFamily:NM.mono }}>{t.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* TRENDING */}
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', textTransform:'uppercase', marginBottom:4 }}>
            TRENDING · กำลังมาแรง
          </div>
          <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:800, fontSize:28 }}>
            What the city is cooking tonight
          </div>
        </div>
        <button style={{ all:'unset', cursor:'pointer', fontSize:12, color:NM.yellow, fontWeight:600 }}>
          see all 142 →
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 }}>
        {trending.slice(0, 6).map(d => {
          const m = matchStats(fridge, d);
          return (
            <button key={d.id} onClick={() => setPage('recipe:'+d.id)} style={{
              all:'unset', cursor:'pointer', borderRadius:14, overflow:'hidden',
              background:NM.card, border:`1px solid ${NM.line}`,
              display:'flex', flexDirection:'column',
            }}>
              <div style={{ position:'relative', height:140 }}>
                <FoodPlaceholder label={d.en} style="stripes" bg={d.color} fg="#1a0a04" radius={0}/>
                <div style={{ position:'absolute', top:10, left:10,
                  padding:'4px 8px', borderRadius:999, fontSize:10, fontFamily:NM.mono,
                  background:NM.bg, color:NM.yellow, fontWeight:700 }}>
                  #{d.trending} TRENDING
                </div>
                <div style={{ position:'absolute', bottom:10, right:10,
                  padding:'4px 8px', borderRadius:999, fontSize:10, fontWeight:700,
                  background: m.pct >= 70 ? NM.lime : m.pct >= 40 ? NM.yellow : NM.cardHi,
                  color: m.pct >= 40 ? NM.bg : NM.inkDim }}>
                  {m.pct}% MATCH
                </div>
              </div>
              <div style={{ padding:'14px 14px 16px' }}>
                <div style={{ fontFamily:'Noto Sans Thai', fontSize:12, color:NM.inkDim, marginBottom:2 }}>{d.th}</div>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{d.en}</div>
                <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:11, color:NM.inkDim, fontFamily:NM.mono }}>
                  <span>★ {d.rating}</span>
                  <span>·</span>
                  <span>{d.time}min</span>
                  <span>·</span>
                  <span>{d.kcal}kcal</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── FRIDGE ───
function NmFridge({ fridge, setFridge, setPage }) {
  const [query, setQuery] = useState('');
  const cats = [...new Set(INGREDIENTS.map(i => i.cat))];
  const toggle = (id) => setFridge(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  const matched = DISHES.filter(d => matchStats(fridge, d).pct >= 60).length;
  const filtered = INGREDIENTS.filter(i =>
    !query || i.en.toLowerCase().includes(query.toLowerCase()) || i.th.includes(query)
  );
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', height:'calc(100% - 65px)' }}>
      <div style={{ padding:'28px 32px', overflow:'auto' }}>
        <div style={{ marginBottom:22 }}>
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:6 }}>01 / MY FRIDGE</div>
          <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:42, lineHeight:1 }}>
            Tell us what's <span style={{ color:NM.yellow }}>inside.</span>
          </div>
          <div style={{ color:NM.inkDim, fontSize:13, marginTop:8 }}>
            Type, tap, or drag. More ingredients = better matches.
          </div>
        </div>

        <div style={{ position:'relative', marginBottom:22 }}>
          <div style={{ position:'absolute', top:'50%', left:16, transform:'translateY(-50%)', color:NM.inkDim }}>
            <Icon.Search size={15}/>
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search ingredients  ·  พิมพ์เช่น ไก่, กระเทียม..." style={{
              width:'100%', boxSizing:'border-box', padding:'14px 16px 14px 42px',
              background:NM.card, border:`1px solid ${NM.line}`, borderRadius:12,
              color:NM.ink, fontSize:14, fontFamily:NM.font, outline:'none',
            }}/>
        </div>

        {cats.map(cat => {
          const items = filtered.filter(i => i.cat === cat);
          if (!items.length) return null;
          return (
            <div key={cat} style={{ marginBottom:22 }}>
              <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:10, textTransform:'uppercase' }}>
                {cat} · {cat === 'protein' ? 'โปรตีน' : cat === 'produce' ? 'ผัก' : 'เครื่องแห้ง'}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {items.map(i => {
                  const on = fridge.includes(i.id);
                  return (
                    <button key={i.id} onClick={() => toggle(i.id)} style={{
                      all:'unset', cursor:'pointer', padding:'9px 14px', borderRadius:999,
                      border:`1.5px solid ${on ? NM.yellow : NM.line}`,
                      background: on ? NM.yellow : NM.card,
                      color: on ? NM.bg : NM.ink, fontSize:13, fontWeight:on ? 700 : 500,
                      display:'inline-flex', alignItems:'center', gap:7,
                    }}>
                      <span style={{ fontSize:15 }}>{i.emoji}</span>
                      <span>{i.en}</span>
                      <span style={{ fontFamily:'Noto Sans Thai', opacity:.6, fontSize:11 }}>{i.th}</span>
                      {on && <Icon.Check size={12}/>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* SIDE PANEL - drag into fridge */}
      <div style={{ borderLeft:`1px solid ${NM.line}`, background:NM.card, padding:24, display:'flex', flexDirection:'column' }}>
        <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:10 }}>
          DRAG INTO FRIDGE
        </div>
        <div style={{ position:'relative', borderRadius:14, background:NM.bg,
          border:`2px dashed ${NM.line}`, padding:16, marginBottom:18,
          minHeight:260, display:'flex', flexWrap:'wrap', gap:6, alignContent:'flex-start' }}>
          <div style={{ position:'absolute', top:8, right:10, fontFamily:NM.mono, fontSize:9, color:NM.inkDim }}>
            {fridge.length} items
          </div>
          {fridge.length === 0 ? (
            <div style={{ color:NM.inkDim, fontSize:12, margin:'auto', textAlign:'center', maxWidth:180 }}>
              Fridge is empty. Tap tags on the left to add.
            </div>
          ) : fridge.map(id => {
            const i = ING[id];
            return (
              <span key={id} onClick={() => setFridge(f => f.filter(x => x !== id))} style={{
                padding:'5px 9px', borderRadius:999, background:NM.cardHi, color:NM.ink,
                fontSize:11, fontWeight:600, cursor:'pointer',
                display:'inline-flex', alignItems:'center', gap:4,
              }}>
                {i.emoji} {i.en} <Icon.X size={10}/>
              </span>
            );
          })}
        </div>

        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em' }}>RESULT</div>
        </div>
        <div style={{ background:NM.bg, borderRadius:14, padding:18, border:`1px solid ${NM.line}`, marginBottom:14 }}>
          <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:56, lineHeight:1, color:NM.yellow }}>
            {matched}
          </div>
          <div style={{ fontSize:13, color:NM.ink, marginTop:4 }}>
            dishes you can cook <span style={{ color:NM.inkDim }}>(≥60% match)</span>
          </div>
        </div>

        <button onClick={() => setPage('recs')} style={{
          all:'unset', cursor:'pointer', padding:'14px 16px', borderRadius:12,
          background:NM.red, color:NM.cream, fontWeight:700, fontSize:13,
          textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:'auto',
        }}>
          See what I can cook <Icon.Arrow size={14}/>
        </button>
      </div>
    </div>
  );
}

// ─── RECOMMENDATIONS ───
function NmRecs({ fridge, setPage }) {
  const [sort, setSort] = useState('match');
  const scored = DISHES.map(d => ({ ...d, ...matchStats(fridge, d) }))
    .sort((a,b) => sort === 'match' ? b.pct - a.pct : sort === 'fast' ? a.time - b.time : b.rating - a.rating);
  return (
    <div style={{ padding:'28px 32px', overflow:'auto', height:'calc(100% - 65px)' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:22 }}>
        <div>
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:6 }}>02 / MATCHED FOR YOU</div>
          <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:42, lineHeight:1 }}>
            With what you have,<br/>you can make <span style={{ color:NM.lime }}>{scored.filter(d => d.pct >= 60).length} dishes.</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:4, padding:4, background:NM.card, borderRadius:999, border:`1px solid ${NM.line}` }}>
          {[['match','Best match'],['fast','Fastest'],['rating','Top rated']].map(([id, label]) => (
            <button key={id} onClick={() => setSort(id)} style={{
              all:'unset', cursor:'pointer', padding:'7px 14px', borderRadius:999, fontSize:12, fontWeight:600,
              background: sort === id ? NM.yellow : 'transparent', color: sort === id ? NM.bg : NM.ink,
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:14 }}>
        {scored.slice(0, 8).map(d => (
          <button key={d.id} onClick={() => setPage('recipe:'+d.id)} style={{
            all:'unset', cursor:'pointer', borderRadius:14, background:NM.card,
            border:`1px solid ${NM.line}`, overflow:'hidden',
            display:'grid', gridTemplateColumns:'160px 1fr',
          }}>
            <div style={{ position:'relative' }}>
              <FoodPlaceholder label={d.en} style="stripes" bg={d.color} fg="#1a0a04" radius={0}/>
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column' }}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:4 }}>
                <div style={{ fontSize:17, fontWeight:700 }}>{d.en}</div>
                <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:22, color: d.pct >= 70 ? NM.lime : d.pct >= 40 ? NM.yellow : NM.inkDim }}>
                  {d.pct}%
                </div>
              </div>
              <div style={{ fontFamily:'Noto Sans Thai', fontSize:12, color:NM.inkDim, marginBottom:10 }}>{d.th}</div>

              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                {d.ingredients.map(id => {
                  const have = fridge.includes(id);
                  const ing = ING[id];
                  return (
                    <span key={id} style={{
                      fontSize:10, padding:'3px 7px', borderRadius:999,
                      background: have ? NM.lime+'22' : NM.cardHi,
                      color: have ? NM.lime : NM.inkDim,
                      border:`1px solid ${have ? NM.lime+'55' : NM.line}`,
                      textDecoration: have ? 'none' : 'line-through',
                      fontWeight: have ? 600 : 500,
                    }}>
                      {have ? '✓ ' : ''}{ing.en}
                    </span>
                  );
                })}
              </div>

              <div style={{ marginTop:'auto', display:'flex', alignItems:'center', gap:10, fontSize:11, color:NM.inkDim, fontFamily:NM.mono }}>
                <span>{d.have.length}/{d.total} in fridge</span>
                <span>·</span>
                <span>{d.time}min</span>
                <span>·</span>
                <span>★ {d.rating}</span>
                <span>·</span>
                <span>{d.kcal}kcal</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SEARCH ───
function NmSearch({ fridge, setPage }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [vegan, setVegan] = useState(false);
  const [timeMax, setTimeMax] = useState(60);
  const [kcalMax, setKcalMax] = useState(800);
  const [spicy, setSpicy] = useState(5);
  const [meal, setMeal] = useState('any');
  const [avoid, setAvoid] = useState([]);

  const results = DISHES.filter(d =>
    (type === 'all' || d.tag === type) &&
    (!vegan || d.vegan) &&
    d.time <= timeMax &&
    d.kcal <= kcalMax &&
    d.spicy <= spicy &&
    (meal === 'any' || d.meal === meal) &&
    !d.ingredients.some(i => avoid.includes(i)) &&
    (!q || d.en.toLowerCase().includes(q.toLowerCase()) || d.th.includes(q))
  );

  const FilterBlock = ({ title, children }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontFamily:NM.mono, fontSize:9, color:NM.inkDim, letterSpacing:'.25em', marginBottom:8, textTransform:'uppercase' }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', height:'calc(100% - 65px)' }}>
      {/* filters */}
      <div style={{ padding:22, overflow:'auto', borderRight:`1px solid ${NM.line}`, background:NM.card }}>
        <FilterBlock title="Dish type">
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {DISH_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)} style={{
                all:'unset', cursor:'pointer', padding:'5px 10px', borderRadius:999,
                fontSize:11, fontWeight:600,
                background: type === t.id ? NM.yellow : 'transparent',
                color: type === t.id ? NM.bg : NM.ink,
                border:`1px solid ${type === t.id ? NM.yellow : NM.line}`,
              }}>{t.en}</button>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Meal">
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {['any','breakfast','lunch','dinner','dessert'].map(m => (
              <button key={m} onClick={() => setMeal(m)} style={{
                all:'unset', cursor:'pointer', padding:'5px 10px', borderRadius:999,
                fontSize:11, fontWeight:600,
                background: meal === m ? NM.yellow : 'transparent',
                color: meal === m ? NM.bg : NM.ink,
                border:`1px solid ${meal === m ? NM.yellow : NM.line}`,
              }}>{m}</button>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title={`Cook time · ≤ ${timeMax} min`}>
          <input type="range" min="5" max="60" step="5" value={timeMax}
            onChange={e => setTimeMax(+e.target.value)}
            style={{ width:'100%', accentColor:NM.red }}/>
        </FilterBlock>

        <FilterBlock title={`Calories · ≤ ${kcalMax} kcal`}>
          <input type="range" min="200" max="800" step="20" value={kcalMax}
            onChange={e => setKcalMax(+e.target.value)}
            style={{ width:'100%', accentColor:NM.red }}/>
        </FilterBlock>

        <FilterBlock title={`Spice · up to ${spicy} 🌶`}>
          <input type="range" min="0" max="5" step="1" value={spicy}
            onChange={e => setSpicy(+e.target.value)}
            style={{ width:'100%', accentColor:NM.red }}/>
        </FilterBlock>

        <FilterBlock title="Diet">
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, cursor:'pointer' }}>
            <input type="checkbox" checked={vegan} onChange={e => setVegan(e.target.checked)} style={{ accentColor:NM.lime }}/>
            Vegetarian / vegan only
          </label>
        </FilterBlock>

        <FilterBlock title="Exclude ingredients">
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {['shrimp','chili','coconut','egg','beef'].map(id => {
              const on = avoid.includes(id);
              return (
                <button key={id} onClick={() => setAvoid(a => on ? a.filter(x => x !== id) : [...a, id])} style={{
                  all:'unset', cursor:'pointer', padding:'4px 9px', borderRadius:999,
                  fontSize:10, fontWeight:600,
                  background: on ? NM.red : 'transparent',
                  color: on ? NM.cream : NM.inkDim,
                  border:`1px solid ${on ? NM.red : NM.line}`,
                }}>
                  {on ? '✗ ' : ''}{ING[id].en}
                </button>
              );
            })}
          </div>
        </FilterBlock>
      </div>

      {/* results */}
      <div style={{ padding:'24px 28px', overflow:'auto' }}>
        <div style={{ position:'relative', marginBottom:18 }}>
          <div style={{ position:'absolute', top:'50%', left:16, transform:'translateY(-50%)', color:NM.inkDim }}>
            <Icon.Search size={16}/>
          </div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search dishes · ค้นหาเมนู..." style={{
            width:'100%', boxSizing:'border-box', padding:'14px 16px 14px 46px',
            background:NM.card, border:`1px solid ${NM.line}`, borderRadius:12,
            color:NM.ink, fontSize:15, fontFamily:NM.font, outline:'none',
          }}/>
        </div>

        <div style={{ fontFamily:NM.mono, fontSize:11, color:NM.inkDim, marginBottom:14 }}>
          {results.length} dishes match your filters
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          {results.map(d => {
            const m = matchStats(fridge, d);
            return (
              <button key={d.id} onClick={() => setPage('recipe:'+d.id)} style={{
                all:'unset', cursor:'pointer', borderRadius:12, overflow:'hidden',
                background:NM.card, border:`1px solid ${NM.line}`, display:'flex', flexDirection:'column',
              }}>
                <div style={{ height:100, position:'relative' }}>
                  <FoodPlaceholder label={d.en} style="dotgrid" bg={d.color} fg="#1a0a04" radius={0}/>
                </div>
                <div style={{ padding:12 }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{d.en}</div>
                  <div style={{ fontFamily:'Noto Sans Thai', fontSize:11, color:NM.inkDim, marginBottom:8 }}>{d.th}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, fontFamily:NM.mono, color:NM.inkDim }}>
                    <span style={{ color: m.pct >= 60 ? NM.lime : NM.inkDim, fontWeight:700 }}>{m.pct}%</span>
                    <span>·</span>
                    <span>{d.time}m</span>
                    <span>·</span>
                    <ChiliScale n={5} value={d.spicy} size={8}/>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── RANDOM (SLOT MACHINE) ───
function NmRandom({ fridge, setPage }) {
  const [vegan, setVegan] = useState(false);
  const [timeMax, setTimeMax] = useState(60);
  const [type, setType] = useState('all');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [reels, setReels] = useState([0, 0, 0]);

  const pool = DISHES.filter(d =>
    (!vegan || d.vegan) && d.time <= timeMax && (type === 'all' || d.tag === type)
  );

  const spin = () => {
    if (!pool.length) return;
    setSpinning(true);
    setResult(null);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    let ticks = 0;
    const id = setInterval(() => {
      setReels([
        Math.floor(Math.random() * DISHES.length),
        Math.floor(Math.random() * DISHES.length),
        Math.floor(Math.random() * DISHES.length),
      ]);
      ticks++;
      if (ticks > 18) {
        clearInterval(id);
        const ci = DISHES.findIndex(x => x.id === chosen.id);
        setReels([ci, ci, ci]);
        setSpinning(false);
        setResult(chosen);
      }
    }, 70);
  };

  return (
    <div style={{ padding:'28px 32px', height:'calc(100% - 65px)', overflow:'auto' }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:6 }}>04 / CAN'T DECIDE?</div>
        <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:52, lineHeight:1 }}>
          Let the <span style={{ color:NM.yellow }}>wok</span> decide.
        </div>
        <div style={{ color:NM.inkDim, fontSize:13, marginTop:6 }}>Spin the reels. We'll pick something that fits.</div>
      </div>

      {/* slot machine */}
      <div style={{ maxWidth:680, margin:'0 auto', background:`linear-gradient(180deg, ${NM.redDeep}, ${NM.red})`,
        borderRadius:24, padding:28, border:`4px solid ${NM.yellow}`,
        boxShadow:`0 0 0 1px ${NM.bg}, 0 24px 60px rgba(0,0,0,.5)` }}>
        <div style={{ fontFamily:NM.mono, fontSize:10, color:'#ffd7', letterSpacing:'.3em', textAlign:'center', marginBottom:10 }}>
          ★ TONIGHT'S SPIN ★
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:18 }}>
          {reels.map((r, idx) => {
            const d = DISHES[r % DISHES.length];
            return (
              <div key={idx} style={{ height:160, background:NM.bg, borderRadius:12, overflow:'hidden',
                border:`2px solid ${NM.yellow}`, position:'relative' }}>
                <div style={{ height:'100%', transition: spinning ? 'transform .1s' : 'transform .4s cubic-bezier(.2,.7,.3,1)' }}>
                  <FoodPlaceholder label={d.en} style="stripes" bg={d.color} fg="#1a0a04" radius={0}/>
                </div>
                <div style={{ position:'absolute', bottom:6, left:6, right:6,
                  background:'rgba(24,19,16,.85)', padding:'4px 8px', borderRadius:6,
                  fontSize:10, fontWeight:700, textAlign:'center', color:NM.cream }}>
                  {spinning ? '. . .' : d.en}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={spin} disabled={spinning} style={{
          all:'unset', cursor: spinning ? 'default' : 'pointer',
          width:'100%', boxSizing:'border-box', padding:'16px', borderRadius:12,
          background: spinning ? NM.cardHi : NM.yellow, color:NM.bg,
          fontWeight:900, fontSize:18, textAlign:'center', letterSpacing:'.1em',
          fontFamily:NM.display, fontStyle:'italic',
        }}>
          {spinning ? 'SPINNING...' : result ? 'SPIN AGAIN →' : 'SPIN THE REELS →'}
        </button>

        {/* filters row */}
        <div style={{ marginTop:18, padding:'14px 16px', background:'rgba(0,0,0,.25)', borderRadius:12,
          display:'flex', gap:16, flexWrap:'wrap', alignItems:'center', fontSize:11, color:'#ffe4' }}>
          <div style={{ fontFamily:NM.mono, letterSpacing:'.2em', textTransform:'uppercase', color:'#ffd9' }}>filters:</div>
          <label style={{ display:'flex', alignItems:'center', gap:6 }}>
            <input type="checkbox" checked={vegan} onChange={e => setVegan(e.target.checked)}/> vegan
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:6 }}>
            ≤ <input type="number" min="5" max="60" value={timeMax} onChange={e => setTimeMax(+e.target.value)}
              style={{ width:42, background:'transparent', border:`1px solid #ffa8`, color:'#fff', padding:'2px 4px', borderRadius:4 }}/> min
          </label>
          <select value={type} onChange={e => setType(e.target.value)} style={{
            background:'transparent', border:`1px solid #ffa8`, color:'#fff', padding:'3px 6px', borderRadius:4, fontSize:11,
          }}>
            {DISH_TYPES.map(t => <option key={t.id} value={t.id} style={{ color:NM.bg }}>{t.en}</option>)}
          </select>
          <div style={{ marginLeft:'auto', fontFamily:NM.mono, color:'#ffd9' }}>{pool.length} in pool</div>
        </div>
      </div>

      {result && (
        <div style={{ maxWidth:680, margin:'20px auto 0', background:NM.card, border:`1px solid ${NM.line}`,
          borderRadius:16, padding:'20px 24px', display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ width:70, height:70, borderRadius:10, overflow:'hidden', flexShrink:0 }}>
            <FoodPlaceholder label={result.en} style="stripes" bg={result.color} fg="#1a0a04" radius={0}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontFamily:NM.mono, color:NM.lime, letterSpacing:'.2em' }}>★ THE WOK HAS SPOKEN ★</div>
            <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:28, color:NM.yellow }}>{result.en}</div>
            <div style={{ fontSize:12, color:NM.inkDim }}>{result.desc}</div>
          </div>
          <button onClick={() => setPage('recipe:'+result.id)} style={{
            all:'unset', cursor:'pointer', padding:'12px 18px', borderRadius:999,
            background:NM.lime, color:NM.bg, fontSize:13, fontWeight:700,
          }}>View recipe →</button>
        </div>
      )}
    </div>
  );
}

// ─── RECIPE DETAIL ───
function NmRecipe({ id, fridge, saved, toggleSaved, setPage }) {
  const d = DISH_BY_ID[id];
  if (!d) return <div style={{ padding:40 }}>Dish not found.</div>;
  const m = matchStats(fridge, d);
  const isSaved = saved.includes(d.id);
  return (
    <div style={{ padding:'20px 32px 40px', overflow:'auto', height:'calc(100% - 65px)' }}>
      <button onClick={() => setPage('recs')} style={{
        all:'unset', cursor:'pointer', color:NM.inkDim, fontSize:12, fontFamily:NM.mono,
        letterSpacing:'.2em', marginBottom:16, display:'inline-block',
      }}>← back to matches</button>

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:28, marginBottom:28 }}>
        <div style={{ borderRadius:18, overflow:'hidden', height:360, position:'relative' }}>
          <FoodPlaceholder label={`${d.en} · hero`} style="wavy" bg={d.color} fg="#1a0a04" radius={0}/>
          <div style={{ position:'absolute', top:14, left:14, padding:'5px 10px', borderRadius:999,
            background:NM.bg, color:NM.yellow, fontSize:10, fontWeight:700, fontFamily:NM.mono, letterSpacing:'.2em' }}>
            #{d.trending || '—'} TRENDING
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:4 }}>
              RECIPE · {d.tag.toUpperCase()}
            </div>
            <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:54, lineHeight:1, color:NM.yellow }}>{d.en}</div>
            <div style={{ fontFamily:'Noto Serif Thai, serif', fontWeight:700, fontSize:26, color:NM.cream, marginTop:4 }}>{d.th}</div>
          </div>
          <div style={{ fontSize:14, color:NM.ink, lineHeight:1.5, maxWidth:440 }}>{d.desc}</div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, marginTop:4 }}>
            {[
              ['TIME', d.time + ' min'],
              ['CALORIES', d.kcal + ' kcal'],
              ['RATING', '★ ' + d.rating],
              ['DIFFICULTY', '▲'.repeat(d.difficulty) + '△'.repeat(3-d.difficulty)],
            ].map(([k,v]) => (
              <div key={k} style={{ padding:'10px 12px', background:NM.card, border:`1px solid ${NM.line}`, borderRadius:10 }}>
                <div style={{ fontFamily:NM.mono, fontSize:9, color:NM.inkDim, letterSpacing:'.2em' }}>{k}</div>
                <div style={{ fontSize:15, fontWeight:700, marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:8, marginTop:6 }}>
            <button style={{
              all:'unset', cursor:'pointer', padding:'12px 18px', borderRadius:999,
              background:NM.red, color:NM.cream, fontSize:13, fontWeight:700,
            }}>Start cooking →</button>
            <button onClick={() => toggleSaved(d.id)} style={{
              all:'unset', cursor:'pointer', padding:'12px 16px', borderRadius:999,
              border:`1.5px solid ${isSaved ? NM.red : NM.line}`, color: isSaved ? NM.red : NM.ink,
              fontSize:13, fontWeight:700, display:'inline-flex', alignItems:'center', gap:6,
            }}>
              <Icon.Heart size={14} filled={isSaved}/> {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:28 }}>
        {/* INGREDIENTS */}
        <div>
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:14 }}>
            INGREDIENTS · {m.have.length}/{m.total} in your fridge
          </div>
          <div style={{ background:NM.card, borderRadius:14, border:`1px solid ${NM.line}`, overflow:'hidden' }}>
            {d.ingredients.map(id => {
              const ing = ING[id];
              const have = fridge.includes(id);
              return (
                <div key={id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
                  borderBottom:`1px solid ${NM.line}`,
                  background: have ? 'transparent' : NM.bg+'55' }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:NM.cardHi,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{ing.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color: have ? NM.ink : NM.inkDim }}>{ing.en}</div>
                    <div style={{ fontFamily:'Noto Sans Thai', fontSize:11, color:NM.inkDim }}>{ing.th}</div>
                  </div>
                  {have ? (
                    <span style={{ fontSize:10, color:NM.lime, fontWeight:700, fontFamily:NM.mono, letterSpacing:'.15em' }}>
                      ✓ HAVE
                    </span>
                  ) : (
                    <span style={{ fontSize:10, color:NM.red, fontWeight:700, fontFamily:NM.mono, letterSpacing:'.15em' }}>
                      MISSING
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {m.missing.length > 0 && (
            <div style={{ marginTop:12, padding:'12px 14px', background:NM.red+'18', border:`1px solid ${NM.red+'55'}`, borderRadius:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:NM.red, marginBottom:4 }}>Shopping list</div>
              <div style={{ fontSize:12, color:NM.ink }}>
                {m.missing.map(i => ING[i].en).join(' · ')}
              </div>
            </div>
          )}
        </div>

        {/* STEPS */}
        <div>
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:14 }}>
            METHOD · {d.steps.length} STEPS
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {d.steps.map((s, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'48px 1fr', gap:14,
                padding:'14px 16px', background:NM.card, borderRadius:12, border:`1px solid ${NM.line}` }}>
                <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:36, color:NM.yellow, lineHeight:0.9 }}>
                  {String(i+1).padStart(2,'0')}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{s.t}</div>
                  <div style={{ fontSize:13, color:NM.inkDim, lineHeight:1.5 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* reviews */}
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginTop:24, marginBottom:10 }}>
            REVIEWS · {d.reviews.toLocaleString()} · ★ {d.rating}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {REVIEWS.map((r,i) => (
              <div key={i} style={{ padding:'12px 14px', background:NM.card, borderRadius:10, border:`1px solid ${NM.line}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <div style={{ width:24, height:24, borderRadius:999, background:NM.yellow, color:NM.bg,
                    fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>{r.avatar}</div>
                  <div style={{ fontSize:12, fontWeight:700 }}>{r.user}</div>
                  <Stars value={r.stars} size={10}/>
                  <div style={{ fontSize:10, color:NM.inkDim, marginLeft:'auto', fontFamily:NM.mono }}>{r.when}</div>
                </div>
                <div style={{ fontSize:12, color:NM.ink, lineHeight:1.5 }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SOCIAL ───
function NmSocial({ fridge, setPage }) {
  return (
    <div style={{ padding:'28px 32px', overflow:'auto', height:'calc(100% - 65px)' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:22 }}>
        <div>
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:6 }}>05 / COMMUNITY</div>
          <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:42, lineHeight:1 }}>
            Home cooks sharing <span style={{ color:NM.red }}>remixes.</span>
          </div>
        </div>
        <button style={{
          all:'unset', cursor:'pointer', padding:'12px 18px', borderRadius:999,
          background:NM.yellow, color:NM.bg, fontSize:13, fontWeight:700,
          display:'inline-flex', alignItems:'center', gap:6,
        }}>
          <Icon.Plus size={14}/> Post your recipe
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:22 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {POSTS.map(p => (
            <div key={p.id} style={{ background:NM.card, border:`1px solid ${NM.line}`, borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${NM.line}` }}>
                <div style={{ width:34, height:34, borderRadius:999, background:p.color, color:'#fff',
                  fontWeight:800, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>{p.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{p.user}</div>
                  <div style={{ fontSize:11, color:NM.inkDim, fontFamily:NM.mono }}>posted · 4h</div>
                </div>
                <Stars value={Math.round(p.rating)} size={11}/>
              </div>
              <div style={{ height:180 }}>
                <FoodPlaceholder label={p.dish} style="stripes" bg={p.color} fg="#1a0a04" radius={0}/>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:16, fontWeight:700, fontFamily:NM.display, fontStyle:'italic', marginBottom:4 }}>
                  {p.dish}
                </div>
                <div style={{ fontSize:13, color:NM.ink, lineHeight:1.5, marginBottom:10 }}>{p.caption}</div>
                <div style={{ display:'flex', alignItems:'center', gap:16, fontSize:12, color:NM.inkDim, fontFamily:NM.mono }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                    <Icon.Heart size={13}/> {p.likes}
                  </span>
                  <span>💬 {p.comments}</span>
                  <span style={{ marginLeft:'auto', color:NM.yellow, fontWeight:700 }}>★ {p.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:10 }}>🔥 TRENDING THIS WEEK</div>
          <div style={{ background:NM.card, border:`1px solid ${NM.line}`, borderRadius:14, overflow:'hidden', marginBottom:18 }}>
            {DISHES.slice(0,5).map((d,i) => (
              <button key={d.id} onClick={() => setPage('recipe:'+d.id)} style={{
                all:'unset', cursor:'pointer', display:'grid', gridTemplateColumns:'28px 1fr auto',
                gap:12, padding:'12px 14px', borderBottom: i < 4 ? `1px solid ${NM.line}` : 'none',
                alignItems:'center',
              }}>
                <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:20, color:NM.yellow }}>
                  {i+1}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700 }}>{d.en}</div>
                  <div style={{ fontFamily:'Noto Sans Thai', fontSize:11, color:NM.inkDim }}>{d.th}</div>
                </div>
                <div style={{ fontSize:10, color:NM.red, fontFamily:NM.mono, fontWeight:700 }}>↑ {Math.round(d.rating*100)}%</div>
              </button>
            ))}
          </div>

          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:10 }}>TOP COOKS</div>
          <div style={{ background:NM.card, border:`1px solid ${NM.line}`, borderRadius:14, padding:14 }}>
            {['@nim_eats','@bangkok.boy','@dad.cooks','@thai_mom'].map((u,i) => (
              <div key={u} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0' }}>
                <div style={{ width:28, height:28, borderRadius:999, background:['#D64528','#E8823A','#E8B13A','#4A7A3E'][i],
                  color:'#fff', fontWeight:800, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {u[1].toUpperCase()}
                </div>
                <div style={{ flex:1, fontSize:12, fontWeight:700 }}>{u}</div>
                <div style={{ fontSize:10, color:NM.inkDim, fontFamily:NM.mono }}>{[340,287,221,188][i]} recipes</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SAVED ───
function NmSaved({ saved, fridge, setPage, toggleSaved }) {
  const list = saved.map(id => DISH_BY_ID[id]).filter(Boolean);
  return (
    <div style={{ padding:'28px 32px', overflow:'auto', height:'calc(100% - 65px)' }}>
      <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:6 }}>06 / SAVED</div>
      <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:42, lineHeight:1, marginBottom:22 }}>
        Your cookbook · <span style={{ color:NM.yellow }}>{list.length} dishes</span>
      </div>
      {list.length === 0 ? (
        <div style={{ padding:40, textAlign:'center', border:`2px dashed ${NM.line}`, borderRadius:16, color:NM.inkDim }}>
          Nothing saved yet. Tap the heart on any recipe.
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 }}>
          {list.map(d => {
            const m = matchStats(fridge, d);
            return (
              <div key={d.id} style={{ borderRadius:14, background:NM.card, border:`1px solid ${NM.line}`, overflow:'hidden' }}>
                <div style={{ height:120, position:'relative' }}>
                  <FoodPlaceholder label={d.en} style="wavy" bg={d.color} fg="#1a0a04" radius={0}/>
                  <button onClick={() => toggleSaved(d.id)} style={{
                    all:'unset', cursor:'pointer', position:'absolute', top:10, right:10,
                    width:30, height:30, borderRadius:999, background:NM.bg, color:NM.red,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Icon.Heart size={14} filled={true}/>
                  </button>
                </div>
                <button onClick={() => setPage('recipe:'+d.id)} style={{
                  all:'unset', cursor:'pointer', display:'block', padding:14, width:'100%', boxSizing:'border-box' }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>{d.en}</div>
                  <div style={{ fontFamily:'Noto Sans Thai', fontSize:11, color:NM.inkDim, marginBottom:8 }}>{d.th}</div>
                  <div style={{ fontSize:11, color: m.pct >= 60 ? NM.lime : NM.inkDim, fontFamily:NM.mono, fontWeight:700 }}>
                    {m.pct}% match · {d.time}min
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN ───
function NmAdmin() {
  const stats = [
    { k:'TOTAL USERS', v:'24,891', d:'+12.4%', color:NM.yellow },
    { k:'RECIPES', v:'1,204', d:'+48 this week', color:NM.lime },
    { k:'DAILY COOKS', v:'8,442', d:'+3.2%', color:NM.red },
    { k:'AVG RATING', v:'4.74', d:'stable', color:NM.cream },
  ];
  const topDishes = DISHES.slice(0,6).sort((a,b) => b.reviews - a.reviews);
  return (
    <div style={{ padding:'24px 32px', overflow:'auto', height:'calc(100% - 65px)' }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18 }}>
        <div>
          <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim, letterSpacing:'.25em', marginBottom:4 }}>
            ADMIN · 23 APR 2026 · 22:47
          </div>
          <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:36 }}>Kitchen control room</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['7d','30d','90d','1y'].map((r,i) => (
            <button key={r} style={{ all:'unset', cursor:'pointer', padding:'5px 12px', borderRadius:999,
              fontSize:11, fontWeight:600, background: i===1 ? NM.yellow : NM.card, color: i===1 ? NM.bg : NM.ink,
              border:`1px solid ${NM.line}` }}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:18 }}>
        {stats.map(s => (
          <div key={s.k} style={{ background:NM.card, border:`1px solid ${NM.line}`, borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontFamily:NM.mono, fontSize:9, color:NM.inkDim, letterSpacing:'.25em' }}>{s.k}</div>
            <div style={{ fontFamily:NM.display, fontStyle:'italic', fontWeight:900, fontSize:32, color:s.color, lineHeight:1, margin:'6px 0' }}>{s.v}</div>
            <div style={{ fontSize:11, color:NM.inkDim, fontFamily:NM.mono }}>{s.d}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:14, marginBottom:18 }}>
        {/* chart */}
        <div style={{ background:NM.card, border:`1px solid ${NM.line}`, borderRadius:12, padding:18, minHeight:220 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>Daily active cooks · 30 days</div>
            <div style={{ fontFamily:NM.mono, fontSize:10, color:NM.inkDim }}>peak 11,204 · avg 8,442</div>
          </div>
          <svg viewBox="0 0 400 160" width="100%" height="160">
            {/* grid */}
            {[0,1,2,3].map(i => <line key={i} x1="0" x2="400" y1={40*i+10} y2={40*i+10} stroke={NM.line}/>)}
            {/* data */}
            {(() => {
              const vals = Array.from({length:30}).map((_,i) => 50 + Math.sin(i/3)*20 + Math.random()*25);
              const max = Math.max(...vals);
              const pts = vals.map((v,i) => `${i*(400/29)},${140 - (v/max)*120}`).join(' ');
              const area = `0,140 ${pts} 400,140`;
              return <>
                <polygon points={area} fill={NM.red} opacity="0.2"/>
                <polyline points={pts} fill="none" stroke={NM.red} strokeWidth="2.5"/>
                {vals.map((v,i) => i%5===0 && <circle key={i} cx={i*(400/29)} cy={140-(v/max)*120} r="3" fill={NM.yellow}/>)}
              </>;
            })()}
          </svg>
        </div>

        {/* dish type donut */}
        <div style={{ background:NM.card, border:`1px solid ${NM.line}`, borderRadius:12, padding:18 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Cooks by dish type</div>
          {[
            ['Noodle', 32, NM.red],
            ['Stir-fry', 24, NM.yellow],
            ['Curry', 18, NM.lime],
            ['Rice', 14, NM.cream],
            ['Salad', 8, '#E8823A'],
            ['Soup', 4, NM.inkDim],
          ].map(([name, pct, c]) => (
            <div key={name} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                <span>{name}</span>
                <span style={{ fontFamily:NM.mono, color:NM.inkDim }}>{pct}%</span>
              </div>
              <div style={{ height:6, background:NM.bg, borderRadius:999, overflow:'hidden' }}>
                <div style={{ width:`${pct*3}%`, height:'100%', background:c }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* top dishes table */}
      <div style={{ background:NM.card, border:`1px solid ${NM.line}`, borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:`1px solid ${NM.line}`, fontSize:13, fontWeight:700,
          display:'flex', justifyContent:'space-between' }}>
          <span>Top dishes · this week</span>
          <button style={{ all:'unset', cursor:'pointer', fontSize:11, color:NM.yellow, fontFamily:NM.mono }}>EXPORT CSV</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'40px 1fr 100px 80px 90px 110px 80px',
          padding:'8px 16px', fontSize:10, fontFamily:NM.mono, color:NM.inkDim,
          letterSpacing:'.2em', borderBottom:`1px solid ${NM.line}` }}>
          <div>#</div><div>DISH</div><div>COOKS</div><div>★ RATING</div><div>AVG TIME</div><div>MATCH RATE</div><div>STATUS</div>
        </div>
        {topDishes.map((d,i) => (
          <div key={d.id} style={{ display:'grid', gridTemplateColumns:'40px 1fr 100px 80px 90px 110px 80px',
            padding:'10px 16px', fontSize:12, borderBottom: i < topDishes.length-1 ? `1px solid ${NM.line}` : 'none',
            alignItems:'center' }}>
            <div style={{ fontFamily:NM.mono, color:NM.inkDim }}>{String(i+1).padStart(2,'0')}</div>
            <div>
              <div style={{ fontWeight:700 }}>{d.en}</div>
              <div style={{ fontFamily:'Noto Sans Thai', fontSize:10, color:NM.inkDim }}>{d.th}</div>
            </div>
            <div style={{ fontFamily:NM.mono }}>{d.reviews.toLocaleString()}</div>
            <div style={{ fontWeight:700, color:NM.yellow }}>{d.rating}</div>
            <div style={{ fontFamily:NM.mono, color:NM.inkDim }}>{d.time} min</div>
            <div>
              <div style={{ height:5, background:NM.bg, borderRadius:999, overflow:'hidden' }}>
                <div style={{ width:`${60+(d.trending||1)*3}%`, height:'100%', background:NM.lime }}/>
              </div>
            </div>
            <div><span style={{ padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:700,
              background: i%3===0 ? NM.lime+'33' : i%3===1 ? NM.yellow+'33' : NM.red+'33',
              color: i%3===0 ? NM.lime : i%3===1 ? NM.yellow : NM.red }}>
              {i%3===0 ? 'Rising' : i%3===1 ? 'Stable' : 'Featured'}
            </span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROUTER ───
function NightMarketApp() {
  const [page, setPage] = useState('home');
  const [fridge, setFridge] = useState(DEFAULT_FRIDGE);
  const [saved, setSaved] = useState(['krapow','tomyum','mangosticky']);
  const toggleSaved = (id) => setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  let screen;
  if (page.startsWith('recipe:')) {
    screen = <NmRecipe id={page.slice(7)} fridge={fridge} saved={saved} toggleSaved={toggleSaved} setPage={setPage}/>;
  } else if (page === 'home') screen = <NmHome fridge={fridge} setPage={setPage}/>;
  else if (page === 'fridge') screen = <NmFridge fridge={fridge} setFridge={setFridge} setPage={setPage}/>;
  else if (page === 'recs') screen = <NmRecs fridge={fridge} setPage={setPage}/>;
  else if (page === 'search') screen = <NmSearch fridge={fridge} setPage={setPage}/>;
  else if (page === 'random') screen = <NmRandom fridge={fridge} setPage={setPage}/>;
  else if (page === 'social') screen = <NmSocial fridge={fridge} setPage={setPage}/>;
  else if (page === 'saved') screen = <NmSaved saved={saved} fridge={fridge} setPage={setPage} toggleSaved={toggleSaved}/>;
  else if (page === 'admin') screen = <NmAdmin/>;
  else screen = <div/>;

  return (
    <NmScreenFrame>
      <NmNav page={page.startsWith('recipe:') ? 'recs' : page} setPage={setPage} fridgeCount={fridge.length}/>
      {screen}
    </NmScreenFrame>
  );
}

window.NightMarketApp = NightMarketApp;
