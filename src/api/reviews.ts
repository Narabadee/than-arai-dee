import { apiFetch } from './client';
import type { Review } from '../data/types';

export const fetchReviews = (dishId: string): Promise<Review[]> => apiFetch(`/reviews/${dishId}`);

export const postReview = (dishId: string, review: Review): Promise<void> =>
  apiFetch(`/reviews/${dishId}`, { method: 'POST', body: JSON.stringify(review) });
