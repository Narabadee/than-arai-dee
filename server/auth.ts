import { Request } from 'express';
import { db } from './database.js';

export interface SessionUser {
  id: string;
  username: string;
  color: string;
  role: string;
  banned: number;
}

export function getAuthUser(req: Request): SessionUser | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as { user_id: string } | undefined;
  if (!session) return null;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as SessionUser | null;
}
