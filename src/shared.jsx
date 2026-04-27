// Shared helpers used across the three visual directions.
// Food placeholder tiles, match math, tiny utilities.

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// Compute match stats between fridge & recipe
function matchStats(fridge, dish) {
  const need = dish.ingredients || [];
  const have = need.filter(i => fridge.includes(i));
  const missing = need.filter(i => !fridge.includes(i));
  const pct = need.length ? Math.round((have.length / need.length) * 100) : 0;
  return { have, missing, pct, total: need.length };
}

// Star rating
function Stars({ n=5, value=0, size=12, color='#F0C445', muted='#00000022' }) {
  return (
    <span style={{ display:'inline-flex', gap:1 }}>
      {Array.from({length:n}).map((_,i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < value ? color : muted}>
          <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

// Chili indicator
function ChiliScale({ n=5, value=0, size=11, color='#D64528', muted='#00000018' }) {
  return (
    <span style={{ display:'inline-flex', gap:1 }}>
      {Array.from({length:n}).map((_,i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < value ? color : muted}>
          <path d="M7 3c3 0 5 2 5 5 3 2 7 6 7 11 0 3-2 5-5 5-5 0-11-4-11-12 0-4 1-9 4-9z"/>
        </svg>
      ))}
    </span>
  );
}

// Food placeholder tile. Labeled, clearly a stand-in. Style varies by theme.
function FoodPlaceholder({ label, style='stripes', bg='#E8B13A', fg='#2A1A12', w='100%', h='100%', radius=12, mono=true }) {
  // stripes | dotgrid | wavy | solid-label
  let pattern = null;
  const id = 'pat-' + Math.random().toString(36).slice(2, 8);
  if (style === 'stripes') {
    pattern = (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(45)">
          <rect width="14" height="14" fill={bg}/>
          <line x1="0" y1="0" x2="0" y2="14" stroke={fg} strokeOpacity="0.14" strokeWidth="7"/>
        </pattern>
      </defs>
    );
  } else if (style === 'dotgrid') {
    pattern = (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="16" height="16">
          <rect width="16" height="16" fill={bg}/>
          <circle cx="8" cy="8" r="1.8" fill={fg} fillOpacity="0.22"/>
        </pattern>
      </defs>
    );
  } else if (style === 'wavy') {
    pattern = (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="36" height="18">
          <rect width="36" height="18" fill={bg}/>
          <path d="M0,9 Q9,2 18,9 T36,9" fill="none" stroke={fg} strokeOpacity="0.18" strokeWidth="2"/>
        </pattern>
      </defs>
    );
  } else {
    pattern = (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill={bg}/>
        </pattern>
      </defs>
    );
  }
  return (
    <div style={{ position:'relative', width:w, height:h, borderRadius:radius, overflow:'hidden' }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position:'absolute', inset:0 }}>
        {pattern}
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        padding:12, textAlign:'center',
      }}>
        <div style={{
          fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
          fontSize: 10, letterSpacing: '0.12em', textTransform:'uppercase',
          color: fg, background: 'rgba(255,255,255,0.55)',
          padding:'4px 8px', borderRadius:4, fontWeight:600,
        }}>
          {label || 'food photo'}
        </div>
      </div>
    </div>
  );
}

// Tiny icon glyphs (duotone friendly, same stroke)
const Icon = {
  Fridge: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 10h14M8 6v2M8 14v4"/></svg>,
  Search: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  Shuffle: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h4l10 12h4M3 18h4L17 6h4M18 3l3 3-3 3M18 15l3 3-3 3"/></svg>,
  Heart: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill={p.filled ? 'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6C19 16.5 12 21 12 21z"/></svg>,
  Plus: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
  X: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l14 14M19 5L5 19"/></svg>,
  Flame: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s6 5 6 11a6 6 0 11-12 0c0-3 2-4 3-6 0 2 1 3 3 3 0-3-2-5 0-8z"/></svg>,
  Clock: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  Home: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z"/></svg>,
  Users: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="4"/><path d="M1 22c0-4 4-6 8-6s8 2 8 6M17 11a3 3 0 100-6M23 22c0-3-2-5-5-5.5"/></svg>,
  Grid: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>,
  Chart: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 20h18M6 20V10M12 20V4M18 20v-6"/></svg>,
  Check: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12l6 6L20 6"/></svg>,
  Arrow: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
};

Object.assign(window, { matchStats, Stars, ChiliScale, FoodPlaceholder, Icon, useState, useEffect, useMemo, useRef, useCallback });
