import { getOrCreateClientId, getStorage, STORAGE_KEYS } from "./storage.js";

async function parseMaybeJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function throwApiError(res) {
  const text = await res.text().catch(() => "");
  const body = await parseMaybeJson(text);
  const err = new Error(`API error: ${res.status} ${res.statusText}`);
  err.status = res.status;
  err.body = body;
  err.details = text;
  throw err;
}

export async function getApiConfig() {
  const stored = await getStorage([
    STORAGE_KEYS.apiBaseUrl,
    STORAGE_KEYS.sessionToken,
    STORAGE_KEYS.apiToken
  ]);
  const sessionToken = stored[STORAGE_KEYS.sessionToken] || "";
  return {
    baseUrl: stored[STORAGE_KEYS.apiBaseUrl] || "http://localhost:8000",
    token: sessionToken || stored[STORAGE_KEYS.apiToken] || ""
  };
}

export async function getMe() {
  const { baseUrl, token } = await getApiConfig();
  const clientId = await getOrCreateClientId();
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/me`, {
    method: "GET",
    headers: {
      "x-client-id": clientId,
      ...(token ? { authorization: `Bearer ${token}` } : {})
    }
  });

  if (!res.ok) {
    await throwApiError(res);
  }

  return res.json().catch(() => ({}));
}

export async function postEvents(events) {
  const { baseUrl, token } = await getApiConfig();
  const clientId = await getOrCreateClientId();
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/events`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-client-id": clientId,
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ events })
  });

  if (!res.ok) {
    await throwApiError(res);
  }

  return res.json().catch(() => ({}));
}

export async function uploadPdf(file) {
  const { baseUrl, token } = await getApiConfig();
  const clientId = await getOrCreateClientId();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/uploads`, {
    method: "POST",
    headers: {
      "x-client-id": clientId,
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: form
  });

  if (!res.ok) {
    await throwApiError(res);
  }

  return res.json();
}

export async function analyzeEdital(payload) {
  const { baseUrl, token } = await getApiConfig();
  const clientId = await getOrCreateClientId();
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/edital/analyze`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-client-id": clientId,
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await throwApiError(res);
  }

  return res.json();
}
