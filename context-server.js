import express from "express";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

// 📂 Статика (отдаём context.html и JS)
app.use(express.static(path.join(__dirname, "public")));

// 🚀 WebSocket сервер
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  console.log("🟢 Context client connected");

  ws.on("message", (data) => {
    console.log(`📦 Received ${data.byteLength} bytes`);
    ws.send(`✅ received ${data.byteLength} bytes`);
  });

  ws.on("close", () => console.log("🔴 Context WS closed"));
});

// 🚪 HTTP → WS
const server = app.listen(PORT, () => {
  console.log(`🚀 Context server running on http://localhost:${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
