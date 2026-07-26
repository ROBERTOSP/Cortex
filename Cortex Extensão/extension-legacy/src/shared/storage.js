export const STORAGE_KEYS = {
  apiBaseUrl: "cortex_api_base_url",
  apiToken: "cortex_api_token",
  sessionToken: "cortex_session_token",
  user: "cortex_user",
  enabled: "cortex_enabled",
  clientId: "cortex_client_id",
  profile: "cortex_profile",
  lastPlan: "cortex_last_plan",
  queue: "cortex_event_queue"
};

export async function getStorage(keys) {
  return chrome.storage.local.get(keys);
}

export async function setStorage(values) {
  await chrome.storage.local.set(values);
}

export async function getOrCreateClientId() {
  const { [STORAGE_KEYS.clientId]: existing } = await getStorage([STORAGE_KEYS.clientId]);
  if (existing) return existing;
  const clientId = crypto.randomUUID();
  await setStorage({ [STORAGE_KEYS.clientId]: clientId });
  return clientId;
}

export async function enqueueEvent(event) {
  const { [STORAGE_KEYS.queue]: queue } = await getStorage([STORAGE_KEYS.queue]);
  const next = Array.isArray(queue) ? queue.slice() : [];
  next.push(event);
  await setStorage({ [STORAGE_KEYS.queue]: next });
  return next.length;
}

export async function dequeueBatch(limit = 50) {
  const { [STORAGE_KEYS.queue]: queue } = await getStorage([STORAGE_KEYS.queue]);
  const current = Array.isArray(queue) ? queue : [];
  const batch = current.slice(0, limit);
  const rest = current.slice(limit);
  await setStorage({ [STORAGE_KEYS.queue]: rest });
  return batch;
}

export async function peekQueueSize() {
  const { [STORAGE_KEYS.queue]: queue } = await getStorage([STORAGE_KEYS.queue]);
  return Array.isArray(queue) ? queue.length : 0;
}
