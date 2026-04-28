import { Router, Request, Response } from 'express';
import { sql } from '../db.js';
import { getAuthUser } from '../auth.js';

export const postsRouter = Router();

postsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    const includeDeleted = req.query.include_deleted === 'true' && user?.role === 'admin';
    const userId = user?.id ?? null;

    const rows = includeDeleted
      ? await sql`
          SELECT p.id, p.user_id, c.username AS user,
            COALESCE(c.avatar, p.avatar) AS avatar,
            p.dish, p.caption, p.ingredients, p.steps, p.youtube,
            p.likes, p.comments_count AS comments, p.rating,
            COALESCE(c.color, p.color) AS color, p.image, p.deleted,
            EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ${userId}) AS "hasLiked"
          FROM posts p LEFT JOIN cooks c ON p.user_id = c.id
          ORDER BY p.created_at DESC
        `
      : await sql`
          SELECT p.id, p.user_id, c.username AS user,
            COALESCE(c.avatar, p.avatar) AS avatar,
            p.dish, p.caption, p.ingredients, p.steps, p.youtube,
            p.likes, p.comments_count AS comments, p.rating,
            COALESCE(c.color, p.color) AS color, p.image, p.deleted,
            EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ${userId}) AS "hasLiked"
          FROM posts p LEFT JOIN cooks c ON p.user_id = c.id
          WHERE p.deleted = false
          ORDER BY p.created_at DESC
        `;

    const formatted = rows.map((r: any) => ({
      ...r,
      ingredients: r.ingredients ? JSON.parse(r.ingredients) : [],
      steps: r.steps ? JSON.parse(r.steps) : [],
      comments: r.comments ?? 0,
      likes: r.likes ?? 0,
      deleted: !!r.deleted,
      hasLiked: !!r.hasLiked,
    }));

    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

postsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Log in to share a recipe.' });

    const { dish, caption, ingredients, steps, image, youtube } = req.body;
    if (!dish || !caption) return res.status(400).json({ error: 'Dish and caption are required.' });

    const id = `p${Date.now()}`;
    await sql`
      INSERT INTO posts (id, user_id, avatar, dish, caption, ingredients, steps, youtube, rating, color, image)
      VALUES (${id}, ${user.id}, ${user.username[0].toUpperCase()}, ${dish}, ${caption},
              ${JSON.stringify(ingredients || [])}, ${JSON.stringify(steps || [])},
              ${youtube || null}, 0, ${user.color}, ${image || null})
    `;

    const [created] = await sql`SELECT * FROM posts WHERE id = ${id}`;
    res.status(201).json({
      ...(created as any),
      user: user.username,
      comments: 0,
      likes: 0,
      rating: 0,
      deleted: false,
      ingredients: ingredients || [],
      steps: steps || [],
      hasLiked: false,
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

postsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const [post] = await sql`SELECT user_id FROM posts WHERE id = ${req.params.id}`;
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if ((post as any).user_id !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await sql`UPDATE posts SET deleted = true WHERE id = ${req.params.id}`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

postsRouter.patch('/:id/edit', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const [post] = await sql`SELECT user_id FROM posts WHERE id = ${req.params.id}`;
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if ((post as any).user_id !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { caption, ingredients, steps } = req.body;
    await sql`
      UPDATE posts SET
        caption = COALESCE(${caption ?? null}, caption),
        ingredients = COALESCE(${ingredients !== undefined ? JSON.stringify(ingredients) : null}, ingredients),
        steps = COALESCE(${steps !== undefined ? JSON.stringify(steps) : null}, steps)
      WHERE id = ${req.params.id}
    `;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to edit post' });
  }
});

postsRouter.patch('/:id/delete', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    await sql`UPDATE posts SET deleted = true WHERE id = ${req.params.id}`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

postsRouter.patch('/:id/restore', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    await sql`UPDATE posts SET deleted = false WHERE id = ${req.params.id}`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

postsRouter.patch('/:id/like', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Login required' });
    const { action } = req.body;
    const [existing] = await sql`SELECT 1 FROM post_likes WHERE post_id = ${req.params.id} AND user_id = ${user.id}`;

    if (action === 'like' && !existing) {
      await sql`INSERT INTO post_likes (post_id, user_id) VALUES (${req.params.id}, ${user.id}) ON CONFLICT DO NOTHING`;
      await sql`UPDATE posts SET likes = likes + 1 WHERE id = ${req.params.id}`;
    } else if (action === 'unlike' && existing) {
      await sql`DELETE FROM post_likes WHERE post_id = ${req.params.id} AND user_id = ${user.id}`;
      await sql`UPDATE posts SET likes = GREATEST(0, likes - 1) WHERE id = ${req.params.id}`;
    }

    const [post] = await sql`SELECT likes FROM posts WHERE id = ${req.params.id}`;
    res.json({ likes: (post as any)?.likes ?? 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to like' });
  }
});

postsRouter.post('/:id/comment', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Login required' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });
    await sql`INSERT INTO post_comments (post_id, user_id, text) VALUES (${req.params.id}, ${user.id}, ${text})`;
    await sql`UPDATE posts SET comments_count = comments_count + 1 WHERE id = ${req.params.id}`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to comment' });
  }
});

postsRouter.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const comments = await sql`
      SELECT pc.text, c.username AS user
      FROM post_comments pc
      JOIN cooks c ON pc.user_id = c.id
      WHERE pc.post_id = ${req.params.id}
      ORDER BY pc.created_at ASC
    `;
    res.json(comments);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

postsRouter.patch('/:id/rate', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Login required' });
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    await sql`
      UPDATE posts SET rating = ROUND(
        CASE WHEN COALESCE(rating, 0) = 0 THEN ${rating}
             ELSE (COALESCE(rating, 0) * 4 + ${rating}) / 5.0
        END::numeric, 1)
      WHERE id = ${req.params.id}
    `;
    const [post] = await sql`SELECT rating FROM posts WHERE id = ${req.params.id}`;
    res.json({ rating: (post as any)?.rating ?? rating });
  } catch (e) {
    res.status(500).json({ error: 'Failed to rate' });
  }
});
