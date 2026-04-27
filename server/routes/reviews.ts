import { Router, Request, Response } from 'express';
import { db } from '../database.js';

export const reviewsRouter = Router();

reviewsRouter.get('/:dishId', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM reviews WHERE dish_id = ? ORDER BY id DESC').all(req.params.dishId) as any[];
  res.json(rows.map(r => ({
    user: r.user_name,
    avatar: r.avatar,
    stars: r.stars,
    when: r.when_text,
    text: r.review_text,
  })));
});

reviewsRouter.post('/:dishId', (req: Request, res: Response) => {
  const { user, avatar, stars, when, text } = req.body;
  if (!user || !stars || !text) return res.status(400).json({ error: 'user, stars, text required.' });
  db.prepare('INSERT INTO reviews (dish_id,user_name,avatar,stars,when_text,review_text) VALUES (?,?,?,?,?,?)').run(
    req.params.dishId, user, avatar || user[0]?.toUpperCase() || 'U', stars, when || 'just now', text
  );
  res.status(201).json({ ok: true });
});
