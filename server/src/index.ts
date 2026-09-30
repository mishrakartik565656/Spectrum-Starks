import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';

// Routes (to be created)
import { authRoutes } from './routes/auth';
import { complaintRoutes } from './routes/complaints';
import { binRoutes } from './routes/bins';
import { wsHandler, websocket } from './ws';
import './cron';

const app = new OpenAPIHono();

app.use('*', logger());
app.use('*', cors({ origin: '*' }));

// API Docs
app.doc('/docs/openapi.json', {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'CleanCity API',
  },
});
app.get('/docs', swaggerUI({ url: '/docs/openapi.json' }));

// Health Check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Mount Routes
app.route('/api/auth', authRoutes);
app.route('/api/complaints', complaintRoutes);
app.route('/api/bins', binRoutes);
app.get('/ws', wsHandler);

// Serve Static Frontend
app.use('/*', serveStatic({ root: '../client' }));
app.use('/*', serveStatic({ path: '../client/index.html' }));

const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
  websocket,
};
