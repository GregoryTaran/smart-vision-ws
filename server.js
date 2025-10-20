import express from "express";
import { WebSocketServer } from "ws";
import { spawn } from "child_process";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 📂 Раздаём файлы из public (context.html, context.js и т.д.)
app.use(express.static(path.join(__dirname, "public")));

// 🧠 Whisper API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🚀 WebSocket сервер
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  console.log("🟢 Client connected via WS");

  ws.on("message", async (data) => {
    // если пришёл бинарный буфер
    if (typeof data !== "string") {
      const bytes = data.byteLength || data.length;
      console.log(`🎧 Received chunk: ${bytes} bytes`);
      ws.send(`✅ Server received ${bytes} bytes`);

      // ⚙️ можно выключить Whisper на время теста
      return;
    }

    // если строка — обработаем как обычный текст
    ws.send("📩 Got text message: " + data);
  });

  ws.on("close", () => console.log("🔴 WS closed"));
});

// 🚪 HTTP → WebSocket
const server = app.listen(PORT, () => {
  console.log(`🚀 Context test server running on port ${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
