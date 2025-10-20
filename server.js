import express from "express";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname));
app.get("/", (_req, res) => res.redirect("/context.html"));
app.get("/health", (_req, res) => res.send("OK"));

const server = app.listen(PORT, () => console.log(`🚀 Context server running on port ${PORT}`));

const wss = new WebSocketServer({ noServer: true });
server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws) => {
  console.log("🟢 WS client connected");
  ws.on("message", (data) => {
    const bytes = data?.byteLength ?? data?.length ?? 0;
    console.log(`📦 Received ${bytes} bytes`);
    ws.send(`✅ Server received ${bytes} bytes`);
  });
  ws.on("close", () => console.log("🔴 WS closed"));
});