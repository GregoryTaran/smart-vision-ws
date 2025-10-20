import express from "express";
import { WebSocketServer } from "ws";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 10000;
const wss = new WebSocketServer({ noServer: true });

// 🎧 Конвертация Float32Array → WAV (PCM16)
function floatToWav(float32Array, sampleRate = 44100) {
  const buffer = Buffer.alloc(44 + float32Array.length * 2);
  const view = new DataView(buffer.buffer);
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + float32Array.length * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, float32Array.length * 2, true);

  let offset = 44;
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

// 🎙️ WebSocket соединение
wss.on("connection", (ws) => {
  console.log("🟢 Client connected");
  ws.sampleRate = 44100;
  let counter = 0;

  ws.on("message", (data) => {
    if (typeof data === "string") {
      try {
        const json = JSON.parse(data);
        if (json.type === "meta" && json.sampleRate) {
          ws.sampleRate = json.sampleRate;
          console.log(`🎛 sampleRate from client: ${ws.sampleRate} Hz`);
          ws.send(`🎛 SampleRate confirmed: ${ws.sampleRate} Hz`);
          return;
        }
      } catch {}
    }

    // 🧠 Конвертируем в WAV
    const f32 = new Float32Array(data);
    const wav = floatToWav(f32, ws.sampleRate);
    const file = `chunk_${counter++}.wav`;
    fs.writeFileSync(file, wav);

    // 🌐 Формируем ссылку для скачивания
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const fileUrl = `${baseUrl.replace(/\/$/, "")}/${file}`;

    console.log(`💾 Saved ${file} (${wav.length} bytes @ ${ws.sampleRate}Hz)`);
    ws.send(`💾 Saved ${file} — ${fileUrl}`);
  });

  ws.on("close", () => console.log("🔴 WS closed"));
});

// 🚀 Express раздаёт файлы из текущей директории
app.use(express.static("."));

// 🧩 HTTP → WebSocket upgrade
const server = app.listen(PORT, () => {
  console.log(`🚀 Context WS server running on port ${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
