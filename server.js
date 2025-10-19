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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("🎧 Smart Vision WS + Whisper v1.0 stable");
});

wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  let audioChunks = [];
  let lastProcessed = Date.now();

  ws.on("message", async (data) => {
    try {
      // получаем аудио-фрагменты
      if (data instanceof Buffer) {
        audioChunks.push(data);

        // каждые 5 секунд отправляем в Whisper
        if (Date.now() - lastProcessed > 5000) {
          const merged = Buffer.concat(audioChunks);

          // игнорируем слишком маленькие куски
          if (merged.length < 5000) {
            console.log("⚠️ Too small chunk, skipping...");
            audioChunks = [];
            lastProcessed = Date.now();
            return;
          }

          const tempPath = path.join(__dirname, "temp.webm");
          fs.writeFileSync(tempPath, merged);

          ws.send("🌀 Processing speech...");
          console.log(`🎧 Processing ${merged.length} bytes`);

          try {
            const transcript = await openai.audio.transcriptions.create({
              file: fs.createReadStream(tempPath),
              model: "whisper-1",
              response_format: "text",
            });

            ws.send("📝 " + transcript);
            console.log("🗣️ Whisper:", transcript);
          } catch (whisperErr) {
            console.error("❌ Whisper error:", whisperErr.message);
            ws.send("❌ Whisper error: " + whisperErr.message);
          }

          fs.unlinkSync(tempPath);
          audioChunks = [];
          lastProcessed = Date.now();
        }
      } else {
        const text = data.toString();
        ws.send(`Echo: ${text}`);
      }
    } catch (err) {
      console.error("❌ General error:", err);
      ws.send("❌ Error processing audio");
    }
  });

  // финальная обработка при закрытии соединения
  ws.on("close", async () => {
    console.log("❌ Client disconnected");
    if (audioChunks.length > 0) {
      const merged = Buffer.concat(audioChunks);
      if (merged.length > 5000) {
        const tempPath = path.join(__dirname, "final.webm");
        fs.writeFileSync(tempPath, merged);
        try {
          const transcript = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: "whisper-1",
            response_format: "text",
          });
          console.log("🗣️ Final:", transcript);
        } catch (err) {
          console.error("❌ Final whisper error:", err.message);
        }
        fs.unlinkSync(tempPath);
      }
    }
    audioChunks = [];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Smart Vision WS + Whisper v1.0 running on port ${PORT}`)
);
