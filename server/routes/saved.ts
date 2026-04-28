import { Router, Request, Response } from 'express';
import { sql } from '../db.js';
import { getAuthUser } from '../auth.js';

export const savedRouter = Router();

savedRouter.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const rows = await sql`SELECT dish_id FROM user_saved WHERE user_id = ${user.id}`;
    res.json(rows.map((r: any) => r.dish_id));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch saved' });
  }
});

savedRouter.post('/:dishId', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    await sql`INSERT INTO user_saved (user_id, dish_id) VALUES (${user.id}, ${req.params.dishId}) ON CONFLICT DO NOTHING`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save dish' });
  }
});

savedRouter.delete('/:dishId', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    await sql`DELETE FROM user_saved WHERE user_id = ${user.id} AND dish_id = ${req.params.dishId}`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to unsave dish' });
  }
});
