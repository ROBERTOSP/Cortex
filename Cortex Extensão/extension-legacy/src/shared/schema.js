export const EVENT_TYPES = {
  questionViewed: "question_viewed",
  answerSelected: "answer_selected",
  answerResult: "answer_result"
};

export function buildEventBase({ source, url, clientId, eventType }) {
  return {
    id: crypto.randomUUID(),
    event_type: eventType,
    source,
    url,
    client_id: clientId,
    occurred_at: new Date().toISOString()
  };
}

export function isValidEvent(evt) {
  if (!evt || typeof evt !== "object") return false;
  if (typeof evt.id !== "string" || !evt.id) return false;
  if (typeof evt.event_type !== "string" || !evt.event_type) return false;
  if (typeof evt.source !== "string" || !evt.source) return false;
  if (typeof evt.url !== "string" || !evt.url) return false;
  if (typeof evt.client_id !== "string" || !evt.client_id) return false;
  if (typeof evt.occurred_at !== "string" || !evt.occurred_at) return false;
  return true;
}

