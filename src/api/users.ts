import { apiFetch } from './client';
import type { AuthUser } from '../context/AuthContext';

export interface LoginResult { token: string; user: AuthUser }

export const login = (username: string, password: string): Promise<LoginResult> =>
  apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const signup = (username: string, password: string): Promise<LoginResult> =>
  apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ username, password }) });

export const fetchUsers = (): Promise<{ id: string; username: string; color: string; banned: number }[]> =>
  apiFetch('/users');

export const toggleBan = (id: string): Promise<{ banned: boolean }> =>
  apiFetch(`/users/${id}/ban`, { method: 'PATCH' });

export const fetchCooks = () => apiFetch('/users/cooks');

export const fetchUserProfile = (username: string) => 
  apiFetch(`/users/profile/${encodeURIComponent(username)}`);

export const updateProfile = (data: { display_name?: string; bio?: string; specialty?: string; avatar?: string; location?: string }) =>
  apiFetch('/users/profile', { method: 'PATCH', body: JSON.stringify(data) });

export const changePassword = (oldPassword: string, newPassword: string) =>
  apiFetch('/users/password', { method: 'PATCH', body: JSON.stringify({ oldPassword, newPassword }) });
