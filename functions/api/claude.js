// Revenue Engine — Cloudflare Pages backend
// Multi-provider AI proxy: Gemini (free, google_search grounding), Cloudflare
// Workers AI (free), Anthropic Claude (quality/fallback), and user-added
// OpenAI-compatible custom providers (stored in KV, managed from the dashboard).
// Also handles: auth gate, KV session/learning persistence, Google Sheets sync.
//
// Required env (set with `wrangler pages secret put <NAME>`):
//   RE_TOKEN           — shared secret; client must send the same value as `token`
//   GEMINI_API_KEY     — Google Gemini (free tier)
//   ANTHROPIC_API_KEY  — Claude (quality agents + fallback)
//
// Bindings (wrangler.toml): RE_SESSIONS (KV), AI (Workers AI)

const JSON_HEADERS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

// 1 MB hard cap — plenty for a single LLM call or a session payload.
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_KV_PAYLOAD_BYTES = 1024 * 1024; // 1 MB per KV value (Cloudflare's real limit)

const VALID_LEARNING_KEYS = new Set([
  "learning", "re_rerun_log_v1", "re_active_sources_v1", "re_custom_sources_v1",
  "re_outcomes_v1", "re_weights_v1", "re_custom_providers_v1",
  "re_mrr_v1", "re_checklist_v1",
]);

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: JSON_HEADERS });

// sessionId comes from the client and is interpolated into a KV key — validate it.
const safeId = (id) => typeof id === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(id);

// Validate a learning-layer key to prevent arbitrary KV key writes.
const safeLearningKey = (key) => typeof key === "string" && VALID_LEARNING_KEYS.has(key);

// Approximate byte size of a JSON-serializable value.
const byteSize = (v) => {
  try { return new Blob([JSON.stringify(v)]).size; } catch { return JSON.stringify(v).length; }
};

// Cross-request provider cooldown: pid → timestamp until which the provider
// is skipped after a failure. Workers isolates persist between requests, so
// this gives breathing room to providers that just failed.
const providerCooldowns = new Map();
const COOLDOWN_MS = 60000;        // generic failure (429/5xx)
const QUOTA_COOLDOWN_MS = 600000;  // quota errors won't clear for a while

// Auth check. `token` may arrive as a body field or an x-re-token header.
// If RE_TOKEN is unset, auth is disabled (dev mode).
function authorize(context, body) {
  const expected = context.env && context.env.RE_TOKEN;
  if (!expected) {
    console.warn("[revenue-engine] RE_TOKEN not set — auth DISABLED. Set it in production.");
    return true;
  }
  const got =
    body.token ||
    (context.request.headers && context.request.headers.get("x-re-token"));
  return got === expected;
}

export async function onRequestPost(context) {
  let body;
  try {
    const text = await context.request.text();
    if (text && text.length > MAX_BODY_BYTES) return json({ error: "Request body too large" }, 413);
    body = text ? JSON.parse(text) : {};
  } catch (e) {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!authorize(context, body)) return json({ error: "Unauthorized" }, 401);

  const KV = context.env && context.env.RE_SESSIONS;

  try {
    // ── Save session to KV ────────────────────────────────────────────────
    if (body._saveToKV) {
      if (!KV) return json({ error: "KV not bound" }, 500);
      const session = body._sessionData;
      if (!session || !safeId(session.id)) return json({ error: "Invalid session id" }, 400);
      if (byteSize(session) > MAX_KV_PAYLOAD_BYTES) return json({ error: "Session payload too large" }, 413);
      await KV.put(`session:${session.id}`, JSON.stringify(session));
      // Update the lightweight index (metadata only) used for fast listing.
      let index = [];
      try { const raw = await KV.get("index"); if (raw) index = JSON.parse(raw); } catch {}
      index = [
        { id: session.id, niche: session.niche, date: session.date, status: session.status, nicheScore: session.nicheScore, viability: session.viability, blueprintName: session.blueprintName },
        ...index.filter(s => s.id !== session.id),
      ].slice(0, 50);
      await KV.put("index", JSON.stringify(index));
      return json({ ok: true });
    }

    // ── Load all sessions (index only) ────────────────────────────────────
    if (body._loadSessions) {
      if (!KV) return json({ sessions: [] });
      let index = [];
      try { const raw = await KV.get("index"); if (raw) index = JSON.parse(raw); } catch {}
      return json({ sessions: index });
    }

    // ── Load single session (full data) ───────────────────────────────────
    if (body._loadSession) {
      if (!KV) return json({ session: null });
      if (!safeId(body._sessionId)) return json({ error: "Invalid session id" }, 400);
      const raw = await KV.get(`session:${body._sessionId}`);
      let session = null;
      try { if (raw) session = JSON.parse(raw); } catch {}
      return json({ session });
    }

    // ── Delete session ────────────────────────────────────────────────────
    if (body._deleteSession) {
      if (!KV) return json({ error: "KV not bound" }, 500);
      if (!safeId(body._sessionId)) return json({ error: "Invalid session id" }, 400);
      await KV.delete(`session:${body._sessionId}`);
      let index = [];
      try { const raw = await KV.get("index"); if (raw) index = JSON.parse(raw); } catch {}
      index = index.filter(s => s.id !== body._sessionId);
      await KV.put("index", JSON.stringify(index));
      return json({ ok: true });
    }

    // ── Save learning data to KV ──────────────────────────────────────────
    if (body._saveLearning) {
      if (!KV) return json({ error: "KV not bound" }, 500);
      const key = body._key || "learning";
      if (!safeLearningKey(key)) return json({ error: "Invalid learning key" }, 400);
      if (byteSize(body._learningData) > MAX_KV_PAYLOAD_BYTES) return json({ error: "Learning payload too large" }, 413);
      await KV.put(key, JSON.stringify(body._learningData));
      return json({ ok: true });
    }

    // ── Load learning data from KV ───────────────────────────────────────
    if (body._loadLearning) {
      if (!KV) return json({ learning: null });
      const key = body._key || "learning";
      if (!safeLearningKey(key)) return json({ error: "Invalid learning key" }, 400);
      let learning = key === "learning" ? [] : null;
      try { const raw = await KV.get(key); if (raw) learning = JSON.parse(raw); } catch {}
      return json({ learning });
    }

    // ── Save to Google Sheets ─────────────────────────────────────────────
    if (body._saveToSheets) {
      const sheetRes = await fetch("https://script.google.com/macros/s/AKfycbzFst2oTPi-J3AUXGZ8HsKw-UuiXZ9n7fc18LEizM9bT5zaC9AoibFkX1Bki0n_TQ8Z/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body._sessionData),
      });
      const sheetText = await sheetRes.text();
      let sheetData;
      try { sheetData = JSON.parse(sheetText); } catch { sheetData = { ok: true, raw: sheetText }; }
      return json(sheetData);
    }

    // ── Multi-provider LLM dispatch ───────────────────────────────────────
    const mode = body.mode || "hybrid";
    const useSearch = !!body.useSearch;
    const agentId = body.agentId || "unknown";

    // Agents that benefit most from Claude's quality in hybrid mode.
    const CLAUDE_AGENTS = new Set(["validator", "psychol", "moat", "oppscore"]);

    // The Anthropic-shaped request we forward or translate per provider.
    const anthBody = {
      model: body.model || "claude-sonnet-4-6",
      max_tokens: body.max_tokens,
      system: body.system,
      messages: body.messages,
      tools: body.tools,
      tool_choice: body.tool_choice,
    };

    /** Google Gemini — free tier, google_search grounding for search agents. */
    async function callGemini(env, b) {
      const key = env.GEMINI_API_KEY;
      if (!key) throw new Error("GEMINI_API_KEY not configured");
      const model = "gemini-3.6-flash";
      const contents = (b.messages || []).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || "" }],
      }));
      const gemBody = {
        system_instruction: b.system ? { parts: [{ text: b.system }] } : undefined,
        contents,
      };
      const generationConfig = { maxOutputTokens: b.max_tokens || 6000 };
      // JSON mode is not available together with google_search grounding.
      if (b.tools?.length) {
        gemBody.tools = [{ google_search: {} }];
      } else {
        generationConfig.responseMimeType = "application/json";
      }
      gemBody.generationConfig = generationConfig;
      Object.keys(gemBody).forEach(k => gemBody[k] === undefined && delete gemBody[k]);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(gemBody) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Gemini ${res.status}`);
      const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("") || "";
      if (!text) throw new Error("Gemini returned empty response");
      const tok = {
        input: data.usageMetadata?.promptTokenCount || 0,
        output: data.usageMetadata?.candidatesTokenCount || 0,
      };
      return { normalized: { content: [{ type: "text", text }] }, provider: "gemini", model, tokens: tok, cost: 0 };
    }

    /** Cloudflare Workers AI — free (Llama 3.3 70B). */
    async function callCfAi(env, b) {
      const ai = env.AI;
      if (!ai) throw new Error("AI binding not configured — add [ai] to wrangler.toml");
      const messages = [];
      if (b.system) messages.push({ role: "system", content: b.system });
      (b.messages || []).forEach(m => {
        if (m.role === "user" || m.role === "assistant") {
          messages.push({ role: m.role, content: m.content || "" });
        }
      });
      const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages, max_tokens: b.max_tokens || 6000,
      });
      const text = typeof response === "string" ? response : response?.response || "";
      if (!text) throw new Error("Workers AI returned empty response");
      const tok = { input: response?.usage?.prompt_tokens || 0, output: response?.usage?.completion_tokens || 0 };
      return { normalized: { content: [{ type: "text", text }] }, provider: "cfai", model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", tokens: tok, cost: 0 };
    }

    /** Anthropic Claude — quality agents + final fallback. Used as a plain
     *  LLM: no beta headers, no server-side tools (search is Gemini's job). */
    async function callAnthropic(env, b) {
      const key = env.ANTHROPIC_API_KEY;
      if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
      const forwarded = {
        model: b.model || "claude-sonnet-4-6",
        max_tokens: b.max_tokens || 6000,
        system: b.system,
        messages: b.messages,
      };
      Object.keys(forwarded).forEach(k => forwarded[k] === undefined && delete forwarded[k]);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(forwarded),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Anthropic ${res.status}`);
      if (data.error) throw new Error(data.error.message);
      const tok = { input: data.usage?.input_tokens || 0, output: data.usage?.output_tokens || 0 };
      const cost = (tok.input * 3 + tok.output * 15) / 1000000;
      return { normalized: data, provider: "anthropic", model: forwarded.model, tokens: tok, cost };
    }

    /** User-added OpenAI-compatible provider from KV. Search-capable ones
     *  (e.g. OpenRouter ":online" models) do search server-side, so client
     *  tools are simply not forwarded. */
    async function callCustomProvider(env, b, provider) {
      const pid = provider.id;
      if (!provider.apiKey) throw new Error("No API key configured for " + provider.name);
      const messages = [];
      if (b.system) messages.push({ role: "system", content: b.system });
      (b.messages || []).forEach(m => {
        messages.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.content || "" });
      });
      const base = (provider.baseUrl || "").replace(/\/+$/, "");
      if (!base) throw new Error("No base URL for " + provider.name);
      const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + provider.apiKey,
        ...(provider.extraHeaders || {}),
      };
      const payload = { model: provider.model, messages, max_tokens: b.max_tokens || 6000 };
      const doFetch = (withJsonMode) =>
        fetch(base + "/chat/completions", {
          method: "POST",
          headers,
          body: JSON.stringify(withJsonMode ? { ...payload, response_format: { type: "json_object" } } : payload),
        });
      let res = await doFetch(true);
      let data = await res.json().catch(() => ({}));
      // Some OpenAI-compatible providers reject response_format — retry once without it.
      if (!res.ok && (res.status === 400 || res.status === 422)) {
        res = await doFetch(false);
        data = await res.json().catch(() => ({}));
      }
      if (!res.ok) throw new Error(data.error?.message || "Custom provider " + res.status);
      const text = data.choices?.[0]?.message?.content || "";
      if (!text) throw new Error("Custom provider returned empty response");
      const tok = { input: data.usage?.prompt_tokens || 0, output: data.usage?.completion_tokens || 0 };
      return { normalized: { content: [{ type: "text", text }] }, provider: pid, model: provider.model, tokens: tok, cost: null };
    }

    // ── Smart routing ────────────────────────────────────────────────────
    function pickProviders() {
      const customSearch = customProviders.filter(p => p.hasSearch).map(p => p.id);
      const customIds = customProviders.map(p => p.id);
      if (mode === "claude") return ["anthropic"];
      if (mode === "free") {
        // cfai as terminal fallback: a quota-exhausted Gemini degrades search
        // agents to ungrounded output instead of killing the run.
        if (useSearch) return [...customSearch, "gemini", "cfai"];
        return [...customIds, "gemini", "cfai"];
      }
      // hybrid: quality agents PREFER Claude but degrade gracefully when
      // no Anthropic key is set (or Claude fails) instead of erroring out.
      if (CLAUDE_AGENTS.has(agentId)) return ["anthropic", ...customIds, "cfai", "gemini"];
      if (useSearch) return [...customSearch, "gemini", "anthropic"];
      return [...customIds, "cfai", "anthropic"];
    }

    // Load user-added custom providers from KV.
    const customProviders = [];
    try {
      const raw = await KV?.get("re_custom_providers_v1");
      if (raw) customProviders.push(...JSON.parse(raw));
    } catch {}

    const builtInCallFns = { gemini: callGemini, cfai: callCfAi, anthropic: callAnthropic };
    const providerList = pickProviders();
    const failovers = [];
    let lastError;

    for (const pid of providerList) {
      if ((providerCooldowns.get(pid) || 0) > Date.now()) {
        console.log("[revenue-engine] " + pid + " in cooldown — skipping");
        failovers.push({ pid, error: "skipped: cooldown (recent 429/5xx)" });
        continue;
      }
      try {
        const isCustom = customProviders.some(p => p.id === pid);
        // Claude gets a tools-stripped body (plain LLM); other providers
        // translate or ignore tools themselves.
        const providerBody = pid === "anthropic"
          ? { ...anthBody, tools: undefined, tool_choice: undefined }
          : anthBody;
        const result = isCustom
          ? await callCustomProvider(context.env, providerBody, customProviders.find(p => p.id === pid))
          : await builtInCallFns[pid](context.env, providerBody);
        result.normalized._provider = result.provider;
        result.normalized._model = result.model;
        result.normalized._tokens = result.tokens || null;
        result.normalized._cost = result.cost === undefined ? null : result.cost;
        if (failovers.length) result.normalized._failover = failovers.slice();
        return new Response(JSON.stringify(result.normalized), { status: 200, headers: JSON_HEADERS });
      } catch (e) {
        console.warn("[revenue-engine] " + pid + " failed for " + agentId + ": " + e.message);
        failovers.push({ pid, error: e.message });
        // Quota errors won't clear in seconds — cool down 10 minutes so the
        // rest of a pipeline run stops burning requests against a dead quota.
        const isQuota = /quota|exceeded|exhausted|429/i.test(e.message || "");
        providerCooldowns.set(pid, Date.now() + (isQuota ? QUOTA_COOLDOWN_MS : COOLDOWN_MS));
        lastError = e;
      }
    }
    return json({
      error: { message: lastError?.message || "All providers failed for " + agentId },
      _failover: failovers.length ? failovers : undefined,
    }, 502);

  } catch (err) {
    console.error("[revenue-engine] handler error:", err);
    return json({ error: { message: err.message || "Internal error" } }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-re-token",
    },
  });
}
