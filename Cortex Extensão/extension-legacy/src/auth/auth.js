import { getApiConfig } from "../shared/api_client.js";
import { getStorage, setStorage, STORAGE_KEYS } from "../shared/storage.js";

const elStatus = document.getElementById("status");
const elAccount = document.getElementById("account");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");

function setStatus(text) {
  if (elStatus) elStatus.textContent = text;
}

function setAccount(text) {
  if (elAccount) elAccount.textContent = text;
}

function chromeGetAuthTokenInteractive() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      const err = chrome.runtime.lastError;
      if (err) return reject(new Error(err.message));
      if (!token) return reject(new Error("no_token"));
      resolve(token);
    });
  });
}

function chromeClearAllCachedAuthTokens() {
  return new Promise((resolve) => {
    chrome.identity.clearAllCachedAuthTokens(() => resolve());
  });
}

async function backendExchangeGoogleAccessToken(accessToken) {
  const { baseUrl } = await getApiConfig();
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/auth/google`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ access_token: accessToken })
  });
  const text = await res.text().catch(() => "");
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    const msg = json?.detail ? JSON.stringify(json.detail) : text || `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json || {};
}

async function render() {
  const stored = await getStorage([STORAGE_KEYS.sessionToken, STORAGE_KEYS.user]);
  const token = stored[STORAGE_KEYS.sessionToken] || "";
  const user = stored[STORAGE_KEYS.user] || null;
  if (token && user?.email) {
    setStatus("Logado");
    setAccount(user.email);
  } else if (token) {
    setStatus("Logado");
    setAccount("—");
  } else {
    setStatus("Deslogado");
    setAccount("—");
  }
}

btnLogin?.addEventListener("click", async () => {
  try {
    setStatus("Abrindo Google...");
    const accessToken = await chromeGetAuthTokenInteractive();
    setStatus("Validando no backend...");
    const res = await backendExchangeGoogleAccessToken(accessToken);
    const sessionToken = res?.session_token || "";
    const user = res?.user || null;
    if (!sessionToken) throw new Error("invalid_session_token");
    await setStorage({ [STORAGE_KEYS.sessionToken]: sessionToken, [STORAGE_KEYS.user]: user });
    setStatus("Logado");
    setAccount(user?.email || "—");
  } catch (e) {
    setStatus(`Falha: ${e?.message || e}`);
  }
});

btnLogout?.addEventListener("click", async () => {
  await chromeClearAllCachedAuthTokens();
  await setStorage({ [STORAGE_KEYS.sessionToken]: "", [STORAGE_KEYS.user]: null });
  await render();
});

void render();
