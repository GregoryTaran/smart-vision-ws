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

  ws.on("message", (data) => {
    // Проверяем, бинарные ли данные (аудио)
    if (data instanceof Buffer) {
      const size = data.length;
      console.log(`🎧 Received audio chunk (${size} bytes)`);
      ws.send(`✅ Received ${size} bytes`);
    } else {
      const text = data.toString();
      console.log(`💬 Text: ${text}`);
      ws.send(`Echo: ${text}`);
    }
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Smart Vision WS server running on port ${PORT}`)
);
