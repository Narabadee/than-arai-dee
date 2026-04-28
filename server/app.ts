import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { dishesRouter } from './routes/dishes.js';
import { ingredientsRouter } from './routes/ingredients.js';
import { postsRouter } from './routes/posts.js';
import { reviewsRouter } from './routes/reviews.js';
import { usersRouter } from './routes/users.js';
import { savedRouter } from './routes/saved.js';
import { fridgeRouter } from './routes/fridge.js';

export const app = express();

app.use(cors({
  origin: (origin, cb) => cb(null, true), // same-domain on Vercel; open for local dev
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/dishes', dishesRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/saved', savedRouter);
app.use('/api/fridge', fridgeRouter);
