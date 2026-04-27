import { apiFetch } from './client';
import type { Dish, DishType } from '../data/types';

export const fetchDishes = (): Promise<Dish[]> => apiFetch('/dishes');
export const fetchDish = (id: string): Promise<Dish> => apiFetch(`/dishes/${id}`);
export const fetchDishTypes = (): Promise<DishType[]> => apiFetch('/dishes/types');

export const createDish = (data: Record<string, unknown>): Promise<Dish> =>
  apiFetch('/dishes', { method: 'POST', body: JSON.stringify(data) });

export const updateDish = (id: string, data: Record<string, unknown>): Promise<Dish> =>
  apiFetch(`/dishes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const updateDishStatus = (id: string, status: string): Promise<void> =>
  apiFetch(`/dishes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const deleteDish = (id: string): Promise<void> =>
  apiFetch(`/dishes/${id}`, { method: 'DELETE' });
