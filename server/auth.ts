import { Request } from 'express';
import { sql } from './db.js';

export interface SessionUser {
  id: string;
  username: string;
  color: string;
  role: string;
  banned: boolean;
}

export async function getAuthUser(req: Request): Promise<SessionUser | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [session] = await sql<{ user_id: string }[]>`SELECT user_id FROM sessions WHERE token = ${token}`;
  if (!session) return null;
  const [user] = await sql<SessionUser[]>`SELECT * FROM users WHERE id = ${session.user_id}`;
  return user ?? null;
}
