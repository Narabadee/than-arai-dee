import { apiFetch } from './client';

export const fetchSaved = (): Promise<string[]> => apiFetch('/saved');
export const addSaved = (dishId: string): Promise<void> => apiFetch(`/saved/${dishId}`, { method: 'POST' });
export const removeSaved = (dishId: string): Promise<void> => apiFetch(`/saved/${dishId}`, { method: 'DELETE' });
