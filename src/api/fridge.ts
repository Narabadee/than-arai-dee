import { apiFetch } from './client';

export const fetchFridge = (): Promise<string[]> => apiFetch('/fridge');
export const saveFridge = (items: string[]): Promise<void> =>
  apiFetch('/fridge', { method: 'PUT', body: JSON.stringify(items) });
