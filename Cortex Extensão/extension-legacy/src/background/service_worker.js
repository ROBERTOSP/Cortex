import { enqueueEvent, dequeueBatch, getOrCreateClientId, getStorage, peekQueueSize, setStorage, STORAGE_KEYS } from "../shared/storage.js";
import { isValidEvent } from "../shared/schema.js";
import { postEvents } from "../shared/api_client.js";

async function ensureDefaults() {
  const existing = await getStorage([STORAGE_KEYS.enabled, STORAGE_KEYS.apiBaseUrl]);
  const patch = {};
  if (typeof existing[STORAGE_KEYS.enabled] !== "boolean") patch[STORAGE_KEYS.enabled] = true;
  if (!existing[STORAGE_KEYS.apiBaseUrl]) patch[STORAGE_KEYS.apiBaseUrl] = "http://localhost:8000";
  if (Object.keys(patch).length) await setStorage(patch);
  await getOrCreateClientId();
}

async function flushQueue() {
  const { [STORAGE_KEYS.enabled]: enabled } = await getStorage([STORAGE_KEYS.enabled]);
  if (!enabled) return { sent: 0, remaining: await peekQueueSize() };

  let sent = 0;
  for (let i = 0; i < 20; i += 1) {
    const batch = await dequeueBatch(50);
    if (!batch.length) break;
    try {
      await postEvents(batch);
      sent += batch.length;
    } catch (e) {
      const { [STORAGE_KEYS.queue]: rest } = await getStorage([STORAGE_KEYS.queue]);
      const current = Array.isArray(rest) ? rest : [];
      await setStorage({ [STORAGE_KEYS.queue]: batch.concat(current) });
      break;
    }
  }

  return { sent, remaining: await peekQueueSize() };
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureDefaults();
});

chrome.runtime.onStartup?.addListener(() => {
  void ensureDefaults().then(() => flushQueue());
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void (async () => {
    await ensureDefaults();

    if (message?.type === "CORTEX_EVENT") {
      const evt = message.event;
      if (!isValidEvent(evt)) {
        sendResponse({ ok: false, error: "invalid_event" });
        return;
      }
      await enqueueEvent(evt);
      const stats = await flushQueue();
      sendResponse({ ok: true, queued: stats.remaining });
      return;
    }

    if (message?.type === "CORTEX_FLUSH") {
      const stats = await flushQueue();
      sendResponse({ ok: true, ...stats });
      return;
    }

    if (message?.type === "CORTEX_STATUS") {
      const stored = await getStorage([STORAGE_KEYS.enabled, STORAGE_KEYS.apiBaseUrl]);
      sendResponse({
        ok: true,
        enabled: !!stored[STORAGE_KEYS.enabled],
        apiBaseUrl: stored[STORAGE_KEYS.apiBaseUrl] || "http://localhost:8000",
        queueSize: await peekQueueSize()
      });
      return;
    }

    sendResponse({ ok: false, error: "unknown_message" });
  })();

  return true;
});

