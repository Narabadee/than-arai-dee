import { Router, Request, Response } from 'express';
import { sql } from '../db.js';
import { getAuthUser } from '../auth.js';

export const dishesRouter = Router();

async function buildDish(row: any) {
  const ingredients = (await sql`SELECT ingredient_id FROM dish_ingredients WHERE dish_id = ${row.id}`).map((r: any) => r.ingredient_id);
  const steps = (await sql`SELECT title, description FROM dish_steps WHERE dish_id = ${row.id} ORDER BY sort_order`).map((s: any) => ({ t: s.title, d: s.description }));
  return { ...row, vegan: !!row.vegan, ingredients, steps };
}

dishesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await sql`SELECT * FROM dishes WHERE status != 'Hidden'`;
    const dishes = await Promise.all(rows.map(buildDish));
    res.json(dishes);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

dishesRouter.get('/types', async (_req: Request, res: Response) => {
  try {
    res.json(await sql`SELECT * FROM dish_types`);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dish types' });
  }
});

dishesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const [row] = await sql`SELECT * FROM dishes WHERE id = ${req.params.id}`;
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(await buildDish(row));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dish' });
  }
});

dishesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { en, th, tag, time, spicy, difficulty, kcal, desc, ingredients, steps, image, youtube } = req.body;
    if (!en || !desc || !ingredients) return res.status(400).json({ error: 'en, desc, and ingredients are required.' });

    const COLORS = ['#D64528','#E8823A','#E8B13A','#4A7A3E','#F4C13D','#B8D63D','#9B59B6'];
    const id = `admin-${Date.now()}`;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    await sql`
      INSERT INTO dishes (id, en, th, tag, time, spicy, difficulty, kcal, vegan, meal, "desc", rating, reviews, color, image, status, source, youtube)
      VALUES (${id}, ${en.trim()}, ${(th||en).trim()}, ${tag||'stirfry'}, ${time||20}, ${spicy||2}, ${difficulty||1}, ${kcal||400}, false, 'lunch', ${desc.trim()}, 4.5, 0, ${color}, ${image||null}, 'Stable', 'admin', ${youtube||null})
    `;

    const ing: string[] = Array.isArray(ingredients)
      ? ingredients
      : String(ingredients).split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
    for (const i of ing) {
      await sql`INSERT INTO dish_ingredients (dish_id, ingredient_id) VALUES (${id}, ${i}) ON CONFLICT DO NOTHING`;
    }

    if (steps && Array.isArray(steps)) {
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await sql`INSERT INTO dish_steps (dish_id, sort_order, title, description) VALUES (${id}, ${i}, ${s.t || s.title || 'Step'}, ${s.d || s.description || ''})`;
      }
    } else {
      await sql`INSERT INTO dish_steps (dish_id, sort_order, title, description) VALUES (${id}, 0, 'Cook', ${desc.trim()})`;
    }

    const [created] = await sql`SELECT * FROM dishes WHERE id = ${id}`;
    res.status(201).json(await buildDish(created));
  } catch (e) {
    res.status(500).json({ error: 'Failed to create dish' });
  }
});

dishesRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { status } = req.body as { status: string };
    await sql`UPDATE dishes SET status = ${status} WHERE id = ${req.params.id}`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

dishesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { en, th, tag, time, spicy, difficulty, kcal, desc, ingredients, steps, image, status, youtube } = req.body;

    await sql`
      UPDATE dishes
      SET en = ${en}, th = ${th}, tag = ${tag}, time = ${time}, spicy = ${spicy},
          difficulty = ${difficulty}, kcal = ${kcal}, "desc" = ${desc},
          image = ${image||null}, status = ${status||'Stable'}, youtube = ${youtube||null}
      WHERE id = ${req.params.id}
    `;

    if (ingredients) {
      await sql`DELETE FROM dish_ingredients WHERE dish_id = ${req.params.id}`;
      const ing: string[] = Array.isArray(ingredients)
        ? ingredients
        : String(ingredients).split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
      for (const i of ing) {
        await sql`INSERT INTO dish_ingredients (dish_id, ingredient_id) VALUES (${req.params.id}, ${i}) ON CONFLICT DO NOTHING`;
      }
    }

    if (steps && Array.isArray(steps)) {
      await sql`DELETE FROM dish_steps WHERE dish_id = ${req.params.id}`;
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await sql`INSERT INTO dish_steps (dish_id, sort_order, title, description) VALUES (${req.params.id}, ${i}, ${s.t || s.title || 'Step'}, ${s.d || s.description || ''})`;
      }
    }

    const [updated] = await sql`SELECT * FROM dishes WHERE id = ${req.params.id}`;
    res.json(await buildDish(updated));
  } catch (e) {
    res.status(500).json({ error: 'Failed to update dish' });
  }
});

dishesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const [dish] = await sql`SELECT source FROM dishes WHERE id = ${req.params.id}`;
    if (!dish) return res.status(404).json({ error: 'Not found' });
    if ((dish as any).source !== 'admin') return res.status(403).json({ error: 'Can only delete admin-added dishes.' });
    await sql`DELETE FROM dish_steps WHERE dish_id = ${req.params.id}`;
    await sql`DELETE FROM dish_ingredients WHERE dish_id = ${req.params.id}`;
    await sql`DELETE FROM dishes WHERE id = ${req.params.id}`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});
