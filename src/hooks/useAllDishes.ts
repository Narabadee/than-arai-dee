import { useEffect, useState } from 'react';
import { fetchDishes } from '../api/dishes';
import { Dish } from '../data/types';

export const useAllDishes = (): { dishes: Dish[]; loading: boolean } => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDishes()
      .then(setDishes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { dishes, loading };
};
