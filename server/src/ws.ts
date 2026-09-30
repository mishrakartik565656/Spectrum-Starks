import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';

const { upgradeWebSocket, websocket } = createBunWebSocket();

const clients = new Set<ServerWebSocket<any>>();

export const wsHandler = upgradeWebSocket((c) => {
  return {
    onOpen(evt, ws) {
      const bunWs = ws.raw as unknown as ServerWebSocket<any>;
      clients.add(bunWs);
    },
    onMessage(evt, ws) {
      // In a real app we'd parse and handle messages here
      // e.g., worker location updates
    },
    onClose(evt, ws) {
      const bunWs = ws.raw as unknown as ServerWebSocket<any>;
      clients.delete(bunWs);
    },
  };
});

export const broadcast = (message: any) => {
  const data = JSON.stringify(message);
  for (const client of clients) {
    client.send(data);
  }
};

export { websocket };
