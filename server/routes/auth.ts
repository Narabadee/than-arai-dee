import { Router, Request, Response } from 'express';
import { db } from '../database.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export const authRouter = Router();

const AVATAR_COLORS = ['#D64528','#E8823A','#E8B13A','#4A7A3E','#F4C13D','#B8D63D','#E84A2A'];

authRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) return res.status(400).json({ error: 'Missing fields.' });

  const u = username.trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = ?').get(u) as any;
  if (!user) return res.status(401).json({ error: 'Username not found.' });
  if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Wrong password.' });
  if (user.banned) return res.status(403).json({ error: 'This account has been suspended.' });

  const token = randomUUID();
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?,?)').run(token, user.id);

  res.json({ token, user: { id: user.id, username: user.username, color: user.color, role: user.role } });
});

authRouter.post('/signup', (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) return res.status(400).json({ error: 'Missing fields.' });
  const u = username.trim();
  if (u.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters.' });

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?').get(u.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Username already taken.' });

  const hash = bcrypt.hashSync(password, 10);
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const id = u.toLowerCase();
  db.transaction(() => {
    db.prepare('INSERT INTO users (id,username,password_hash,color,role) VALUES (?,?,?,?,?)').run(id, u, hash, color, 'user');
    db.prepare('INSERT INTO cooks (id, username, display_name, avatar, color, bio, specialty) VALUES (?,?,?,?,?,?,?)')
      .run(id, `@${u}`, u, u[0].toUpperCase(), color, 'New to the Night Market! Just started my cooking journey.', 'Market Explorer');
  })();

  const token = randomUUID();
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?,?)').run(token, id);

  res.status(201).json({ token, user: { id, username: u, color, role: 'user' } });
});
