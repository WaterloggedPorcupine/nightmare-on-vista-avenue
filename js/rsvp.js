// Posts RSVP answers to Zhuri's Google Form. The site is static, so the answer
// goes straight to the form's formResponse endpoint. Google's response is opaque
// (no-cors), so a resolved fetch is treated as success.
import { CONFIG } from './config.js';

const R = CONFIG.rsvp;

export function isConfigured() {
  return !!(R.formAction && /\/formResponse$/.test(R.formAction) &&
    /^entry\.\d+$/.test(R.nameField || '') && /^entry\.\d+$/.test(R.answerField || ''));
}

function post(name, answer) {
  const body = new URLSearchParams({ [R.nameField]: name, [R.answerField]: answer });
  return fetch(R.formAction, { method: 'POST', mode: 'no-cors', body });
}

function savePending(entry) {
  try { localStorage.setItem(R.pendingKey, JSON.stringify(entry)); } catch (e) { /* ignore */ }
}
function clearPending() {
  try { localStorage.removeItem(R.pendingKey); } catch (e) { /* ignore */ }
}

// Sends one answer, retrying once. Always resolves; the result says whether it got out.
export async function submitRsvp(name, answer) {
  if (!R.options.includes(answer)) throw new Error('RSVP answer must be one of ' + R.options.join(', '));
  if (!isConfigured()) {
    console.warn('[rsvp] Form settings are not filled in; skipping the submission.');
    return { sent: false, reason: 'not-configured' };
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await post(name, answer);
      clearPending();
      return { sent: true };
    } catch (e) {
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1200));
    }
  }
  savePending({ name, answer, at: Date.now() });
  return { sent: false, reason: 'offline' };
}

// Called once at startup: resends an answer that could not go out last time.
export async function flushPendingRsvp() {
  let entry = null;
  try { entry = JSON.parse(localStorage.getItem(R.pendingKey) || 'null'); } catch (e) { entry = null; }
  if (!entry || !entry.name || !R.options.includes(entry.answer) || !isConfigured()) return;
  try { await post(entry.name, entry.answer); clearPending(); } catch (e) { /* try again next load */ }
}
