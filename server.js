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

// 📂 теперь сервер видит папку public (context.html, context.js и т.д.)
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
    if (typeof data === "string") return;

    try {
      console.log("🎧 Received chunk:", data.length, "bytes");
      ws.send("🌀 Processing speech...");

      // 1️⃣ Конвертируем WebM → WAV
      const wavBuffer = await convertWebmToWav(data);

      // 2️⃣ Распознаем через Whisper
      const result = await openai.audio.transcriptions.create({
        file: new File([wavBuffer], "chunk.wav", { type: "audio/wav" }),
        model: "whisper-1",
      });

      ws.send("📝 " + result.text.trim());
    } catch (err) {
      console.error("❌ Whisper error:", err.message);
      ws.send("❌ Whisper error: " + err.message);
    }
  });

  ws.on("close", () => console.log("🔴 WS closed"));
});

// 🧩 Конвертация WebM → WAV
async function convertWebmToWav(webmBuffer) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-loglevel", "error",
      "-i", "pipe:0",
      "-ar", "16000",
      "-ac", "1",
      "-f", "wav",
      "pipe:1",
    ]);

    const output = [];
    ffmpeg.stdout.on("data", (chunk) => output.push(chunk));
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve(Buffer.concat(output));
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
    ffmpeg.on("error", reject);
    ffmpeg.stdin.end(webmBuffer);
  });
}

// 🚪 HTTP → WebSocket
const server = app.listen(PORT, () => {
  console.log(`🚀 Smart Vision WS + Whisper + Static running on ${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
