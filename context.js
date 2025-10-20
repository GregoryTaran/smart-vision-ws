const WS_URL = `${location.origin.replace(/^http/, "ws")}/ws`;
let ws, audioCtx, worklet, stream;
let buffer = [];
let total = 0;
let lastSend = 0;
let sampleRate = 44100;
let sessionId = null; // 🔐 добавлено
const logEl = document.getElementById("log");

// 🔗 Лог с кликабельными ссылками
function log(msg) {
  const linked = msg.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
  const line = document.createElement("div");
  line.innerHTML = linked;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
  console.log(msg);
}

document.getElementById("start").onclick = async () => {
  ws = new WebSocket(WS_URL);
  ws.binaryType = "arraybuffer";

  // 🔹 обработка sessionId и обычных сообщений
  ws.onmessage = (e) => {
    const msg = String(e.data);
    if (msg.startsWith("SESSION:")) {
      sessionId = msg.split(":")[1];
      log(`📩 SESSION:${sessionId}`);
    } else {
      log("📩 " + msg);
    }
  };

  ws.onclose = () => log("❌ Disconnected");

  audioCtx = new AudioContext();
  sampleRate = audioCtx.sampleRate;
  log(`🎛 Detected SampleRate: ${sampleRate} Hz`);
  await audioCtx.audioWorklet.addModule("recorder-worklet.js");

  ws.onopen = () => {
    log("✅ Connected to WebSocket server");
    ws.send(JSON.stringify({ type: "meta", sampleRate }));
  };

  // 🎙️ Получаем микрофон без автофильтров
  stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      noiseSuppression: false,
      echoCancellation: false,
      autoGainControl: false
    }
  });

  const source = audioCtx.createMediaStreamSource(stream);
  worklet = new AudioWorkletNode(audioCtx, "recorder-processor");
  source.connect(worklet);

  const INTERVAL = 2000; // 2 секунды
  lastSend = performance.now();

  worklet.port.onmessage = (e) => {
    const chunk = e.data;
    buffer.push(chunk);
    total += chunk.length;

    const now = performance.now();
    if (now - lastSend >= INTERVAL) {
      sendBlock();
      lastSend = now;
    }
  };

  log("🎙️ Recording started");
  document.getElementById("start").disabled = true;
  document.getElementById("stop").disabled = false;
};

function sendBlock(pad = false) {
  if (!buffer.length) return;
  let full = concat(buffer);
  if (pad) {
    const target = Math.round(sampleRate * 2);
    if (full.length < target) {
      const padded = new Float32Array(target);
      padded.set(full);
      full = padded;
      log(`🫧 Padded last block (${target - full.length} zeros)`);
    }
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(full.buffer);
    log(`🎧 Sent ${full.byteLength} bytes @ ${sampleRate} Hz`);
  }

  buffer = [];
  total = 0;
}

function concat(chunks) {
  const totalLen = chunks.reduce((a, b) => a + b.length, 0);
  const res = new Float32Array(totalLen);
  let offset = 0;
  for (const part of chunks) {
    res.set(part, offset);
    offset += part.length;
  }
  return res;
}

document.getElementById("stop").onclick = () => {
  sendBlock(true);
  if (audioCtx) audioCtx.close();
  if (stream) stream.getTracks().forEach(t => t.stop());
  if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  log("⏹️ Stopped");
  document.getElementById("start").disabled = false;
  document.getElementById("stop").disabled = true;

  // 🧩 После остановки — объединяем файлы по сессии
  setTimeout(async () => {
    try {
      if (!sessionId) {
        log("❔ Session ID неизвестен — невозможно объединить");
        return;
      }

      log("🧩 Отправляем запрос на объединение...");

      const res = await fetch(`/merge?session=${encodeURIComponent(sessionId)}`);
      if (!res.ok) throw new Error(await res.text());

      const mergedUrl = `${location.origin}/${sessionId}_merged.wav`;
      log(`💾 Готово: <a href="${mergedUrl}" target="_blank" download>${sessionId}_merged.wav</a>`);
    } catch (e) {
      log("❌ Ошибка объединения: " + e.message);
    }
  }, 1000);
};
