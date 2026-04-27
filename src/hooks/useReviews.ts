import { useState, useCallback, useEffect } from 'react';
import { Review } from '../data/types';
import { fetchReviews, postReview } from '../api/reviews';

export const useReviews = (dishId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchReviews(dishId)
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dishId]);

  const addReview = useCallback(async (review: Review) => {
    await postReview(dishId, review);
    setReviews(prev => [review, ...prev]);
  }, [dishId]);

  return { localReviews: reviews, addReview, loading };
};
