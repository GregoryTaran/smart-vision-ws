import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("🎧 Smart Vision WS + Whisper v1.2 (whisper-safe+)");
});

wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  let audioChunks = [];
  let lastProcessed = Date.now();

  ws.on("message", async (data) => {
    try {
      if (data instanceof Buffer) {
        audioChunks.push(data);

        // каждые 5 секунд отправляем буфер в Whisper
        if (Date.now() - lastProcessed > 5000) {
          const merged = Buffer.concat(audioChunks);

          if (merged.length < 8000) {
            console.log("⚠️ Too small chunk, skipping...");
            audioChunks = [];
            lastProcessed = Date.now();
            return;
          }

          const tempWebm = path.join(__dirname, "temp.webm");
          const tempWav = path.join(__dirname, "temp.wav");
          fs.writeFileSync(tempWebm, merged);

          ws.send("🌀 Processing speech...");
          console.log(`🎧 Processing ${merged.length} bytes`);

          // ждём 200 мс, чтобы файл дописался полностью
          await new Promise((r) => setTimeout(r, 200));

          // проверяем целостность
          const stats = fs.statSync(tempWebm);
          if (!stats.size || stats.size < 10000) {
            console.log("⚠️ Skipping incomplete WebM chunk");
            [tempWebm].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));
            audioChunks = [];
            lastProcessed = Date.now();
            return;
          }

          try {
            // 🔁 конвертация webm → wav
            await new Promise((resolve, reject) => {
              ffmpeg(tempWebm)
                .noVideo()
                .audioCodec("pcm_s16le")
                .audioChannels(1)
                .audioFrequency(16000)
                .on("end", resolve)
                .on("error", reject)
                .save(tempWav);
            });

            // 🎙️ Распознавание через Whisper
            const transcript = await openai.audio.transcriptions.create({
              file: fs.createReadStream(tempWav),
              model: "whisper-1",
              response_format: "text",
            });

            ws.send("📝 " + transcript);
            console.log("🗣️ Whisper:", transcript);
          } catch (whisperErr) {
            console.error("❌ Whisper error:", whisperErr.message);
            ws.send("❌ Whisper error: " + whisperErr.message);
          }

          // 🧹 Очистка временных файлов
          [tempWebm, tempWav].forEach(
            (f) => fs.existsSync(f) && fs.unlinkSync(f)
          );

          audioChunks = [];
          lastProcessed = Date.now();
        }
      } else {
        ws.send("Echo: " + data.toString());
      }
    } catch (err) {
      console.error("❌ General error:", err);
      ws.send("❌ Error processing audio");
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    audioChunks = [];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Smart Vision WS + Whisper v1.2 running on port ${PORT}`)
);
