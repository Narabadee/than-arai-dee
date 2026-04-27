import { Router } from 'express';
import { db } from '../database.js';

export const ingredientsRouter = Router();

ingredientsRouter.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM ingredients').all());
});
