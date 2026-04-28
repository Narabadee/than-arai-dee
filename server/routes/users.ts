import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { sql } from '../db.js';
import { getAuthUser } from '../auth.js';

export const usersRouter = Router();

usersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    res.json(await sql`SELECT id, username, color, banned FROM users WHERE role != 'admin'`);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

usersRouter.patch('/:id/ban', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const [target] = await sql`SELECT banned FROM users WHERE id = ${req.params.id}`;
    if (!target) return res.status(404).json({ error: 'User not found' });
    const newBanned = !(target as any).banned;
    await sql`UPDATE users SET banned = ${newBanned} WHERE id = ${req.params.id}`;
    res.json({ banned: newBanned });
  } catch (e) {
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

usersRouter.get('/cooks', async (_req: Request, res: Response) => {
  try {
    res.json(await sql`SELECT * FROM cooks`);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch cooks' });
  }
});

usersRouter.get('/profile/:username', async (req: Request, res: Response) => {
  try {
    const username = (req.params.username as string).replace('@', '').toLowerCase();
    const [profile] = await sql`SELECT * FROM cooks WHERE LOWER(username) = ${`@${username}`} OR id = ${username}`;
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const posts = await sql`
      SELECT p.*, c.username as user, COALESCE(c.avatar, p.avatar) as avatar,
             COALESCE(c.color, p.color) as color, p.comments_count AS comments
      FROM posts p LEFT JOIN cooks c ON p.user_id = c.id
      WHERE p.user_id = ${(profile as any).id} AND p.deleted = false
      ORDER BY p.created_at DESC
    `;

    const mappedPosts = posts.map((p: any) => ({
      ...p,
      ingredients: p.ingredients ? JSON.parse(p.ingredients) : [],
      steps: p.steps ? JSON.parse(p.steps) : [],
      comments: p.comments ?? 0,
      likes: p.likes ?? 0,
      rating: p.rating ?? 0,
      deleted: !!p.deleted,
    }));

    const ratedPosts = mappedPosts.filter((p: any) => p.rating > 0);
    const avg_rating = ratedPosts.length > 0
      ? Math.round((ratedPosts.reduce((sum: number, p: any) => sum + p.rating, 0) / ratedPosts.length) * 10) / 10
      : 0;
    const total_likes = mappedPosts.reduce((sum: number, p: any) => sum + p.likes, 0);

    res.json({ ...(profile as any), posts: mappedPosts, avg_rating, total_likes });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

usersRouter.patch('/profile', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { display_name, bio, specialty, avatar, location } = req.body;
    await sql`
      UPDATE cooks SET
        display_name = COALESCE(${display_name ?? null}, display_name),
        bio = COALESCE(${bio ?? null}, bio),
        specialty = COALESCE(${specialty ?? null}, specialty),
        avatar = COALESCE(${avatar ?? null}, avatar),
        location = COALESCE(${location ?? null}, location)
      WHERE id = ${user.id}
    `;
    const [updated] = await sql`SELECT * FROM cooks WHERE id = ${user.id}`;
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

usersRouter.patch('/password', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing passwords.' });

    const [dbUser] = await sql`SELECT password_hash FROM users WHERE id = ${user.id}`;
    if (!bcrypt.compareSync(oldPassword, (dbUser as any).password_hash)) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}`;
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});
