import { apiFetch } from './client';
import type { Post } from '../data/types';

export const fetchPosts = (includeDeleted = false): Promise<(Post & { deleted?: boolean })[]> =>
  apiFetch(`/posts${includeDeleted ? '?include_deleted=true' : ''}`);

export const deletePost = (id: string): Promise<void> =>
  apiFetch(`/posts/${id}/delete`, { method: 'PATCH' });

export const restorePost = (id: string): Promise<void> =>
  apiFetch(`/posts/${id}/restore`, { method: 'PATCH' });

export const createPost = (data: Partial<Post>): Promise<Post> =>
  apiFetch('/posts', { method: 'POST', body: JSON.stringify(data) });

export const deleteOwnPost = (id: string): Promise<void> =>
  apiFetch(`/posts/${id}`, { method: 'DELETE' });

export const editPost = (id: string, data: { caption?: string; ingredients?: string[]; steps?: { t: string; d: string }[] }): Promise<void> =>
  apiFetch(`/posts/${id}/edit`, { method: 'PATCH', body: JSON.stringify(data) });

export const likePost = (id: string, action: 'like' | 'unlike'): Promise<{ likes: number }> =>
  apiFetch(`/posts/${id}/like`, { method: 'PATCH', body: JSON.stringify({ action }) });

export const commentOnPost = (id: string, text: string): Promise<void> =>
  apiFetch(`/posts/${id}/comment`, { method: 'POST', body: JSON.stringify({ text }) });

export const fetchPostComments = (id: string): Promise<{ user: string; text: string }[]> =>
  apiFetch(`/posts/${id}/comments`);

export const ratePostApi = (id: string, rating: number): Promise<{ rating: number }> =>
  apiFetch(`/posts/${id}/rate`, { method: 'PATCH', body: JSON.stringify({ rating }) });
