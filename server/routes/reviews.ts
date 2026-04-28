import { Router, Request, Response } from 'express';
import { sql } from '../db.js';

export const reviewsRouter = Router();

reviewsRouter.get('/:dishId', async (req: Request, res: Response) => {
  try {
    const rows = await sql`SELECT * FROM reviews WHERE dish_id = ${req.params.dishId} ORDER BY id DESC`;
    res.json(rows.map((r: any) => ({
      user: r.user_name,
      avatar: r.avatar,
      stars: r.stars,
      when: r.when_text,
      text: r.review_text,
    })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

reviewsRouter.post('/:dishId', async (req: Request, res: Response) => {
  try {
    const { user, avatar, stars, when, text } = req.body;
    if (!user || !stars || !text) return res.status(400).json({ error: 'user, stars, text required.' });
    await sql`
      INSERT INTO reviews (dish_id, user_name, avatar, stars, when_text, review_text)
      VALUES (${req.params.dishId}, ${user}, ${avatar || user[0]?.toUpperCase() || 'U'}, ${stars}, ${when || 'just now'}, ${text})
    `;
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to post review' });
  }
});
