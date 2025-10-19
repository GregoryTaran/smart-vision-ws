import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.get("/", (req, res) => {
  res.send("🎧 Smart Vision WS ready!");
});

wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  ws.on("message", (message) => {
    console.log("📩 Received:", message.toString());
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Smart Vision WS server running on port ${PORT}`));
