import { apiFetch } from './client';
import type { Ingredient } from '../data/types';

export const fetchIngredients = (): Promise<Ingredient[]> => apiFetch('/ingredients');
