import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database.js';
import { getAuthUser } from '../auth.js';

export const usersRouter = Router();

usersRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const rows = db.prepare("SELECT id, username, color, banned FROM users WHERE role != 'admin'").all();
  res.json(rows);
});

usersRouter.patch('/:id/ban', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const target = db.prepare('SELECT banned FROM users WHERE id = ?').get(req.params.id) as any;
  if (!target) return res.status(404).json({ error: 'User not found' });
  db.prepare('UPDATE users SET banned = ? WHERE id = ?').run(target.banned ? 0 : 1, req.params.id);
  res.json({ banned: !target.banned });
});

usersRouter.get('/cooks', (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM cooks').all());
});

usersRouter.get('/profile/:username', (req: Request, res: Response) => {
  const username = (req.params.username as string).replace('@', '').toLowerCase();
  const profile = db.prepare('SELECT * FROM cooks WHERE LOWER(username) = ? OR id = ?').get(`@${username}`, username) as any;
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  
  // Get user's posts
  const postsQuery = `
    SELECT p.*, c.username as user, COALESCE(c.avatar, p.avatar) as avatar, COALESCE(c.color, p.color) as color,
           p.comments_count AS comments
    FROM posts p
    LEFT JOIN cooks c ON p.user_id = c.id
    WHERE p.user_id = ? AND p.deleted = 0
    ORDER BY p.rowid DESC
  `;
  const posts = db.prepare(postsQuery).all(profile.id) as any[];
  
  profile.posts = posts.map(p => ({
    ...p,
    ingredients: p.ingredients ? JSON.parse(p.ingredients) : [],
    steps: p.steps ? JSON.parse(p.steps) : [],
    comments: p.comments ?? 0,
    likes: p.likes ?? 0,
    rating: p.rating ?? 0,
    deleted: !!p.deleted
  }));

  // Compute live stats from actual posts
  const ratedPosts = profile.posts.filter((p: any) => p.rating > 0);
  profile.avg_rating = ratedPosts.length > 0
    ? Math.round((ratedPosts.reduce((sum: number, p: any) => sum + p.rating, 0) / ratedPosts.length) * 10) / 10
    : 0;
  profile.total_likes = profile.posts.reduce((sum: number, p: any) => sum + p.likes, 0);

  res.json(profile);
});

usersRouter.patch('/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { display_name, bio, specialty, avatar, location } = req.body;
  
  db.prepare(`
    UPDATE cooks 
    SET display_name = COALESCE(?, display_name),
        bio = COALESCE(?, bio),
        specialty = COALESCE(?, specialty),
        avatar = COALESCE(?, avatar),
        location = COALESCE(?, location)
    WHERE id = ?
  `).run(display_name, bio, specialty, avatar, location, user.id);

  const updated = db.prepare('SELECT * FROM cooks WHERE id = ?').get(user.id);
  res.json(updated);
});

usersRouter.patch('/password', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing passwords.' });

  const dbUser = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as any;
  if (!bcrypt.compareSync(oldPassword, dbUser.password_hash)) {
    return res.status(401).json({ error: 'Incorrect current password.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
  
  res.json({ success: true });
});
