import { Post, Review } from './types';

export interface Cook {
  id: string;
  username: string;
  avatar: string;
  color: string;
  bio: string;
  specialty: string;
  totalLikes: number;
  avgRating: number;
  dishOffset: number; // index into DISHES array for fav dishes
}

export const COOKS: Cook[] = [
  {
    id: 'nim_eats',
    username: '@nim_eats',
    avatar: 'N',
    color: '#D64528',
    bio: 'Bangkok-born, Melbourne-based. I cook Thai food the way my yai taught me — then break all her rules.',
    specialty: 'Isaan & fusion',
    totalLikes: 14820,
    avgRating: 4.7,
    dishOffset: 0,
  },
  {
    id: 'bangkok_boy',
    username: '@bangkok.boy',
    avatar: 'B',
    color: '#E8823A',
    bio: 'Street food is fine dining with a better view. Recreating hawker classics one wok at a time.',
    specialty: 'Street food recreations',
    totalLikes: 9340,
    avgRating: 4.6,
    dishOffset: 5,
  },
  {
    id: 'dad_cooks',
    username: '@dad.cooks',
    avatar: 'D',
    color: '#E8B13A',
    bio: 'Retired engineer, full-time chef for two daughters who have very strong opinions about food.',
    specialty: 'Family classics',
    totalLikes: 22100,
    avgRating: 4.9,
    dishOffset: 10,
  },
  {
    id: 'thai_mom',
    username: '@thai_mom',
    avatar: 'T',
    color: '#4A7A3E',
    bio: 'Three kids, one wok, zero shortcuts. Every recipe has been tested at least 40 times before I post it.',
    specialty: 'Traditional recipes',
    totalLikes: 31400,
    avgRating: 4.8,
    dishOffset: 15,
  },
  {
    id: 'veggie_joom',
    username: '@veggie.joom',
    avatar: 'V',
    color: '#27AE60',
    bio: 'Proving that plant-based Thai food is not a compromise. Every dish is fully vegan and fully delicious.',
    specialty: 'Vegan Thai',
    totalLikes: 7620,
    avgRating: 4.6,
    dishOffset: 20,
  },
  {
    id: 'spicylord',
    username: '@spicylord',
    avatar: 'S',
    color: '#C0392B',
    bio: 'If it doesn\'t make you sweat it\'s just warm soup. Heat tolerance built over 30 years of trying.',
    specialty: 'Extreme spice',
    totalLikes: 19200,
    avgRating: 4.7,
    dishOffset: 25,
  },
  {
    id: 'firsttrycook',
    username: '@firsttrycook',
    avatar: 'F',
    color: '#8E44AD',
    bio: 'Documenting every attempt (including the disasters). Amateur hour, professional appetite.',
    specialty: 'Beginner honest reviews',
    totalLikes: 31800,
    avgRating: 4.3,
    dishOffset: 30,
  },
];

export const POSTS: Post[] = [
  {
    id: 'p1', user: '@nim_eats', avatar: 'N',
    dish: 'Lazy Krapow (no basil edition)',
    caption: 'Out of holy basil, subbed Thai basil. Heresy? Maybe. Delicious? Also yes.',
    likes: 342, comments: 28, rating: 4.5, color: '#D64528',
    image: 'images/dishes/krapow.png',
  },
  {
    id: 'p2', user: '@bangkok.boy', avatar: 'B',
    dish: 'Tom Yum but creamy (nam khon)',
    caption: 'Added evap milk at the end. Controversial but my mom approved.',
    likes: 891, comments: 67, rating: 4.8, color: '#E8823A',
    image: 'images/dishes/tomyum.png',
  },
  {
    id: 'p3', user: '@veggie.joom', avatar: 'V',
    dish: 'Mushroom Larb (fully vegan)',
    caption: 'King oyster mushrooms hand-chopped. Toasted rice powder non-negotiable.',
    likes: 234, comments: 19, rating: 4.6, color: '#4A7A3E',
    image: 'images/dishes/larbgai.png',
  },
  {
    id: 'p4', user: '@dad.cooks', avatar: 'D',
    dish: 'Khao Pad with pineapple',
    caption: 'Daughter requested the hollowed-pineapple presentation. Dad delivers.',
    likes: 1203, comments: 142, rating: 4.9, color: '#E8B13A',
    image: 'images/dishes/friedrice.png',
  },
  {
    id: 'p5', user: '@thai_mom', avatar: 'T',
    dish: 'Pad See Ew — the family recipe',
    caption: 'Wide rice noodles, dark soy, Chinese broccoli. This one took 3 years to perfect. Not joking.',
    likes: 2104, comments: 231, rating: 4.9, color: '#4A7A3E',
    image: 'images/dishes/padthai.png',
  },
  {
    id: 'p6', user: '@spicylord', avatar: 'S',
    dish: 'Crying Tiger Steak',
    caption: 'The dipping sauce IS the dish. Grilled beef is just an excuse to eat the jaew.',
    likes: 678, comments: 54, rating: 4.7, color: '#C0392B',
    image: 'images/dishes/cryingtiger.png',
  },
  {
    id: 'p7', user: '@firsttrycook', avatar: 'F',
    dish: 'My first Som Tum (send help)',
    caption: 'Used a rolling pin instead of a mortar. Added too much fish sauce. Ate it anyway. 6/10 will try again.',
    likes: 1890, comments: 203, rating: 4.3, color: '#8E44AD',
    image: 'images/dishes/somtum.png',
  },
  {
    id: 'p8', user: '@nim_eats', avatar: 'N',
    dish: 'Kanom Jeen with homemade curry',
    caption: 'Spent all Saturday on this. Worth every second. The curry paste alone took 2 hours.',
    likes: 512, comments: 41, rating: 4.6, color: '#D64528',
    image: 'images/dishes/greencurry.png',
  },
];

// Reviews for recipe detail
export const REVIEWS: Review[] = [
  {
    user: '@thai_mom', avatar: 'T', stars: 5, when: '2d',
    text: 'Exactly like my grandmother made it. Make sure your wok is screaming hot.',
  },
  {
    user: '@firsttrycook', avatar: 'F', stars: 4, when: '5d',
    text: 'Subbed Italian basil and it still slapped. Halved the chili for the kids.',
  },
  {
    user: '@spicylord', avatar: 'S', stars: 5, when: '1w',
    text: 'Doubled the chili. Cried through dinner. No regrets. Will do again.',
  },
];
