// ── KV / session API calls ───────────────────────────────────
const RE_TOKEN = "British#1";

export async function kvPost(body) {
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-re-token": RE_TOKEN,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`HTTP ${res.status}: ${err.error || "API error"}`);
    }
    return await res.json();
  } catch (e) { console.error("KV error:", e); return null; }
}

export async function loadSessions() {
  const r = await kvPost({ _loadSessions: true });
  return r?.sessions || [];
}

export async function saveSession(s) {
  await kvPost({ _saveToKV: true, _sessionData: s });
  try { await kvPost({ _saveToSheets: true, _sessionData: s }); } catch {}
}

export async function loadFullSession(id) {
  const r = await kvPost({ _loadSession: true, _sessionId: id });
  return r?.session || null;
}

export async function deleteSession(id) {
  await kvPost({ _deleteSession: true, _sessionId: id });
}
