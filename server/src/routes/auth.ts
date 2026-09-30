import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';
import { setCookie, deleteCookie } from 'hono/cookie';
import { authMiddleware } from '../middleware/auth';

export const authRoutes = new OpenAPIHono();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

authRoutes.openapi(createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: { 'application/json': { schema: LoginSchema } }
    }
  },
  responses: {
    200: { description: 'Logged in' },
    401: { description: 'Unauthorized' }
  }
}), async (c) => {
  const { email, password } = c.req.valid('json');
  
  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const isValid = await Bun.password.verify(password, user.passwordHash);
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
  };

  const token = await sign(payload, process.env.JWT_SECRET!);
  
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  return c.json({ 
    message: 'Logged in', 
    user: { id: user.id, name: user.name, role: user.role, email: user.email } 
  });
});

authRoutes.openapi(createRoute({
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: { 'application/json': { schema: RegisterSchema } }
    }
  },
  responses: {
    201: { description: 'Registered' },
    400: { description: 'Bad request' }
  }
}), async (c) => {
  const { email, password, name } = c.req.valid('json');

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (existing) {
    return c.json({ error: 'Email already exists' }, 400);
  }

  const passwordHash = await Bun.password.hash(password);

  const [user] = await db.insert(users).values({
    email,
    name,
    passwordHash,
    role: 'citizen'
  }).returning();

  return c.json({ message: 'Registered successfully', userId: user.id }, 201);
});

authRoutes.openapi(createRoute({
  method: 'post',
  path: '/logout',
  responses: {
    200: { description: 'Logged out' }
  }
}), (c) => {
  deleteCookie(c, 'auth_token', { path: '/' });
  return c.json({ message: 'Logged out' });
});

// Using standard Hono syntax for routes that need custom middleware
// as @hono/zod-openapi middleware typings can be tricky
authRoutes.get('/me', authMiddleware(), (c) => {
  const user = c.get('user');
  return c.json({ user });
});
