import { Router, Request, Response } from 'express';
import { db } from '../database.js';
import { getAuthUser } from '../auth.js';

export const postsRouter = Router();

postsRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const includeDeleted = req.query.include_deleted === 'true' && user?.role === 'admin';
  const query = `
    SELECT 
      p.id, 
      p.user_id,
      c.username AS user, 
      COALESCE(c.avatar, p.avatar) AS avatar, 
      p.dish, 
      p.caption, 
      p.ingredients,
      p.steps,
      p.likes, 
      p.comments_count AS comments, 
      p.rating, 
      COALESCE(c.color, p.color) AS color, 
      p.image, 
      p.deleted,
      (SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as hasLiked
    FROM posts p
    LEFT JOIN cooks c ON p.user_id = c.id
    ${includeDeleted ? '' : 'WHERE p.deleted = 0'}
    ORDER BY p.rowid DESC
  `;
  const rows = db.prepare(query).all(user?.id || null) as any[];
  
  const formatted = rows.map(r => ({
    ...r,
    ingredients: r.ingredients ? JSON.parse(r.ingredients) : [],
    steps: r.steps ? JSON.parse(r.steps) : [],
    comments: r.comments ?? 0,
    likes: r.likes ?? 0,
    deleted: !!r.deleted,
    hasLiked: !!r.hasLiked
  }));
  
  res.json(formatted);
});

postsRouter.post('/', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Log in to share a recipe.' });

  const { dish, caption, ingredients, steps, image } = req.body;
  if (!dish || !caption) return res.status(400).json({ error: 'Dish and caption are required.' });

  const id = `p${Date.now()}`;
  db.prepare(`
    INSERT INTO posts (id, user_id, avatar, dish, caption, ingredients, steps, rating, color, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    user.id,
    user.username[0].toUpperCase(),
    dish,
    caption,
    JSON.stringify(ingredients || []),
    JSON.stringify(steps || []),
    0,
    user.color,
    image || null
  );

  const created = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as any;
  res.status(201).json({
    ...created,
    user: user.username,
    comments: 0,
    likes: 0,
    rating: 0,
    deleted: false,
    ingredients: JSON.parse(created.ingredients),
    steps: JSON.parse(created.steps),
    hasLiked: false
  });
});

// Delete own post (or admin)
postsRouter.delete('/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(req.params.id) as any;
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  db.prepare('UPDATE posts SET deleted = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Edit own post
postsRouter.patch('/:id/edit', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(req.params.id) as any;
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { caption, ingredients, steps } = req.body;
  db.prepare(`
    UPDATE posts SET
      caption = COALESCE(?, caption),
      ingredients = COALESCE(?, ingredients),
      steps = COALESCE(?, steps)
    WHERE id = ?
  `).run(
    caption ?? null,
    ingredients !== undefined ? JSON.stringify(ingredients) : null,
    steps !== undefined ? JSON.stringify(steps) : null,
    req.params.id
  );

  res.json({ ok: true });
});

// Admin soft-delete / restore
postsRouter.patch('/:id/delete', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  db.prepare('UPDATE posts SET deleted = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

postsRouter.patch('/:id/restore', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  db.prepare('UPDATE posts SET deleted = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Toggle like (prevent infinity glitch)
postsRouter.patch('/:id/like', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Login required' });
  const { action } = req.body; // 'like' | 'unlike'
  
  const existing = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(req.params.id, user.id);

  if (action === 'like' && !existing) {
    db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(req.params.id, user.id);
    db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(req.params.id);
  } else if (action === 'unlike' && existing) {
    db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(req.params.id, user.id);
    db.prepare('UPDATE posts SET likes = MAX(0, likes - 1) WHERE id = ?').run(req.params.id);
  }
  
  const post = db.prepare('SELECT likes FROM posts WHERE id = ?').get(req.params.id) as any;
  res.json({ likes: post?.likes ?? 0 });
});

// Post a comment
postsRouter.post('/:id/comment', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Login required' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text required' });

  db.prepare('INSERT INTO post_comments (post_id, user_id, text) VALUES (?, ?, ?)').run(req.params.id, user.id, text);
  db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(req.params.id);
  
  res.json({ ok: true });
});

// Fetch comments for a post
postsRouter.get('/:id/comments', (req: Request, res: Response) => {
  const query = `
    SELECT pc.text, c.username AS user
    FROM post_comments pc
    JOIN cooks c ON pc.user_id = c.id
    WHERE pc.post_id = ?
    ORDER BY pc.created_at ASC
  `;
  const comments = db.prepare(query).all(req.params.id);
  res.json(comments);
});

// Rate a post (weighted average)
postsRouter.patch('/:id/rate', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Login required' });
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
  // Weighted: blend new rating with existing (treats DB rating as average of ~4 prior votes)
  db.prepare(`
    UPDATE posts SET rating = ROUND(
      CASE WHEN COALESCE(rating,0) = 0 THEN ?
           ELSE (COALESCE(rating,0) * 4 + ?) / 5.0
      END, 1)
    WHERE id = ?
  `).run(rating, rating, req.params.id);
  const post = db.prepare('SELECT rating FROM posts WHERE id = ?').get(req.params.id) as any;
  res.json({ rating: post?.rating ?? rating });
});
