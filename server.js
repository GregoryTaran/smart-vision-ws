import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// подключаем Whisper
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // добавишь ключ в Render → Environment
});

app.get("/", (req, res) => {
  res.send("🎧 Smart Vision WS + Whisper ready!");
});

wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  ws.on("message", async (data) => {
    try {
      // если аудио
      if (data instanceof Buffer) {
        const tempPath = path.join(__dirname, "temp.webm");
        fs.writeFileSync(tempPath, data);

        // Отправляем в Whisper
        const transcript = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempPath),
          model: "whisper-1",
          response_format: "text",
        });

        console.log("🗣️ Whisper:", transcript);
        ws.send(`📝 ${transcript}`);
        fs.unlinkSync(tempPath);
      } else {
        const text = data.toString();
        ws.send(`Echo: ${text}`);
      }
    } catch (err) {
      console.error("❌ Whisper error:", err);
      ws.send("❌ Error processing audio");
    }
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Smart Vision WS + Whisper running on port ${PORT}`)
);
