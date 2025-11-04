import { Server } from "@hocuspocus/server";
import { Logger } from "@hocuspocus/extension-logger";
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { AuthExtension } from "./extensions/auth-extension";
import { DatabaseExtension } from "./extensions/database-extension";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

/**
 * GrantWare AI Real-time Collaboration WebSocket Server
 *
 * Uses Hocuspocus (built on Yjs) to provide conflict-free real-time
 * document editing for all organization members.
 *
 * Features:
 * - User authentication via Supabase
 * - Organization-scoped document access control
 * - Periodic auto-save to PostgreSQL
 * - User presence and cursor positions
 * - Conflict-free collaborative editing
 */

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     GrantWare AI - Real-time Collaboration Server        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

console.log(`🚀 Starting WebSocket server on port ${PORT}...`);

// Initialize Hocuspocus server with extensions
const hocuspocusServer = Server.configure({
  name: "grantware-collaboration",
  timeout: 30000,
  debounce: 5000,
  maxDebounce: 30000,
  quiet: false,

  extensions: [
    // Authentication extension - verifies JWT and document access
    new AuthExtension(),

    // Database extension - loads/saves documents from PostgreSQL
    new DatabaseExtension(),

    // Logger extension - detailed logging
    new Logger({
      log: (message) => {
        // Log all messages - Hocuspocus Logger only accepts 'log' property
        console.log(`📝 [Hocuspocus] ${message}`);
      },
    }),
  ],

  async onConnect(data) {
    const { documentName, requestParameters, requestHeaders } = data;
    const userContext = data.context?.user;

    console.log(
      `
🔌 [Connect] New connection
   Document: "${documentName}"
   User: ${userContext?.name || "Anonymous"} (${
        userContext?.email || "No Auth"
      })
   Organization: ${data.context?.organizationId || "Unknown"}
   Status: ✅ Authenticated
    `
    );
  },

  async onDisconnect(data) {
    const { documentName } = data;
    const userContext = data.context?.user;

    console.log(`
🔌 [Disconnect] Connection closed
   Document: ${documentName}
   User: ${userContext?.name || "Unknown"}
    `);
  },
});

// Create Express app for the HTTP server
const app = express();

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "grantware-websocket-server",
  });
});

// Status endpoint with connection info
app.get("/status", (req, res) => {
  res.json({
    status: "running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    documents: hocuspocusServer.documents.size,
    connections: Array.from(hocuspocusServer.documents.values()).reduce(
      (total, doc) => total + doc.getConnectionsCount(),
      0
    ),
  });
});

// Create HTTP server
const httpServer = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Attach Hocuspocus server to handle WebSocket upgrade requests
httpServer.on("upgrade", (request, socket, head) => {
  console.log(
    `🔄 [Upgrade] WebSocket upgrade request from ${request.socket.remoteAddress}`
  );

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
    hocuspocusServer.handleConnection(ws, request);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`
✅ WebSocket server is running!

   HTTP:      http://localhost:${PORT}
   WebSocket: ws://localhost:${PORT}
   Health:    http://localhost:${PORT}/health
   Status:    http://localhost:${PORT}/status

🎯 Ready to accept real-time collaboration connections
  `);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");

  await hocuspocusServer.destroy();
  httpServer.close(() => {
    console.log("✅ Server shut down complete");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");

  await hocuspocusServer.destroy();
  httpServer.close(() => {
    console.log("✅ Server shut down complete");
    process.exit(0);
  });
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
