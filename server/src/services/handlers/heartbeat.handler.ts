import { Ping, Pong } from '@/sockets/schema';
import { MessageHandlerContext } from '@/sockets/types';

// Handler for PING
export function handlePing(context: MessageHandlerContext<typeof Ping>) {
  const { ws, send } = context;
  const userId = ws.data.userId;

  if (!userId) {
    console.warn('[WS PING] Received PING without userId.');
    return;
  }
  console.log(`[WS] Received PING from user ${userId}`);
  send(Pong, {
    /* Ensure payload matches schema */
  });
}
