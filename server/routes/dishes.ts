import { Router, Request, Response } from 'express';
import { db } from '../database.js';
import { getAuthUser } from '../auth.js';

export const dishesRouter = Router();

function buildDish(row: any) {
  const ingredients = (db.prepare('SELECT ingredient_id FROM dish_ingredients WHERE dish_id = ?').all(row.id) as any[]).map(r => r.ingredient_id);
  const steps = (db.prepare('SELECT title, description FROM dish_steps WHERE dish_id = ? ORDER BY sort_order').all(row.id) as any[]).map(s => ({ t: s.title, d: s.description }));
  return { ...row, vegan: !!row.vegan, ingredients, steps };
}

dishesRouter.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare("SELECT * FROM dishes WHERE status != 'Hidden'").all();
  res.json(rows.map(buildDish));
});

dishesRouter.get('/types', (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM dish_types').all());
});

dishesRouter.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM dishes WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(buildDish(row));
});

dishesRouter.post('/', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const { en, th, tag, time, spicy, difficulty, kcal, desc, ingredients, steps, image, youtube } = req.body;
  if (!en || !desc || !ingredients) return res.status(400).json({ error: 'en, desc, and ingredients are required.' });

  const COLORS = ['#D64528','#E8823A','#E8B13A','#4A7A3E','#F4C13D','#B8D63D','#9B59B6'];
  const id = `admin-${Date.now()}`;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  db.prepare(`
    INSERT INTO dishes (id,en,th,tag,time,spicy,difficulty,kcal,vegan,meal,desc,rating,reviews,color,image,status,source,youtube)
    VALUES (?,?,?,?,?,?,?,?,0,'lunch',?,4.5,0,?,?,?,'Stable','admin',?)
  `).run(id, en.trim(), (th||en).trim(), tag||'stirfry', time||20, spicy||2, difficulty||1, kcal||400, desc.trim(), color, image||null, youtube||null);

  const ing: string[] = Array.isArray(ingredients)
    ? ingredients
    : String(ingredients).split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
  const insertDI = db.prepare('INSERT OR IGNORE INTO dish_ingredients (dish_id,ingredient_id) VALUES (?,?)');
  for (const i of ing) insertDI.run(id, i);

  if (steps && Array.isArray(steps)) {
    const insertStep = db.prepare('INSERT INTO dish_steps (dish_id,sort_order,title,description) VALUES (?,?,?,?)');
    steps.forEach((s: any, i: number) => {
      insertStep.run(id, i, s.t || s.title || 'Step', s.d || s.description || '');
    });
  } else {
    db.prepare('INSERT INTO dish_steps (dish_id,sort_order,title,description) VALUES (?,0,?,?)').run(id, 'Cook', desc.trim());
  }

  const created = db.prepare('SELECT * FROM dishes WHERE id = ?').get(id);
  res.status(201).json(buildDish(created));
});

dishesRouter.patch('/:id/status', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { status } = req.body as { status: string };
  db.prepare("UPDATE dishes SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ ok: true });
});

dishesRouter.put('/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const { en, th, tag, time, spicy, difficulty, kcal, desc, ingredients, steps, image, status, youtube } = req.body;
  
  // Update main table
  db.prepare(`
    UPDATE dishes 
    SET en = ?, th = ?, tag = ?, time = ?, spicy = ?, difficulty = ?, kcal = ?, desc = ?, image = ?, status = ?, youtube = ?
    WHERE id = ?
  `).run(en, th, tag, time, spicy, difficulty, kcal, desc, image || null, status || 'Stable', youtube || null, req.params.id);

  // Update ingredients if provided
  if (ingredients) {
    db.prepare('DELETE FROM dish_ingredients WHERE dish_id = ?').run(req.params.id);
    const ing: string[] = Array.isArray(ingredients)
      ? ingredients
      : String(ingredients).split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
    const insertDI = db.prepare('INSERT OR IGNORE INTO dish_ingredients (dish_id,ingredient_id) VALUES (?,?)');
    for (const i of ing) insertDI.run(req.params.id, i);
  }

  // Update steps if provided
  if (steps && Array.isArray(steps)) {
    db.prepare('DELETE FROM dish_steps WHERE dish_id = ?').run(req.params.id);
    const insertStep = db.prepare('INSERT INTO dish_steps (dish_id,sort_order,title,description) VALUES (?,?,?,?)');
    steps.forEach((s: any, i: number) => {
      insertStep.run(req.params.id, i, s.t || s.title || 'Step', s.d || s.description || '');
    });
  }

  const updated = db.prepare('SELECT * FROM dishes WHERE id = ?').get(req.params.id);
  res.json(buildDish(updated));
});

dishesRouter.delete('/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const dish = db.prepare("SELECT source FROM dishes WHERE id = ?").get(req.params.id) as any;
  if (!dish) return res.status(404).json({ error: 'Not found' });
  if (dish.source !== 'admin') return res.status(403).json({ error: 'Can only delete admin-added dishes.' });
  db.prepare('DELETE FROM dish_steps WHERE dish_id = ?').run(req.params.id);
  db.prepare('DELETE FROM dish_ingredients WHERE dish_id = ?').run(req.params.id);
  db.prepare('DELETE FROM dishes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
