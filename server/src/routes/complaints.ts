import { OpenAPIHono } from '@hono/zod-openapi';
import { db } from '../db';
import { complaints } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { broadcast } from '../ws';
import Anthropic from '@anthropic-ai/sdk';

export const complaintRoutes = new OpenAPIHono();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

complaintRoutes.use('/*', authMiddleware());

// Create Complaint
complaintRoutes.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  const [complaint] = await db.insert(complaints).values({
    userId: user.id,
    category: body.category,
    description: body.description,
    severity: body.severity || 'medium',
    status: 'submitted',
    location: body.location ? `POINT(${body.location.lng} ${body.location.lat})` : null,
    address: body.address,
    photoUrl: body.photoUrl,
  }).returning();

  broadcast({ type: 'new_complaint', complaint });

  return c.json({ message: 'Complaint created', complaintId: complaint.id }, 201);
});

// List Complaints
complaintRoutes.get('/', async (c) => {
  const user = c.get('user');
  
  let userComplaints;
  if (user.role === 'citizen') {
    userComplaints = await db.select().from(complaints).where(eq(complaints.userId, user.id)).orderBy(desc(complaints.createdAt));
  } else if (user.role === 'worker') {
    userComplaints = await db.select().from(complaints).where(eq(complaints.assignedWorkerId, user.id)).orderBy(desc(complaints.createdAt));
  } else {
    userComplaints = await db.select().from(complaints).orderBy(desc(complaints.createdAt));
  }
  
  return c.json({ complaints: userComplaints });
});

// Suggest Category via Claude
complaintRoutes.post('/suggest-category', async (c) => {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_key') {
    return c.json({ category: 'Other', reason: 'AI disabled (no API key)', confidence: 0 });
  }

  try {
    const body = await c.req.parseBody();
    const imageFile = body['image'] as File;
    
    if (!imageFile) {
      return c.json({ error: 'Image is required' }, 400);
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const msg = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      max_tokens: 150,
      system: `You are an expert in waste classification. Given an image, classify it into exactly one of these categories: 
      Wet / Organic, Dry, Recyclable, E-waste, Hazardous, Construction debris, Mixed / Unsorted, Overflowing bin, Illegal dumping, Other.
      Respond in JSON format: {"category": "category_name", "confidence": 0.0-1.0, "reason": "short reason"}`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageFile.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64Image,
              }
            },
            { type: 'text', text: 'Classify this waste.' }
          ]
        }
      ]
    });

    const contentText = 'text' in msg.content[0] ? msg.content[0].text : '{}';
    const result = JSON.parse(contentText);
    return c.json(result);
  } catch (err: any) {
    console.error('Claude API Error:', err);
    return c.json({ category: 'Other', reason: 'AI suggestion failed', confidence: 0 });
  }
});

// Update Status
complaintRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const body = await c.req.json();

  if (user.role === 'citizen') {
    if (body.rating) {
      await db.update(complaints).set({ rating: body.rating }).where(and(eq(complaints.id, id), eq(complaints.userId, user.id)));
      return c.json({ message: 'Rated' });
    }
    return c.json({ error: 'Forbidden' }, 403);
  }

  const updateData: any = { status: body.status };
  if (body.status === 'resolved') {
    updateData.resolvedAt = new Date();
    if (body.resolutionPhotoUrl) {
      updateData.resolutionPhotoUrl = body.resolutionPhotoUrl;
    }
  }

  await db.update(complaints).set(updateData).where(eq(complaints.id, id));
  
  return c.json({ message: 'Updated' });
});
