import express from "express";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 1) Раздаём статику из /public
app.use(express.static(path.join(__dirname, "public")));

// 2) Корень редиректим на /context.html (чтобы не было "Cannot GET /")
app.get("/", (_req, res) => {
  res.redirect("/context.html");
});

// 3) Health-проверка (удобно смотреть сразу в браузере)
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

// 4) HTTP → WS апгрейд с путём /ws
const server = app.listen(PORT, () => {
  console.log(`🚀 Context test server on port ${PORT}`);
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  // принимаем апгрейд только на /ws
  if (new URL(req.url, `http://${req.headers.host}`).pathname !== "/ws") {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

// 5) Эхо-сервер: отвечает сколько байт получил
wss.on("connection", (ws) => {
  console.log("🟢 WS client connected");
  ws.on("message", (data) => {
    const bytes = data?.byteLength ?? data?.length ?? 0;
    console.log(`📦 Received ${bytes} bytes`);
    ws.send(`✅ Server received ${bytes} bytes`);
  });
  ws.on("close", () => console.log("🔴 WS closed"));
});
