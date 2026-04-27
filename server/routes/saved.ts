import { Router, Request, Response } from 'express';
import { db } from '../database.js';
import { getAuthUser } from '../auth.js';

export const savedRouter = Router();

savedRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const rows = db.prepare('SELECT dish_id FROM user_saved WHERE user_id = ?').all(user.id) as any[];
  res.json(rows.map(r => r.dish_id));
});

savedRouter.post('/:dishId', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  db.prepare('INSERT OR IGNORE INTO user_saved (user_id, dish_id) VALUES (?,?)').run(user.id, req.params.dishId);
  res.json({ ok: true });
});

savedRouter.delete('/:dishId', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  db.prepare('DELETE FROM user_saved WHERE user_id = ? AND dish_id = ?').run(user.id, req.params.dishId);
  res.json({ ok: true });
});
