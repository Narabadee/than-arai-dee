import { Router, Request, Response } from 'express';
import { db } from '../database.js';
import { getAuthUser } from '../auth.js';

export const fridgeRouter = Router();

fridgeRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const rows = db.prepare('SELECT ingredient_id FROM user_fridge WHERE user_id = ?').all(user.id) as any[];
  res.json(rows.map(r => r.ingredient_id));
});

fridgeRouter.put('/', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const items: string[] = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Body must be an array of ingredient IDs.' });
  const update = db.transaction(() => {
    db.prepare('DELETE FROM user_fridge WHERE user_id = ?').run(user.id);
    const ins = db.prepare('INSERT INTO user_fridge (user_id, ingredient_id) VALUES (?,?)');
    for (const id of items) ins.run(user.id, id);
  });
  update();
  res.json({ ok: true });
});
