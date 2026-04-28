import { Router } from 'express';
import { sql } from '../db.js';

export const ingredientsRouter = Router();

ingredientsRouter.get('/', async (_req, res) => {
  try {
    res.json(await sql`SELECT * FROM ingredients`);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});
