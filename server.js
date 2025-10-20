import fs from "fs";
import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const server = app.listen(3000, () => console.log("🚀 Server started"));
const wss = new WebSocketServer({ server });

app.use(express.static(".")); // раздаём все файлы из текущей папки

// 🎙️ Каждое подключение — новая сессия
let sessionCounter = 1;

wss.on("connection", (ws) => {
  ws.sessionId = `sess-${sessionCounter++}`;
  ws.chunkCounter = 0;
  console.log(`🎧 New connection: ${ws.sessionId}`);

  ws.on("message", (msg) => {
    // получаем Float32 аудиоданные
    if (msg instanceof Buffer) {
      const f32 = new Float32Array(msg.buffer, msg.byteOffset, msg.byteLength / 4);
      const wav = floatToWav(f32, ws.sampleRate || 44100);
      const filename = `${ws.sessionId}_chunk_${ws.chunkCounter++}.wav`;
      fs.writeFileSync(filename, wav);
      ws.send(`💾 Saved ${filename}`);
    } else {
      // метаданные
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === "meta") ws.sampleRate = data.sampleRate;
      } catch {}
    }
  });

  ws.on("close", () => console.log(`❌ Closed: ${ws.sessionId}`));
});

// 📦 merge для конкретной сессии
app.get("/merge", (req, res) => {
  try {
    const session = req.query.session;
    if (!session) return res.status(400).send("No session provided");

    const files = fs.readdirSync(".").filter(f => f.startsWith(session + "_chunk_"));
    if (!files.length) return res.status(404).send("No files for this session");

    const first = fs.readFileSync(files[0]);
    const sampleRate = first.readUInt32LE(24);
    const headerSize = 44;
    const pcms = files.map(f => fs.readFileSync(f).subarray(headerSize));
    const totalPCM = Buffer.concat(pcms);

    const byteLen = totalPCM.length;
    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + byteLen, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write("data", 36);
    header.writeUInt32LE(byteLen, 40);

    const merged = Buffer.concat([header, totalPCM]);
    const mergedFile = `${session}_merged.wav`;
    fs.writeFileSync(mergedFile, merged);
    res.download(mergedFile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Merge error");
  }
});

// --- функция создания WAV ---
function floatToWav(float32Array, sampleRate = 44100) {
  const buffer = Buffer.alloc(44 + float32Array.length * 2);
  const view = new DataView(buffer.buffer);
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + float32Array.length * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
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
