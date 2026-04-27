import { Dish } from '../data/types';

export interface MatchStats {
  have: string[];
  missing: string[];
  pct: number;
  total: number;
}

/**
 * Compute match stats between fridge ingredients and a dish
 */
export function getMatchStats(fridge: string[], dish: Dish): MatchStats {
  const need = dish.ingredients || [];
  const have = need.filter(i => fridge.includes(i));
  const missing = need.filter(i => !fridge.includes(i));
  const pct = need.length ? Math.round((have.length / need.length) * 100) : 0;
  
  return { have, missing, pct, total: need.length };
}
