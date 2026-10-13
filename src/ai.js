// ── AI API wrapper ───────────────────────────────────────────
import { kvPost } from "./api.js";

const RE_TOKEN = "British#1";

export async function callAI(system, user, useSearch, agentId = "util") {
  function extractAIJSON(text) {
    if (!text) throw new Error("Empty response");
    try { return JSON.parse(text); } catch {}
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) { try { return JSON.parse(fenceMatch[1].trim()); } catch {} }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) { try { return JSON.parse(jsonMatch[0]); } catch {} }
    throw new Error("No valid JSON found in response: " + text.substring(0, 200));
  }

  const token =
    (typeof localStorage !== "undefined" && localStorage.getItem("re_token")) ||
    RE_TOKEN;

  const mode = (typeof localStorage !== "undefined" && localStorage.getItem("re_mode")) || "hybrid";

  const buildBody = () => {
    const b = {
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      system,
      messages: [{ role: "user", content: user }],
    };
    if (useSearch) b.tools = [{ type: "web_search_20250305", name: "web_search" }];
    b.mode = mode;
    b.agentId = agentId;
    b.useSearch = !!useSearch;
    return b;
  };

  const logPhase = (msg) => {
    if (typeof window !== "undefined" && window.__addLog)
      window.__addLog(agentId, msg);
  };

  logPhase(`Calling ${mode === "claude" ? "Claude" : mode === "free" ? "free provider" : "provider"}...`);

  const t0 = Date.now();
  let lastErr;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-re-token": token,
        },
        body: JSON.stringify(buildBody()),
      });

      if (!res.ok && res.status === 401)
        throw new Error("Unauthorized — set your access token in Settings.");

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API error");

      const ms = Date.now() - t0;
      logPhase(`Received response from ${data._provider || "provider"} (${ms}ms)`);

      if (data._provider) {
        callAI.lastProvider = data._provider;
        if (typeof window !== "undefined" && window.__trackProvider)
          window.__trackProvider(data._provider, true, ms, null);
        if (data._cost !== undefined && data._cost !== null)
          window.__accrueCost && window.__accrueCost(data._provider, data._cost, data._tokens);
      }

      const text = data.content?.[0]?.text;
      if (!text) throw new Error("No text content in response");
      return extractAIJSON(text);
    } catch (e) {
      lastErr = e;
      console.warn(`[attempt ${attempt + 1}] ${agentId}: ${e.message}`);
      if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
    }
  }

  logPhase(`Failed after 3 attempts: ${lastErr?.message}`);
  throw lastErr;
}
