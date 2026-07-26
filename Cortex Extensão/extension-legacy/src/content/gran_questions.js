import { EVENT_TYPES, buildEventBase } from "../shared/schema.js";
import { getOrCreateClientId, getStorage, STORAGE_KEYS } from "../shared/storage.js";

const SOURCE = "gran";
const handled = new WeakSet();
const questionState = new Map();

function nowMs() {
  return Date.now();
}

function normalizeText(v) {
  return (v || "").toString().replace(/\s+/g, " ").trim();
}

function extractSubjectParts(qEl) {
  const subjectEl = qEl.querySelector(".ds-question__header__top__subject");
  if (!subjectEl) return [];
  const spans = Array.from(subjectEl.querySelectorAll("span"));
  return spans.map((s) => normalizeText(s.textContent)).filter(Boolean);
}

function extractQuestionId(qEl) {
  const idEl = qEl.querySelector(".ds-question__header__top__id");
  const text = normalizeText(idEl?.textContent);
  if (text) return text.startsWith("Q") ? text : `Q${text}`;
  return "N/A";
}

function extractChoiceLetter(optEl) {
  const label = optEl.querySelector(".ds-question__body__options__option__label");
  const t = normalizeText(label?.textContent);
  return t ? t[0].toUpperCase() : "N/A";
}

async function isEnabled() {
  const stored = await getStorage([STORAGE_KEYS.enabled]);
  return typeof stored[STORAGE_KEYS.enabled] === "boolean" ? stored[STORAGE_KEYS.enabled] : true;
}

async function sendEvent(event) {
  if (!(await isEnabled())) return;
  await chrome.runtime.sendMessage({ type: "CORTEX_EVENT", event }).catch(() => null);
}

async function buildBase(eventType) {
  const clientId = await getOrCreateClientId();
  return buildEventBase({ source: SOURCE, url: location.href, clientId, eventType });
}

function detectResultFromQuestion(qEl, selectedLetter) {
  const options = Array.from(qEl.querySelectorAll(".ds-question__body__options__option"));
  let correctLetter = "N/A";
  for (const opt of options) {
    const classes = `${opt.className}`.toLowerCase();
    if (classes.includes("correct") || classes.includes("success")) {
      correctLetter = extractChoiceLetter(opt);
      break;
    }
  }
  if (correctLetter === "N/A") return { known: false };
  return { known: true, correct: selectedLetter === correctLetter, correctLetter };
}

async function onQuestionViewed(qEl) {
  const id = extractQuestionId(qEl);
  const subjectParts = extractSubjectParts(qEl);
  questionState.set(qEl, { viewedAt: nowMs(), lastSelected: null });
  const base = await buildBase(EVENT_TYPES.questionViewed);
  await sendEvent({
    ...base,
    question: {
      id_portal: id,
      subject_parts: subjectParts
    }
  });
}

async function onAnswerSelected(qEl, optEl) {
  const state = questionState.get(qEl) || { viewedAt: null, lastSelected: null };
  const selectedLetter = extractChoiceLetter(optEl);
  state.lastSelected = { at: nowMs(), letter: selectedLetter };
  questionState.set(qEl, state);

  const id = extractQuestionId(qEl);
  const subjectParts = extractSubjectParts(qEl);
  const base = await buildBase(EVENT_TYPES.answerSelected);
  await sendEvent({
    ...base,
    question: {
      id_portal: id,
      subject_parts: subjectParts
    },
    answer: {
      selected: selectedLetter
    }
  });
}

async function onAnswerResult(qEl) {
  const state = questionState.get(qEl);
  const selectedLetter = state?.lastSelected?.letter;
  if (!selectedLetter || selectedLetter === "N/A") return;

  const detected = detectResultFromQuestion(qEl, selectedLetter);
  if (!detected.known) return;
  if (state?.lastResult?.selected === selectedLetter && state?.lastResult?.correctLetter === detected.correctLetter) return;

  const id = extractQuestionId(qEl);
  const subjectParts = extractSubjectParts(qEl);
  const base = await buildBase(EVENT_TYPES.answerResult);
  const durationMs = state?.lastSelected?.at && state?.viewedAt ? Math.max(0, state.lastSelected.at - state.viewedAt) : null;

  questionState.set(qEl, { ...state, lastResult: { selected: selectedLetter, correctLetter: detected.correctLetter } });

  await sendEvent({
    ...base,
    question: {
      id_portal: id,
      subject_parts: subjectParts
    },
    answer: {
      selected: selectedLetter,
      correct: detected.correct,
      correct_letter: detected.correctLetter,
      duration_ms: durationMs
    }
  });
}

function attachQuestionHandlers(qEl) {
  if (handled.has(qEl)) return;
  handled.add(qEl);

  const optionsContainer = qEl.querySelector(".ds-question__body__options");
  if (optionsContainer) {
    optionsContainer.addEventListener(
      "click",
      (ev) => {
        const opt = ev.target?.closest?.(".ds-question__body__options__option");
        if (!opt) return;
        void onAnswerSelected(qEl, opt);
        setTimeout(() => void onAnswerResult(qEl), 250);
      },
      true
    );
  }

  const observer = new MutationObserver(() => {
    void onAnswerResult(qEl);
  });
  observer.observe(qEl, { attributes: true, subtree: true, attributeFilter: ["class"] });
}

function setupIntersections() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const qEl = entry.target;
        if (!questionState.has(qEl)) void onQuestionViewed(qEl);
        attachQuestionHandlers(qEl);
        io.unobserve(qEl);
      }
    },
    { threshold: 0.25 }
  );

  for (const qEl of document.querySelectorAll(".ds-question")) {
    io.observe(qEl);
  }

  const rootObserver = new MutationObserver(() => {
    for (const qEl of document.querySelectorAll(".ds-question")) {
      if (!questionState.has(qEl)) io.observe(qEl);
    }
  });

  rootObserver.observe(document.documentElement, { childList: true, subtree: true });
}

setupIntersections();

