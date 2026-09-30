import { OpenAPIHono } from '@hono/zod-openapi';
import { db } from '../db';
import { bins } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

export const binRoutes = new OpenAPIHono();

binRoutes.use('/*', authMiddleware());

binRoutes.get('/', async (c) => {
  const allBins = await db.select().from(bins);
  return c.json({ bins: allBins });
});

binRoutes.post('/', authMiddleware(['admin', 'supervisor']), async (c) => {
  const body = await c.req.json();
  const [bin] = await db.insert(bins).values({
    type: body.type,
    capacityLiters: body.capacityLiters,
    location: `POINT(${body.location.lng} ${body.location.lat})`,
    areaId: body.areaId,
  }).returning();

  return c.json({ message: 'Bin created', binId: bin.id }, 201);
});
