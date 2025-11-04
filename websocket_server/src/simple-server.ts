#!/usr/bin/env node

/**
 * Simple WebSocket server for Yjs collaboration
 * Much simpler than Hocuspocus - just handles Yjs sync
 */

import * as http from "http";
import * as WebSocket from "ws";
import * as Y from "yjs";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";

const PORT = process.env.WS_PORT || 4000;
const HOST = process.env.WS_HOST || "localhost";

// Message types
const messageSync = 0;
const messageAwareness = 1;

// Store all active documents in memory
const docs = new Map<string, WSSharedDoc>();

// Simple shared document class
class WSSharedDoc extends Y.Doc {
  name: string;
  connections: Map<any, Set<number>>;
  awareness: awarenessProtocol.Awareness;

  constructor(name: string) {
    super();
    this.name = name;
    this.connections = new Map();
    this.awareness = new awarenessProtocol.Awareness(this);

    console.log(`📄 [Doc Created] ${name}`);
  }

  addConnection(conn: any) {
    this.connections.set(conn, new Set());
    console.log(
      `✅ [Connection Added] Doc: ${this.name}, Total: ${this.connections.size}`
    );
  }

  removeConnection(conn: any) {
    const controlledIds = this.connections.get(conn);
    this.connections.delete(conn);

    if (controlledIds) {
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        Array.from(controlledIds),
        null
      );
    }

    console.log(
      `❌ [Connection Removed] Doc: ${this.name}, Remaining: ${this.connections.size}`
    );

    // Clean up document if no more connections
    if (this.connections.size === 0) {
      console.log(`🗑️  [Doc Cleanup] ${this.name} - no more connections`);
      this.awareness.destroy();
      docs.delete(this.name);
    }
  }
}

// Get or create a document
function getDoc(docName: string): WSSharedDoc {
  let doc = docs.get(docName);
  if (!doc) {
    doc = new WSSharedDoc(docName);
    docs.set(docName, doc);
  }
  return doc;
}

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Yjs WebSocket Server\n");
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on("connection", (conn, req) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const docName =
    url.searchParams.get("room") || url.pathname.slice(1) || "default";

  console.log(`\n🔌 [New Connection]`);
  console.log(`   Document: ${docName}`);
  console.log(`   Client: ${req.socket.remoteAddress}`);

  const doc = getDoc(docName);
  doc.addConnection(conn);

  // Send sync step 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  conn.send(encoding.toUint8Array(encoder));

  // Send awareness states
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    conn.send(encoding.toUint8Array(awarenessEncoder));
  }

  // Handle messages
  conn.on("message", (message: Buffer) => {
    try {
      const uint8Array = new Uint8Array(message);
      const decoder = decoding.createDecoder(uint8Array);
      const messageType = decoding.readVarUint(decoder);
      const encoder = encoding.createEncoder();

      switch (messageType) {
        case messageSync:
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, doc, null);

          // Broadcast to all connections
          if (encoding.length(encoder) > 1) {
            const response = encoding.toUint8Array(encoder);
            doc.connections.forEach((_, c) => {
              if (c.readyState === WebSocket.OPEN) {
                c.send(response);
              }
            });
          }
          break;

        case messageAwareness:
          awarenessProtocol.applyAwarenessUpdate(
            doc.awareness,
            decoding.readVarUint8Array(decoder),
            conn
          );
          break;
      }
    } catch (err) {
      console.error("❌ [Message Error]", err);
    }
  });

  // Handle updates
  const updateHandler = (update: Uint8Array, origin: any) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);

    doc.connections.forEach((_, c) => {
      if (c !== origin && c.readyState === WebSocket.OPEN) {
        c.send(message);
      }
    });
  };
  doc.on("update", updateHandler);

  // Handle awareness updates
  const awarenessChangeHandler = (
    { added, updated, removed }: any,
    origin: any
  ) => {
    const changedClients = added.concat(updated, removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(doc.awareness, changedClients)
    );
    const message = encoding.toUint8Array(encoder);

    doc.connections.forEach((_, c) => {
      if (c !== origin && c.readyState === WebSocket.OPEN) {
        c.send(message);
      }
    });
  };
  doc.awareness.on("update", awarenessChangeHandler);

  // Handle disconnect
  conn.on("close", () => {
    doc.off("update", updateHandler);
    doc.awareness.off("update", awarenessChangeHandler);
    doc.removeConnection(conn);
    console.log(`🔌 [Disconnected] Doc: ${docName}`);
  });

  conn.on("error", (err) => {
    console.error(`❌ [Connection Error] Doc: ${docName}`, err.message);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Simple Yjs WebSocket Server`);
  console.log(`   URL: ws://${HOST}:${PORT}`);
  console.log(`   Ready for connections!\n`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...");
  wss.close(() => {
    server.close(() => {
      console.log("✅ Server stopped");
      process.exit(0);
    });
  });
});
