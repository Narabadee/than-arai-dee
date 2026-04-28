import { Router, Request, Response } from 'express';
import { sql } from '../db.js';
import { getAuthUser } from '../auth.js';

export const fridgeRouter = Router();

fridgeRouter.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const rows = await sql`SELECT ingredient_id FROM user_fridge WHERE user_id = ${user.id}`;
    res.json(rows.map((r: any) => r.ingredient_id));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch fridge' });
  }
});

fridgeRouter.put('/', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const items: string[] = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Body must be an array of ingredient IDs.' });

    await sql.begin(async (tx) => {
      await tx`DELETE FROM user_fridge WHERE user_id = ${user.id}`;
      for (const id of items) {
        await tx`INSERT INTO user_fridge (user_id, ingredient_id) VALUES (${user.id}, ${id})`;
      }
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update fridge' });
  }
});
