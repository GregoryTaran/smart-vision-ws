const WS_URL = location.origin.replace(/^http/, "ws"); // автоматически
let ws, audioCtx, worklet, stream;
let buffer = [];
let total = 0;
const logEl = document.getElementById("log");

function log(msg) {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
  console.log(msg);
}

document.getElementById("start").onclick = async () => {
  try {
    ws = new WebSocket(WS_URL);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => log("✅ Connected to WebSocket server");
    ws.onmessage = (e) => log("📩 " + e.data);
    ws.onclose = () => log("❌ Disconnected");

    audioCtx = new AudioContext({ sampleRate: 44100 });
    await audioCtx.audioWorklet.addModule("recorder-worklet.js");

    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioCtx.createMediaStreamSource(stream);
    worklet = new AudioWorkletNode(audioCtx, "recorder-processor");
    source.connect(worklet);

    const CHUNK_SIZE = audioCtx.sampleRate * 1; // 1 секунда
    worklet.port.onmessage = (e) => {
      const chunk = e.data;
      buffer.push(chunk);
      total += chunk.length;
      if (total >= CHUNK_SIZE) {
        const full = new Float32Array(total);
        let offset = 0;
        for (const part of buffer) {
          full.set(part, offset);
          offset += part.length;
        }
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(full.buffer);
          log(`🎧 Sent ${full.byteLength} bytes`);
        }
        buffer = [];
        total = 0;
      }
    };

    log("🎙️ Recording started");
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = false;
  } catch (err) {
    log("❌ Error: " + err.message);
  }
};

document.getElementById("stop").onclick = () => {
  if (audioCtx) audioCtx.close();
  if (stream) stream.getTracks().forEach(t => t.stop());
  if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  log("⏹️ Stopped");
  document.getElementById("start").disabled = false;
  document.getElementById("stop").disabled = true;
};
