import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { PrismaClient } from '@cashflow/database';
import { User } from '@cashflow/types'; // Example import

const app = new Hono();
const prisma = new PrismaClient();

app.use('*', logger());

app.get('/', (c) => {
  return c.text('Hello from Bun, Hono, and Prisma!');
});

app.get('/users', async (c) => {
  try {
    const users: User[] = await prisma.user.findMany(); // Type will come from @cashflow/types via database package re-export
    return c.json(users);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// WebSocket example (very basic)
app.get('/ws', (c) => {
  if (c.req.header('upgrade') !== 'websocket') {
    return c.text('Expected websocket', 400);
  }
  const { response, socket } = Deno.upgradeWebSocket(c.req.raw); // Bun uses Deno's WebSocket API

  socket.onopen = () => {
    socket.send('Hello from server WebSocket!');
  };
  socket.onmessage = (event) => {
    socket.send(`Echo: ${event.data}`);
  };
  socket.onclose = () => {};
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return response;
});

const port = parseInt(process.env.PORT || '3000');

export default {
  port,
  fetch: app.fetch,
  websocket: {
    // Required for Bun to handle WebSockets correctly with Hono
    message(ws, message) {},
    open(ws) {},
    close(ws, code, message) {},
    error(ws, error) {},
  },
};
