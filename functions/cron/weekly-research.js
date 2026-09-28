/**
 * Revenue Engine — Weekly Monday Research Automation
 * Runs every Monday at 7:00 AM Dakar time (UTC+0)
 * 1. Suggests 10 trending niches
 * 2. Picks top 3 by opportunity signals
 * 3. Runs full pipeline on each
 * 4. Emails summary to pabyngono@gmail.com
 * 5. Saves results to KV
 */

const RE_TOKEN = "British#1";
const REPORT_EMAIL = "pabyngono@gmail.com";
const PLATFORM_URL = "https://revenue-engine-aa1.pages.dev";

// ── Call the platform's own AI endpoint ──────────────────────────────────────
async function callAI(env, system, user, useSearch = false, agentId = "cron") {
  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: user }],
    mode: "hybrid",
    agentId,
    useSearch,
  };
  if (useSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];

  const res = await fetch(`${PLATFORM_URL}/api/claude`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-re-token": RE_TOKEN,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("No text in response");

  // Extract JSON
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) { try { return JSON.parse(fence[1].trim()); } catch {} }
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch {} }
  throw new Error("No valid JSON in response");
}

// ── Send email via Cloudflare Email Routing ───────────────────────────────────
async function sendEmail(env, subject, htmlBody) {
  // Save to KV — displayed as notification in platform
  // and also attempt Cloudflare Email if domain is verified
  try {
    const key = `re_email_${Date.now()}`;
    await env.RE_SESSIONS.put(key, JSON.stringify({
      subject,
      htmlBody,
      sentAt: new Date().toISOString(),
      to: REPORT_EMAIL,
      read: false,
    }), { expirationTtl: 604800 }); // 7 days
    console.log(`[weekly-research] Report saved to KV: ${key}`);

    // Also try sending via Resend API (free tier: 100 emails/day)
    // Set RESEND_API_KEY as a Worker secret to enable real email
    if (env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Revenue Engine <onboarding@resend.dev>",
          to: [REPORT_EMAIL],
          subject,
          html: htmlBody,
        }),
      });
      if (res.ok) {
        console.log("[weekly-research] Email sent via Resend ✅");
      } else {
        const err = await res.json();
        console.log("[weekly-research] Resend error:", err.message);
      }
    } else {
      console.log("[weekly-research] No RESEND_API_KEY — report saved to KV only");
    }
    return true;
  } catch (e) {
    console.error("sendEmail error:", e.message);
    return false;
  }
}

// ── Build HTML email report ───────────────────────────────────────────────────
function buildEmailHTML(date, niches) {
  const scoreColor = (s) => s >= 75 ? "#0E7A4E" : s >= 60 ? "#B45309" : "#C0392B";
  const fitColor = (s) => s >= 7 ? "#0E7A4E" : s >= 5 ? "#B45309" : "#C0392B";

  const nicheCards = niches.map((n, i) => `
    <div style="margin-bottom:24px;border:1px solid #E3E1DA;border-radius:12px;overflow:hidden;font-family:sans-serif">
      <!-- Header -->
      <div style="background:#141B2E;color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;opacity:.6;text-transform:uppercase;letter-spacing:.1em">Niche ${i+1}</div>
          <div style="font-size:20px;font-weight:800;margin-top:4px">${n.niche}</div>
          <div style="font-size:12px;opacity:.7;margin-top:2px">${n.businessType || "digital_product"}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:36px;font-weight:800;color:${scoreColor(n.platformScore)}">${n.platformScore}</div>
          <div style="font-size:11px;opacity:.6">/100</div>
        </div>
      </div>

      <!-- Scores row -->
      <div style="display:flex;border-bottom:1px solid #E3E1DA">
        <div style="flex:1;padding:12px 16px;border-right:1px solid #E3E1DA">
          <div style="font-size:9px;color:#6B7280;font-weight:700;text-transform:uppercase">French Fit</div>
          <div style="font-size:18px;font-weight:700;color:${fitColor(n.frenchFit)}">${n.frenchFit}/10</div>
        </div>
        <div style="flex:1;padding:12px 16px;border-right:1px solid #E3E1DA">
          <div style="font-size:9px;color:#6B7280;font-weight:700;text-transform:uppercase">Competition</div>
          <div style="font-size:18px;font-weight:700;color:${n.competition === "low" ? "#0E7A4E" : n.competition === "medium" ? "#B45309" : "#C0392B"}">${n.competition || "—"}</div>
        </div>
        <div style="flex:1;padding:12px 16px">
          <div style="font-size:9px;color:#6B7280;font-weight:700;text-transform:uppercase">Revenue Potential</div>
          <div style="font-size:14px;font-weight:700;color:#141B2E">${n.revenuePotential || "—"}</div>
        </div>
      </div>

      <!-- Content -->
      <div style="padding:16px 20px;background:#fff">

        ${n.verdict ? `<div style="margin-bottom:12px;padding:10px 14px;background:#E7F4EC;border-radius:8px;font-size:13px;color:#0E7A4E;font-weight:600">
          ✅ ${n.verdict}
        </div>` : ""}

        ${n.topCompetitor ? `
        <div style="margin-bottom:12px">
          <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;margin-bottom:6px">🔗 Top Competitor to Copy</div>
          <div style="font-size:13px;font-weight:700;color:#141B2E">${n.topCompetitor.name || "—"}</div>
          ${n.topCompetitor.url ? `<a href="${n.topCompetitor.url}" style="font-size:12px;color:#1971C2">${n.topCompetitor.url}</a>` : ""}
          ${n.topCompetitor.revenue ? `<div style="font-size:12px;color:#0E7A4E;font-weight:600;margin-top:2px">💰 ${n.topCompetitor.revenue}</div>` : ""}
          ${n.topCompetitor.weaknesses ? `<div style="font-size:11px;color:#C0392B;margin-top:4px">⚠ ${Array.isArray(n.topCompetitor.weaknesses) ? n.topCompetitor.weaknesses.slice(0,2).join(" • ") : n.topCompetitor.weaknesses}</div>` : ""}
        </div>` : ""}

        ${n.copyBlueprint ? `
        <div style="margin-bottom:12px">
          <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;margin-bottom:6px">📋 Copy Blueprint</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${n.copyBlueprint.timeToLaunch ? `<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:#F3F0FF;color:#6741D9;font-weight:600">⏱ ${n.copyBlueprint.timeToLaunch}</span>` : ""}
            ${n.copyBlueprint.totalCost ? `<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:#FFF3BF;color:#B45309;font-weight:600">💵 ${n.copyBlueprint.totalCost}</span>` : ""}
            ${n.copyBlueprint.firstRevenue ? `<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:#E7F4EC;color:#0E7A4E;font-weight:600">🎯 ${n.copyBlueprint.firstRevenue}</span>` : ""}
          </div>
          ${n.copyBlueprint.mvp ? `<div style="font-size:12px;color:#141B2E;margin-top:8px;line-height:1.5">${n.copyBlueprint.mvp}</div>` : ""}
        </div>` : ""}

        ${n.frenchMarket ? `
        <div style="margin-bottom:12px;padding:10px 14px;background:#E7F5FF;border-radius:8px">
          <div style="font-size:10px;font-weight:700;color:#1971C2;text-transform:uppercase;margin-bottom:4px">🇫🇷 French Market</div>
          ${n.frenchMarket.primaryCountry ? `<div style="font-size:12px;color:#141B2E;margin-bottom:4px">Start in: <strong>${n.frenchMarket.primaryCountry}</strong></div>` : ""}
          ${n.frenchMarket.priceXOF ? `<div style="font-size:12px;color:#141B2E;margin-bottom:4px">Price: <strong>${n.frenchMarket.priceXOF} FCFA</strong> (${n.frenchMarket.priceEUR || "—"})</div>` : ""}
          ${n.frenchMarket.quickWin ? `<div style="font-size:12px;color:#0E7A4E;font-weight:600">→ ${n.frenchMarket.quickWin}</div>` : ""}
        </div>` : ""}

        ${n.marketingAngle ? `
        <div>
          <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;margin-bottom:6px">📣 Marketing Angle</div>
          <div style="font-size:13px;font-style:italic;color:#141B2E">"${n.marketingAngle}"</div>
        </div>` : ""}

      </div>

      <!-- CTA -->
      <div style="padding:12px 20px;background:#F9F8F5;border-top:1px solid #E3E1DA;text-align:center">
        <a href="${PLATFORM_URL}" style="display:inline-block;padding:10px 24px;background:#141B2E;color:#fff;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">
          Open in Platform →
        </a>
      </div>
    </div>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9F8F5;font-family:-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:28px;margin-bottom:8px">🚀</div>
      <h1 style="font-size:22px;font-weight:800;color:#141B2E;margin:0 0 4px">Weekly Research Report</h1>
      <div style="font-size:13px;color:#6B7280">${date} · Revenue Engine Auto-Research</div>
    </div>

    <!-- Summary bar -->
    <div style="background:#141B2E;color:#fff;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;opacity:.6;text-transform:uppercase">This week</div>
        <div style="font-size:18px;font-weight:700;margin-top:2px">${niches.length} niches researched</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;opacity:.6">Top score</div>
        <div style="font-size:24px;font-weight:800;color:#4ADE80">${Math.max(...niches.map(n => n.platformScore || 0))}/100</div>
      </div>
    </div>

    <!-- Recommendation -->
    ${niches[0] ? `
    <div style="background:#E7F4EC;border:2px solid #0E7A4E;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <div style="font-size:11px;font-weight:700;color:#0E7A4E;text-transform:uppercase;margin-bottom:4px">⭐ This Week's Top Pick</div>
      <div style="font-size:18px;font-weight:800;color:#141B2E">${niches[0].niche}</div>
      <div style="font-size:13px;color:#0E7A4E;margin-top:4px">Score: ${niches[0].platformScore}/100 · French fit: ${niches[0].frenchFit}/10 · ${niches[0].competition} competition</div>
      <div style="font-size:12px;color:#141B2E;margin-top:8px">→ Your action today: Visit ${niches[0].topCompetitor?.url || "the platform"} and sign up for their email list</div>
    </div>` : ""}

    <!-- Niche cards -->
    ${nicheCards}

    <!-- Footer -->
    <div style="text-align:center;padding:20px;font-size:11px;color:#6B7280">
      <div>Generated automatically every Monday at 7:00 AM</div>
      <div style="margin-top:4px"><a href="${PLATFORM_URL}" style="color:#1971C2">Open Revenue Engine</a></div>
    </div>

  </div>
</body>
</html>`;
}

// ── Main cron handler ─────────────────────────────────────────────────────────
export default {
  async scheduled(event, env, ctx) {
    console.log("[weekly-research] Starting Monday research automation...");
    const date = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    try {
      // ── Step 1: Get 10 trending niche suggestions ───────────────────────────
      console.log("[weekly-research] Getting niche suggestions...");
      const suggestions = await callAI(env,
        "You are a market trend analyst. Suggest trending niches across ALL business types including physical products, digital products, mobile apps, services, courses. JSON only.",
        `Search Google Trends, Exploding Topics, Product Hunt, Minea, Etsy Trending, App Store Top Charts and IndieHackers to find 6 high-opportunity niches RIGHT NOW.

Return a MIX: 1 physical product, 1 digital product, 1 mobile app, 1 service, 1 course, 1 web app.
For each identify a real winning product already making money.

Return JSON: {"niches":[{
  "niche":"short niche name",
  "businessType":"physical_product|digital_product|mobile_app|service|course|web_app",
  "why":"why hot right now",
  "signal":"specific trending signal",
  "competition":"low|medium|high",
  "revenuePotential":"e.g. $50K-$200K/mo",
  "winningExample":"real product name already winning"
}]}
Return exactly 6 niches.`, true, "suggest");

      const niches = suggestions?.niches || [];
      if (!niches.length) throw new Error("No niches returned from suggestion agent");
      console.log(`[weekly-research] Got ${niches.length} suggestions`);

      // ── Step 2: Research top 3 niches in parallel ───────────────────────────
      const top3 = niches.slice(0, 3);
      console.log("[weekly-research] Researching top 3 niches...");

      const researched = await Promise.all(top3.map(async (n) => {
        try {
          // Score the niche
          const scorer = await callAI(env,
            "You are the Niche Scorer. Score market opportunities. JSON only.",
            `Score "${n.niche}" niche. Search Google Trends, Reddit, Product Hunt.
Return JSON: {"overallScore":75,"verdict":"promising","verdictReason":"one sentence"}`,
            true, "scorer");

          // Find competitor with URL
          const scout = await callAI(env,
            "You are the Scout Agent. Find real competitors with verified URLs. JSON only.",
            `Find the top competitor for "${n.niche}". Search IndieHackers, Starter Story, Product Hunt, Etsy, Gumroad.
Return JSON: {"products":[{"name":"","url":"","mrr":"","weaknesses":["",""],"adActivity":"low|medium|high"}]}`,
            true, "scout");

          // French market fit
          const frenchfit = await callAI(env,
            "You are the Francophone West Africa Market Analyst. JSON only.",
            `Assess "${n.niche}" for French-speaking markets (France, Senegal, Côte d'Ivoire, Quebec, Morocco).
Return JSON: {"fitScore":8,"overallFit":"good","primaryCountry":"France","whyThisCountry":"reason","recommendedPriceXOF":"15000","recommendedPriceEUR":"€23","quickWin":"first action to take","biggestRisk":"main risk"}`,
            true, "frenchfit");

          // Copy blueprint summary
          const blueprint = await callAI(env,
            "You are the Copy Blueprint Agent. JSON only.",
            `Give a quick blueprint to copy "${n.niche}" for the French market.
Return JSON: {"timeToLaunch":"2 weeks","totalCost":"$150","firstRevenueIn":"1 week","mvpDescription":"what to build","marketingAngle":"core message in French"}`,
            false, "copyhow");

          const competitor = scout?.products?.[0];

          return {
            niche: n.niche,
            businessType: n.businessType,
            competition: n.competition,
            revenuePotential: n.revenuePotential,
            winningExample: n.winningExample,
            platformScore: scorer?.overallScore || 0,
            verdict: scorer?.verdictReason,
            frenchFit: frenchfit?.fitScore || 0,
            topCompetitor: competitor ? {
              name: competitor.name,
              url: competitor.url,
              revenue: competitor.mrr,
              weaknesses: competitor.weaknesses,
            } : null,
            frenchMarket: frenchfit ? {
              primaryCountry: frenchfit.primaryCountry,
              priceXOF: frenchfit.recommendedPriceXOF,
              priceEUR: frenchfit.recommendedPriceEUR,
              quickWin: frenchfit.quickWin,
            } : null,
            copyBlueprint: blueprint ? {
              timeToLaunch: blueprint.timeToLaunch,
              totalCost: blueprint.totalCost,
              firstRevenue: blueprint.firstRevenueIn,
              mvp: blueprint.mvpDescription,
            } : null,
            marketingAngle: blueprint?.marketingAngle,
          };
        } catch (e) {
          console.error(`[weekly-research] Error researching ${n.niche}:`, e.message);
          return { niche: n.niche, platformScore: 0, frenchFit: 0, error: e.message };
        }
      }));

      // ── Step 3: Sort by combined score ─────────────────────────────────────
      const ranked = researched
        .filter(n => !n.error)
        .sort((a, b) => (b.platformScore + b.frenchFit * 5) - (a.platformScore + a.frenchFit * 5));

      console.log(`[weekly-research] Ranked ${ranked.length} niches`);

      // ── Step 4: Save to KV ──────────────────────────────────────────────────
      const reportKey = `re_weekly_report_${new Date().toISOString().split("T")[0]}`;
      await env.RE_SESSIONS.put(reportKey, JSON.stringify({
        date,
        niches: ranked,
        generatedAt: new Date().toISOString(),
      }), { expirationTtl: 2592000 }); // 30 days
      console.log(`[weekly-research] Saved report to KV: ${reportKey}`);

      // ── Step 5: Send email ──────────────────────────────────────────────────
      const subject = `🚀 Weekly Research: ${ranked[0]?.niche || "Top niches"} scores ${ranked[0]?.platformScore || 0}/100`;
      const html = buildEmailHTML(date, ranked);
      await sendEmail(env, subject, html);
      console.log("[weekly-research] Email sent successfully");

    } catch (e) {
      console.error("[weekly-research] Fatal error:", e.message);
      // Send error notification
      await sendEmail(env,
        "⚠️ Revenue Engine Weekly Research Failed",
        `<p>The weekly research automation failed on ${new Date().toISOString()}.</p><p>Error: ${e.message}</p><p><a href="${PLATFORM_URL}">Open platform to run manually</a></p>`
      );
    }
  }
};
