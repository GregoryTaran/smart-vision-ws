import express from "express";
import { WebSocketServer } from "ws";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 10000;
const wss = new WebSocketServer({ noServer: true });

function floatToWav(float32Array, sampleRate = 44100) {
  const buffer = Buffer.alloc(44 + float32Array.length * 2);
  const view = new DataView(buffer.buffer);
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + float32Array.length * 2, true);
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, float32Array.length * 2, true);
  let offset = 44;
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

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
    const f32 = new Float32Array(data);
    const wav = floatToWav(f32, ws.sampleRate);
    const file = `chunk_${counter++}.wav`;
    fs.writeFileSync(file, wav);
    console.log(`💾 Saved ${file} (${wav.length} bytes @ ${ws.sampleRate}Hz)`);
    ws.send(`💾 Saved ${file}`);
  });

  ws.on("close", () => console.log("🔴 WS closed"));
});

app.use(express.static("."));

const server = app.listen(PORT, () => {
  console.log(`🚀 Context WS server running on port ${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});