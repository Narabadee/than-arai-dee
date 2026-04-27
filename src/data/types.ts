export interface Ingredient {
  id: string;
  en: string;
  th: string;
  cat: 'protein' | 'produce' | 'pantry';
  emoji: string;
}

export interface Step {
  t: string;
  d: string;
}

export interface Dish {
  id: string;
  en: string;
  th: string;
  tag: string;
  time: number;
  spicy: number;
  difficulty: number;
  kcal: number;
  vegan: boolean;
  meal: string;
  ingredients: string[];
  desc: string;
  rating: number;
  reviews: number;
  trending?: number;
  color: string;
  steps: Step[];
  image?: string;
}

export interface Post {
  id: string;
  user_id: string;
  user: string;
  avatar: string;
  dish: string;
  caption: string;
  likes: number;
  comments: number;
  rating: number;
  color: string;
  ingredients?: string[];
  steps?: { t: string; d: string }[];
  image?: string;
  hasLiked?: boolean;
}

export interface Review {
  user: string;
  avatar: string;
  stars: number;
  when: string;
  text: string;
}

export interface DishType {
  id: string;
  th: string;
  en: string;
}
