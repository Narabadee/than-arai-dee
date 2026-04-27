import { Ingredient } from './types';

export const INGREDIENTS: Ingredient[] = [
  // Proteins
  { id:'chicken',  en:'Chicken',    th:'ไก่',       cat:'protein', emoji:'🍗' },
  { id:'pork',     en:'Pork',       th:'หมู',       cat:'protein', emoji:'🥩' },
  { id:'beef',     en:'Beef',       th:'เนื้อ',      cat:'protein', emoji:'🥩' },
  { id:'shrimp',   en:'Shrimp',     th:'กุ้ง',       cat:'protein', emoji:'🦐' },
  { id:'egg',      en:'Eggs',       th:'ไข่',       cat:'protein', emoji:'🥚' },
  { id:'tofu',     en:'Tofu',       th:'เต้าหู้',     cat:'protein', emoji:'🧈' },
  // Produce
  { id:'garlic',   en:'Garlic',     th:'กระเทียม',  cat:'produce', emoji:'🧄' },
  { id:'chili',    en:'Thai chili', th:'พริก',      cat:'produce', emoji:'🌶️' },
  { id:'basil',    en:'Holy basil', th:'กะเพรา',    cat:'produce', emoji:'🌿' },
  { id:'lime',     en:'Lime',       th:'มะนาว',     cat:'produce', emoji:'🟢' },
  { id:'lemongrass', en:'Lemongrass', th:'ตะไคร้', cat:'produce', emoji:'🌾' },
  { id:'galangal', en:'Galangal',   th:'ข่า',       cat:'produce', emoji:'🫚' },
  { id:'onion',    en:'Onion',      th:'หอมใหญ่',   cat:'produce', emoji:'🧅' },
  { id:'tomato',   en:'Tomato',     th:'มะเขือเทศ', cat:'produce', emoji:'🍅' },
  { id:'mushroom', en:'Mushroom',   th:'เห็ด',      cat:'produce', emoji:'🍄' },
  { id:'carrot',   en:'Carrot',     th:'แครอท',     cat:'produce', emoji:'🥕' },
  // Pantry
  { id:'rice',     en:'Jasmine rice', th:'ข้าว',    cat:'pantry', emoji:'🍚' },
  { id:'noodle',   en:'Rice noodle', th:'เส้นก๋วยเตี๋ยว', cat:'pantry', emoji:'🍜' },
  { id:'fishsauce', en:'Fish sauce', th:'น้ำปลา',   cat:'pantry', emoji:'🐟' },
  { id:'oyster',   en:'Oyster sauce', th:'ซอสหอยนางรม', cat:'pantry', emoji:'🫙' },
  { id:'coconut',  en:'Coconut milk', th:'กะทิ',   cat:'pantry', emoji:'🥥' },
  { id:'sugar',    en:'Palm sugar', th:'น้ำตาลปี๊บ',  cat:'pantry', emoji:'🍯' },
];

export const ING = Object.fromEntries(INGREDIENTS.map(i => [i.id, i]));

export const DEFAULT_FRIDGE = [];
