import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { createMiddleware } from 'hono/factory';

export const authMiddleware = (allowedRoles?: string[]) => createMiddleware(async (c, next) => {
  const token = getCookie(c, 'auth_token');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const payload = await verify(
      token,
      process.env.JWT_SECRET!,
      'HS256'
);
    c.set('user', payload);
    
    if (allowedRoles && !allowedRoles.includes(payload.role as string)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    await next();
  } catch (e) {
  console.error('JWT verification failed:', e);
  console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
  return c.json({ error: 'Invalid token' }, 401);
}
});
