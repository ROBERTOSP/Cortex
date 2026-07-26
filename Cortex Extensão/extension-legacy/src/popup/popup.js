import { getStorage, setStorage, STORAGE_KEYS } from "../shared/storage.js";

const elEnabled = document.getElementById("enabled");
const elApiBaseUrl = document.getElementById("apiBaseUrl");
const elApiToken = document.getElementById("apiToken");
const elOpenLogin = document.getElementById("openLogin");
const elSave = document.getElementById("save");
const elFlush = document.getElementById("flush");
const elStatus = document.getElementById("status");

function setStatus(text) {
  elStatus.textContent = text;
}

async function load() {
  const stored = await getStorage([STORAGE_KEYS.enabled, STORAGE_KEYS.apiBaseUrl, STORAGE_KEYS.apiToken]);
  elEnabled.checked = typeof stored[STORAGE_KEYS.enabled] === "boolean" ? stored[STORAGE_KEYS.enabled] : true;
  elApiBaseUrl.value = stored[STORAGE_KEYS.apiBaseUrl] || "http://localhost:8000";
  elApiToken.value = stored[STORAGE_KEYS.apiToken] || "";

  const status = await chrome.runtime.sendMessage({ type: "CORTEX_STATUS" }).catch(() => null);
  if (status?.ok) {
    setStatus(`Fila: ${status.queueSize}\nAPI: ${status.apiBaseUrl}\nAtivo: ${status.enabled ? "sim" : "não"}`);
  } else {
    setStatus("Status indisponível");
  }
}

elSave.addEventListener("click", async () => {
  const apiBaseUrl = (elApiBaseUrl.value || "").trim();
  const apiToken = (elApiToken.value || "").trim();
  await setStorage({
    [STORAGE_KEYS.enabled]: !!elEnabled.checked,
    [STORAGE_KEYS.apiBaseUrl]: apiBaseUrl || "http://localhost:8000",
    [STORAGE_KEYS.apiToken]: apiToken
  });
  await load();
});

elFlush.addEventListener("click", async () => {
  const res = await chrome.runtime.sendMessage({ type: "CORTEX_FLUSH" }).catch(() => null);
  if (res?.ok) {
    setStatus(`Enviado: ${res.sent}\nRestante: ${res.remaining}`);
    return;
  }
  setStatus("Falha ao enviar pendências");
});

elOpenLogin?.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/auth/auth.html") });
});

void load();
