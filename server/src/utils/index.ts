import type { Server, ServerWebSocket } from "bun";
import { z, ZodType, ZodTypeAny } from "zod";
import { MessageSchemaType, WsData } from "../sockets/types";

/**
 * Validates a message against its schema and publishes it to a WebSocket topic using Bun's pub/sub.
 * Ensures data integrity before broadcasting.
 *
 * @param ws - The ServerWebSocket instance publishing the message (used for context like clientId).
 * @param server - The Bun server instance (required for ws.publish).
 * @param topic - The topic (channel) to publish to.
 * @param schema - The Zod schema to validate the payload against.
 * @param payload - The data payload for the message.
 * @param meta - Optional additional metadata (merged with default meta).
 * @returns True if the message was validated and published successfully, false otherwise.
 */
export function publish<Schema extends MessageSchemaType>(
  ws: ServerWebSocket<WsData>,
  server: Server, // Explicitly require the server instance
  topic: string,
  schema: Schema,
  payload: Schema["shape"] extends { payload: infer P }
    ? P extends ZodTypeAny
      ? z.infer<P>
      : unknown
    : unknown,
  meta: Partial<
    Omit<z.infer<Schema["shape"]["meta"]>, "clientId" | "timestamp">
  > = {}
): boolean {
  try {
    const messageType = schema.shape.type._def.value;

    // Construct the full message object
    const message = {
      type: messageType,
      meta: {
        clientId: ws.data.clientId, // Use clientId from ws connection data
        userId: ws.data.userId, // Include userId if available
        timestamp: Date.now(),
        ...meta,
      },
      // Conditionally include payload only if it's defined in the schema and provided
      ...(schema.shape.payload && payload !== undefined && { payload }),
    };

    // Validate the *entire* message object against the schema
    const validationResult = schema.safeParse(message);

    if (!validationResult.success) {
      console.error(
        `[WS PUBLISH] Validation failed for type "${messageType}" on topic "${topic}":`,
        validationResult.error.flatten() // Log flattened errors for clarity
      );
      return false;
    }

    // Publish the validated and stringified data
    const publishedBytes = server.publish(
      topic,
      JSON.stringify(validationResult.data)
    );
    // console.log(`[WS PUBLISH] Published ${publishedBytes} bytes to topic "${topic}" for type "${messageType}"`);
    return publishedBytes > 0;
  } catch (error) {
    console.error(
      `[WS PUBLISH] Error publishing message to topic "${topic}":`,
      error
    );
    return false;
  }
}

// Utility to safely parse incoming JSON messages
export function safeJsonParse(message: string | Buffer): {
  success: boolean;
  data?: any;
  error?: Error;
} {
  try {
    const data = JSON.parse(message.toString());
    // Basic check: Ensure it's an object with a 'type' property
    if (
      typeof data !== "object" ||
      data === null ||
      typeof data.type !== "string"
    ) {
      console.warn(
        `[WS] Received invalid message format (not object or no type):`,
        data
      );
      return { success: false, error: new Error("Invalid message format") };
    }
    return { success: true, data };
  } catch (error) {
    console.error("[WS] Failed to parse incoming JSON:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("JSON parsing failed"),
    };
  }
}
