/**
 * Run once to seed the Supabase database:
 *   npx tsx scripts/seed.ts
 *
 * Requires DATABASE_URL in .env or environment.
 */
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });

async function main() {
  console.log('[seed] Starting...');

  // ── Ingredients ─────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO ingredients (id, en, th, cat, emoji) VALUES
      ('chicken','Chicken','ไก่','protein','🍗'),
      ('pork','Pork','หมู','protein','🥩'),
      ('beef','Beef','เนื้อ','protein','🥩'),
      ('shrimp','Shrimp','กุ้ง','protein','🦐'),
      ('egg','Eggs','ไข่','protein','🥚'),
      ('tofu','Tofu','เต้าหู้','protein','🧈'),
      ('garlic','Garlic','กระเทียม','produce','🧄'),
      ('chili','Thai chili','พริก','produce','🌶️'),
      ('basil','Holy basil','กะเพรา','produce','🌿'),
      ('lime','Lime','มะนาว','produce','🟢'),
      ('lemongrass','Lemongrass','ตะไคร้','produce','🌾'),
      ('galangal','Galangal','ข่า','produce','🫚'),
      ('onion','Onion','หอมใหญ่','produce','🧅'),
      ('tomato','Tomato','มะเขือเทศ','produce','🍅'),
      ('mushroom','Mushroom','เห็ด','produce','🍄'),
      ('carrot','Carrot','แครอท','produce','🥕'),
      ('rice','Jasmine rice','ข้าว','pantry','🍚'),
      ('noodle','Rice noodle','เส้นก๋วยเตี๋ยว','pantry','🍜'),
      ('fishsauce','Fish sauce','น้ำปลา','pantry','🐟'),
      ('oyster','Oyster sauce','ซอสหอยนางรม','pantry','🫙'),
      ('coconut','Coconut milk','กะทิ','pantry','🥥'),
      ('sugar','Palm sugar','น้ำตาลปี๊บ','pantry','🍯')
    ON CONFLICT DO NOTHING
  `;

  // ── Dish types ───────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO dish_types (id, th, en) VALUES
      ('all','ทั้งหมด','All'),
      ('noodle','เส้น','Noodle'),
      ('soup','ซุป','Soup'),
      ('curry','แกง','Curry'),
      ('stirfry','ผัด','Stir-fry'),
      ('rice','ข้าว','Rice'),
      ('salad','ยำ','Salad'),
      ('dessert','ของหวาน','Dessert')
    ON CONFLICT DO NOTHING
  `;

  // ── Dishes ───────────────────────────────────────────────────────────────────
  type Dish = { id: string; en: string; th: string; tag: string; time: number; spicy: number; diff: number; kcal: number; vegan: boolean; meal: string; desc: string; rating: number; reviews: number; trending: number; color: string; image: string; youtube: string; ings: string[]; steps: [string, string][] };
  const dishes: Dish[] = [
    { id:'krapow', en:'Pad Krapow', th:'ผัดกะเพรา', tag:'stirfry', time:15, spicy:4, diff:1, kcal:520, vegan:false, meal:'lunch', desc:'Street-food classic. Pork or chicken, holy basil, fire.', rating:4.8, reviews:1284, trending:1, color:'#D64528', image:'images/dishes/krapow.png', youtube:'https://youtu.be/4fCD6l2asFI?si=sMQkXJP3Whr6494_', ings:['chicken','garlic','chili','basil','fishsauce','oyster','egg','rice'], steps:[['Pound','Mortar 4 cloves garlic + 6 birds-eye chilies to a rough paste.'],['Fire','Wok on high. 2 tbsp oil. Paste in, 10 seconds until fragrant.'],['Protein','Add 200g minced chicken. Sear hard, break apart. 2 min.'],['Season','1 tbsp oyster, 1 tbsp fish sauce, 1 tsp sugar. Splash of stock.'],['Basil','Handful holy basil. Toss once. Off heat.'],['Plate','Over rice. Fry an egg until the edges frizzle. Done.']] },
    { id:'tomyum', en:'Tom Yum Goong', th:'ต้มยำกุ้ง', tag:'soup', time:25, spicy:4, diff:2, kcal:310, vegan:false, meal:'dinner', desc:'Hot-sour prawn soup. Aromatic, bright, unforgettable.', rating:4.9, reviews:2010, trending:2, color:'#E8823A', image:'images/dishes/tomyum.png', youtube:'https://youtu.be/Tz7jH-XijB4?si=yQ2GT2U98e2AaG_u', ings:['shrimp','lemongrass','galangal','lime','chili','mushroom','fishsauce'], steps:[['Stock','Simmer shrimp shells in 3 cups water, 10 min. Strain.'],['Aromatics','Add bruised lemongrass, 4 slices galangal, kaffir lime leaves.'],['Build','Mushrooms in. Then shrimp. Cook just until pink.'],['Season','Off heat: 2 tbsp fish sauce, 3 tbsp lime, chilies crushed.'],['Serve','Taste. Should be equal parts sour, salty, spicy.']] },
    { id:'friedrice', en:'Thai Fried Rice', th:'ข้าวผัด', tag:'rice', time:10, spicy:1, diff:1, kcal:480, vegan:false, meal:'lunch', desc:'The ten-minute answer to leftover rice.', rating:4.6, reviews:890, trending:3, color:'#E8B13A', image:'images/dishes/friedrice.png', youtube:'https://youtu.be/chwvx3YdXfA?si=9cBu_Ra3eygvZrIp', ings:['rice','egg','garlic','onion','carrot','fishsauce'], steps:[['Prep','Day-old rice, cold. Garlic minced. Egg cracked.'],['Egg','Hot wok, oil, egg. Scramble soft. Push aside.'],['Rice','Garlic, then rice. Toss until every grain is glossy.'],['Season','Fish sauce drizzled around the rim of the wok.'],['Finish','Scallions in. Cucumber + lime on the side.']] },
    { id:'boatnoodle', en:'Boat Noodle', th:'ก๋วยเตี๋ยวเรือ', tag:'noodle', time:45, spicy:3, diff:3, kcal:390, vegan:false, meal:'dinner', desc:'Deep, dark, five-spice beef broth. Tiny bowl, infinite refills.', rating:4.7, reviews:612, trending:5, color:'#8B2E2E', image:'images/dishes/boatnoodle.png', youtube:'https://youtu.be/VUHOUQbLCzE?si=EMEvIDwe9g6OFm0-', ings:['noodle','beef','garlic','chili','basil'], steps:[['Broth','Beef bones + star anise + cinnamon. Low simmer, 3 hours.'],['Blanch','Rice noodles into boiling water 15 seconds.'],['Assemble','Noodles, sliced beef, meatballs. Broth poured over.'],['Top','Crispy garlic, cilantro, a spoon of pork blood (optional).']] },
    { id:'greencurry', en:'Green Curry', th:'แกงเขียวหวาน', tag:'curry', time:30, spicy:3, diff:2, kcal:560, vegan:false, meal:'dinner', desc:'Creamy, fragrant. The colour of a Thai forest after rain.', rating:4.8, reviews:1450, trending:4, color:'#4A7A3E', image:'images/dishes/greencurry.png', youtube:'https://youtu.be/eeGIrnqV7J8?si=BStMETwaMwO1aQ3R', ings:['chicken','coconut','basil','chili','garlic','fishsauce','sugar'], steps:[['Crack','Thick coconut cream in a pan until the oil splits out.'],['Fry','3 tbsp green curry paste. Fry until paste bleeds oil.'],['Simmer','Chicken in. Then thin coconut milk. 10 minutes.'],['Season','Fish sauce, palm sugar. Thai eggplant if you have it.'],['Finish','Basil, sliced chili. Off heat immediately.']] },
    { id:'padthai', en:'Pad Thai', th:'ผัดไทย', tag:'noodle', time:20, spicy:2, diff:2, kcal:620, vegan:false, meal:'lunch', desc:'Tamarind-sweet, wok-smoky. Crushed peanuts on top.', rating:4.7, reviews:2340, trending:6, color:'#E8823A', image:'images/dishes/padthai.png', youtube:'https://youtu.be/tTJgh6AOG9k?si=pJyb87njsmR-xZLO', ings:['noodle','shrimp','egg','garlic','tofu','fishsauce','sugar','lime'], steps:[['Soak','Dried rice noodles, warm water 20 min until pliable.'],['Sauce','Tamarind + palm sugar + fish sauce, equal parts.'],['Wok','Tofu + shrimp seared. Push aside. Scramble egg.'],['Noodle','Drained noodles + sauce. Toss hard until sticky-glossy.'],['Top','Bean sprouts, peanuts, lime wedge, chili flakes.']] },
    { id:'somtum', en:'Som Tum', th:'ส้มตำ', tag:'salad', time:10, spicy:5, diff:1, kcal:180, vegan:true, meal:'lunch', desc:'Green papaya salad. Sour, spicy, sweet. Loud pounding.', rating:4.9, reviews:1890, trending:7, color:'#4A7A3E', image:'images/dishes/somtum.png', youtube:'https://youtu.be/KrCEL0tdswg?si=AiPuY80B1eiWywMv', ings:['garlic','chili','lime','fishsauce','sugar','tomato','carrot'], steps:[['Pound','Garlic + chilies in the mortar. Few cracks.'],['Build',"Lime, fish sauce, palm sugar. Bruise, don't puree."],['Toss','Shredded papaya + tomato + long beans. Bruise gently.'],['Serve','Piled high. Sticky rice on the side. Eat immediately.']] },
    { id:'panang', en:'Panang Curry', th:'พะแนง', tag:'curry', time:35, spicy:2, diff:2, kcal:510, vegan:false, meal:'dinner', desc:'Thick, peanutty, rich. Less soupy than its green cousin.', rating:4.7, reviews:980, trending:8, color:'#A84D2E', image:'images/dishes/panang.png', youtube:'https://youtu.be/KC5qyIR0atc?si=SezbZ6JD8faOSHfp', ings:['beef','coconut','chili','basil','sugar','fishsauce'], steps:[['Paste','Fry panang paste in thick coconut cream, 5 min.'],['Beef','Sliced thin. Quick sear. Do not overcook.'],['Reduce','Low simmer until sauce coats a spoon.'],['Finish','Kaffir lime leaves julienned over top.']] },
    { id:'mangosticky', en:'Mango Sticky Rice', th:'ข้าวเหนียวมะม่วง', tag:'dessert', time:40, spicy:0, diff:2, kcal:440, vegan:true, meal:'dessert', desc:'Sweet warm coconut rice. Cold ripe mango. Summer in a bowl.', rating:4.9, reviews:1670, trending:9, color:'#F0C445', image:'images/dishes/mangosticky.png', youtube:'https://youtu.be/t5hfE9uzo_o?si=e_pq0TZ4OlKZAtpB', ings:['rice','coconut','sugar'], steps:[['Soak','Sticky rice 2 hours in cold water.'],['Steam','30 min over boiling water, cloth-lined basket.'],['Sauce','Coconut milk + palm sugar + pinch salt, warmed.'],['Dress','Hot rice bathed in sauce. Rest 10 min.'],['Serve','Sliced mango alongside. Toasted mung beans on top.']] },
    { id:'larbgai', en:'Larb Gai', th:'ลาบไก่', tag:'salad', time:20, spicy:4, diff:2, kcal:290, vegan:false, meal:'dinner', desc:'Isaan-style minced chicken salad. Toasted rice powder is the secret.', rating:4.6, reviews:540, trending:10, color:'#B04A2E', image:'images/dishes/larbgai.png', youtube:'https://youtu.be/Anyn4COxg00?si=GP7vfG6MklTnPmOf', ings:['chicken','lime','chili','fishsauce','onion'], steps:[['Toast','Raw sticky rice in dry pan until golden. Grind coarse.'],['Cook','Minced chicken in splash of stock. No oil.'],['Dress','Lime, fish sauce, chili flakes, shallot, mint.'],['Rice powder','Stirred in at the end. It is the whole point.']] },
    { id:'khaosoi', en:'Khao Soi', th:'ข้าวซอย', tag:'noodle', time:50, spicy:2, diff:3, kcal:640, vegan:false, meal:'dinner', desc:'Chiang Mai coconut curry noodles. Soft noodles below, crispy on top.', rating:4.9, reviews:1120, trending:11, color:'#E89A3A', image:'images/dishes/khaosoi.png', youtube:'https://youtu.be/ZfzGe-RW2RY?si=izrvoR_7n2p7wr-S', ings:['noodle','chicken','coconut','chili','lime','onion'], steps:[['Curry','Khao soi paste + coconut milk. Chicken thighs, simmer 30 min.'],['Noodle','Egg noodles boiled soft. Half reserved, half fried crispy.'],['Bowl','Soft noodles, curry, chicken. Crispy nest on top.'],['Table','Pickled mustard, shallot, lime, chili oil. DIY.']] },
    { id:'tofustir', en:'Pad Pak Tofu', th:'ผัดผักเต้าหู้', tag:'stirfry', time:12, spicy:1, diff:1, kcal:340, vegan:true, meal:'lunch', desc:'Vegetable stir-fry with silken tofu. Weeknight hero.', rating:4.4, reviews:410, trending:12, color:'#4A7A3E', image:'images/dishes/tofustir.png', youtube:'https://youtu.be/0YaRVn24suQ?si=JbHJzxgX4MRqdw9u', ings:['tofu','garlic','mushroom','carrot','oyster','onion'], steps:[['Prep','Tofu pressed dry, cubed. Veg cut bite-size.'],['Sear','Tofu until golden on all sides. Out.'],['Fry','Garlic, harder veg first, softer last.'],['Finish','Tofu back in. Sauce. 30 seconds and out.']] },
  ];

  for (const d of dishes) {
    await sql`
      INSERT INTO dishes (id, en, th, tag, time, spicy, difficulty, kcal, vegan, meal, "desc", rating, reviews, trending, color, image, status, source, youtube)
      VALUES (${d.id}, ${d.en}, ${d.th}, ${d.tag}, ${d.time}, ${d.spicy}, ${d.diff}, ${d.kcal}, ${d.vegan}, ${d.meal}, ${d.desc}, ${d.rating}, ${d.reviews}, ${d.trending}, ${d.color}, ${d.image}, 'Stable', 'built-in', ${d.youtube})
      ON CONFLICT DO NOTHING
    `;
    for (const ing of d.ings) {
      await sql`INSERT INTO dish_ingredients (dish_id, ingredient_id) VALUES (${d.id}, ${ing}) ON CONFLICT DO NOTHING`;
    }
    for (let i = 0; i < d.steps.length; i++) {
      const [title, description] = d.steps[i];
      await sql`INSERT INTO dish_steps (dish_id, sort_order, title, description) VALUES (${d.id}, ${i}, ${title}, ${description})`;
    }
  }

  // ── Cooks ────────────────────────────────────────────────────────────────────
  const cooks = [
    ['nim_eats','@nim_eats','N','#D64528','Bangkok-born, Melbourne-based. I cook Thai food the way my yai taught me — then break all her rules.','Isaan & fusion',14820,4.7,0],
    ['bangkok_boy','@bangkok.boy','B','#E8823A','Street food is fine dining with a better view. Recreating hawker classics one wok at a time.','Street food recreations',9340,4.6,5],
    ['dad_cooks','@dad.cooks','D','#E8B13A','Retired engineer, full-time chef for two daughters who have very strong opinions about food.','Family classics',22100,4.9,10],
    ['thai_mom','@thai_mom','T','#4A7A3E','Three kids, one wok, zero shortcuts. Every recipe has been tested at least 40 times before I post it.','Traditional recipes',31400,4.8,15],
    ['veggie_joom','@veggie.joom','V','#27AE60','Proving that plant-based Thai food is not a compromise. Every dish is fully vegan and fully delicious.','Vegan Thai',7620,4.6,20],
    ['spicylord','@spicylord','S','#C0392B',"If it doesn't make you sweat it's just warm soup. Heat tolerance built over 30 years of trying.",'Extreme spice',19200,4.7,25],
    ['firsttrycook','@firsttrycook','F','#8E44AD','Documenting every attempt (including the disasters). Amateur hour, professional appetite.','Beginner honest reviews',31800,4.3,30],
  ] as const;
  for (const [id, username, avatar, color, bio, specialty, total_likes, avg_rating, dish_offset] of cooks) {
    await sql`
      INSERT INTO cooks (id, username, avatar, color, bio, specialty, total_likes, avg_rating, dish_offset)
      VALUES (${id}, ${username}, ${avatar}, ${color}, ${bio}, ${specialty}, ${total_likes}, ${avg_rating}, ${dish_offset})
      ON CONFLICT DO NOTHING
    `;
  }

  // ── Posts ────────────────────────────────────────────────────────────────────
  const posts = [
    ['p1','nim_eats','N','Lazy Krapow (no basil edition)','Out of holy basil, subbed Thai basil. Heresy? Maybe. Delicious? Also yes.',342,28,4.5,'#D64528','images/dishes/krapow.png'],
    ['p2','bangkok_boy','B','Tom Yum but creamy (nam khon)','Added evap milk at the end. Controversial but my mom approved.',891,67,4.8,'#E8823A','images/dishes/tomyum.png'],
    ['p3','veggie_joom','V','Mushroom Larb (fully vegan)','King oyster mushrooms hand-chopped. Toasted rice powder non-negotiable.',234,19,4.6,'#4A7A3E','images/dishes/larbgai.png'],
    ['p4','dad_cooks','D','Khao Pad with pineapple','Daughter requested the hollowed-pineapple presentation. Dad delivers.',1203,142,4.9,'#E8B13A','images/dishes/friedrice.png'],
    ['p5','thai_mom','T','Pad See Ew — the family recipe','Wide rice noodles, dark soy, Chinese broccoli. This one took 3 years to perfect. Not joking.',2104,231,4.9,'#4A7A3E','images/dishes/padthai.png'],
    ['p6','spicylord','S','Crying Tiger Steak','The dipping sauce IS the dish. Grilled beef is just an excuse to eat the jaew.',678,54,4.7,'#C0392B','images/dishes/cryingtiger.png'],
    ['p7','firsttrycook','F','My first Som Tum (send help)','Used a rolling pin instead of a mortar. Added too much fish sauce. Ate it anyway. 6/10 will try again.',1890,203,4.3,'#8E44AD','images/dishes/somtum.png'],
    ['p8','nim_eats','N','Kanom Jeen with homemade curry','Spent all Saturday on this. Worth every second. The curry paste alone took 2 hours.',512,41,4.6,'#D64528','images/dishes/greencurry.png'],
  ] as const;
  for (const [id, user_id, avatar, dish, caption, likes, comments_count, rating, color, image] of posts) {
    await sql`
      INSERT INTO posts (id, user_id, avatar, dish, caption, likes, comments_count, rating, color, image)
      VALUES (${id}, ${user_id}, ${avatar}, ${dish}, ${caption}, ${likes}, ${comments_count}, ${rating}, ${color}, ${image})
      ON CONFLICT DO NOTHING
    `;
  }

  // ── Reviews ──────────────────────────────────────────────────────────────────
  const existing = await sql`SELECT COUNT(*) as c FROM reviews`;
  if (Number((existing[0] as any).c) === 0) {
    await sql`INSERT INTO reviews (dish_id, user_name, avatar, stars, when_text, review_text) VALUES ('krapow','@thai_mom','T',5,'2d','Exactly like my grandmother made it. Make sure your wok is screaming hot.')`;
    await sql`INSERT INTO reviews (dish_id, user_name, avatar, stars, when_text, review_text) VALUES ('krapow','@firsttrycook','F',4,'5d','Subbed Italian basil and it still slapped. Halved the chili for the kids.')`;
    await sql`INSERT INTO reviews (dish_id, user_name, avatar, stars, when_text, review_text) VALUES ('krapow','@spicylord','S',5,'1w','Doubled the chili. Cried through dinner. No regrets. Will do again.')`;
  }

  // ── Admin user ───────────────────────────────────────────────────────────────
  const adminExists = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
  if (adminExists.length === 0) {
    const hash = bcrypt.hashSync('admin1234', 10);
    await sql`INSERT INTO users (id, username, password_hash, color, role) VALUES ('admin', 'Admin', ${hash}, '#E84A2A', 'admin') ON CONFLICT DO NOTHING`;
    console.log('[seed] Admin created — username: Admin  password: admin1234');
    console.log('[seed] IMPORTANT: Change the admin password after first login!');
  }

  console.log('[seed] Done!');
  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
