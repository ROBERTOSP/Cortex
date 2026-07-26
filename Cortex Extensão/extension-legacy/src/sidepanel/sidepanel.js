import { analyzeEdital, getMe, uploadPdf } from "../shared/api_client.js";
import { getStorage, setStorage, STORAGE_KEYS } from "../shared/storage.js";

const elContent = document.getElementById("content");
const tabs = Array.from(document.querySelectorAll(".tab"));
const elOpenPopup = document.getElementById("openPopup");
const elTokenBalance = document.getElementById("tokenBalance");
const elOpenLogin = document.getElementById("openLogin");

function setActiveTab(name) {
  for (const t of tabs) t.classList.toggle("active", t.dataset.tab === name);
}

function renderTemplate(id) {
  const tpl = document.getElementById(id);
  const node = tpl.content.cloneNode(true);
  elContent.innerHTML = "";
  elContent.appendChild(node);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

async function refreshTokenBalance() {
  if (!elTokenBalance) return null;
  try {
    const me = await getMe();
    const bal = me?.token_balance;
    if (typeof bal === "number" && Number.isFinite(bal)) {
      elTokenBalance.textContent = `Tokens: ${bal}`;
      return bal;
    }
    elTokenBalance.textContent = "Tokens: —";
    return null;
  } catch {
    elTokenBalance.textContent = "Tokens: —";
    return null;
  }
}

async function loadProfile() {
  const { [STORAGE_KEYS.profile]: profile } = await getStorage([STORAGE_KEYS.profile]);
  return profile || null;
}

async function loadPlan() {
  const { [STORAGE_KEYS.lastPlan]: plan } = await getStorage([STORAGE_KEYS.lastPlan]);
  return plan || null;
}

function normalizeNumber(v) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function saveProfileFromForm() {
  const jobTitle = (document.getElementById("jobTitle")?.value || "").trim();
  const examDate = (document.getElementById("examDate")?.value || "").trim();
  const hoursPerDay = normalizeNumber(document.getElementById("hoursPerDay")?.value);
  const daysPerWeek = normalizeNumber(document.getElementById("daysPerWeek")?.value);

  const profile = {
    job_title: jobTitle,
    exam_date: examDate || null,
    hours_per_day: hoursPerDay,
    days_per_week: daysPerWeek
  };

  await setStorage({ [STORAGE_KEYS.profile]: profile });
  return profile;
}

async function generatePlan() {
  const statusEl = document.getElementById("onboardingStatus");
  const profile = (await loadProfile()) || (await saveProfileFromForm());
  const fileInput = document.getElementById("editalPdf");
  const file = fileInput?.files?.[0] || null;

  if (statusEl) statusEl.textContent = "Gerando cronograma...";
  await refreshTokenBalance();

  let uploadId = null;
  if (file) {
    const up = await uploadPdf(file);
    uploadId = up.upload_id || null;
  }

  let res;
  try {
    res = await analyzeEdital({
      job_title: profile.job_title || null,
      exam_date: profile.exam_date,
      hours_per_day: profile.hours_per_day,
      days_per_week: profile.days_per_week,
      upload_id: uploadId
    });
  } catch (e) {
    const status = e?.status;
    const detail = e?.body?.detail || e?.body || null;
    if (status === 402 && detail?.error === "insufficient_tokens") {
      const bal = detail?.token_balance;
      await refreshTokenBalance();
      if (statusEl) statusEl.textContent = `Tokens insuficientes. Saldo atual: ${typeof bal === "number" ? bal : "—"}.`;
      return;
    }
    if (status === 401 || status === 403) {
      if (statusEl) statusEl.textContent = "Não autorizado. Verifique o token em Config.";
      return;
    }
    throw e;
  }

  await setStorage({ [STORAGE_KEYS.lastPlan]: res });

  await refreshTokenBalance();
  if (statusEl) statusEl.textContent = "Cronograma gerado e salvo na aba Plano.";
  await renderForTab("plano");
}

async function renderOnboarding() {
  renderTemplate("tplOnboarding");
  const profile = await loadProfile();
  if (profile) {
    const elJobTitle = document.getElementById("jobTitle");
    const elExamDate = document.getElementById("examDate");
    const elHours = document.getElementById("hoursPerDay");
    const elDays = document.getElementById("daysPerWeek");
    if (elJobTitle) elJobTitle.value = profile.job_title || "";
    if (elExamDate) elExamDate.value = profile.exam_date || "";
    if (elHours && profile.hours_per_day !== null && profile.hours_per_day !== undefined) elHours.value = String(profile.hours_per_day);
    if (elDays && profile.days_per_week !== null && profile.days_per_week !== undefined) elDays.value = String(profile.days_per_week);
  }

  document.getElementById("saveProfile")?.addEventListener("click", async () => {
    await saveProfileFromForm();
    setText("onboardingStatus", "Perfil salvo.");
  });

  document.getElementById("generatePlan")?.addEventListener("click", async () => {
    try {
      await generatePlan();
    } catch (e) {
      setText("onboardingStatus", `Erro: ${e?.message || e}`);
    }
  });
}

async function renderHoje() {
  renderTemplate("tplHoje");
  const plan = await loadPlan();
  const profile = await loadProfile();

  if (!profile) {
    setText("hojeBody", "Finalize a primeira configuração para o Cortex montar seu cronograma.");
  } else if (!plan) {
    setText("hojeBody", "Clique em “Gerar/atualizar cronograma” para criar seu plano inicial.");
  } else {
    const today = plan?.today?.slice?.(0, 3) || [];
    if (!today.length) {
      setText("hojeBody", "Plano disponível. Abra a aba Plano para detalhes.");
    } else {
      setText("hojeBody", today.map((t, i) => `${i + 1}. ${t.title} (${t.minutes} min)`).join("\n"));
    }
  }

  document.getElementById("btnGeneratePlan")?.addEventListener("click", async () => {
    await renderOnboarding();
  });
}

async function renderPlano() {
  const profile = await loadProfile();
  const plan = await loadPlan();
  if (!profile) {
    await renderOnboarding();
    return;
  }
  renderTemplate("tplPlano");
  setText("planJson", JSON.stringify(plan || { hint: "Sem plano. Gere no onboarding." }, null, 2));
  document.getElementById("btnRegen")?.addEventListener("click", async () => {
    await renderOnboarding();
  });
}

async function renderForTab(name) {
  setActiveTab(name);
  if (name === "hoje") return renderHoje();
  if (name === "plano") return renderPlano();
  if (name === "notas") return renderOnboarding();
  if (name === "flashcards") return renderOnboarding();
  if (name === "ia") return renderOnboarding();
  return renderHoje();
}

for (const t of tabs) {
  t.addEventListener("click", () => void renderForTab(t.dataset.tab));
}

elOpenPopup.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/popup/popup.html") });
});

elOpenLogin?.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/auth/auth.html") });
});

void (async () => {
  await refreshTokenBalance();
  const profile = await loadProfile();
  const plan = await loadPlan();
  if (!profile || !plan) {
    await renderOnboarding();
    setActiveTab("hoje");
    return;
  }
  await renderForTab("hoje");
})();
