import { Router, Request, Response } from 'express';
import { sql } from '../db.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export const authRouter = Router();

const AVATAR_COLORS = ['#D64528','#E8823A','#E8B13A','#4A7A3E','#F4C13D','#B8D63D','#E84A2A'];

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) return res.status(400).json({ error: 'Missing fields.' });

    const u = username.trim().toLowerCase();
    const [user] = await sql`SELECT * FROM users WHERE LOWER(username) = ${u}`;
    if (!user) return res.status(401).json({ error: 'Username not found.' });
    if (!bcrypt.compareSync(password, (user as any).password_hash)) return res.status(401).json({ error: 'Wrong password.' });
    if ((user as any).banned) return res.status(403).json({ error: 'This account has been suspended.' });

    const token = randomUUID();
    await sql`INSERT INTO sessions (token, user_id) VALUES (${token}, ${(user as any).id})`;

    res.json({ token, user: { id: (user as any).id, username: (user as any).username, color: (user as any).color, role: (user as any).role } });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) return res.status(400).json({ error: 'Missing fields.' });
    const u = username.trim();
    if (u.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters.' });

    const [existing] = await sql`SELECT id FROM users WHERE LOWER(username) = ${u.toLowerCase()}`;
    if (existing) return res.status(409).json({ error: 'Username already taken.' });

    const hash = bcrypt.hashSync(password, 10);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const id = u.toLowerCase();

    await sql`INSERT INTO users (id, username, password_hash, color, role) VALUES (${id}, ${u}, ${hash}, ${color}, 'user')`;
    await sql`
      INSERT INTO cooks (id, username, display_name, avatar, color, bio, specialty)
      VALUES (${id}, ${`@${u}`}, ${u}, ${u[0].toUpperCase()}, ${color}, 'New to the Night Market! Just started my cooking journey.', 'Market Explorer')
    `;

    const token = randomUUID();
    await sql`INSERT INTO sessions (token, user_id) VALUES (${token}, ${id})`;

    res.status(201).json({ token, user: { id, username: u, color, role: 'user' } });
  } catch (e: any) {
    if (e?.code === '23505') return res.status(409).json({ error: 'Username already taken.' });
    res.status(500).json({ error: 'Signup failed' });
  }
});
