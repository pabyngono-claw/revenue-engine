import { useState, useRef, useEffect } from "react";
import { Search, TrendingUp, CheckCircle2, Circle, Loader2, AlertTriangle, Users, Rocket, BarChart3, ArrowRight, RefreshCw, Play, Bot, ChevronDown, ChevronUp, Database, Trash2, PauseCircle, Globe } from "lucide-react";

const INK = "#141B2E";
const PAPER = "#FAFAF7";
const MONEY = "#0E7A4E";
const MONEY_BG = "#E7F4EC";
const SIGNAL = "#B45309";
const SIGNAL_BG = "#FDF3E3";
const LINE = "#E3E1DA";
const MUTED = "#6B7280";
const DANGER = "#C0392B";
const DANGER_BG = "#FDECEC";

const PHASES = [
  { id: 1, name: "Intelligence sweep", window: "Days 1-3", icon: Search, tasks: ["Identify 2-3 products already earning $50K-$200K/month in the niche", "Map every community they target (subreddits, FB groups, X, Discord, YouTube)", "Collect viral posts that surface frustration or workarounds", "Shortlist the single best product to attack"] },
  { id: 2, name: "Pain & gap analysis", window: "Days 4-6", icon: AlertTriangle, tasks: ["Pull negative reviews (G2, Capterra, Trustpilot, App Store, Reddit)", "Pull community pain posts and merge into one master list", "Cluster complaints into feature categories", "Weight by willingness-to-pay signals (cancelled, switched, would pay for)", "Lock the top 3 gaps as core differentiators"] },
  { id: 3, name: "Pre-build validation", window: "Days 7-14", icon: Users, tasks: ["Launch landing page with real pricing + waitlist", "Post in mapped communities as building this, want early access", "Reach 200+ interested signups", "Run 5-10 direct user conversations", "Collect pre-orders or deposits"] },
  { id: 4, name: "Rapid MVP build", window: "Weeks 3-6", icon: Rocket, tasks: ["Build core value loop + top 2 differentiators only", "Replicate validated UX patterns from the competitor", "Invite waitlist to closed beta", "Fix the 2 highest-friction beta complaints", "First paying users live"] },
  { id: 5, name: "Distribution & scale", window: "Weeks 7-16", icon: TrendingUp, tasks: ["Enter every marketing channel the competitor uses", "Lead all messaging with differentiators, not features", "Activate waitlist users to post genuine results", "Launch affiliate / referral program", "Hit milestones: $10K MRR wk 8, $50K wk 12, $100K wk 16"] },
];

const AGENTS = [
  { id: "scorer",     name: "Niche scorer",      label: "Pre-flight", role: "Scores niche using Google Trends, Exploding Topics, TrendTrack, Minea, Flippa, Gumroad, X",       icon: "⭐", color: "#6741D9", bg: "#F3F0FF" },
  { id: "scout",      name: "Scout",             label: "Agent 1",    role: "Finds products via IndieHackers, TrendTrack, Winning Hunter, USADrop, Everbee, AppMagic, Flippa", icon: "🔍", color: "#3B5BDB", bg: "#EDF2FF" },
  { id: "analyst",    name: "Analyst",           label: "Agent 2",    role: "Mines G2, Capterra, Reddit, Winning Hunter, Minea ad comments, TrendTrack, Sensor Tower for gaps",        icon: "🎯", color: MONEY,     bg: MONEY_BG },
  { id: "pricing",    name: "Pricing",           label: "Agent 3",    role: "Researches pricing via SaaSHub, Baremetrics Open, AppMagic, Minea ads, Flippa",          icon: "💰", color: "#2F9E44", bg: "#EBFBEE" },
  { id: "strategist", name: "Strategist",        label: "Agent 4",    role: "Builds blueprint using SimilarWeb traffic data, BuiltWith stack, Wayback Machine",       icon: "🧠", color: "#6741D9", bg: "#F3F0FF" },
  { id: "validator",  name: "Validator",         label: "Agent 5",    role: "Gates pipeline using Google Trends, Crunchbase, Minea ad volume, community sizes",       icon: "✅", color: "#0C8599", bg: "#E3FAFC", gate: true },
  { id: "legal",      name: "Legal",             label: "Agent 6",    role: "Checks GDPR.eu, FTC.gov, ICO.org.uk compliance and free templates",                      icon: "⚖️", color: "#862E9C", bg: "#F8F0FC" },
  { id: "builder",    name: "Builder",           label: "Agent 7",    role: "Specs tech stack using BuiltWith, Stackshare, GitHub boilerplates",                      icon: "⚙️", color: SIGNAL,    bg: SIGNAL_BG },
  { id: "qa",         name: "QA",                label: "Agent 8",    role: "Defines test plan from OWASP Top 10, Google Lighthouse, Core Web Vitals",                icon: "🧪", color: "#C2255C", bg: "#FFF0F6" },
  { id: "seo",        name: "SEO",               label: "Agent 9",    role: "Finds keywords via Ubersuggest, AnswerThePublic, eRank, Merch Titans, SpyFu",            icon: "📈", color: "#0C8599", bg: "#E3FAFC" },
  { id: "marketing",  name: "Marketing",         label: "Agent 10",   role: "Writes copy from Facebook Ad Library, Minea, TikTok Creative Center, Google Ads",       icon: "📣", color: "#C2255C", bg: "#FFF0F6" },
  { id: "cs",         name: "Customer success",  label: "Agent 11",   role: "Builds onboarding from G2 onboarding reviews, App Store, UserOnboard teardowns",         icon: "🤝", color: MONEY,     bg: MONEY_BG },
  { id: "distributor",name: "Distributor",       label: "Agent 12",   role: "Maps distribution from SimilarWeb, Minea, Facebook Groups, Flippa, TikTok",              icon: "🚀", color: "#2F9E44", bg: "#EBFBEE" },
  { id: "finance",    name: "Finance",           label: "Agent 13",   role: "Models financials from Baremetrics Open, Flippa multiples, AppMagic, Sensor Tower",      icon: "📊", color: "#3B5BDB", bg: "#EDF2FF" },
  { id: "forecast",   name: "Trend forecast",    label: "Agent 14",   role: "Predicts where demand is going in 6-18 months using trends, hiring, GitHub, patents, regulation", icon: "🔮", color: "#6741D9", bg: "#F3F0FF" },
  { id: "distro",     name: "Distribution intel",label: "Agent 15",   role: "Reverse-engineers exactly how the competitor grew — referral loops, viral mechanics, cold outreach", icon: "🧲", color: "#C2255C", bg: "#FFF0F6" },
  { id: "moat",       name: "Moat designer",     label: "Agent 16",   role: "Designs defensibility — network effects, switching costs, data moats, ecosystem lock-in",           icon: "🏰", color: "#862E9C", bg: "#F8F0FC" },
  { id: "execrisk",   name: "Execution risk",    label: "Agent 17",   role: "Scores technical, sales, regulatory, support, and capital risk with an overall execution score",    icon: "⚠️", color: SIGNAL,    bg: SIGNAL_BG },
  { id: "psychol",    name: "Customer psychology",label: "Agent 19",  role: "Maps emotional triggers, buying motivations, objections, urgency and trust barriers",   icon: "🧬", color: "#6741D9", bg: "#F3F0FF" },
  { id: "oppscore",   name: "Opportunity score", label: "Agent 20",   role: "Computes a weighted 0-100 score across 12 dimensions — the final go/no-go verdict",                icon: "🏆", color: MONEY,     bg: MONEY_BG },
];

const ALL_SOURCES = [
  { agent: "Pre-flight: Niche Scorer", color: "#6741D9", bg: "#F3F0FF", sources: [
    { name: "Google Trends", url: "trends.google.com", what: "12-month trajectory", cost: "Free" },
    { name: "Exploding Topics", url: "explodingtopics.com", what: "Trending before peak", cost: "Free" },
    { name: "Reddit", url: "reddit.com", what: "Community demand", cost: "Free" },
    { name: "Hacker News", url: "news.ycombinator.com", what: "Tech excitement", cost: "Free" },
    { name: "Product Hunt", url: "producthunt.com", what: "Launch signals", cost: "Free" },
    { name: "X / Twitter", url: "x.com", what: "Viral conversations", cost: "Free" },
    { name: "Facebook Groups", url: "facebook.com/groups", what: "Community sizes", cost: "Free" },
    { name: "Gumroad Discover", url: "gumroad.com/discover", what: "Products already selling", cost: "Free" },
    { name: "Flippa", url: "flippa.com", what: "Business sale prices", cost: "Free" },
    { name: "Minea", url: "minea.com", what: "Ad activity across FB/TT/Pinterest", cost: "Free tier" },
  ]},
  { agent: "Agent 1: Scout", color: "#3B5BDB", bg: "#EDF2FF", sources: [
    { name: "IndieHackers", url: "indiehackers.com/products", what: "Verified MRR from founders", cost: "Free" },
    { name: "Starter Story", url: "starterstory.com", what: "Revenue-verified interviews", cost: "Free" },
    { name: "Product Hunt", url: "producthunt.com", what: "Top-voted products", cost: "Free" },
    { name: "Crunchbase", url: "crunchbase.com", what: "Funded companies", cost: "Free tier" },
    { name: "AppSumo", url: "appsumo.com", what: "Deal volume signals", cost: "Free" },
    { name: "SaaSHub", url: "saashub.com", what: "Product comparisons", cost: "Free" },
    { name: "Gumroad Discover", url: "gumroad.com/discover", what: "Live download count", cost: "Free" },
    { name: "Flippa", url: "flippa.com", what: "Verified listed revenue", cost: "Free" },
    { name: "AppMagic", url: "appmagic.rocks", what: "Mobile app revenue data", cost: "Free tier" },
    { name: "Sensor Tower", url: "sensortower.com", what: "App download trends", cost: "Free tier" },
    { name: "Minea", url: "minea.com", what: "High ad spend = high revenue", cost: "Free tier" },
    { name: "Facebook Ad Library", url: "facebook.com/ads/library", what: "Ad longevity signals profit", cost: "Free" },
    { name: "eRank", url: "erank.com", what: "Marketplace search volume", cost: "Free plan" },
    { name: "Merch Titans", url: "merchtitans.com/tools/keywords", what: "Keyword demand, no signup", cost: "Free" },
    { name: "X / Twitter", url: "x.com", what: "Founders sharing revenue", cost: "Free" },
    { name: "TrendTrack", url: "trendtrack.io", what: "Real-time trend velocity, product discovery, competitor store tracking", cost: "Paid" },
    { name: "Winning Hunter", url: "winninghunter.com", what: "98% accurate competitor store tracking and ad creative intelligence", cost: "Paid" },
    { name: "USADrop", url: "usadrop.com/products", what: "Supplier catalog — confirm product availability, cost and margins", cost: "Free" },
    { name: "Everbee", url: "everbee.io", what: "Etsy-specific: 180M+ listings with estimated sales, revenue and keywords", cost: "Free plan" },
  ]},
  { agent: "Agent 2: Analyst", color: MONEY, bg: MONEY_BG, sources: [
    { name: "G2", url: "g2.com", what: "Structured 1-3 star reviews", cost: "Free" },
    { name: "Capterra", url: "capterra.com", what: "SMB negative reviews", cost: "Free" },
    { name: "Trustpilot", url: "trustpilot.com", what: "Consumer sentiment", cost: "Free" },
    { name: "Reddit", url: "reddit.com", what: "Raw unfiltered complaints", cost: "Free" },
    { name: "App Store / Google Play", url: "apps.apple.com", what: "Mobile review pain points", cost: "Free" },
    { name: "X / Twitter", url: "x.com", what: "Real-time complaints", cost: "Free" },
    { name: "Facebook Groups", url: "facebook.com/groups", what: "Frustrated user conversations", cost: "Free" },
    { name: "AppMagic", url: "appmagic.rocks", what: "Review sentiment over time", cost: "Free tier" },
    { name: "Sensor Tower", url: "sensortower.com", what: "Rating history analysis", cost: "Free tier" },
    { name: "Flippa", url: "flippa.com", what: "Due diligence reveals weaknesses", cost: "Free" },
    { name: "Minea ad comments", url: "minea.com", what: "Raw customer frustration", cost: "Free tier" },
    { name: "Facebook Ad Library", url: "facebook.com/ads/library", what: "Ad comments = feature requests", cost: "Free" },
  ]},
  { agent: "Agent 3: Pricing", color: "#2F9E44", bg: "#EBFBEE", sources: [
    { name: "G2 Pricing Pages", url: "g2.com", what: "User-verified pricing tiers", cost: "Free" },
    { name: "SaaSHub", url: "saashub.com", what: "Side-by-side comparisons", cost: "Free" },
    { name: "Baremetrics Open", url: "baremetrics.com/open", what: "Live MRR, ARPU, churn", cost: "Free" },
    { name: "IndieHackers", url: "indiehackers.com", what: "Founder pricing decisions", cost: "Free" },
    { name: "Reddit r/SaaS", url: "reddit.com/r/SaaS", what: "Willingness-to-pay threads", cost: "Free" },
    { name: "Gumroad Discover", url: "gumroad.com/discover", what: "One-time vs subscription split", cost: "Free" },
    { name: "AppMagic", url: "appmagic.rocks", what: "Revenue per download", cost: "Free tier" },
    { name: "Sensor Tower", url: "sensortower.com", what: "IAP and subscription data", cost: "Free tier" },
    { name: "Flippa", url: "flippa.com", what: "Revenue multiples", cost: "Free" },
    { name: "Minea", url: "minea.com", what: "Price points in winning ads", cost: "Free tier" },
    { name: "Facebook Ad Library", url: "facebook.com/ads/library", what: "Pricing language in ads", cost: "Free" },
  ]},
  { agent: "Agent 5: Validator (GATE)", color: "#0C8599", bg: "#E3FAFC", sources: [
    { name: "Google Trends", url: "trends.google.com", what: "Growing vs declining", cost: "Free" },
    { name: "Reddit community sizes", url: "reddit.com", what: "Audience proof", cost: "Free" },
    { name: "Crunchbase", url: "crunchbase.com", what: "VC funding = validated market", cost: "Free tier" },
    { name: "X / Twitter", url: "x.com", what: "Active conversation", cost: "Free" },
    { name: "G2 Grid", url: "g2.com/categories", what: "Category saturation", cost: "Free" },
    { name: "Product Hunt", url: "producthunt.com", what: "Recent launch frequency", cost: "Free" },
    { name: "Facebook Groups", url: "facebook.com/groups", what: "Total addressable community", cost: "Free" },
    { name: "Minea", url: "minea.com", what: "Active ad count = money being made", cost: "Free tier" },
    { name: "AppMagic", url: "appmagic.rocks", what: "Download trends", cost: "Free tier" },
    { name: "Sensor Tower", url: "sensortower.com", what: "App category growth", cost: "Free tier" },
    { name: "Gumroad Discover", url: "gumroad.com/discover", what: "100+ sales = proven demand", cost: "Free" },
    { name: "Flippa", url: "flippa.com", what: "Exits confirm acquirer interest", cost: "Free" },
    { name: "Facebook Ad Library", url: "facebook.com/ads/library", what: "Advertiser count = money made", cost: "Free" },
    { name: "TrendTrack", url: "trendtrack.io", what: "Niche trend phase — emergence vs growth vs saturation", cost: "Paid" },
    { name: "Winning Hunter", url: "winninghunter.com", what: "Revenue distribution across niche stores — spot opportunity", cost: "Paid" },
  ]},
  { agent: "Agent 6: Legal", color: "#862E9C", bg: "#F8F0FC", sources: [
    { name: "GDPR.eu", url: "gdpr.eu", what: "GDPR compliance guides", cost: "Free" },
    { name: "FTC.gov", url: "ftc.gov", what: "US consumer protection rules", cost: "Free" },
    { name: "ICO.org.uk", url: "ico.org.uk", what: "UK data protection guidance", cost: "Free" },
    { name: "PrivacyPolicies.com", url: "privacypolicies.com", what: "Free policy generator", cost: "Free" },
    { name: "Termly.io", url: "termly.io", what: "ToS and privacy templates", cost: "Free tier" },
  ]},
  { agent: "Agent 7: Builder", color: SIGNAL, bg: SIGNAL_BG, sources: [
    { name: "BuiltWith", url: "builtwith.com", what: "Competitor exact tech stack", cost: "Free" },
    { name: "Stackshare", url: "stackshare.io", what: "Battle-tested stacks", cost: "Free" },
    { name: "GitHub", url: "github.com", what: "Free boilerplates", cost: "Free" },
    { name: "IndieHackers", url: "indiehackers.com", what: "Founder stack recommendations", cost: "Free" },
  ]},
  { agent: "Agent 8: QA", color: "#C2255C", bg: "#FFF0F6", sources: [
    { name: "OWASP Top 10", url: "owasp.org", what: "Security testing checklist", cost: "Free" },
    { name: "Google Lighthouse", url: "developers.google.com/web/tools/lighthouse", what: "Performance and accessibility", cost: "Free" },
    { name: "WCAG 2.1", url: "w3.org/WAI/standards-guidelines/wcag", what: "Accessibility standard", cost: "Free" },
    { name: "Core Web Vitals", url: "web.dev/vitals", what: "LCP, FID, CLS targets", cost: "Free" },
  ]},
  { agent: "Agent 9: SEO", color: "#0C8599", bg: "#E3FAFC", sources: [
    { name: "Ubersuggest free", url: "neilpatel.com/ubersuggest", what: "Keyword volumes and difficulty", cost: "Free" },
    { name: "AnswerThePublic", url: "answerthepublic.com", what: "Questions people search", cost: "Free" },
    { name: "Google PAA", url: "google.com", what: "People Also Ask data", cost: "Free" },
    { name: "SpyFu free", url: "spyfu.com", what: "Competitor keywords", cost: "Free" },
    { name: "Google Trends", url: "trends.google.com", what: "Rising keyword variations", cost: "Free" },
    { name: "eRank", url: "erank.com", what: "Marketplace search volume", cost: "Free plan" },
    { name: "Merch Titans", url: "merchtitans.com/tools/keywords", what: "Keyword demand, no signup", cost: "Free" },
  ]},
  { agent: "Agent 10: Marketing", color: "#C2255C", bg: "#FFF0F6", sources: [
    { name: "Facebook Ad Library", url: "facebook.com/ads/library", what: "Every competitor ad — public", cost: "Free" },
    { name: "Minea", url: "minea.com", what: "Top creatives FB/TT/Pinterest", cost: "Free tier" },
    { name: "Google Ads Transparency", url: "adstransparency.google.com", what: "Competitor Google ads", cost: "Free" },
    { name: "SpyFu free", url: "spyfu.com", what: "PPC keywords and spend", cost: "Free" },
    { name: "TikTok Creative Center", url: "ads.tiktok.com/business/creativecenter", what: "Top TikTok ads by category", cost: "Free" },
    { name: "LinkedIn Ad Library", url: "linkedin.com/ad-library", what: "B2B competitor ads", cost: "Free" },
    { name: "Reddit", url: "reddit.com", what: "Upvoted posts = best copy", cost: "Free" },
    { name: "X / Twitter", url: "x.com", what: "Viral content formats", cost: "Free" },
    { name: "Gumroad", url: "gumroad.com", what: "Copy that converts on marketplace", cost: "Free" },
    { name: "eRank", url: "erank.com", what: "High-traffic keywords for headlines", cost: "Free plan" },
    { name: "Merch Titans", url: "merchtitans.com/tools/keywords", what: "Keyword volume for copy", cost: "Free" },
    { name: "Winning Hunter", url: "winninghunter.com", what: "Ad creative intelligence — hooks and visual formats that convert", cost: "Paid" },
    { name: "TrendTrack", url: "trendtrack.io", what: "Which ad creatives in niche are scaling right now", cost: "Paid" },
  ]},
  { agent: "Agent 11: Customer Success", color: MONEY, bg: MONEY_BG, sources: [
    { name: "G2 onboarding reviews", url: "g2.com", what: "Competitor onboarding complaints", cost: "Free" },
    { name: "App Store reviews", url: "apps.apple.com", what: "Setup and tutorial complaints", cost: "Free" },
    { name: "Reddit", url: "reddit.com", what: "New user struggles", cost: "Free" },
    { name: "UserOnboard", url: "useronboard.com", what: "Onboarding teardowns", cost: "Free" },
  ]},
  { agent: "Agent 12: Distributor", color: "#2F9E44", bg: "#EBFBEE", sources: [
    { name: "SimilarWeb free", url: "similarweb.com", what: "Traffic source breakdown", cost: "Free" },
    { name: "Facebook Ad Library", url: "facebook.com/ads/library", what: "Which channels competitor pays for", cost: "Free" },
    { name: "Minea", url: "minea.com", what: "Best channels and creatives", cost: "Free tier" },
    { name: "SpyFu free", url: "spyfu.com", what: "Google Ads spend estimate", cost: "Free" },
    { name: "YouTube search", url: "youtube.com", what: "Niche influencers", cost: "Free" },
    { name: "X / Twitter", url: "x.com", what: "Influential voices", cost: "Free" },
    { name: "Facebook Groups", url: "facebook.com/groups", what: "Community sizes", cost: "Free" },
    { name: "AppMagic", url: "appmagic.rocks", what: "Which app stores drive downloads", cost: "Free tier" },
    { name: "Sensor Tower", url: "sensortower.com", what: "ASO keyword rankings", cost: "Free tier" },
    { name: "Flippa", url: "flippa.com", what: "Traffic channel breakdown in listings", cost: "Free" },
    { name: "TikTok Creative Center", url: "ads.tiktok.com/business/creativecenter", what: "TikTok trending content", cost: "Free" },
    { name: "Gumroad", url: "gumroad.com", what: "How top sellers drive traffic", cost: "Free" },
  ]},
  { agent: "Agent 13: Finance", color: "#3B5BDB", bg: "#EDF2FF", sources: [
    { name: "Baremetrics Open", url: "baremetrics.com/open", what: "Live MRR, churn, ARPU", cost: "Free" },
    { name: "IndieHackers", url: "indiehackers.com", what: "Real MRR growth timelines", cost: "Free" },
    { name: "Flippa sold listings", url: "flippa.com", what: "Revenue multiples and exits", cost: "Free" },
    { name: "AppMagic", url: "appmagic.rocks", what: "Mobile market revenue size", cost: "Free tier" },
    { name: "Sensor Tower", url: "sensortower.com", what: "App category revenue benchmarks", cost: "Free tier" },
    { name: "Gumroad Discover", url: "gumroad.com/discover", what: "Revenue from count x price", cost: "Free" },
    { name: "X / Twitter", url: "x.com", what: "Founders sharing MRR publicly", cost: "Free" },
  ]},
  { agent: "Agent 19: Customer Psychology", color: "#6741D9", bg: "#F3F0FF", sources: [
    { name: "Reddit", url: "reddit.com", what: "Why people bought — emotional language, trigger moments", cost: "Free" },
    { name: "G2 + Capterra reviews", url: "g2.com", what: "Emotional words: finally, relief, stressed, embarrassed", cost: "Free" },
    { name: "Facebook Groups", url: "facebook.com/groups", what: "Language patterns when describing pain", cost: "Free" },
    { name: "X / Twitter wins", url: "x.com", what: "What success looks like when users share it", cost: "Free" },
    { name: "Trustpilot", url: "trustpilot.com", what: "Emotional story of disappointment vs delight", cost: "Free" },
    { name: "YouTube comments", url: "youtube.com", what: "What tutorial viewers say they struggle with emotionally", cost: "Free" },
    { name: "App Store reviews", url: "apps.apple.com", what: "Emotional triggers in mobile reviews", cost: "Free" },
  ]},
];

// ── KV-BACKED STORAGE — persists across sessions and devices ─────────────────
async function kvPost(body) {
  try {
    const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return await res.json();
  } catch (e) { console.error("KV error:", e); return null; }
}

async function loadSessions() {
  const r = await kvPost({ _loadSessions: true });
  return r?.sessions || [];
}

async function saveSession(s) {
  // Save full session to KV
  await kvPost({ _saveToKV: true, _sessionData: s });
  // Also save to Google Sheets
  try { await kvPost({ _saveToSheets: true, _sessionData: s }); } catch {}
}

async function loadFullSession(id) {
  const r = await kvPost({ _loadSession: true, _sessionId: id });
  return r?.session || null;
}

async function deleteSession(id) {
  await kvPost({ _deleteSession: true, _sessionId: id });
}

async function callAI(system, user, useSearch) {
  const body = { model: "claude-sonnet-4-6", max_tokens: 1500, system, messages: [{ role: "user", content: user }] };
  if (useSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "API error");
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  const clean = text.replace(/```json|```/g, "").trim();
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("No JSON returned");
  return JSON.parse(clean.slice(s, e + 1));
}

const delay = ms => new Promise(r => setTimeout(r, ms));
const payColor = s => s === "high" ? { c: MONEY, bg: MONEY_BG } : s === "medium" ? { c: SIGNAL, bg: SIGNAL_BG } : { c: MUTED, bg: "#F1F0EC" };

export default function App() {
  const [tab, setTab] = useState("agents");
  const [niche, setNiche] = useState("");
  const [running, setRunning] = useState(false);
  const [gated, setGated] = useState(false);
  const [states, setStates] = useState(() => Object.fromEntries(AGENTS.map(a => [a.id, "idle"])));
  const [logs,   setLogs]   = useState(() => Object.fromEntries(AGENTS.map(a => [a.id, []])));
  const [open,   setOpen]   = useState(() => Object.fromEntries(AGENTS.map(a => [a.id, true])));
  const [results, setResults] = useState({});
  const [error,   setError]   = useState(null);
  const [done,    setDone]    = useState({});
  const [mrr,     setMrr]     = useState(0);
  const [mrrIn,   setMrrIn]   = useState("");
  const [sessions, setSessions] = useState([]);
  const [dbReady,  setDbReady]  = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [intelView, setIntelView] = useState("validate");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [rerunStatus, setRerunStatus] = useState({}); // sessionId -> {running, changes, lastChecked}
  const [rerunQueue, setRerunQueue] = useState([]); // sessions queued for check
  const [enabledAgents, setEnabledAgents] = useState(() =>
    Object.fromEntries(AGENTS.map(a => [a.id, true]))
  ); // which agents are active in the workflow
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [activeSources, setActiveSources] = useState(null); // null = all enabled (loaded from KV)
  const [editingSources, setEditingSources] = useState(false);
  const [customSources, setCustomSources] = useState([]); // user-added sources
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState({ name:"", url:"", what:"", cost:"Free", agent:"Pre-flight: Niche Scorer" });
  const [editingSourceId, setEditingSourceId] = useState(null); // url of source being edited
  const [outcomes, setOutcomes] = useState({}); // sessionId -> {built, mrr, notes, date}
  const [outcomeWeights, setOutcomeWeights] = useState({ // learned weights 0-1
    marketSize:0.10, growthRate:0.10, customerPain:0.15, competition:0.10,
    pricingPower:0.10, cacDifficulty:0.10, retentionPotential:0.10,
    virality:0.05, seoOpportunity:0.05, aiDefensibility:0.05,
    technicalComplexity:0.05, regulatoryRisk:0.05
  }); // "competitor" | "product"
  const [checkpoint, setCheckpoint] = useState(null); // holds oppscore result waiting for human decision
  const [learningInsights, setLearningInsights] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const abort = useRef(false);
  const sid   = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    loadSessions().then(s => { setSessions(s); setDbReady(true); });
    computeInsights().then(i => setLearningInsights(i));
    loadActiveSources().then(s => { if (s) setActiveSources(s); });
    loadCustomSources().then(s => setCustomSources(s));
    loadOutcomes().then(o => setOutcomes(o));
    loadWeights().then(w => { if (w) setOutcomeWeights(w); });
    // Seed synthetic outcomes if < 10 real ones
    loadOutcomes().then(async o => {
      setOutcomes(o);
      await seedSyntheticOutcomes(o);
    });
    // Load rerun log
    kvPost({ _loadLearning: true, _key: "re_rerun_log_v1" }).then(r => {
      if (r?.learning) {
        const status = {};
        Object.entries(r.learning).forEach(([sid, log]) => {
          status[sid] = { running: false, changes: log.changes, lastChecked: new Date(log.checkedAt).toLocaleString() };
        });
        setRerunStatus(status);
      }
    });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const setState = (id, s) => setStates(p => ({ ...p, [id]: s }));
  const addLog   = (id, m) => setLogs(p => ({ ...p, [id]: [...p[id], { t: new Date().toLocaleTimeString(), m }] }));
  const setR     = (id, d) => setResults(p => ({ ...p, [id]: d }));

  const resetAll = () => {
    setResults({}); setError(null); setGated(false); setCheckpoint(null);
    setStates(Object.fromEntries(AGENTS.map(a => [a.id, "idle"])));
    setLogs(Object.fromEntries(AGENTS.map(a => [a.id, []])));
    abort.current = false;
    sid.current = Date.now().toString();
  };

  const suggestNiches = async () => {
    setSuggesting(true); setSuggestions([]);
    try {
      const data = await callAI(
        "You are a market trend analyst. Suggest trending niches for a bootstrapped SaaS. JSON only.",
        `Search Google Trends, Exploding Topics, Product Hunt, Minea, and IndieHackers to find 5 trending niches RIGHT NOW that have strong monetization signals, growing communities, and are underserved by existing tools.

Return JSON: {"niches":[{"niche":"short niche name e.g. AI resume builders","why":"one sentence why it's hot right now","signal":"the specific trending signal found","monthlySearchGrowth":"e.g. +40% in 6 months","competitionLevel":"low|medium|high","estimatedRevenuePotential":"e.g. $50K-$200K/mo"}]}
Return exactly 5 niches ordered by opportunity score.`, true
      );
      setSuggestions(data.niches || []);
    } catch (e) { setError("Could not fetch suggestions: " + e.message); }
    setSuggesting(false);
  };

  // ── CONTINUOUS LEARNING LAYER ─────────────────────────────────────────────
  const loadLearning = async (key) => {
    const r = await kvPost({ _loadLearning: true, _key: key || "learning" });
    return r?.learning || (key ? null : []);
  };

  const saveLearning = async (session) => {
    try {
      let all = await loadLearning();
      all.unshift({
        id: session.id,
        date: session.date,
        niche: session.niche,
        nicheScore: session.results?.scorer?.overallScore,
        verdict: session.results?.scorer?.verdict,
        demandScore: session.results?.validator?.demandScore,
        competitionScore: session.results?.validator?.competitionScore,
        trendDirection: session.results?.validator?.trendDirection,
        viability: session.results?.validator?.overallViability,
        gateDecision: session.results?.validator?.gateDecision,
        opportunityScore: session.results?.oppscore?.totalWeightedScore,
        grade: session.results?.oppscore?.grade,
        recommendation: session.results?.oppscore?.recommendation,
        primaryMoat: session.results?.moat?.primaryMoat,
        execScore: session.results?.execrisk?.overallExecutionScore,
        forecastScore: session.results?.forecast?.forecastScore,
        status: session.status,
      });
      await kvPost({ _saveLearning: true, _key: 'learning', _learningData: all.slice(0, 100) });
    } catch (e) { console.error("Learning save failed", e); }
  };

  // ── AUTOMATED RE-RUN & CHANGE DETECTION ─────────────────────────────────
  const RERUN_KEY = "re_rerun_log_v1";

  const checkForChanges = async (session) => {
    if (!session?.niche || !session?.results?.scorer) return null;
    const sid = session.id;
    setRerunStatus(p => ({ ...p, [sid]: { running: true, changes: null, lastChecked: null } }));
    try {
      // Run a lightweight 3-signal check: Trend, Demand, Competitor ad activity
      const check = await callAI(
        "You are a change detection agent. Compare current market signals to stored baseline. Return ONLY JSON.",
        `Check for significant market changes in "${session.niche}" since ${session.date}.

Previous baseline signals:
- Niche score: ${session.nicheScore}/50
- Trend direction: ${session.results.validator?.trendDirection || "unknown"}
- Demand score: ${session.results.validator?.demandScore || "unknown"}/10  
- Ad activity: ${session.results.validator?.adActivity || "unknown"}
- Opportunity score: ${session.results.oppscore?.totalWeightedScore || "unknown"}/100
- Primary competitor: ${session.results.scout?.products?.[0]?.name || "unknown"}

Search Google Trends, Reddit, Facebook Ad Library, and Minea RIGHT NOW for "${session.niche}".

Detect if ANY of these changed significantly (>20% shift):
1. Search trend direction (growing/stable/declining)
2. Community activity level (more or fewer posts)  
3. Competitor ad volume (more or fewer ads)
4. New major entrants in the market
5. Regulatory or AI disruption news

Return JSON: {
  "changesDetected": true,
  "changeScore": 0,
  "signals": [
    {"signal":"trend direction","previous":"${session.results.validator?.trendDirection}","current":"growing|stable|declining","changed":true,"severity":"high|medium|low"}
  ],
  "summary": "2 sentence summary of what changed",
  "recommendation": "rerun|monitor|ignore",
  "recommendationReason": "why"
}`, true
      );

      // Save to rerun log
      const logRaw = await kvPost({ _loadLearning: true, _key: RERUN_KEY });
      const log = logRaw?.learning || {};
      log[sid] = {
        checkedAt: new Date().toISOString(),
        changes: check,
        previousScore: session.nicheScore,
        niche: session.niche,
      };
      await kvPost({ _saveLearning: true, _key: RERUN_KEY, _learningData: log });
      setRerunStatus(p => ({
        ...p,
        [sid]: { running: false, changes: check, lastChecked: new Date().toLocaleString() }
      }));
      return check;
    } catch (e) {
      setRerunStatus(p => ({ ...p, [sid]: { running: false, changes: null, lastChecked: "Error: "+e.message } }));
      return null;
    }
  };

  const checkAllSessions = async () => {
    const all = await loadSessions();
    const completeSessions = all.filter(s => s.status === "complete");
    for (const s of completeSessions.slice(0, 5)) { // max 5 at a time
      const full = await loadFullSession(s.id);
      if (full) await checkForChanges({ ...s, results: full.results });
      await new Promise(r => setTimeout(r, 1500)); // rate limit
    }
  };

  // ── SYNTHETIC OUTCOMES FOR WEIGHT LEARNING ──────────────────────────────
  // Seeds the weight engine with synthetic outcomes derived from scores
  // until real outcomes reach 50+. Uses statistical patterns from SaaS research.
  const seedSyntheticOutcomes = async (allOutcomes) => {
    const realCount = Object.values(allOutcomes).filter(o => o.built !== undefined).length;
    if (realCount >= 10) return; // enough real data, skip synthetic

    const allSess = await loadSessions();
    const completeSess = allSess.filter(s => s.status === "complete" && s.results?.oppscore);

    // Industry priors from SaaS research:
    // - Products scoring 70+ have ~35% chance of reaching $10K MRR
    // - Products scoring 50-69 have ~15% chance
    // - Products scoring <50 have ~5% chance
    // We inject these as synthetic data points to stabilise early weight learning

    const synthetic = {};
    completeSess.forEach(s => {
      if (allOutcomes[s.id]?.built !== undefined) return; // skip if real data exists
      const score = s.results?.oppscore?.totalWeightedScore || 0;
      const rand = Math.random();
      let syntheticBuilt, syntheticMrr;
      if (score >= 70) {
        syntheticBuilt = rand < 0.6; // 60% modelled as built
        syntheticMrr = syntheticBuilt ? (rand < 0.35 ? Math.round(10000 + rand * 90000) : Math.round(rand * 9000)) : 0;
      } else if (score >= 50) {
        syntheticBuilt = rand < 0.4;
        syntheticMrr = syntheticBuilt ? (rand < 0.15 ? Math.round(10000 + rand * 40000) : Math.round(rand * 8000)) : 0;
      } else {
        syntheticBuilt = rand < 0.2;
        syntheticMrr = syntheticBuilt ? (rand < 0.05 ? Math.round(10000 + rand * 20000) : Math.round(rand * 5000)) : 0;
      }
      synthetic[s.id] = { built: syntheticBuilt, mrr: syntheticMrr, synthetic: true, addedAt: new Date().toISOString() };
    });

    if (Object.keys(synthetic).length > 0) {
      const merged = { ...synthetic, ...allOutcomes }; // real data overrides synthetic
      await recomputeWeights(merged);
    }
  };

  // ── SOURCE MANAGEMENT ─────────────────────────────────────────────────
  const SOURCES_KEY   = "re_active_sources_v1";
  const OUTCOMES_KEY  = "re_outcomes_v1";
  const WEIGHTS_KEY   = "re_weights_v1";

  const loadActiveSources = async () => {
    const r = await kvPost({ _loadLearning: true, _key: SOURCES_KEY });
    return r?.learning || null; // null = all enabled
  };
  const saveActiveSources = async (srcs) => {
    await kvPost({ _saveLearning: true, _key: SOURCES_KEY, _learningData: srcs });
  };
  const CUSTOM_SOURCES_KEY = "re_custom_sources_v1";
  const loadCustomSources = async () => {
    const r = await kvPost({ _loadLearning: true, _key: CUSTOM_SOURCES_KEY });
    return r?.learning || [];
  };
  const saveCustomSources = async (srcs) => {
    await kvPost({ _saveLearning: true, _key: CUSTOM_SOURCES_KEY, _learningData: srcs });
    setCustomSources(srcs);
  };
  const addCustomSource = async (src) => {
    const all = await loadCustomSources();
    // Prevent duplicate URLs
    if (all.find(s => s.url === src.url)) return false;
    const updated = [...all, { ...src, custom: true, addedAt: new Date().toISOString() }];
    await saveCustomSources(updated);
    return true;
  };
  const deleteCustomSource = async (url) => {
    const all = await loadCustomSources();
    await saveCustomSources(all.filter(s => s.url !== url));
  };
  const updateCustomSource = async (url, updates) => {
    const all = await loadCustomSources();
    await saveCustomSources(all.map(s => s.url === url ? { ...s, ...updates } : s));
  };

  const loadOutcomes = async () => {
    const r = await kvPost({ _loadLearning: true, _key: OUTCOMES_KEY });
    return r?.learning || {};
  };
  const saveOutcome = async (sessionId, outcome) => {
    const all = await loadOutcomes();
    all[sessionId] = { ...outcome, updatedAt: new Date().toISOString() };
    await kvPost({ _saveLearning: true, _key: OUTCOMES_KEY, _learningData: all });
    setOutcomes(all);
    // Recompute weights from outcomes
    await recomputeWeights(all);
  };
  const loadWeights = async () => {
    const r = await kvPost({ _loadLearning: true, _key: WEIGHTS_KEY });
    return r?.learning || null;
  };

  // ── WEIGHT LEARNING ENGINE ─────────────────────────────────────────────
  // Analyses which dimension scores predicted success (MRR >= 10000)
  // and adjusts weights toward dimensions that correlated with success
  const recomputeWeights = async (allOutcomes) => {
    const allSess = await loadSessions();
    const successes = [], failures = [];
    for (const [sid, out] of Object.entries(allOutcomes)) {
      const sess = allSess.find(s => s.id === sid);
      if (!sess?.results?.oppscore?.dimensionScores) continue;
      if (out.built && out.mrr >= 10000) successes.push(sess.results.oppscore.dimensionScores);
      else if (out.built && out.mrr < 10000) failures.push(sess.results.oppscore.dimensionScores);
    }
    if (successes.length < 2) return; // not enough data yet
    // Compute average score per dimension for successes vs failures
    const dims = Object.keys(outcomeWeights);
    const newWeights = { ...outcomeWeights };
    dims.forEach(dim => {
      const avgSuccess = successes.reduce((s,d) => s + (d[dim]||5), 0) / successes.length;
      const avgFailure = failures.length ? failures.reduce((s,d) => s + (d[dim]||5), 0) / failures.length : 5;
      // Boost weight if this dimension scored higher in successes than failures
      const signal = (avgSuccess - avgFailure) / 10; // -1 to +1
      newWeights[dim] = Math.max(0.02, Math.min(0.25, newWeights[dim] + signal * 0.02));
    });
    // Normalise to sum to 1.0
    const total = Object.values(newWeights).reduce((a,b) => a+b, 0);
    dims.forEach(dim => { newWeights[dim] = Math.round((newWeights[dim]/total)*1000)/1000; });
    setOutcomeWeights(newWeights);
    await kvPost({ _saveLearning: true, _key: WEIGHTS_KEY, _learningData: newWeights });
  };

  const computeInsights = async () => {
    const all = await loadLearning();
    if (all.length < 3) return [];
    const insights = [];
    const completed = all.filter(s => s.status === "complete" && s.opportunityScore);
    const avoided = all.filter(s => s.status === "avoided");
    const paused = all.filter(s => s.gateDecision === "pause" || s.gateDecision === "abort");
    // Pattern 1: Low demand score correlation
    const lowDemand = completed.filter(s => parseInt(s.demandScore) < 6);
    if (lowDemand.length >= 2) insights.push({ type: "warning", text: `${lowDemand.length} of your completed runs had demand scores below 6. Consider raising your gate threshold.` });
    // Pattern 2: Best performing niches by score
    const top = completed.sort((a,b) => (b.opportunityScore||0) - (a.opportunityScore||0)).slice(0,3);
    if (top.length > 0) insights.push({ type: "success", text: `Your highest-scoring niches: ${top.map(s => `${s.niche} (${s.opportunityScore}/100)`).join(", ")}` });
    // Pattern 3: Trend direction pattern
    const growing = completed.filter(s => s.trendDirection === "growing");
    if (growing.length > 0 && completed.length > 0) insights.push({ type: "info", text: `${Math.round((growing.length/completed.length)*100)}% of your runs were in growing markets. Strong signal selection.` });
    // Pattern 4: Avoided niches
    if (avoided.length > 0) insights.push({ type: "info", text: `${avoided.length} niches avoided early by the Niche Scorer — saving ~${avoided.length * 18} agent calls.` });
    // Pattern 5: Most common moats
    const moats = completed.filter(s => s.primaryMoat).map(s => s.primaryMoat);
    if (moats.length >= 2) {
      const moatCounts = moats.reduce((a, m) => { a[m] = (a[m]||0)+1; return a; }, {});
      const topMoat = Object.entries(moatCounts).sort((a,b) => b[1]-a[1])[0];
      if (topMoat) insights.push({ type: "info", text: `Most common moat in your research: "${topMoat[0]}" (${topMoat[1]} runs). You may be drawn to a specific defensibility pattern.` });
    }
    return insights;
  };

  const persist = async (res, status) => {
    const session = { id: sid.current, niche, date: new Date().toLocaleDateString(), status, nicheScore: res.scorer?.overallScore || null, viability: res.validator?.overallViability || null, blueprintName: res.strategist?.name || null, results: res };
    await saveSession(session); // saves to KV + Google Sheets
    await saveLearning(session);
    setSessions(await loadSessions());
    const insights = await computeInsights();
    setLearningInsights(insights);
  };

  const run = async () => {
    if (!niche.trim()) { setError("Enter a niche first."); return; }
    resetAll(); setRunning(true);
    const R = {};
    const cap = (id, d) => { setR(id, d); R[id] = d; };

    try {
      setState("scorer", "running");
      addLog("scorer", `Scoring "${niche}" via Google Trends, Exploding Topics, Minea, Gumroad, Flippa, X...`);
      const scorer = await callAI("You are the Niche Scorer. Score niches using live trending data. JSON only.",
        `Score the "${niche}" niche for a bootstrapped SaaS targeting $100K/month.
Search: Google Trends (12-month trajectory), Exploding Topics (trending?), Reddit r/SaaS + r/startups (sentiment), Hacker News (Show HN activity), Product Hunt (launch volume last 6 months), X/Twitter (viral conversations), Facebook Groups (member counts), Gumroad Discover (products selling?), Flippa (business sale prices), Minea (ad activity across FB/TT/Pinterest), TrendTrack trendtrack.io (real-time trend monitoring and ad activity signals across ecommerce platforms — strongest signal for trending products).
Return JSON: {"scores":{"marketSize":{"score":0,"max":10,"rationale":""},"growthTrajectory":{"score":0,"max":10,"rationale":"Google Trends data"},"communityDemand":{"score":0,"max":10,"rationale":"Reddit/Facebook/HN"},"monetization":{"score":0,"max":10,"rationale":"Gumroad/Flippa/Minea"},"competitionLevel":{"score":0,"max":10,"rationale":"10=low competition"}},"overallScore":0,"verdict":"strong|promising|risky|avoid","verdictReason":"2 sentences from data","trendingSignals":["specific signals found"],"bestAngle":"specific sub-niche with most momentum","estimatedTAM":"","sourcesChecked":["list sources with findings"]}`, true);
      if (abort.current) return;
      cap("scorer", scorer);
      addLog("scorer", `Score: ${scorer.overallScore}/50 — ${scorer.verdict}. ${scorer.verdictReason}`);
      setState("scorer", "done");
      if (scorer.verdict === "avoid") { setError(`Scorer: avoid (${scorer.overallScore}/50). ${scorer.verdictReason}`); await persist(R, "avoided"); setRunning(false); return; }
      await delay(500);

      let T = null;
      if (isAgentEnabled("scout")) {
        setState("scout", "running");
        addLog("scout", `Searching IndieHackers, Starter Story, AppMagic, Sensor Tower, Flippa, Minea for "${niche}"...`);
        const scout = await callAI("You are the Scout Agent. Find high-revenue products from verified sources. JSON only.",
          `Find digital products in "${niche}" already making serious money.
Search: IndieHackers (verified MRR), Starter Story (revenue interviews), Product Hunt (top-voted), Crunchbase (funded companies), AppSumo (deal volume), SaaSHub (user counts), Gumroad Discover (download counts), Flippa (verified revenue listings), AppMagic appmagic.rocks (mobile revenue), Sensor Tower (app downloads), Minea (high ad spend = high revenue), Facebook Ad Library (ad longevity = profitable), eRank (marketplace volume), Merch Titans merchtitans.com/tools/keywords (keyword demand), X/Twitter (founders sharing revenue), TrendTrack trendtrack.io (real-time product discovery and competitor store tracking — check for products gaining ad traction right now), Winning Hunter winninghunter.com (real-time store tracking with 98% accuracy — search the niche to find what competitor stores are actually selling and their revenue), USADrop usadrop.com/products (supplier catalog — confirm product is available to dropship, check supplier margins and MOQ), Everbee everbee.io (if niche is Etsy-relevant: 180M+ listings database with estimated monthly sales, revenue and keyword data).
Return JSON: {"products":[{"name":"","what":"one sentence","revenue":"with source","evidence":"URL or publication","communities":["specific communities"],"weaknesses":["from G2 or Reddit"],"adActivity":"high|medium|low","suppliers":["supplier names found on USADrop, AliExpress, CJ Dropshipping used by sellers in this niche"],"productTags":["3-8 keyword tags that describe this product category e.g. home-decor, problem-solver, impulse-buy, seasonal, evergreen"],"buildComplexity":"easy|medium|hard — how hard to source and sell this","marginEstimate":"estimated gross margin % e.g. 60-70%"}],"topTarget":{"name":"","reason":"most attackable weakness"}}
Return 3-5 products by revenue evidence strength.`, true);
        if (abort.current) return;
        cap("scout", scout);
        addLog("scout", `Found ${scout.products?.length || 0} products. Target: ${scout.topTarget?.name} — ${scout.topTarget?.reason}`);
        setState("scout", "done");
        T = scout.products?.[0];
        if (!T) throw new Error("Scout found no products");
        await delay(500);
      } else {
        setState("scout", "skipped");
        addLog("scout", "Skipped — disabled in agent selector");
        // Use a placeholder so downstream agents can still run
        T = R.scout?.products?.[0] || { name: niche + " competitor", what: "unknown", revenue: "unknown", evidence: "", communities: [], weaknesses: [], adActivity: "unknown" };
      }

      if (isAgentEnabled("analyst")) {
        setState("analyst", "running");
      addLog("analyst", `Mining G2, Capterra, Reddit, Minea ad comments, AppMagic, Sensor Tower for ${T.name}...`);
      const analyst = await callAI("You are the Analyst Agent. Extract validated market gaps from real reviews. JSON only.",
        `Find every complaint about "${T.name}" (${T.what}).
Search in order: G2 (1-3 star reviews sorted recent), Capterra (negative reviews), Trustpilot (recurring issues), Reddit (site:reddit.com ${T.name} problem OR complaint OR alternative), App Store/Google Play (1-3 star), X/Twitter (${T.name} problem OR hate OR broken), Facebook Groups (frustrated conversations), AppMagic appmagic.rocks (sentiment trends), Sensor Tower (rating history), Flippa (due diligence notes), Minea ad comments (raw frustration), Facebook Ad Library comments (feature requests), Winning Hunter winninghunter.com (reverse search "${T.name}" creatives — ad comments reveal customer pain), TrendTrack trendtrack.io ("${T.name}" store performance and saturation data).
Return JSON: {"gaps":[{"complaint":"exact user words","feature":"solution","paySignal":"high|medium|low","mentionCount":"approximate","recency":"last30days|last90days|last12months|older","evidence":"which sources","switchRisk":"yes|maybe|no","exactQuote":"real quote if found"}],"summary":"2 sentences","topGaps":["top 3"],"marketOpening":"specific angle","sourcesSearched":["list"]}
Return 6-8 gaps ranked by mentionCount x paySignal x recency.`, true);
      if (abort.current) return;
      cap("analyst", analyst);
      addLog("analyst", `${analyst.gaps?.length || 0} gaps across ${analyst.sourcesSearched?.length || 0} sources. Top: ${analyst.topGaps?.join(", ")}`);
      setState("analyst", "done");
      await delay(500);  // analyst end
      } else {
        setState("analyst", "skipped");
        addLog("analyst", "Skipped — disabled in agent selector");
      }

      if (isAgentEnabled("pricing")) {
        setState("pricing", "running");
      addLog("pricing", `Researching "${niche}" pricing on G2, SaaSHub, Baremetrics Open, Minea, Flippa...`);
      const pricing = await callAI("You are the Pricing Agent. Research real market pricing. JSON only.",
        `Research pricing for "${niche}" competing with "${T.name}".
Search: G2 (pricing pages and tiers), SaaSHub (side-by-side comparisons), Baremetrics Open baremetrics.com/open (live ARPU/MRR/churn), IndieHackers (pricing decisions and conversion rates), Reddit r/SaaS (willingness-to-pay discussions), Gumroad Discover (one-time vs subscription split), AppMagic appmagic.rocks (revenue per download), Sensor Tower (IAP and subscription data), Flippa (revenue multiples), Minea (price points in winning ads), Facebook Ad Library (pricing language in ${T.name} ads), USADrop usadrop.com/products (supplier cost for niche products — reveals actual COGS and margin floor), Everbee everbee.io (if Etsy-relevant: revenue per listing and price distribution across top sellers), TrendTrack trendtrack.io (competitor store pricing patterns).
Return JSON: {"competitorPricing":[{"name":"","tiers":[{"name":"","price":"","features":[""]}]}],"marketPricingRange":{"lowest":"","median":"","highest":"","source":""},"willingnessToPay":{"low":"","median":"","high":"","evidence":""},"recommendedTiers":[{"name":"","monthlyPrice":"","annualPrice":"","features":[""],"targetCustomer":"","rationale":""}],"pricingModel":"subscription|usage-based|one-time|freemium","pricingInsight":"key insight from data","revenueToTarget":{"customersNeeded":0,"atTier":"","monthlyPrice":0,"calculation":"X x $Y = $100K MRR"},"productMargins":[{"productType":"e.g. digital course, physical widget, SaaS subscription","estimatedCOGS":"cost to produce or source e.g. $8 from supplier","sellingPrice":"average market price","grossMargin":"%","netMarginAfterAds":"%","source":"where COGS data came from e.g. USADrop catalog"}],"evergreenScore":{"score":"1-10","rationale":"is demand year-round or seasonal?","seasonalPeaks":["months with highest demand"],"evergreenEvidence":"what makes this durable beyond trends"},"sourcesChecked":[""]}`, true);
      if (abort.current) return;
      cap("pricing", pricing);
      addLog("pricing", `Range: ${pricing.marketPricingRange?.lowest}-${pricing.marketPricingRange?.highest}. ${pricing.pricingInsight}`);
      setState("pricing", "done");
      await delay(500);  // pricing end
      } else {
        setState("pricing", "skipped");
        addLog("pricing", "Skipped — disabled in agent selector");
      }

      if (isAgentEnabled("strategist")) {
        setState("strategist", "running");
      addLog("strategist", `Building blueprint using SimilarWeb traffic data and BuiltWith stack analysis...`);
      const strategist = await callAI("You are the Strategist Agent. Build MVP plans grounded in market data. JSON only.",
        `Design optimal MVP competing with "${T.name}" in "${niche}".
Previous data: revenue ${T.revenue} (${T.evidence}), top gaps: ${JSON.stringify(analyst.topGaps)}, opening: ${analyst.marketOpening}, pricing: ${JSON.stringify(pricing.recommendedTiers?.slice(0,2))}, calculation: ${pricing.revenueToTarget?.calculation}.
Also search: SimilarWeb similarweb.com ("${T.name}" traffic sources — which channels drive most users?), BuiltWith builtwith.com (exact tech stack of "${T.name}"), Wayback Machine web.archive.org (how "${T.name}" evolved — features added/removed).
Return JSON: {"name":"","tagline":"X for people who hate Y about ${T.name}","coreFeatures":["3-4 cloned must-haves"],"differentiators":["top 3 gap features"],"mvpScope":"what to build in 6 weeks","notMVP":"what to cut","competitorTrafficSources":["from SimilarWeb"],"techStackInsight":"from BuiltWith","milestones":[{"week":"Week 8","target":"$10K MRR"},{"week":"Week 12","target":"$50K MRR"},{"week":"Week 16","target":"$100K MRR"}],"risks":["top 2 with mitigation"],"dataSourcesUsed":[""]}`, true);
      if (abort.current) return;
      cap("strategist", strategist);
      addLog("strategist", `Blueprint: ${strategist.name} — ${strategist.tagline}`);
      setState("strategist", "done");
      await delay(500);  // strategist end
      } else {
        setState("strategist", "skipped");
        addLog("strategist", "Skipped — disabled in agent selector");
      }

      setState("validator", "running");
      addLog("validator", `Validating with Google Trends, Crunchbase, Minea ad volume, community sizes...`);
      const validator = await callAI("You are the Validator Agent. Validate with live data and gate the pipeline. JSON only.",
        `Validate "${strategist.name}" in "${niche}" competing with "${T.name}".
Search: TrendTrack trendtrack.io (primary source — real-time trend velocity, ad activity signals and competitor store monitoring across ecommerce platforms; check for emergence vs growth vs saturation phase), Google Trends (growing or declining last 12 months?), Reddit (top 3 community member counts), Crunchbase (funded companies in niche last 12 months), X/Twitter (active conversation? sentiment?), G2 Grid g2.com/categories (how many products in category?), Product Hunt (launches last 3 months), Facebook Groups (total member count across groups), Minea (how many active ads? high=money being made), AppMagic appmagic.rocks (download trends), Sensor Tower (category growth), Gumroad Discover (products with 100+ sales = proven demand), Flippa (successful exits = acquirer interest), Facebook Ad Library (active advertiser count), Winning Hunter winninghunter.com (which stores in this niche are growing or declining in real-time?).
Return JSON: {"demandScore":"1-10","demandEvidence":"specific data e.g. Google Trends 40% growth","competitionScore":"1-10 (10=blue ocean)","competitionEvidence":"G2 count and Minea advertiser count","communitySize":"total members found","vcActivity":"funded companies last 12mo","trendDirection":"growing|stable|declining","adActivity":"high|medium|low","gapScores":[{"gap":"","payScore":"1-10","recommendation":"build|skip|later"}],"overallViability":"high|medium|low","viabilityReason":"2 sentences from data","greenLights":["specific data points"],"redFlags":["specific concerns"],"gateDecision":"proceed|pause|abort","gateReason":"one sentence from data","sourcesChecked":[""]}`, true);
      if (abort.current) return;
      cap("validator", validator);
      addLog("validator", `Demand: ${validator.demandScore}/10 | Competition: ${validator.competitionScore}/10 | Trend: ${validator.trendDirection} | Ads: ${validator.adActivity}`);
      addLog("validator", `Gate: ${validator.gateDecision} — ${validator.gateReason}`);
      setState("validator", "done");
      await persist(R, "validated");
      if (validator.gateDecision !== "proceed") { setGated(true); setRunning(false); return; }
      await delay(500);

      if (isAgentEnabled("legal")) {
        setState("legal", "running");
      addLog("legal", `Checking GDPR.eu, FTC.gov, ICO.org.uk for "${niche}" compliance...`);
      const legal = await callAI("You are the Legal Agent. Identify compliance from authoritative free sources. JSON only.",
        `Legal requirements for "${strategist.name}" — ${niche} SaaS.
Check: GDPR.eu (GDPR obligations), FTC.gov (US regulations for "${niche}"), ICO.org.uk (UK data protection), PrivacyPolicies.com or Termly.io (required clauses for "${niche}"), search "${niche} GDPR compliance" and "${niche} terms of service required", check if "${niche}" needs HIPAA/FERPA/PCI/COPPA.
Return JSON: {"privacyLaws":[{"law":"","jurisdiction":"","applies":true,"requirement":"","action":"","freeResource":"URL"}],"requiredDocuments":[{"document":"","whyRequired":"","freeTemplate":"URL"}],"industrySpecificRules":[""],"ipRisks":[{"risk":"","severity":"high|medium|low","mitigation":""}],"paymentCompliance":{"pciRequired":true,"notes":"","recommendedProcessor":"Stripe"},"priorityActions":[{"action":"","urgency":"before-launch|first-month|first-quarter","estimatedCost":"free|$X","canDIY":true,"diyGuide":"URL"}],"freeComplianceTools":[""],"disclaimer":"AI-generated, not legal advice."}`, false);
      if (abort.current) return;
      cap("legal", legal);
      addLog("legal", `${legal.priorityActions?.length || 0} actions. ${legal.freeComplianceTools?.length || 0} free tools.`);
      setState("legal", "done");
      await delay(500);  // legal end
      } else {
        setState("legal", "skipped");
        addLog("legal", "Skipped — disabled in agent selector");
      }

      if (isAgentEnabled("builder")) {
        setState("builder", "running");
      addLog("builder", `Analysing ${T.name} tech stack via BuiltWith, Stackshare, GitHub boilerplates...`);
      const builder = await callAI("You are the Builder Agent. Produce technical specs based on what works in this niche. JSON only.",
        `Technical spec for "${strategist.name}" — ${niche}. Features: ${JSON.stringify(strategist.coreFeatures)}. Differentiators: ${JSON.stringify(strategist.differentiators)}. MVP: ${strategist.mvpScope}.
Search: BuiltWith builtwith.com ("${T.name}" exact stack), Stackshare stackshare.io ("${niche}" battle-tested stacks), GitHub ("${niche} boilerplate" or "${niche} starter" open source), IndieHackers (what stacks "${niche}" founders recommend).
Return JSON: {"competitorStack":"from BuiltWith","recommendedStack":{"frontend":"","backend":"","database":"","auth":"","payments":"Stripe","hosting":"","monitoring":"","reasoning":"why for ${niche}"},"openSourceStarters":["GitHub repos"],"mvpFeatures":[{"feature":"","priority":"must|should|nice","effortDays":0,"difficulty":"easy|medium|hard","description":""}],"apiEndpoints":[{"endpoint":"","method":"GET|POST|PUT|DELETE","purpose":""}],"sprintPlan":[{"sprint":"Sprint 1 (Week 1-2)","tasks":[""],"deliverable":""},{"sprint":"Sprint 2 (Week 3-4)","tasks":[""],"deliverable":""},{"sprint":"Sprint 3 (Week 5-6)","tasks":[""],"deliverable":""}],"monthlyCost":"","biggestTechnicalRisk":""}`, true);
      if (abort.current) return;
      cap("builder", builder);
      addLog("builder", `Stack: ${builder.recommendedStack?.frontend} + ${builder.recommendedStack?.backend}. Competitor: ${builder.competitorStack}`);
      setState("builder", "done");
      await delay(500);  // builder end
      } else {
        setState("builder", "skipped");
        addLog("builder", "Skipped — disabled in agent selector");
      }

      if (isAgentEnabled("qa")) {
        setState("qa", "running");
      addLog("qa", `Building QA plan from OWASP Top 10, Google Lighthouse, Core Web Vitals...`);
      const qa = await callAI("You are the QA Agent. Define quality standards from free industry frameworks. JSON only.",
        `QA plan for "${strategist.name}" — ${niche} built with ${builder.recommendedStack?.frontend} + ${builder.recommendedStack?.backend}.
Use: OWASP Top 10 owasp.org (security checklist), Google Lighthouse (performance/accessibility/SEO/best-practices targets), OWASP ASVS Level 1 (MVP minimum), WCAG 2.1 AA (accessibility), Core Web Vitals (LCP/FID/CLS targets).
Features: ${JSON.stringify(builder.mvpFeatures?.map(f => f.feature))}.
Return JSON: {"testSuites":[{"suite":"","type":"unit|integration|e2e|security|performance|manual","tests":[""],"priority":"critical|high|medium","tool":"free tool"}],"owaspTop10Coverage":["risk and how addressed"],"lighthouseTargets":{"performance":0,"accessibility":0,"bestPractices":0,"seo":0},"coreWebVitals":{"lcp":"","fid":"","cls":""},"preLaunchChecklist":["must pass"],"securityChecklist":["from OWASP"],"freeTestingTools":[{"tool":"","url":"","purpose":""}],"founderTestingGuide":"step-by-step for solo founder"}`, false);
      if (abort.current) return;
      cap("qa", qa);
      addLog("qa", `${qa.preLaunchChecklist?.length || 0} pre-launch checks. OWASP: ${qa.owaspTop10Coverage?.length || 0} risks.`);
      setState("qa", "done");
      await delay(500);  // qa end
      } else {
        setState("qa", "skipped");
        addLog("qa", "Skipped — disabled in agent selector");
      }

      if (isAgentEnabled("seo")) {
        setState("seo", "running");
      addLog("seo", `Finding keywords via Ubersuggest, AnswerThePublic, eRank, Merch Titans, SpyFu...`);
      const seo = await callAI("You are the SEO Agent. Find keyword opportunities from free tools. JSON only.",
        `SEO strategy for "${strategist.name}" in "${niche}" competing with "${T.name}".
Search: Ubersuggest free neilpatel.com/ubersuggest ("${niche}" and "${T.name} alternative" volumes and difficulty), AnswerThePublic answerthepublic.com ("${niche}" questions), Google People Also Ask (search "${niche} software"), Google Trends (rising variations), Reddit (site:reddit.com ${niche} — what threads rank?), "${T.name} vs" Google autocomplete, SpyFu free spyfu.com (${T.name} keyword rankings), eRank erank.com (marketplace search volume, free plan), Merch Titans merchtitans.com/tools/keywords (keyword demand, no signup).
Return JSON: {"primaryKeywords":[{"keyword":"","monthlySearches":"","difficulty":"low|medium|high","intent":"informational|commercial|transactional","source":""}],"questionKeywords":["from AnswerThePublic and PAA"],"comparisonKeywords":["${T.name} alternatives, best ${niche} tool"],"quickWins":["low difficulty commercial — first 30 days"],"contentPlan":[{"title":"","targetKeyword":"","type":"blog|landing|comparison","estimatedTraffic":""}],"landingPageSEO":{"heroHeadline":"","metaTitle":"","metaDescription":"","targetKeyword":""},"technicalSEO":["must-do items"],"timeToRank":"","freeTools":[{"tool":"","url":"","purpose":""}]}`, true);
      if (abort.current) return;
      cap("seo", seo);
      addLog("seo", `${seo.primaryKeywords?.length || 0} keywords. Quick wins: ${seo.quickWins?.slice(0,2).join(", ")}`);
      setState("seo", "done");
      await delay(500);  // seo end
      } else {
        setState("seo", "skipped");
        addLog("seo", "Skipped — disabled in agent selector");
      }

      if (isAgentEnabled("marketing")) {
        setState("marketing", "running");
      addLog("marketing", `Analysing ${T.name} ads via Facebook Ad Library, Minea, TikTok Creative Center...`);
      const marketing = await callAI("You are the Marketing Agent. Write copy informed by competitor ad spending. JSON only.",
        `Marketing for "${strategist.name}" competing with "${T.name}" in "${niche}". Differentiators: ${JSON.stringify(strategist.differentiators)}. Top complaints: ${analyst.topGaps?.join(", ")}.
Search: Facebook Ad Library facebook.com/ads/library ("${T.name}" ads — messaging and longevity = profitable), Minea minea.com ("${T.name}" all FB/TT/Pinterest ads, top engaged creatives, READ AD COMMENTS for customer voice), Google Ads Transparency adstransparency.google.com ("${T.name}" Google ads), SpyFu free spyfu.com (PPC keywords and spend), TikTok Creative Center ads.tiktok.com/business/creativecenter (top "${niche}" ads), LinkedIn Ad Library linkedin.com/ad-library ("${T.name}" B2B ads), Reddit ("${niche}" most upvoted posts = best copy), X/Twitter (viral "${niche}" formats), Gumroad ("${niche}" descriptions with most sales), eRank (high-traffic keywords for headlines), Merch Titans (keyword volume for copy), Winning Hunter winninghunter.com (reverse search "${T.name}" ad creatives — which hooks and visual formats get most engagement?), TrendTrack trendtrack.io (which ad creatives in "${niche}" are scaling right now — high spend + growing impressions = proven direction).
Return JSON: {"competitorAdInsights":{"facebookAds":"messaging and longevity","googleAds":"keywords","tiktokAds":"creative approach","coreMessage":"main marketing message"},"positioningGap":"what ${T.name} ads DONT say that users want","positioning":{"statement":"","vsCompetitor":"${T.name} but ___","uniqueAngle":""},"headlines":["5 that address the gap"],"adCopy":[{"platform":"Reddit","headline":"","body":"","cta":"","targetCommunity":""},{"platform":"Facebook","headline":"","body":"","cta":""},{"platform":"Google","headline":"","body":"","cta":"","targetKeyword":""}],"emailSequence":[{"email":"Email 1 Welcome","subject":"","keyMessage":""},{"email":"Email 2 Day 3","subject":"","keyMessage":""},{"email":"Email 3 Day 7","subject":"","keyMessage":""}],"validationPost":"exact 3-sentence community post casual tone","brandVoice":"3 adjectives","hookAnalysis":{"primaryHook":"the single most powerful hook for this audience","hookFormula":"exact formula e.g. You dont need X to get Y, or Most people dont know that Z","topHooks":[{"hook":"exact hook text","format":"video|image|text","platform":"TikTok|Facebook|Instagram|Google","whyItWorks":"psychological reason","exampleFromCompetitor":"if found in FB Ad Library or Winning Hunter"}],"antiHooks":["overused angles to avoid in this niche"]},"sourcesChecked":[""]}`, true);
      if (abort.current) return;
      cap("marketing", marketing);
      addLog("marketing", `Gap: ${marketing.positioningGap}`);
      addLog("marketing", `Competitor message: ${marketing.competitorAdInsights?.coreMessage}`);
      setState("marketing", "done");
      await delay(500);  // marketing end
      } else {
        setState("marketing", "skipped");
        addLog("marketing", "Skipped — disabled in agent selector");
      }

      if (isAgentEnabled("cs")) {
        setState("cs", "running");
      addLog("cs", `Analysing ${T.name} onboarding via G2, App Store reviews, UserOnboard...`);
      const cs = await callAI("You are the Customer Success Agent. Build onboarding from competitor onboarding research. JSON only.",
        `Customer success for "${strategist.name}" — ${niche}. Onboarding weaknesses from analyst: ${analyst.gaps?.filter(g => g.complaint?.toLowerCase().match(/setup|onboard|confus|start/))?.map(g => g.complaint)?.join(", ") || "see gaps"}.
Search: G2 ("${T.name}" reviews filtered by Onboarding — what is hard?), App Store/Google Play ("${T.name}" reviews mentioning setup/confusing/tutorial), Reddit ("${T.name} onboarding OR getting started OR confusing"), UserOnboard useronboard.com (is "${T.name}" analysed? what patterns work in ${niche}?), "${T.name}" help docs (what is their activation sequence?).
Return JSON: {"competitorOnboardingWeaknesses":["what users say about ${T.name} onboarding"],"activationMetric":{"metric":"single action predicting retention","definition":"","targetTime":"","benchmark":"industry standard"},"onboardingFlow":[{"step":1,"name":"","goal":"","action":"","duration":"minutes","automated":true,"tool":"free tool"}],"inAppMessages":[{"trigger":"","message":"","timing":"","channel":"email|in-app"}],"retentionEmails":[{"day":0,"subject":"","purpose":""},{"day":3,"subject":"","purpose":""},{"day":7,"subject":"","purpose":""},{"day":30,"subject":"","purpose":""}],"churnSignals":[{"signal":"","severity":"high|medium","intervention":"","automated":true}],"automationStack":["free tools"],"weeklyTimeRequired":"hrs/week"}`, true);
      if (abort.current) return;
      cap("cs", cs);
      addLog("cs", `Activation: ${cs.activationMetric?.metric}. ${cs.onboardingFlow?.length || 0} steps. ${cs.weeklyTimeRequired}`);
      setState("cs", "done");
      await delay(500);  // cs end
      } else {
        setState("cs", "skipped");
        addLog("cs", "Skipped — disabled in agent selector");
      }

      if (isAgentEnabled("distributor")) {
        setState("distributor", "running");
      addLog("distributor", `Mapping ${T.name} traffic via SimilarWeb, Minea channels, YouTube influencers...`);
      const distributor = await callAI("You are the Distributor Agent. Build distribution from where competitor traffic actually comes from. JSON only.",
        `Distribution for "${strategist.name}" in "${niche}" targeting "${T.name}" users. Communities: ${JSON.stringify(T.communities)}. SEO quick wins: ${JSON.stringify(seo.quickWins?.slice(0,3))}.
Search: SimilarWeb similarweb.com ("${T.name}" traffic breakdown — Direct/Search/Social/Referral/Paid % and top social networks), Facebook Ad Library (is "${T.name}" running FB/Instagram ads? how many? since when?), Minea ("${niche}" top ad spenders across FB and TikTok — what creatives work?), SpyFu free ("${T.name}" Google Ads spend), SimilarWeb referrals (which sites refer to "${T.name}" = partnership targets), YouTube ("${niche} tutorial" and "${niche} review" — YouTubers and subscriber counts), X/Twitter (influential voices in "${niche}" and viral formats), Facebook Groups (top "${niche}" groups — member count and rules), AppMagic appmagic.rocks (which app stores drive most downloads?), Sensor Tower (ASO keywords), Flippa ("${niche}" businesses — how did they generate traffic?), Gumroad (how do top "${niche}" sellers drive traffic?), TikTok Creative Center (is "${niche}" trending on TikTok?).
Return JSON: {"competitorTrafficBreakdown":{"direct":"% from SimilarWeb","search":"% organic","paid":"% paid","social":"% social","referral":"% referral","topReferrers":["sites"]},"channelStrategy":[{"channel":"","priority":"1-5","why":"based on SimilarWeb/Minea data","firstAction":"","weeklyHours":"","expectedROI":""}],"communityPlaybook":[{"community":"name + member count","platform":"Reddit|Facebook|Discord","postTemplate":"exact post text","timing":"","doNot":""}],"youtubeOpportunity":"YouTubers found and how to reach","referralTargets":["sites referring to ${T.name}"],"tiktokOpportunity":"TikTok trend from Creative Center, TrendTrack, Winning Hunter channel data","launchSequence":[{"week":"Week 1","phase":"Pre-launch","actions":[""],"hoursRequired":0,"goal":""},{"week":"Week 2-3","phase":"Soft launch","actions":[""],"hoursRequired":0,"goal":""},{"week":"Week 4-6","phase":"Public launch","actions":[""],"hoursRequired":0,"goal":""},{"week":"Week 7-16","phase":"Scale","actions":[""],"hoursRequired":0,"goal":""}],"affiliateProgram":{"commission":"","targetAffiliates":"YouTubers/bloggers covering ${T.name}","recruitmentTemplate":""},"totalWeeklyHours":"realistic total","scaleStrategy":{"phase1":{"title":"Traction ($0-$10K MRR)","actions":[""],"keyChannel":"","timeframe":""},"phase2":{"title":"Growth ($10K-$50K MRR)","actions":[""],"keyChannel":"","timeframe":""},"phase3":{"title":"Scale ($50K-$100K MRR)","actions":[""],"keyChannel":"","timeframe":""},"bottleneck":"the single biggest thing that will slow scale","unfairAdvantage":"what you can do that competitor cannot at scale"}}`, true);
      if (abort.current) return;
      cap("distributor", distributor);
      addLog("distributor", `Traffic: ${JSON.stringify(distributor.competitorTrafficBreakdown)}`.slice(0, 120));
      addLog("distributor", `${distributor.channelStrategy?.length || 0} channels. Referral targets: ${distributor.referralTargets?.slice(0,2).join(", ")}`);
      setState("distributor", "done");
      await delay(500);  // distributor end
      } else {
        setState("distributor", "skipped");
        addLog("distributor", "Skipped — disabled in agent selector");
      }

      if (isAgentEnabled("finance")) {
      setState("finance", "running");
      addLog("finance", `Pulling benchmarks from Baremetrics Open, Flippa multiples, AppMagic, Sensor Tower...`);
      const finance = await callAI("You are the Finance Agent. Build financial models from real benchmark data. JSON only.",
        `Financial model for "${strategist.name}" — ${niche}. Target: $100K MRR (${pricing.revenueToTarget?.calculation}). Pricing: ${JSON.stringify(pricing.recommendedTiers?.slice(0,2))}. Channels: ${JSON.stringify(distributor.channelStrategy?.slice(0,3)?.map(c => c.channel))}.
Search: USADrop usadrop.com/products (search niche products — supplier cost data reveals true margin floor and COGS for financial model), Baremetrics Open baremetrics.com/open ("${niche}" products with live MRR/churn/ARPU data), IndieHackers ("${niche}" verified revenue reports and growth timelines), Flippa ("${niche}" sold listings — sale price / monthly revenue = multiple), AppMagic appmagic.rocks ("${niche}" mobile revenue estimates), Sensor Tower ("${niche}" app category revenue data), Gumroad Discover (top "${niche}" products — download count x price = revenue estimate), X/Twitter ("${niche} MRR" or "${niche} revenue" — founders sharing publicly), search "how long to $10K MRR ${niche}" on IndieHackers and Reddit.
Return JSON: {"benchmarkData":{"comparableProducts":["${niche} products with public metrics"],"industryChurnRate":"","industryARPU":"","medianTimeToFirstRevenue":"from IH","source":""},"monthlyBurnEstimate":{"tooling":"","marketing":"","other":"","total":""},"cacByChannel":[{"channel":"","estimatedCAC":"","paybackPeriod":"","ltv":""}],"unitEconomics":{"arpu":"","churnRate":"benchmark","ltv":"","cacTarget":"","ltvCacRatio":""},"breakEven":{"mrrNeeded":"","customersNeeded":0,"estimatedMonth":"from IH timelines","assumptions":""},"cashFlowProjection":[{"month":"Month 1","mrr":"$0","burn":"","netCash":""},{"month":"Month 3","mrr":"","burn":"","netCash":""},{"month":"Month 6","mrr":"","burn":"","netCash":""},{"month":"Month 12","mrr":"","burn":"","netCash":""}],"criticalWarning":"most important financial risk","sensitivityAnalysis":{"bestCase":"","baseCase":"comparable IH products","worstCase":""},"exitMultiple":"from Flippa data","sourcesChecked":[""]}`, true);
      if (abort.current) return;
      cap("finance", finance);
      addLog("finance", `Benchmarks: ${finance.sourcesChecked?.slice(0,3).join(", ")}`);
      addLog("finance", `Break-even: ${finance.breakEven?.mrrNeeded} at ${finance.breakEven?.estimatedMonth}. Exit: ${finance.exitMultiple}`);
      setState("finance", "done");

      // AGENT 14: TREND FORECAST
      if (isAgentEnabled("forecast")) {
        setState("forecast", "running");
      addLog("forecast", `Forecasting "${niche}" demand 6-18 months ahead using GitHub, hiring, patents, funding...`);
      const forecast = await callAI("You are the Trend Forecast Agent. Predict where market demand is going using forward-looking signals. JSON only.",
        `Forecast the "${niche}" market 6-18 months from now. Predict what WILL happen, not what is happening today.
Search: Google Trends (12-month slope and acceleration), Exploding Topics (what stage of trend curve?), GitHub Trending (commit velocity and new project launches in "${niche}"), Crunchbase (funding velocity last 6mo vs previous 6mo in "${niche}"), LinkedIn Jobs (job postings for "${niche}" roles YoY growth), Google Patents patents.google.com (filing velocity in "${niche}"), Hacker News (developer sentiment shifting?), search "AI disruption ${niche}" (will AI commoditise or supercharge this?), search "${niche} regulation 2025 2026" (regulatory tailwinds or headwinds?).
Return JSON: {"demandForecast":{"sixMonths":"growing|stable|declining","twelveMonths":"growing|stable|declining","eighteenMonths":"growing|stable|declining","confidence":"high|medium|low","rationale":"2 sentences from data"},"growthDrivers":["forces accelerating demand next 12mo"],"growthThreats":["forces that could slow or kill market"],"githubSignal":"commit velocity and new projects found","hiringSignal":"job posting trend and YoY growth","fundingSignal":"funding velocity from Crunchbase","patentSignal":"patent filing activity","aiDisruptionRisk":"high|medium|low","aiDisruptionDetail":"could AI replace this in 24 months?","regulatoryOutlook":"tailwind|neutral|headwind","regulatoryDetail":"specific regulations affecting niche","seasonality":"is this seasonal? peak months?","windowOfOpportunity":"how long before too crowded or AI-disrupted?","forecastScore":"1-10","sourcesChecked":[""]}`, true);
      if (abort.current) return;
      cap("forecast", forecast);
      addLog("forecast", `12mo: ${forecast.demandForecast?.twelveMonths} | AI risk: ${forecast.aiDisruptionRisk} | Score: ${forecast.forecastScore}/10`);
      addLog("forecast", `Window: ${forecast.windowOfOpportunity}`);
      setState("forecast", "done");
      await delay(500);  // forecast end
      } else {
        setState("forecast", "skipped");
        addLog("forecast", "Skipped — disabled in agent selector");
      }

      // AGENT 15: DISTRIBUTION INTELLIGENCE
      if (isAgentEnabled("distro")) {
        setState("distro", "running");
      addLog("distro", `Reverse-engineering how ${T.name} actually grew — timeline, viral loops, cold outreach...`);
      const distro = await callAI("You are the Distribution Intelligence Agent. Reverse-engineer exactly how the competitor grew from 0 to where they are now. JSON only.",
        `Reverse-engineer the complete growth engine of "${T.name}" (${T.what}, revenue: ${T.revenue}).
Search: Wayback Machine web.archive.org (what did "${T.name}" look like at launch? early messaging?), Product Hunt (did they launch there? when? upvotes?), Reddit (oldest mentions of "${T.name}" — where did early users come from?), SimilarWeb (when did organic search start growing vs paid?), Facebook Ad Library (when was their FIRST ad? = when paid growth started), Minea (full ad history — what creatives worked early vs now?), SpyFu (PPC history — when did paid search start?), IndieHackers (has founder shared growth story?), LinkedIn (team composition reveals primary acquisition bet).
Return JSON: {"growthTimeline":[{"phase":"0-100 customers","primaryChannel":"","tactics":[""],"timeframe":""},{"phase":"100-1000 customers","primaryChannel":"","tactics":[""],"timeframe":""},{"phase":"1000+ customers","primaryChannel":"","tactics":[""],"timeframe":""}],"primaryGrowthEngine":"single channel driving most growth","viralMechanics":"how does product spread naturally?","coldOutreachPlaybook":"did they use cold email/DM? what targeting?","contentStrategy":"what content drove organic growth?","communityStrategy":"which communities seeded first?","affiliateStructure":"commission and top affiliates","partnershipLever":"key integrations unlocking distribution","paidAcquisitionStart":"when did paid growth start and what triggered it?","cac":"estimated CAC","paybackPeriod":"months to recover CAC","growthMistakes":"channels that clearly failed","copyablePlaybook":["5 specific tactics to replicate early growth"],"unfairAdvantage":"distribution advantage you must replicate or bypass","sourcesChecked":[""]}`, true);
      if (abort.current) return;
      cap("distro", distro);
      addLog("distro", `Primary engine: ${distro.primaryGrowthEngine}`);
      addLog("distro", `Viral mechanic: ${distro.viralMechanics}`);
      addLog("distro", `Copy: ${distro.copyablePlaybook?.slice(0,2).join(" | ")}`);
      setState("distro", "done");
      await delay(500);  // distro end
      } else {
        setState("distro", "skipped");
        addLog("distro", "Skipped — disabled in agent selector");
      }

      // AGENT 16: MOAT DESIGNER
      if (isAgentEnabled("moat")) {
        setState("moat", "running");
      addLog("moat", `Designing defensibility for ${strategist.name} — network effects, data moats, switching costs...`);
      const moat = await callAI("You are the Moat Designer Agent. Design a defensibility strategy so this product is hard to copy once built. JSON only.",
        `Design the defensibility strategy for "${strategist.name}" in "${niche}".
First research what keeps users in "${T.name}" despite complaints: G2 (why do users stay despite hating things? look for switching friction comments), BuiltWith (how many integrations? depth = switching cost), Crunchbase (partnership/acquisition announcements signal ecosystem strategy), LinkedIn (team composition: data scientists=data moat, community managers=community moat), GitHub (open source projects = ecosystem moat).
Your differentiators: ${JSON.stringify(strategist.differentiators)}.
Return JSON: {"currentCompetitorMoats":["what keeps ${T.name} users locked in despite complaints"],"moatDesign":[{"moatType":"data|network-effect|switching-cost|ecosystem|brand|community|ai-personalization","description":"specific moat","howToBuild":"exact steps","timeToEstablish":"","strength":"strong|medium|weak","priority":"1-5"}],"primaryMoat":"single strongest moat to focus on first","moatStatement":"This business becomes hard to copy because...","networkEffectPotential":"does product get better as more people use it?","dataAsset":"what proprietary data accumulates that competitors cannot replicate?","switchingCostDesign":"product decisions that increase switching cost without harming UX","ecosystemStrategy":"which integrations to build first for lock-in","communityMoat":"how to build community as distribution and retention asset","defenseTimeline":[{"milestone":"Month 3","moatBuilt":""},{"milestone":"Month 6","moatBuilt":""},{"milestone":"Month 12","moatBuilt":""}],"vulnerabilities":["where is this moat strategy still weak?"]}`, true);
      if (abort.current) return;
      cap("moat", moat);
      addLog("moat", `Primary moat: ${moat.primaryMoat}`);
      addLog("moat", moat.moatStatement);
      setState("moat", "done");
      await delay(500);  // moat end
      } else {
        setState("moat", "skipped");
        addLog("moat", "Skipped — disabled in agent selector");
      }

      // AGENT 17: EXECUTION RISK
      if (isAgentEnabled("execrisk")) {
        setState("execrisk", "running");
      addLog("execrisk", `Scoring execution risk across 6 dimensions...`);
      const execrisk = await callAI("You are the Execution Risk Agent. Score the realistic difficulty of building and scaling this product. Be honest. JSON only.",
        `Score execution risk for building "${strategist.name}" in "${niche}".
Research: BuiltWith ("${T.name}" tech complexity), G2 (support burden from user complaints), Reddit and IndieHackers (founders who tried building in "${niche}" — what did they struggle with?), Crunchbase (competitor raises — bootstrapped feasibility), search "building ${niche} SaaS difficult".
Stack: ${JSON.stringify(builder.recommendedStack)}. Features: ${JSON.stringify(builder.mvpFeatures?.slice(0,5)?.map(f => f.feature))}. Legal: ${JSON.stringify(legal.priorityActions?.slice(0,3)?.map(a => a.action))}.
Return JSON: {"riskScores":{"technicalRisk":{"score":"1-10","level":"Low|Medium|High|Critical","rationale":"","mitigation":""},"salesRisk":{"score":"1-10","level":"Low|Medium|High|Critical","rationale":"how hard to close customers","mitigation":""},"regulatoryRisk":{"score":"1-10","level":"Low|Medium|High|Critical","rationale":"","mitigation":""},"supportBurden":{"score":"1-10","level":"Low|Medium|High|Critical","rationale":"expected support complexity","mitigation":""},"capitalRisk":{"score":"1-10","level":"Low|Medium|High|Critical","rationale":"bootstrappable?","mitigation":""},"hiringRisk":{"score":"1-10","level":"Low|Medium|High|Critical","rationale":"skill availability","mitigation":""}},"overallExecutionScore":"0-100 (100=easiest)","overallRiskLevel":"Low|Medium|High|Critical","biggestRisk":"single most likely reason this fails","riskMitigation":"most important thing to reduce overall risk","bootstrappable":true,"bootstrapRationale":"why can or cannot bootstrap","criticalDependencies":["things that must go right"],"earlyWarningSignals":["signs in first 90 days things are going wrong"],"sourcesChecked":[""]}`, true);
      if (abort.current) return;
      cap("execrisk", execrisk);
      const rs = execrisk.riskScores;
      addLog("execrisk", `Execution score: ${execrisk.overallExecutionScore}/100 — ${execrisk.overallRiskLevel} overall risk`);
      addLog("execrisk", `Tech: ${rs?.technicalRisk?.level} | Sales: ${rs?.salesRisk?.level} | Regulatory: ${rs?.regulatoryRisk?.level} | Support: ${rs?.supportBurden?.level}`);
      addLog("execrisk", `Biggest risk: ${execrisk.biggestRisk}`);
      setState("execrisk", "done");
      await delay(500);  // execrisk end
      } else {
        setState("execrisk", "skipped");
        addLog("execrisk", "Skipped — disabled in agent selector");
      }

      // AGENT 18: OPPORTUNITY SCORE (weighted 0-100)
      if (isAgentEnabled("oppscore")) {
      setState("oppscore", "running");
      addLog("oppscore", `Computing final weighted opportunity score across 12 dimensions from all 17 agents...`);
      const oppscore = await callAI("You are the Opportunity Scorer. Synthesise all research into a single definitive weighted 0-100 score. Be precise and ruthlessly honest. JSON only.",
        `Compute the final Opportunity Score for "${strategist.name}" in "${niche}" using ALL agent research.

Data to score with:
- Niche score: ${scorer.overallScore}/50 (${scorer.verdict})
- Demand: ${validator.demandScore}/10 | Competition: ${validator.competitionScore}/10 | Trend: ${validator.trendDirection}
- 12mo forecast: ${forecast.demandForecast?.twelveMonths} | AI disruption: ${forecast.aiDisruptionRisk} | Forecast score: ${forecast.forecastScore}/10
- Top gaps: ${analyst.topGaps?.join(", ")} | Mentions: high frequency
- Pricing power: ${pricing.pricingInsight}
- Primary growth engine: ${distro.primaryGrowthEngine} | CAC: ${distro.cac}
- Primary moat: ${moat.primaryMoat}
- Execution score: ${execrisk.overallExecutionScore}/100 | Risk: ${execrisk.overallRiskLevel}
- Virality: ${distro.viralMechanics}
- SEO: ${seo.quickWins?.length || 0} quick wins found
- Regulatory: ${legal.priorityActions?.length || 0} actions needed

Return JSON: {"dimensions":{"marketSize":{"score":0,"max":10,"weight":10,"weightedScore":0,"rationale":""},"growthRate":{"score":0,"max":10,"weight":10,"weightedScore":0,"rationale":""},"customerPain":{"score":0,"max":15,"weight":15,"weightedScore":0,"rationale":""},"competition":{"score":0,"max":10,"weight":10,"weightedScore":0,"rationale":""},"pricingPower":{"score":0,"max":10,"weight":10,"weightedScore":0,"rationale":""},"cacDifficulty":{"score":0,"max":10,"weight":10,"weightedScore":0,"rationale":""},"retentionPotential":{"score":0,"max":10,"weight":10,"weightedScore":0,"rationale":""},"virality":{"score":0,"max":5,"weight":5,"weightedScore":0,"rationale":""},"seoOpportunity":{"score":0,"max":5,"weight":5,"weightedScore":0,"rationale":""},"aiDefensibility":{"score":0,"max":5,"weight":5,"weightedScore":0,"rationale":""},"technicalComplexity":{"score":0,"max":5,"weight":5,"weightedScore":0,"rationale":"inverse of tech risk"},"regulatoryRisk":{"score":0,"max":5,"weight":5,"weightedScore":0,"rationale":"inverse of regulatory risk"}},"totalWeightedScore":0,"grade":"A+|A|B+|B|C+|C|D|F","verdict":"one definitive sentence — build this or not","topReasons":["top 3 reasons this scores well"],"topRisks":["top 3 reasons this could fail"],"recommendation":"proceed|pivot|avoid","pivotSuggestion":"if pivot, what angle would score higher?","confidenceLevel":"high|medium|low"}`, false);
      if (abort.current) return;
      cap("oppscore", oppscore);
      addLog("oppscore", `FINAL SCORE: ${oppscore.totalWeightedScore}/100 — Grade: ${oppscore.grade}`);
      addLog("oppscore", `Verdict: ${oppscore.verdict}`);
      addLog("oppscore", `Recommendation: ${oppscore.recommendation?.toUpperCase()}`);
      setState("oppscore", "done");  // finance end
      } else {
        setState("finance", "skipped");
        addLog("finance", "Skipped — disabled in agent selector");
      }
  // oppscore end
      } else {
        setState("oppscore", "skipped");
        addLog("oppscore", "Skipped — disabled in agent selector");
      }
      // ── HUMAN CHECKPOINT ──────────────────────────────────────────────────
      // Show the Opportunity Score and wait for human decision before continuing
      await persist(R, "validated_oppscore");
      setCheckpoint({ oppscore: R.oppscore, niche, blueprintName: R.strategist?.name });
      setRunning(false);
      return; // Pipeline pauses here — user must click proceed or stop
      setSessions(await loadSessions());

    } catch (e) {
      setError("Pipeline failed: " + e.message);
      setStates(s => { const n = { ...s }; Object.keys(n).forEach(k => { if (n[k] === "running") n[k] = "error"; }); return n; });
      await persist(R, "error");
    }
    setRunning(false);
  };

  // Run final agent (Customer Psychology) after human checkpoint approval
  const runFinalAgents = async () => {
    if (!results.oppscore || !results.strategist) return;
    setCheckpoint(null);
    setRunning(true);
    const R = { ...Object.fromEntries(Object.entries(results)) };
    const cap = (id, d) => { setR(id, d); R[id] = d; };

    try {
      // ── AGENT 19: CUSTOMER PSYCHOLOGY ──────────────────────────────────
      setState("psychol", "running");
      addLog("psychol", `Mapping emotional triggers and buying psychology of "${niche}" users...`);
      addLog("psychol", "Analysing why people really buy — beyond features, into feelings...");
      const T = results.scout?.products?.[0];
      const psychol = await callAI(
        "You are the Customer Psychology Agent. Go beyond complaints into the emotional and psychological drivers of buying decisions. JSON only.",
        `Map the deep customer psychology for buyers in the "${niche}" market who use "${T?.name || "the competitor"}".

Research these sources:
- Reddit: Search "${niche}" subreddits for posts about WHY people bought, what made them finally decide, what they were afraid of
- G2 and Capterra reviews: Look for emotional language — "finally", "relief", "wish I found this sooner", "stressed", "embarrassed"
- Facebook Groups: What language do people use when describing their pain? What words recur?
- X/Twitter: What does success look like when people share wins in "${niche}"?
- Trustpilot: What made customers disappointed vs delighted — the emotional story not just the feature
- YouTube comments on "${niche}" tutorials: What do viewers say they're struggling with emotionally?
- Amazon reviews if applicable: People reveal deep motivations in Amazon reviews

Top complaints already found: ${JSON.stringify(results.analyst?.topGaps?.slice(0,5))}.
Blueprint product: ${results.strategist?.name} — ${results.strategist?.tagline}.

Return JSON: {
  "idealCustomerProfile": {"demographics":"age range, gender, income level, job title or life situation","psychographics":"values, lifestyle, self-image","painLevel":"high|medium|low — how much does the pain hurt daily?","searchBehavior":"where they look for solutions before buying","dayInLife":"one sentence describing their typical day and where this product fits"},"primaryEmotion": "the dominant emotion driving purchase — e.g. fear of falling behind, desire for status, relief from stress",
  "buyingMotivations": [{"motivation":"","emotionalDriver":"fear|status|convenience|time|money|stress|income|belonging","strength":"high|medium|low","evidence":"where found"}],
  "buyingObjections": [{"objection":"","underlyingFear":"","howToOvercome":"","urgency":"how to create urgency around this"}],
  "trustBarriers": [{"barrier":"","severity":"high|medium|low","solution":"how to remove this barrier before they buy"}],
  "triggerMoments": ["specific moments when someone decides to buy — e.g. just got promoted, team doubled, missed a deadline"],
  "decisionMakers": {"primary":"who actually clicks buy","influencers":["who else is in the room"],"blockers":["who might stop the purchase"]},
  "messagingAngles": [{"angle":"","headline":"exact headline using this angle","why":"why this resonates emotionally"}],
  "pricingPsychology": "how price anchoring, loss aversion, and value framing should work for this audience",
  "onboardingEmotion": "what emotional state the user is in when they first log in — and how to meet them there",
  "retentionEmotion": "what keeps them emotionally attached long-term vs what makes them feel guilty enough to cancel",
  "urgencyTriggers": ["specific events or situations that create urgency to buy NOW"],
  "socialProofType": "testimonials|case studies|logos|numbers|community — what proof type works best for this buyer"
}`, true);

      if (abort.current) return;
      cap("psychol", psychol);
      addLog("psychol", `Primary emotion: ${psychol.primaryEmotion}`);
      addLog("psychol", `${psychol.buyingMotivations?.length || 0} buying motivations. ${psychol.buyingObjections?.length || 0} objections mapped.`);
      addLog("psychol", `Key trigger: ${psychol.triggerMoments?.[0]}`);
      setState("psychol", "done");

      await persist(R, "complete");
      setSessions(await loadSessions());

    } catch (e) {
      setError("Final agent failed: " + e.message);
      setState("psychol", "error");
    }
    setRunning(false);
  };

  const loadSession = async (s) => {
    // Load full session data from KV (index only has metadata)
    setTab("agents");
    setNiche(s.niche);
    setError(null);
    setGated(false);
    setCheckpoint(null);
    // Show loading state
    setStates(Object.fromEntries(AGENTS.map(a => [a.id, "idle"])));
    setLogs(Object.fromEntries(AGENTS.map(a => [a.id, []])));
    setResults({});
    const full = await loadFullSession(s.id);
    if (full?.results) {
      setResults(full.results);
      setStates(Object.fromEntries(AGENTS.map(a => [a.id, full.results[a.id] ? "done" : "idle"])));
    }
  };
  const toggleTask = (pid, ti) => { const k = `${pid}-${ti}`; setDone(d => ({ ...d, [k]: !d[k] })); };
  const totalTasks = PHASES.reduce((a, p) => a + p.tasks.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((doneCount / totalTasks) * 100);
  const mrrPct = Math.min(100, Math.round((mrr / 100000) * 100));
  const stateColor = s => s === "done" ? MONEY : s === "running" ? SIGNAL : s === "error" ? DANGER : s === "skipped" ? "#9CA3AF" : MUTED;
  const allDone = AGENTS.every(a => !enabledAgents[a.id] || states[a.id] === "done");
  const enabledCount_agents = Object.values(enabledAgents).filter(Boolean).length;
  const isAgentEnabled = (id) => enabledAgents[id] !== false;
  const toggleAgent = (id) => {
    // Prevent disabling scorer and validator — they are structural gates
    if (id === "scorer" || id === "validator") return;
    setEnabledAgents(p => ({ ...p, [id]: !p[id] }));
  };
  const toggleAllAgents = (val) => {
    setEnabledAgents(Object.fromEntries(
      AGENTS.map(a => [a.id, (a.id === "scorer" || a.id === "validator") ? true : val])
    ));
  };
  const oppScore = results.oppscore?.totalWeightedScore;
  const oppGrade = results.oppscore?.grade;
  const oppRec = results.oppscore?.recommendation;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, color: INK, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile?"12px 10px 80px":"24px 16px 80px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderBottom: `2px solid ${INK}`, paddingBottom: 16, marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Revenue engine · 19-agent system</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "3px 0 0", letterSpacing: "-.02em" }}>Find it. Validate it. Ship it.</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: MONEY }}>${mrr.toLocaleString()}<span style={{ fontSize: 11, color: MUTED, fontWeight: 400 }}> / $100K MRR</span></div>
            <div style={{ width: 150, height: 4, background: LINE, borderRadius: 3, marginTop: 4, marginLeft: "auto" }}><div style={{ width: mrrPct + "%", height: "100%", background: MONEY, borderRadius: 3, transition: "width .4s" }} /></div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `1px solid ${LINE}`, overflowX: "auto" }}>
          {[["agents","Agent pipeline",Bot],["intel","Intelligence",TrendingUp],["sources","Data sources",Globe],["history","Saved sessions",Database],["dashboard","Execution dashboard",BarChart3]].map(([k,label,Icon]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: isMobile?10:12, fontWeight: 600, color: tab === k ? INK : MUTED, borderBottom: tab === k ? `2px solid ${INK}` : "2px solid transparent", marginBottom: -1, display: "flex", alignItems: "center", gap: isMobile?3:5, fontFamily: "inherit", whiteSpace: "nowrap", padding: isMobile?"8px 8px":"10px 14px" }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {error && <div style={{ background: DANGER_BG, border: `1px solid #F0B4B4`, color: DANGER, padding: "9px 13px", borderRadius: 7, fontSize: 12, marginBottom: 12 }}>{error}</div>}

        {tab === "agents" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:8 }}>
                <div style={{ fontSize:12,color:MUTED,lineHeight:1.5,flex:1 }}>
                  <b style={{color:INK}}>{enabledCount_agents}/{AGENTS.length} agents active.</b> 40+ free sources · Validator gates at Agent 5.
                </div>
                <button onClick={()=>setShowAgentSelector(p=>!p)}
                  style={{ padding:"7px 13px",background:showAgentSelector?"#F1F0EC":"#fff",color:INK,border:`1px solid ${LINE}`,borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",flexShrink:0 }}>
                  ⚙ {showAgentSelector?"Hide":"Configure"} agents
                </button>
              </div>

              {showAgentSelector&&(
                <div style={{ background:"#fff",border:`1px solid ${LINE}`,borderRadius:10,overflow:"hidden",marginBottom:14 }}>
                  <div style={{ padding:"11px 14px",background:"#F9F8F5",borderBottom:`1px solid ${LINE}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:INK }}>Agent workflow builder</div>
                      <div style={{ fontSize:11,color:MUTED,marginTop:2 }}>Toggle agents on/off. Niche Scorer and Validator are required gates and cannot be disabled.</div>
                    </div>
                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={()=>toggleAllAgents(true)} style={{ padding:"5px 11px",background:MONEY_BG,color:MONEY,border:`1px solid #BFDECB`,borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Enable all</button>
                      <button onClick={()=>toggleAllAgents(false)} style={{ padding:"5px 11px",background:"#F1F0EC",color:MUTED,border:`1px solid ${LINE}`,borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Disable optional</button>
                    </div>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr" }}>
                    {AGENTS.map((agent,i)=>{
                      const locked=agent.id==="scorer"||agent.id==="validator";
                      const enabled=isAgentEnabled(agent.id);
                      return(
                        <div key={agent.id} onClick={()=>toggleAgent(agent.id)}
                          style={{ display:"flex",alignItems:"center",gap:9,padding:"10px 14px",borderBottom:`1px solid ${LINE}`,cursor:locked?"default":"pointer",background:!enabled?"#F9F8F5":"#fff",transition:"background .15s",userSelect:"none" }}>
                          <div style={{ width:30,height:17,borderRadius:9,background:enabled?(locked?"#9CA3AF":MONEY):LINE,position:"relative",flexShrink:0,transition:"background .2s",cursor:locked?"default":"pointer" }}>
                            <div style={{ width:13,height:13,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:enabled?15:2,transition:"left .2s",boxShadow:"0 1px 2px rgba(0,0,0,.2)" }}/>
                          </div>
                          <div style={{ width:26,height:26,borderRadius:6,background:enabled?agent.bg:"#F1F0EC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0 }}>{agent.icon}</div>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:4,flexWrap:"wrap" }}>
                              <span style={{ fontSize:9,color:MUTED,fontWeight:600 }}>{agent.label}</span>
                              <span style={{ fontSize:12,fontWeight:700,color:enabled?INK:MUTED }}>{agent.name}</span>
                              {locked&&<span style={{ fontSize:9,padding:"1px 5px",borderRadius:20,background:"#F1F0EC",color:MUTED }}>required</span>}
                              {agent.gate&&<span style={{ fontSize:9,padding:"1px 5px",borderRadius:20,background:"#E3FAFC",color:"#0C8599",fontWeight:700 }}>GATE</span>}
                            </div>
                            <div style={{ fontSize:9,color:enabled?MUTED:"#C0C4CC",lineHeight:1.4,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{agent.role}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding:"10px 14px",background:"#F9F8F5",borderTop:`1px solid ${LINE}` }}>
                    <div style={{ fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:7 }}>Quick presets</div>
                    <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                      {[
                        ["🔍 Research only",["scorer","scout","analyst","pricing","validator"]],
                        ["⚡ Fast validation",["scorer","scout","analyst","pricing","strategist","validator","execrisk","oppscore"]],
                        ["🏗 Build-ready",["scorer","scout","analyst","pricing","strategist","validator","legal","builder","qa","finance","oppscore"]],
                        ["📣 Marketing focus",["scorer","scout","analyst","pricing","validator","seo","marketing","cs","distributor","psychol","oppscore"]],
                        ["🔮 Future-proof",["scorer","scout","validator","forecast","moat","execrisk","oppscore"]],
                        ["✅ Full pipeline",null],
                      ].map(([label,ids])=>(
                        <button key={label} onClick={()=>{
                          if(ids===null){toggleAllAgents(true);return;}
                          const preset=Object.fromEntries(AGENTS.map(a=>[a.id,ids.includes(a.id)]));
                          preset.scorer=true;preset.validator=true;
                          setEnabledAgents(preset);
                        }} style={{ padding:"5px 11px",background:"#fff",color:INK,border:`1px solid ${LINE}`,borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
                <input value={niche} onChange={e => { setNiche(e.target.value); setSuggestions([]); }} onKeyDown={e => e.key === "Enter" && !running && run()}
                  placeholder="e.g. AI resume builders, habit tracking apps, project management tools..."
                  style={{ flex: 1, padding: "12px 15px", fontSize: 13, border: `1px solid ${LINE}`, borderRadius: 8, background: "#fff", fontFamily: "inherit", outline: "none", color: INK }} />
                {!running
                  ? <button onClick={run} style={{ padding: "12px 20px", background: MONEY, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "inherit", whiteSpace: "nowrap" }}><Play size={14} /> Run all agents</button>
                  : <button onClick={() => { abort.current = true; setRunning(false); }} style={{ padding: "12px 16px", background: DANGER, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Stop</button>
                }
              </div>
              <button onClick={suggestNiches} disabled={suggesting || running} style={{ padding: "8px 14px", background: "#fff", color: INK, border: `1px solid ${LINE}`, borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: suggesting || running ? "wait" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                {suggesting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : "✨"}
                {suggesting ? "Finding trending niches..." : "Suggest a niche for me"}
              </button>
            </div>

            {suggestions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 8 }}>Trending niches right now — click to select</div>
                <div style={{ display: "grid", gap: 7 }}>
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => { setNiche(s.niche); setSuggestions([]); }} style={{ textAlign: "left", padding: "11px 14px", borderRadius: 9, border: `1px solid ${LINE}`, background: "#fff", cursor: "pointer", fontFamily: "inherit", transition: "border-color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = MONEY}
                      onMouseLeave={e => e.currentTarget.style.borderColor = LINE}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{s.niche}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: s.competitionLevel==="low"?MONEY_BG:s.competitionLevel==="medium"?SIGNAL_BG:DANGER_BG, color: s.competitionLevel==="low"?MONEY:s.competitionLevel==="medium"?SIGNAL:DANGER, fontWeight: 600 }}>{s.competitionLevel} competition</span>
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: MONEY_BG, color: MONEY, fontWeight: 600 }}>{s.estimatedRevenuePotential}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 3 }}>{s.why}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: SIGNAL }}>📈 {s.signal}</span>
                        {s.monthlySearchGrowth && <span style={{ fontSize: 10, color: MONEY }}>🔍 {s.monthlySearchGrowth}</span>}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>Click any niche to select it, then hit Run all agents.</div>
              </div>
            )}

            {learningInsights.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: 6 }}>🧠 Learning layer — patterns from your past runs</div>
                {learningInsights.map((ins, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "7px 12px", borderRadius: 7, marginBottom: 5, background: ins.type==="warning"?SIGNAL_BG:ins.type==="success"?MONEY_BG:"#EDF2FF", border: `1px solid ${ins.type==="warning"?"#EAD09A":ins.type==="success"?"#BFDECB":"#BAD3F8"}` }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{ins.type==="warning"?"⚠️":ins.type==="success"?"✓":"→"}</span>
                    <span style={{ fontSize: 12, color: INK, lineHeight: 1.5 }}>{ins.text}</span>
                  </div>
                ))}
              </div>
            )}

            {gated && results.validator && (
              <div style={{ background: SIGNAL_BG, border: `1px solid #EAD09A`, borderRadius: 9, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}><PauseCircle size={16} color={SIGNAL} /><span style={{ fontSize: 13, fontWeight: 700, color: SIGNAL }}>Pipeline paused by Validator (Agent 5)</span></div>
                <div style={{ fontSize: 12, color: "#6B4A0F", marginBottom: 6 }}>{results.validator.gateReason}</div>
                <div style={{ fontSize: 12, marginBottom: 6 }}>Trend: <b style={{ color: results.validator.trendDirection==="growing"?MONEY:DANGER }}>{results.validator.trendDirection}</b> | Ads: <b>{results.validator.adActivity}</b> | Community: <b>{results.validator.communitySize}</b></div>
                {results.validator.redFlags?.map((f, i) => <div key={i} style={{ fontSize: 11, color: DANGER, marginBottom: 2 }}>⚠ {f}</div>)}
                <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
                  <button onClick={() => { setGated(false); run(); }} style={{ padding: "8px 14px", background: INK, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Override — continue anyway</button>
                  <button onClick={() => { setNiche(""); resetAll(); }} style={{ padding: "8px 14px", background: "#fff", color: INK, border: `1px solid ${LINE}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Try different niche</button>
                </div>
              </div>
            )}

            {checkpoint && (
              <div style={{ background: "#fff", border: `2px solid ${MONEY}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ background: MONEY, color: "#fff", padding: "14px 18px" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.8, fontWeight: 700 }}>Human checkpoint — Agent 20 complete</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>Your Opportunity Score is ready</div>
                </div>
                <div style={{ padding: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                    <div style={{ textAlign: "center", padding: "16px 20px", borderRadius: 10, background: checkpoint.oppscore?.totalWeightedScore >= 70 ? MONEY_BG : checkpoint.oppscore?.totalWeightedScore >= 50 ? SIGNAL_BG : DANGER_BG, border: `2px solid ${checkpoint.oppscore?.totalWeightedScore >= 70 ? MONEY : checkpoint.oppscore?.totalWeightedScore >= 50 ? SIGNAL : DANGER}` }}>
                      <div style={{ fontFamily: "monospace", fontSize: 36, fontWeight: 700, color: checkpoint.oppscore?.totalWeightedScore >= 70 ? MONEY : checkpoint.oppscore?.totalWeightedScore >= 50 ? SIGNAL : DANGER }}>{checkpoint.oppscore?.totalWeightedScore}</div>
                      <div style={{ fontSize: 12, color: MUTED }}>out of 100</div>
                      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: checkpoint.oppscore?.totalWeightedScore >= 70 ? MONEY : checkpoint.oppscore?.totalWeightedScore >= 50 ? SIGNAL : DANGER }}>{checkpoint.oppscore?.grade}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 6 }}>{checkpoint.oppscore?.verdict}</div>
                      <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: checkpoint.oppscore?.recommendation === "proceed" ? MONEY_BG : checkpoint.oppscore?.recommendation === "pivot" ? SIGNAL_BG : DANGER_BG, color: checkpoint.oppscore?.recommendation === "proceed" ? MONEY : checkpoint.oppscore?.recommendation === "pivot" ? SIGNAL : DANGER, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
                        {checkpoint.oppscore?.recommendation}
                      </div>
                      {checkpoint.oppscore?.pivotSuggestion && checkpoint.oppscore?.recommendation !== "proceed" && (
                        <div style={{ fontSize: 11, color: SIGNAL, marginTop: 6 }}>Pivot angle: {checkpoint.oppscore.pivotSuggestion}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap: 10, marginBottom: 14 }}>
                    <div style={{ background: MONEY_BG, border: `1px solid #BFDECB`, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: MONEY, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>Why this scores well</div>
                      {checkpoint.oppscore?.topReasons?.map((r, i) => <div key={i} style={{ fontSize: 11, color: INK, marginBottom: 3 }}>✓ {r}</div>)}
                    </div>
                    <div style={{ background: DANGER_BG, border: `1px solid #F0B4B4`, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: DANGER, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>Why this could fail</div>
                      {checkpoint.oppscore?.topRisks?.map((r, i) => <div key={i} style={{ fontSize: 11, color: DANGER, marginBottom: 3 }}>⚠ {r}</div>)}
                    </div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 12 }}>
                    This is your go/no-go moment. The next agent (Customer Psychology) digs into emotional triggers and buying motivations. Only run it if you're proceeding.
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={runFinalAgents} style={{ flex: 1, padding: "12px 16px", background: MONEY, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                      ✓ Proceed — run Customer Psychology agent
                    </button>
                    <button onClick={() => { setCheckpoint(null); setNiche(""); resetAll(); }} style={{ padding: "12px 16px", background: "#fff", color: INK, border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      ✕ Try a different niche
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gap: 7 }}>
              {AGENTS.map((agent, idx) => {
                const s = states[agent.id], lg = logs[agent.id], isOpen = open[agent.id], d = results[agent.id];
                return (
                  <div key={agent.id} style={{ border: `1px solid ${s==="done"?MONEY:s==="running"?SIGNAL:s==="error"?DANGER:s==="skipped"?"#D1D5DB":LINE}`, borderRadius: 9, overflow: "hidden", transition: "border-color .3s", opacity: !isAgentEnabled(agent.id) && s==="idle" ? 0.5 : 1 }}>
                    <div onClick={() => setOpen(p => ({ ...p, [agent.id]: !p[agent.id] }))}
                      style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", background: s==="done"?MONEY_BG:s==="running"?SIGNAL_BG:"#F9F8F5", cursor: "pointer", userSelect: "none" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 7, background: agent.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{agent.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>{agent.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{agent.name}</span>
                          {agent.gate && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 20, background: "#E3FAFC", color: "#0C8599", fontWeight: 700, border: "1px solid #0C859940" }}>GATE</span>}
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "1px 6px", borderRadius: 20, color: stateColor(s), background: s==="done"?MONEY_BG:s==="running"?SIGNAL_BG:s==="skipped"?"#F1F0EC":"#F1F0EC", border: `1px solid ${stateColor(s)}40` }}>
                            {s==="idle"?"waiting":s==="running"?"running...":s==="skipped"?"skipped":s}
                          </span>
                          {s==="running" && <Loader2 size={11} color={SIGNAL} style={{ animation: "spin 1s linear infinite" }} />}
                          {s==="done" && <CheckCircle2 size={11} color={MONEY} />}
                        </div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{agent.role}</div>
                      </div>
                      {isOpen ? <ChevronUp size={13} color={MUTED} /> : <ChevronDown size={13} color={MUTED} />}
                    </div>
                    {isOpen && (
                      <div style={{ background: "#fff", borderTop: `1px solid ${LINE}` }}>
                        {lg.length > 0 && (
                          <div style={{ padding: "7px 13px", borderBottom: d ? `1px solid ${LINE}` : "none" }}>
                            {lg.map((l, i) => (
                              <div key={i} style={{ display: "flex", gap: 7, padding: "2px 0" }}>
                                <span style={{ fontSize: 9, color: MUTED, flexShrink: 0, fontFamily: "monospace" }}>{l.t}</span>
                                <span style={{ fontSize: 11, color: INK, lineHeight: 1.5 }}>{l.m}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {!d && s==="idle" && <div style={{ padding: "9px 13px", fontSize: 11, color: MUTED, fontStyle: "italic" }}>{idx===0?"Waiting for niche input...":`Waiting for ${AGENTS[idx-1]?.name}...`}</div>}
                        {d && <AgentOutput agent={agent} data={d} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!running && Object.values(states).every(s => s==="idle") && (
              <div style={{ textAlign: "center", padding: "40px 16px", color: MUTED }}>
                <Bot size={28} style={{ marginBottom: 10, opacity: 0.3 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>19 agents · 40+ data sources</div>
                <div style={{ fontSize: 12, marginTop: 5, maxWidth: 440, margin: "5px auto 0", lineHeight: 1.6 }}>Including Minea, AppMagic, Sensor Tower, Flippa, Facebook Ad Library, eRank, Merch Titans, Baremetrics Open Startups, and more. See the Data sources tab for the full list.</div>
              </div>
            )}
            {allDone && (
              <div style={{ textAlign: "center", padding: "18px", background: MONEY_BG, border: `1px solid #BFDECB`, borderRadius: 9, marginTop: 10 }}>
                <CheckCircle2 size={22} color={MONEY} style={{ marginBottom: 5 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: MONEY }}>All 18 agents complete — saved to history and Google Sheets</div>
                {oppScore !== undefined && (
                  <div style={{ marginTop: 8, display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 700, color: oppScore>=70?MONEY:oppScore>=50?SIGNAL:DANGER }}>{oppScore}/100</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: oppScore>=70?MONEY:oppScore>=50?SIGNAL:DANGER }}>Grade: {oppGrade}</div>
                    <div style={{ padding: "4px 14px", borderRadius: 20, background: oppRec==="proceed"?MONEY:oppRec==="avoid"?DANGER:SIGNAL, color: "#fff", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{oppRec}</div>
                  </div>
                )}
                <button onClick={() => setTab("dashboard")} style={{ marginTop: 10, padding: "8px 16px", background: MONEY, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5 }}>Go to dashboard <ArrowRight size={12} /></button>
                <button onClick={() => setTab("intel")} style={{ marginTop: 10, marginLeft: 8, padding: "8px 16px", background: "#fff", color: MONEY, border: `1px solid ${MONEY}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5 }}>View validation hub →</button>
              </div>
            )}
          </div>
        )}

        {tab === "intel" && (
          <div>
            {!results.scout ? (
              <div style={{textAlign:"center",padding:"50px 16px",color:MUTED}}>
                <div style={{fontSize:28,marginBottom:10}}>🔍</div>
                <div style={{fontSize:14,fontWeight:600,color:INK}}>No intelligence yet</div>
                <div style={{fontSize:12,marginTop:5,lineHeight:1.6}}>Run the agent pipeline first. Once complete, all competitor and product intelligence aggregates here.</div>
                <button onClick={()=>setTab("agents")} style={{marginTop:14,padding:"9px 18px",background:MONEY,color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Go to agents →</button>
              </div>
            ) : (
              <div>
                {/* Toggle */}
                <div style={{display:"flex",gap:0,marginBottom:20,background:"#F1F0EC",borderRadius:9,padding:3}}>
                  {[["validate","✅ Validation hub"],["competitor","🎯 Competitor intelligence"],["product","🚀 Your product blueprint"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setIntelView(v)} style={{flex:1,padding:isMobile?"7px 8px":"9px 14px",background:intelView===v?"#fff":"transparent",border:"none",borderRadius:7,fontSize:isMobile?10:12,fontWeight:700,color:intelView===v?INK:MUTED,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",boxShadow:intelView===v?"0 1px 4px rgba(0,0,0,.08)":"none"}}>{l}</button>
                  ))}
                </div>

                {/* ── VALIDATION HUB ─────────────────────────────────────── */}
                {intelView === "validate" && (() => {
                  const sc  = results.scorer;
                  const sv  = results.scout;
                  const an  = results.analyst;
                  const pr  = results.pricing;
                  const vl  = results.validator;
                  const lg  = results.legal;
                  const fc  = results.forecast;
                  const di  = results.distro;
                  const mo  = results.moat;
                  const er  = results.execrisk;
                  const op  = results.oppscore;
                  const T   = sv?.products?.[0];

                  // Compute overall readiness
                  const scores = [
                    sc?.overallScore ? Math.round((sc.overallScore/50)*100) : null,
                    vl?.demandScore  ? Math.round((parseInt(vl.demandScore)/10)*100) : null,
                    vl?.competitionScore ? Math.round((parseInt(vl.competitionScore)/10)*100) : null,
                    op?.totalWeightedScore || null,
                    er?.overallExecutionScore ? parseInt(er.overallExecutionScore) : null,
                    fc?.forecastScore ? Math.round((parseInt(fc.forecastScore)/10)*100) : null,
                  ].filter(Boolean);
                  const avgScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null;
                  const readiness = avgScore >= 75 ? "BUILD" : avgScore >= 55 ? "VALIDATE MORE" : avgScore >= 40 ? "PIVOT" : "ABORT";
                  const readinessColor = readiness==="BUILD"?MONEY:readiness==="VALIDATE MORE"?SIGNAL:DANGER;
                  const readinessBg = readiness==="BUILD"?MONEY_BG:readiness==="VALIDATE MORE"?SIGNAL_BG:DANGER_BG;

                  // Collect all green lights and red flags across agents
                  const allGreenLights = [
                    ...(vl?.greenLights||[]).map(g=>({src:"Validator",text:g})),
                    ...(sc?.trendingSignals||[]).slice(0,3).map(g=>({src:"Niche Scorer",text:g})),
                    ...(op?.topReasons||[]).map(g=>({src:"Opportunity Score",text:g})),
                    ...(fc?.growingSignals||[]).map(g=>({src:"Forecast",text:g})),
                    ...(mo?.moatStrength==="high"?[{src:"Moat",text:`Strong ${mo.primaryMoat} moat identified`}]:[]),
                  ].filter(x=>x.text);

                  const allRedFlags = [
                    ...(vl?.redFlags||[]).map(r=>({src:"Validator",text:r,sev:"high"})),
                    ...(op?.topRisks||[]).map(r=>({src:"Opportunity Score",text:r,sev:"high"})),
                    ...(er?.technicalRisk==="high"?[{src:"Execution Risk",text:"Technical complexity is HIGH",sev:"high"}]:[]),
                    ...(er?.salesRisk==="high"?[{src:"Execution Risk",text:"Sales cycle risk is HIGH",sev:"high"}]:[]),
                    ...(er?.regulatoryRisk==="high"?[{src:"Execution Risk",text:"Regulatory risk is HIGH",sev:"high"}]:[]),
                    ...(fc?.aiDisruptionRisk==="high"?[{src:"Forecast",text:"HIGH risk of AI disruption within 24 months",sev:"high"}]:[]),
                    ...(lg?.ipRisks||[]).filter(r=>r.severity==="high").map(r=>({src:"Legal",text:r.risk,sev:"high"})),
                    ...(sv?.products||[]).filter(p=>p.adActivity==="high"&&p!==T).slice(0,2).map(p=>({src:"Scout",text:`${p.name} is well-funded and running heavy ads`,sev:"medium"})),
                  ].filter(x=>x.text);

                  // Legal blockers
                  const legalBlockers = (lg?.priorityActions||[]).filter(a=>a.urgency==="before-launch");
                  const legalWarnings = (lg?.priorityActions||[]).filter(a=>a.urgency==="first-month");

                  return <div style={{display:"grid",gap:12}}>

                    {/* ── MASTER VERDICT ── */}
                    <div style={{background:"#fff",border:`2px solid ${readinessColor}`,borderRadius:12,overflow:"hidden"}}>
                      <div style={{background:readinessColor,color:"#fff",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                        <div>
                          <div style={{fontSize:10,letterSpacing:".14em",textTransform:"uppercase",opacity:.75,fontWeight:700}}>Build readiness verdict</div>
                          <div style={{fontSize:28,fontWeight:700,letterSpacing:"-.02em",marginTop:2}}>{readiness}</div>
                          {op?.verdict&&<div style={{fontSize:12,opacity:.85,marginTop:2}}>{op.verdict}</div>}
                        </div>
                        <div style={{textAlign:"right"}}>
                          {avgScore&&<div style={{fontFamily:"monospace",fontSize:36,fontWeight:700}}>{avgScore}<span style={{fontSize:14,opacity:.7}}>/100</span></div>}
                          {op?.grade&&<div style={{fontSize:20,fontWeight:700,opacity:.85}}>{op.grade}</div>}
                        </div>
                      </div>
                      {/* Score grid */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:0,borderBottom:`1px solid ${LINE}`}}>
                        {[
                          ["Niche score", sc?.overallScore ? `${sc.overallScore}/50` : null, sc?.overallScore>=35?MONEY:sc?.overallScore>=25?SIGNAL:DANGER],
                          ["Demand",      vl?.demandScore ? `${vl.demandScore}/10` : null, parseInt(vl?.demandScore)>=6?MONEY:SIGNAL],
                          ["Competition", vl?.competitionScore ? `${vl.competitionScore}/10` : null, parseInt(vl?.competitionScore)>=5?MONEY:DANGER],
                          ["Trend",       vl?.trendDirection, vl?.trendDirection==="growing"?MONEY:vl?.trendDirection==="stable"?SIGNAL:DANGER],
                          ["Opportunity", op?.totalWeightedScore ? `${op.totalWeightedScore}/100` : null, op?.totalWeightedScore>=70?MONEY:op?.totalWeightedScore>=50?SIGNAL:DANGER],
                          ["Execution",   er?.overallExecutionScore ? `${er.overallExecutionScore}/100` : null, parseInt(er?.overallExecutionScore)>=70?MONEY:parseInt(er?.overallExecutionScore)>=50?SIGNAL:DANGER],
                          ["Forecast",    fc?.forecastScore ? `${fc.forecastScore}/10` : null, parseInt(fc?.forecastScore)>=6?MONEY:SIGNAL],
                          ["Ad activity", vl?.adActivity, vl?.adActivity==="high"?MONEY:vl?.adActivity==="medium"?SIGNAL:MUTED],
                        ].filter(([,v])=>v).map(([k,v,c])=>(
                          <div key={k} style={{padding:"10px 8px",textAlign:"center",borderRight:`1px solid ${LINE}`}}>
                            <div style={{fontSize:9,color:MUTED,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{k}</div>
                            <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:c}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {op?.recommendation&&(
                        <div style={{padding:"10px 16px",display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",padding:"3px 12px",borderRadius:20,background:op.recommendation==="proceed"?MONEY_BG:op.recommendation==="pivot"?SIGNAL_BG:DANGER_BG,color:op.recommendation==="proceed"?MONEY:op.recommendation==="pivot"?SIGNAL:DANGER}}>{op.recommendation}</span>
                          {op.pivotSuggestion&&<span style={{fontSize:11,color:MUTED}}>{op.pivotSuggestion}</span>}
                        </div>
                      )}
                    </div>

                    {/* ── WEIGHTED OPPORTUNITY SCORE BREAKDOWN ── */}
                    {op?.dimensionScores&&(
                      <Section title="📊 Opportunity score — 12 dimension breakdown" color={MONEY} bg={MONEY_BG}>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:5}}>
                          {Object.entries(op.dimensionScores).map(([k,v])=>(
                            <div key={k} style={{padding:"6px 8px",borderRadius:6,background:"#F9F8F5",border:`1px solid ${LINE}`}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                                <span style={{fontSize:10,fontWeight:600,color:INK,textTransform:"capitalize"}}>{k.replace(/([A-Z])/g," $1")}</span>
                                <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:v>=7?MONEY:v>=5?SIGNAL:DANGER}}>{v}/10</span>
                              </div>
                              <div style={{height:4,background:LINE,borderRadius:2}}>
                                <div style={{width:`${(v/10)*100}%`,height:"100%",background:v>=7?MONEY:v>=5?SIGNAL:DANGER,borderRadius:2}}/>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {/* ── GREEN LIGHTS vs RED FLAGS ── */}
                    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
                      <Section title={`✅ Green lights (${allGreenLights.length})`} color={MONEY} bg={MONEY_BG}>
                        {allGreenLights.length===0&&<div style={{fontSize:11,color:MUTED}}>Run more agents to surface signals.</div>}
                        {allGreenLights.map((g,i)=>(
                          <div key={i} style={{padding:"5px 0",borderBottom:i<allGreenLights.length-1?`1px solid ${LINE}`:"none"}}>
                            <div style={{fontSize:9,fontWeight:700,color:MONEY,textTransform:"uppercase",marginBottom:1}}>{g.src}</div>
                            <div style={{fontSize:11,color:INK}}>✓ {g.text}</div>
                          </div>
                        ))}
                      </Section>
                      <Section title={`🚨 Red flags (${allRedFlags.length})`} color={DANGER} bg={DANGER_BG}>
                        {allRedFlags.length===0&&<div style={{fontSize:11,color:MUTED}}>No critical red flags found.</div>}
                        {allRedFlags.map((r,i)=>(
                          <div key={i} style={{padding:"5px 0",borderBottom:i<allRedFlags.length-1?`1px solid ${LINE}`:"none"}}>
                            <div style={{fontSize:9,fontWeight:700,color:DANGER,textTransform:"uppercase",marginBottom:1}}>{r.src}</div>
                            <div style={{fontSize:11,color:INK}}>⚠ {r.text}</div>
                          </div>
                        ))}
                      </Section>
                    </div>

                    {/* ── MARKET VALIDATION ── */}
                    <Section title="📈 Market validation signals" color="#0C8599" bg="#E3FAFC">
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:7,marginBottom:10}}>
                        {[
                          {label:"TAM estimate",      value:sc?.estimatedTAM,       color:INK},
                          {label:"Community size",    value:vl?.communitySize,      color:INK},
                          {label:"VC activity",       value:vl?.vcActivity,         color:MONEY},
                          {label:"Trend direction",   value:vl?.trendDirection,     color:vl?.trendDirection==="growing"?MONEY:SIGNAL},
                          {label:"6-month forecast",  value:fc?.demandIn6Months,    color:SIGNAL},
                          {label:"12-month forecast", value:fc?.demandIn12Months,   color:SIGNAL},
                          {label:"AI disruption risk",value:fc?.aiDisruptionRisk,   color:fc?.aiDisruptionRisk==="high"?DANGER:MONEY},
                          {label:"Best angle",        value:sc?.bestAngle,          color:"#6741D9"},
                        ].filter(x=>x.value).map((x,i)=>(
                          <div key={i} style={{padding:"8px 10px",borderRadius:7,background:"#F9F8F5",border:`1px solid ${LINE}`}}>
                            <div style={{fontSize:9,color:MUTED,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{x.label}</div>
                            <div style={{fontSize:11,fontWeight:600,color:x.color,lineHeight:1.4}}>{x.value}</div>
                          </div>
                        ))}
                      </div>
                      {sc?.trendingSignals?.length>0&&(
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:5}}>Trending signals found</div>
                          {sc.trendingSignals.map((s,i)=><div key={i} style={{fontSize:11,color:SIGNAL,marginBottom:2}}>→ {s}</div>)}
                        </div>
                      )}
                    </Section>

                    {/* ── COMPETITOR THREAT ASSESSMENT ── */}
                    {sv?.products?.length>0&&(
                      <Section title="⚔️ Competitor threat assessment" color={DANGER} bg={DANGER_BG}>
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:11,fontWeight:600,color:INK,marginBottom:6}}>Market opening: <span style={{color:MONEY}}>{an?.marketOpening}</span></div>
                          {sv.products.map((p,i)=>(
                            <div key={i} style={{padding:"8px 10px",borderRadius:7,border:`1px solid ${i===0?DANGER:LINE}`,background:i===0?"#fff":"#F9F8F5",marginBottom:5}}>
                              <div style={{display:"flex",justifyContent:"space-between",gap:6,flexWrap:"wrap"}}>
                                <span style={{fontSize:12,fontWeight:700}}>{p.name}</span>
                                <div style={{display:"flex",gap:5}}>
                                  <span style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:MONEY}}>{p.revenue}</span>
                                  <span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:p.adActivity==="high"?DANGER_BG:SIGNAL_BG,color:p.adActivity==="high"?DANGER:SIGNAL}}>ads:{p.adActivity}</span>
                                </div>
                              </div>
                              <div style={{fontSize:10,color:MUTED,marginTop:2}}>{p.what}</div>
                              {p.weaknesses?.length>0&&(
                                <div style={{marginTop:4}}>
                                  {p.weaknesses.map((w,j)=><span key={j} style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:MONEY_BG,color:MONEY,marginRight:3}}>✓ Gap: {w}</span>)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {an?.gaps?.length>0&&(
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:5}}>Top validated gaps (attack these)</div>
                            {an.gaps.filter(g=>g.paySignal==="high").slice(0,4).map((g,i)=>(
                              <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${LINE}`}}>
                                <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20,background:MONEY_BG,color:MONEY,flexShrink:0}}>HIGH PAY</span>
                                <div>
                                  <div style={{fontSize:11,fontWeight:600}}>{g.feature}</div>
                                  <div style={{fontSize:10,color:MUTED,fontStyle:"italic"}}>"{g.complaint}" · ~{g.mentionCount} mentions</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Section>
                    )}

                    {/* ── PRICING VALIDATION ── */}
                    {pr&&(
                      <Section title="💰 Pricing validation" color="#2F9E44" bg="#EBFBEE">
                        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:7,marginBottom:10}}>
                          <div style={{padding:"8px 10px",borderRadius:7,background:"#F9F8F5",border:`1px solid ${LINE}`,textAlign:"center"}}>
                            <div style={{fontSize:9,color:MUTED,fontWeight:700,textTransform:"uppercase"}}>Market low</div>
                            <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:INK,marginTop:2}}>{pr.marketPricingRange?.lowest}</div>
                          </div>
                          <div style={{padding:"8px 10px",borderRadius:7,background:MONEY_BG,border:`2px solid ${MONEY}`,textAlign:"center"}}>
                            <div style={{fontSize:9,color:MONEY,fontWeight:700,textTransform:"uppercase"}}>Market median</div>
                            <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:MONEY,marginTop:2}}>{pr.marketPricingRange?.median||"—"}</div>
                          </div>
                          <div style={{padding:"8px 10px",borderRadius:7,background:"#F9F8F5",border:`1px solid ${LINE}`,textAlign:"center"}}>
                            <div style={{fontSize:9,color:MUTED,fontWeight:700,textTransform:"uppercase"}}>Market high</div>
                            <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:INK,marginTop:2}}>{pr.marketPricingRange?.highest}</div>
                          </div>
                        </div>
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:4}}>Willingness to pay signals</div>
                          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:5}}>
                            {[["Conservative",pr.willingnessToPay?.low],["Median",pr.willingnessToPay?.median],["Premium",pr.willingnessToPay?.high]].map(([k,v])=>v&&(
                              <div key={k} style={{padding:"5px 7px",borderRadius:6,background:"#F9F8F5",border:`1px solid ${LINE}`,textAlign:"center"}}>
                                <div style={{fontSize:9,color:MUTED}}>{k}</div>
                                <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:INK}}>{v}</div>
                              </div>
                            ))}
                          </div>
                          {pr.willingnessToPay?.evidence&&<div style={{fontSize:10,color:MUTED,marginTop:5,fontStyle:"italic"}}>Evidence: {pr.willingnessToPay.evidence}</div>}
                        </div>
                        <div style={{padding:"8px 10px",borderRadius:7,background:MONEY_BG,border:`1px solid #BFDECB`}}>
                          <span style={{fontSize:10,fontWeight:700,color:MONEY,textTransform:"uppercase"}}>Revenue path: </span>
                          <span style={{fontSize:11}}>{pr.revenueToTarget?.calculation}</span>
                        </div>
                      </Section>
                    )}

                    {/* ── DISTRIBUTION VALIDATION ── */}
                    {di&&(
                      <Section title="🧲 Distribution & growth validation" color="#C2255C" bg="#FFF0F6">
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:4}}>Growth engine confirmed</div>
                          {di.growthEngine&&<div style={{fontSize:11,marginBottom:4}}><b>Engine:</b> {di.growthEngine}</div>}
                          {di.viralMechanics&&<div style={{fontSize:11,marginBottom:4}}><b>Viral:</b> {di.viralMechanics}</div>}
                          {di.referralLoop&&<div style={{fontSize:11,marginBottom:4}}><b>Referral:</b> {di.referralLoop}</div>}
                          {di.coldOutreach&&<div style={{fontSize:11}}><b>Cold outreach:</b> {di.coldOutreach}</div>}
                        </div>
                        <div style={{padding:"7px 10px",borderRadius:7,background:"#F9F8F5",border:`1px solid ${LINE}`,fontSize:11}}>
                          <b>Your lowest-CAC channel: </b>{results.distributor?.channelStrategy?.[0]?.channel} — {results.distributor?.channelStrategy?.[0]?.why}
                        </div>
                      </Section>
                    )}

                    {/* ── DEFENSIBILITY VALIDATION ── */}
                    {mo&&(
                      <Section title="🏰 Defensibility validation" color="#862E9C" bg="#F8F0FC">
                        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:"#862E9C",textTransform:"uppercase",marginBottom:4}}>Your primary moat</div>
                            <div style={{fontSize:13,fontWeight:700,color:"#862E9C",marginBottom:4}}>{mo.primaryMoat}</div>
                            <div style={{fontSize:11,color:INK}}>{mo.defensibilityPlan}</div>
                          </div>
                          <div style={{padding:"10px",borderRadius:8,background:"#fff",border:`1px solid ${LINE}`,textAlign:"center"}}>
                            <div style={{fontSize:9,color:MUTED,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Moat strength</div>
                            <div style={{fontSize:18,fontWeight:700,color:mo.moatStrength==="high"?MONEY:mo.moatStrength==="medium"?SIGNAL:DANGER,textTransform:"capitalize"}}>{mo.moatStrength}</div>
                            <div style={{fontSize:10,color:MUTED,marginTop:3}}>{mo.moatStrength==="high"?"Hard to replicate":"Could be copied — strengthen before launch"}</div>
                          </div>
                        </div>
                      </Section>
                    )}

                    {/* ── EXECUTION RISK VALIDATION ── */}
                    {er&&(
                      <Section title="⚠️ Execution risk validation" color={SIGNAL} bg={SIGNAL_BG}>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:6,marginBottom:10}}>
                          {[
                            ["Technical",    er.technicalRisk,     er.technicalRationale],
                            ["Sales",        er.salesRisk,         er.salesRationale],
                            ["Regulatory",   er.regulatoryRisk,    er.regulatoryRationale],
                            ["Support",      er.supportBurden,     er.supportRationale],
                            ["Capital",      er.capitalRequirements,er.capitalRationale],
                            ["Hiring",       er.hiringDifficulty,  er.hiringRationale],
                          ].filter(([,v])=>v).map(([k,v,r])=>(
                            <div key={k} style={{padding:"8px 10px",borderRadius:7,background:"#fff",border:`2px solid ${v==="low"?MONEY:v==="medium"?"#EAD09A":DANGER}`}}>
                              <div style={{fontSize:9,color:MUTED,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                              <div style={{fontSize:13,fontWeight:700,textTransform:"capitalize",color:v==="low"?MONEY:v==="medium"?SIGNAL:DANGER}}>{v}</div>
                              {r&&<div style={{fontSize:9,color:MUTED,marginTop:3,lineHeight:1.4}}>{r}</div>}
                            </div>
                          ))}
                        </div>
                        <div style={{textAlign:"center",padding:"10px",borderRadius:8,background:"#fff",border:`2px solid ${parseInt(er.overallExecutionScore)>=70?MONEY:parseInt(er.overallExecutionScore)>=50?SIGNAL:DANGER}`}}>
                          <div style={{fontSize:10,color:MUTED,fontWeight:700,textTransform:"uppercase"}}>Overall execution score</div>
                          <div style={{fontFamily:"monospace",fontSize:28,fontWeight:700,color:parseInt(er.overallExecutionScore)>=70?MONEY:parseInt(er.overallExecutionScore)>=50?SIGNAL:DANGER,marginTop:2}}>{er.overallExecutionScore}<span style={{fontSize:13,color:MUTED}}>/100</span></div>
                        </div>
                      </Section>
                    )}

                    {/* ── LEGAL VALIDATION ── */}
                    {lg&&(
                      <Section title="⚖️ Legal & compliance validation" color="#862E9C" bg="#F8F0FC">
                        {legalBlockers.length>0&&(
                          <div style={{marginBottom:10}}>
                            <div style={{fontSize:11,fontWeight:700,color:DANGER,marginBottom:6}}>🚫 Must fix BEFORE launch ({legalBlockers.length})</div>
                            {legalBlockers.map((a,i)=>(
                              <div key={i} style={{padding:"7px 10px",borderRadius:7,border:`1px solid #F0B4B4`,background:DANGER_BG,marginBottom:5,display:"flex",justifyContent:"space-between",gap:8}}>
                                <span style={{fontSize:11}}>{a.action}</span>
                                <div style={{display:"flex",gap:4,flexShrink:0}}>
                                  {a.canDIY&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:MONEY_BG,color:MONEY}}>DIY</span>}
                                  <span style={{fontSize:9,fontWeight:700,color:DANGER}}>BLOCKER</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {legalWarnings.length>0&&(
                          <div style={{marginBottom:8}}>
                            <div style={{fontSize:11,fontWeight:700,color:SIGNAL,marginBottom:6}}>⚠ Fix within first month ({legalWarnings.length})</div>
                            {legalWarnings.map((a,i)=>(
                              <div key={i} style={{padding:"6px 10px",borderRadius:7,border:`1px solid #EAD09A`,background:SIGNAL_BG,marginBottom:4,display:"flex",justifyContent:"space-between",gap:8}}>
                                <span style={{fontSize:11}}>{a.action}</span>
                                {a.canDIY&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:MONEY_BG,color:MONEY,flexShrink:0}}>DIY</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {legalBlockers.length===0&&legalWarnings.length===0&&(
                          <div style={{fontSize:11,color:MONEY}}>✓ No critical legal blockers found before launch.</div>
                        )}
                        {lg.industrySpecificRules?.length>0&&(
                          <div style={{marginTop:6}}>
                            <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:4}}>Industry-specific rules</div>
                            {lg.industrySpecificRules.map((r,i)=><div key={i} style={{fontSize:11,color:INK,marginBottom:2}}>· {r}</div>)}
                          </div>
                        )}
                        <div style={{fontSize:9,color:MUTED,marginTop:8,fontStyle:"italic",borderTop:`1px solid ${LINE}`,paddingTop:6}}>{lg.disclaimer}</div>
                      </Section>
                    )}

                    {/* ── PRE-BUILD CHECKLIST ── */}
                    <Section title="☑️ Pre-build validation checklist" color={INK} bg="#F9F8F5">
                      <div style={{fontSize:12,color:MUTED,marginBottom:10}}>Complete these before writing a single line of code.</div>
                      {[
                        {done: !!sc,             category:"Market",       item:`Niche scored ${sc?.overallScore||"?"}/50 — verdict: ${sc?.verdict||"pending"}`},
                        {done: !!vl,             category:"Demand",       item:`Demand confirmed: ${vl?.demandScore||"?"}/10 — ${vl?.demandEvidence?.slice(0,80)||"run Validator"}`},
                        {done: !!an?.gaps?.length,category:"Pain",        item:`${an?.gaps?.length||0} user pain points validated with exact quotes from G2, Reddit, App Store`},
                        {done: an?.gaps?.filter(g=>g.paySignal==="high").length>0, category:"Pay signal", item:`${an?.gaps?.filter(g=>g.paySignal==="high").length||0} high pay-signal gaps confirmed — users will pay to fix these`},
                        {done: !!pr?.competitorPricing?.length, category:"Pricing",  item:`Market pricing researched: ${pr?.marketPricingRange?.lowest||"?"} – ${pr?.marketPricingRange?.highest||"?"}`},
                        {done: !!di?.growthEngine,category:"Distribution", item:`Growth engine identified: ${di?.growthEngine?.slice(0,60)||"run Distribution Intel"}`},
                        {done: !!mo?.primaryMoat, category:"Moat",       item:`Defensibility designed: ${mo?.primaryMoat||"run Moat Designer"}`},
                        {done: legalBlockers.length===0&&!!lg, category:"Legal",   item: legalBlockers.length>0?`${legalBlockers.length} legal blocker(s) must be resolved first`:"No legal blockers — safe to proceed"},
                        {done: !!fc,             category:"Forecast",     item:`12-month demand forecast: ${fc?.demandIn12Months?.slice(0,70)||"run Forecast"}`},
                        {done: er&&parseInt(er.overallExecutionScore)>=50, category:"Execution", item:`Execution score: ${er?.overallExecutionScore||"?"}/100 — ${er?.overallExecutionScore>=70?"low risk":"review risks before proceeding"}`},
                        {done: op?.totalWeightedScore>=50, category:"Opportunity", item:`Opportunity score: ${op?.totalWeightedScore||"?"}/100 grade ${op?.grade||"?"} — ${op?.recommendation||"run Opportunity Score"}`},
                      ].map((c,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:i<10?`1px solid ${LINE}`:"none"}}>
                          <div style={{width:20,height:20,borderRadius:"50%",background:c.done?MONEY:LINE,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                            {c.done?<span style={{color:"#fff",fontSize:11}}>✓</span>:<span style={{color:MUTED,fontSize:9}}>○</span>}
                          </div>
                          <div style={{flex:1}}>
                            <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",color:c.done?MONEY:MUTED,marginRight:6}}>{c.category}</span>
                            <span style={{fontSize:11,color:c.done?INK:MUTED}}>{c.item}</span>
                          </div>
                        </div>
                      ))}
                      <div style={{marginTop:12,padding:"10px 14px",borderRadius:8,background:readinessBg,border:`1px solid ${readinessColor}40`}}>
                        <div style={{fontSize:12,fontWeight:700,color:readinessColor}}>
                          {readiness==="BUILD"?"✅ All signals green — you have sufficient evidence to start building.":
                           readiness==="VALIDATE MORE"?"⏸ Run remaining agents and do manual validation before committing to build.":
                           readiness==="PIVOT"?"↩ Consider pivoting the angle — see the best angle and pivot suggestion above.":
                           "🛑 Evidence is too weak — try a different niche."}
                        </div>
                      </div>
                    </Section>

                  </div>;
                })()}

                {/* ── COMPETITOR VIEW ─────────────────────────────────────── */}
                {intelView === "competitor" && (() => {
                  const T = results.scout?.products?.[0];
                  const mkt = results.marketing;
                  const dist = results.distributor;
                  const distro = results.distro;
                  const analyst = results.analyst;
                  const pricing = results.pricing;
                  const validator = results.validator;
                  const forecast = results.forecast;
                  if (!T) return <div style={{textAlign:"center",padding:30,color:MUTED}}>Scout agent hasn't run yet.</div>;
                  return <div style={{display:"grid",gap:12}}>

                    {/* Hero card */}
                    <div style={{background:"#fff",border:`1px solid ${LINE}`,borderRadius:12,overflow:"hidden"}}>
                      <div style={{background:INK,color:"#fff",padding:"14px 18px"}}>
                        <div style={{fontSize:10,letterSpacing:".12em",textTransform:"uppercase",opacity:.6,fontWeight:700}}>Primary target competitor</div>
                        <div style={{fontSize:isMobile?16:22,fontWeight:700,marginTop:4}}>{T.name}</div>
                        <div style={{fontSize:12,opacity:.7,marginTop:2}}>{T.what}</div>
                      </div>
                      <div style={{padding:"14px 18px"}}>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:12}}>
                          {[
                            ["Revenue",T.revenue,MONEY],
                            ["Demand",validator?.demandScore+"/10",parseInt(validator?.demandScore)>=6?MONEY:DANGER],
                            ["Competition",validator?.competitionScore+"/10",parseInt(validator?.competitionScore)>=6?MONEY:DANGER],
                            ["Trend",validator?.trendDirection,validator?.trendDirection==="growing"?MONEY:SIGNAL],
                            ["Ad activity",T.adActivity,T.adActivity==="high"?MONEY:SIGNAL],
                            ["VC activity",validator?.vcActivity,MUTED],
                          ].map(([k,v,c])=>v&&(
                            <div key={k} style={{padding:"8px 10px",borderRadius:8,background:"#F9F8F5",border:`1px solid ${LINE}`}}>
                              <div style={{fontSize:9,color:MUTED,fontWeight:700,textTransform:"uppercase"}}>{k}</div>
                              <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:c,marginTop:2}}>{v}</div>
                            </div>
                          ))}
                        </div>
                        {/* Quick links */}
                        <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:6}}>Verify yourself →</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {[
                            [`G2 reviews`,`https://www.g2.com/search?query=${encodeURIComponent(T.name)}`],
                            [`Capterra`,`https://www.capterra.com/search/?query=${encodeURIComponent(T.name)}`],
                            [`FB Ads`,`https://www.facebook.com/ads/library/?q=${encodeURIComponent(T.name)}`],
                            [`SimilarWeb`,`https://www.similarweb.com/website/${T.name.toLowerCase().replace(/\s/g,"")+".com"}/`],
                            [`Reddit`,`https://www.reddit.com/search/?q=${encodeURIComponent(T.name)}`],
                            [`Product Hunt`,`https://www.producthunt.com/search?q=${encodeURIComponent(T.name)}`],
                            [`IndieHackers`,`https://www.indiehackers.com/search?query=${encodeURIComponent(T.name)}`],
                            [`Minea`,`https://app.minea.com/`],
                            [`AppMagic`,`https://appmagic.rocks/`],
                          ].map(([label,url])=>(
                            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                              style={{fontSize:isMobile?9:11,padding:isMobile?"3px 7px":"4px 10px",borderRadius:20,background:"#EDF2FF",color:"#3B5BDB",textDecoration:"none",fontWeight:600,border:"1px solid #BAD3F8"}}>{label} ↗</a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* All competitor products from Scout */}
                    {results.scout?.products?.length > 1 && (
                      <Section title="📦 All products found in this niche" color="#3B5BDB" bg="#EDF2FF">
                        {results.scout.products.map((p,i)=>(
                          <div key={i} style={{padding:"8px 10px",borderRadius:7,border:`1px solid ${i===0?MONEY:LINE}`,background:i===0?MONEY_BG:"#F9F8F5",marginBottom:6}}>
                            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                              <span style={{fontSize:13,fontWeight:700}}>{p.name}</span>
                              <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:MONEY}}>{p.revenue}</span>
                            </div>
                            <div style={{fontSize:11,color:MUTED,marginTop:2}}>{p.what}</div>
                            <div style={{fontSize:10,color:MUTED,marginTop:2}}>Source: <a href={p.evidence} target="_blank" rel="noopener noreferrer" style={{color:"#3B5BDB"}}>{p.evidence}</a></div>
                            {p.weaknesses?.length>0&&<div style={{marginTop:4,display:"flex",gap:4,flexWrap:"wrap"}}>{p.weaknesses.map((w,j)=><span key={j} style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:DANGER_BG,color:DANGER}}>⚠ {w}</span>)}</div>}
                            {p.communities?.length>0&&<div style={{marginTop:4,display:"flex",gap:4,flexWrap:"wrap"}}>{p.communities.map((c,j)=><span key={j} style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"#F1F0EC"}}>{c}</span>)}</div>}
                          </div>
                        ))}
                      </Section>
                    )}

                    {/* Competitor pricing */}
                    {pricing?.competitorPricing?.length>0&&(
                      <Section title="💰 Competitor pricing" color="#2F9E44" bg="#EBFBEE">
                        <div style={{fontSize:11,fontWeight:600,color:MONEY,marginBottom:8}}>{pricing.pricingInsight}</div>
                        <div style={{fontSize:11,marginBottom:8}}>Market range: <b>{pricing.marketPricingRange?.lowest}</b> – <b>{pricing.marketPricingRange?.highest}</b> · Source: {pricing.marketPricingRange?.source}</div>
                        {pricing.competitorPricing.map((cp,i)=>(
                          <div key={i} style={{marginBottom:10}}>
                            <div style={{fontSize:12,fontWeight:700,marginBottom:5}}>{cp.name}</div>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:5}}>
                              {cp.tiers?.map((t,j)=>(
                                <div key={j} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${LINE}`,background:"#F9F8F5"}}>
                                  <div style={{fontSize:10,fontWeight:700}}>{t.name}</div>
                                  <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:MONEY}}>{t.price}</div>
                                  {t.features?.slice(0,3).map((f,k)=><div key={k} style={{fontSize:9,color:MUTED,marginTop:1}}>· {f}</div>)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </Section>
                    )}

                    {/* Ads & Marketing */}
                    {mkt&&(
                      <Section title="📣 Ads & marketing strategy" color="#C2255C" bg="#FFF0F6">
                        <div style={{background:"#F9F8F5",border:`1px solid ${LINE}`,borderRadius:8,padding:"10px 12px",marginBottom:10}}>
                          <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:4}}>Core message they run</div>
                          <div style={{fontSize:13,fontWeight:600}}>{mkt.competitorAdInsights?.coreMessage}</div>
                          {mkt.competitorAdInsights?.facebookAds&&<div style={{fontSize:11,color:MUTED,marginTop:4}}><b>FB/Instagram:</b> {mkt.competitorAdInsights.facebookAds}</div>}
                          {mkt.competitorAdInsights?.googleAds&&<div style={{fontSize:11,color:MUTED,marginTop:3}}><b>Google:</b> {mkt.competitorAdInsights.googleAds}</div>}
                          {mkt.competitorAdInsights?.tiktokAds&&<div style={{fontSize:11,color:MUTED,marginTop:3}}><b>TikTok:</b> {mkt.competitorAdInsights.tiktokAds}</div>}
                        </div>
                        <div style={{background:SIGNAL_BG,border:`1px solid #EAD09A`,borderRadius:7,padding:"8px 10px",marginBottom:10}}>
                          <div style={{fontSize:10,fontWeight:700,color:SIGNAL,textTransform:"uppercase",marginBottom:3}}>Positioning gap they leave open</div>
                          <div style={{fontSize:12,fontWeight:600,color:"#6B4A0F"}}>{mkt.positioningGap}</div>
                        </div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                          <a href={`https://www.facebook.com/ads/library/?q=${encodeURIComponent(T.name)}`} target="_blank" rel="noopener noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:20,background:"#EDF2FF",color:"#3B5BDB",fontWeight:600,textDecoration:"none",border:"1px solid #BAD3F8"}}>View FB ads ↗</a>
                          <a href={`https://adstransparency.google.com/?region=anywhere&query=${encodeURIComponent(T.name)}`} target="_blank" rel="noopener noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:20,background:"#EDF2FF",color:"#3B5BDB",fontWeight:600,textDecoration:"none",border:"1px solid #BAD3F8"}}>View Google ads ↗</a>
                          <a href="https://app.minea.com/" target="_blank" rel="noopener noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:20,background:"#EDF2FF",color:"#3B5BDB",fontWeight:600,textDecoration:"none",border:"1px solid #BAD3F8"}}>View on Minea ↗</a>
                          <a href={`https://www.tiktok.com/search?q=${encodeURIComponent(T.name)}`} target="_blank" rel="noopener noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:20,background:"#EDF2FF",color:"#3B5BDB",fontWeight:600,textDecoration:"none",border:"1px solid #BAD3F8"}}>Search TikTok ↗</a>
                          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(T.name+" review")}`} target="_blank" rel="noopener noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:20,background:"#EDF2FF",color:"#3B5BDB",fontWeight:600,textDecoration:"none",border:"1px solid #BAD3F8"}}>YouTube reviews ↗</a>
                        </div>
                      </Section>
                    )}

                    {/* User complaints */}
                    {analyst&&(
                      <Section title="😤 What users actually complain about" color={MONEY} bg={MONEY_BG}>
                        <div style={{fontSize:11,fontStyle:"italic",color:"#6B4A0F",background:SIGNAL_BG,border:`1px solid #EAD09A`,borderRadius:6,padding:"7px 10px",marginBottom:8}}>{analyst.marketOpening}</div>
                        {analyst.gaps?.map((g,i)=>{
                          const pc = g.paySignal==="high"?{c:MONEY,bg:MONEY_BG}:g.paySignal==="medium"?{c:SIGNAL,bg:SIGNAL_BG}:{c:MUTED,bg:"#F1F0EC"};
                          return <div key={i} style={{padding:"7px 10px",borderRadius:6,border:`1px solid ${LINE}`,borderLeft:`3px solid ${pc.c}`,marginBottom:5,background:"#F9F8F5"}}>
                            <div style={{display:"flex",justifyContent:"space-between",gap:6}}>
                              <div style={{flex:1}}>
                                <div style={{fontSize:10,color:MUTED,fontStyle:"italic"}}>"{g.complaint}"</div>
                                <div style={{fontSize:11,fontWeight:600,color:MONEY,marginTop:2}}>→ Opportunity: {g.feature}</div>
                                <div style={{fontSize:9,color:MUTED,marginTop:2}}>{g.evidence} · ~{g.mentionCount} mentions · {g.recency}</div>
                                {g.exactQuote&&<div style={{fontSize:9,color:MUTED,fontStyle:"italic",marginTop:3,borderTop:`1px solid ${LINE}`,paddingTop:3}}>"{g.exactQuote}"</div>}
                              </div>
                              <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",padding:"2px 6px",borderRadius:20,color:pc.c,background:pc.bg,flexShrink:0,height:"fit-content"}}>{g.paySignal}</span>
                            </div>
                          </div>;
                        })}
                      </Section>
                    )}

                    {/* Growth engine */}
                    {(dist||distro)&&(
                      <Section title="🧲 How they actually grew" color="#C2255C" bg="#FFF0F6">
                        {dist?.competitorTrafficBreakdown&&(
                          <div style={{marginBottom:10}}>
                            <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:5}}>Traffic breakdown (SimilarWeb)</div>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              {Object.entries(dist.competitorTrafficBreakdown).filter(([k])=>k!=="topReferrers").map(([k,v])=>(
                                <div key={k} style={{padding:"6px 10px",borderRadius:7,background:"#F9F8F5",border:`1px solid ${LINE}`,textAlign:"center"}}>
                                  <div style={{fontSize:9,color:MUTED,textTransform:"capitalize"}}>{k}</div>
                                  <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:INK}}>{v}</div>
                                </div>
                              ))}
                            </div>
                            {dist.competitorTrafficBreakdown.topReferrers?.length>0&&(
                              <div style={{marginTop:6}}>
                                <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:4}}>Top referral sources (backlink targets)</div>
                                {dist.competitorTrafficBreakdown.topReferrers.map((r,i)=>(
                                  <a key={i} href={`https://${r}`} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",fontSize:11,padding:"3px 9px",borderRadius:20,background:"#EDF2FF",color:"#3B5BDB",textDecoration:"none",fontWeight:600,margin:"2px 4px 2px 0",border:"1px solid #BAD3F8"}}>{r} ↗</a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {distro?.growthEngine&&<div style={{marginBottom:7}}><div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>Growth engine</div><div style={{fontSize:11}}>{distro.growthEngine}</div></div>}
                        {distro?.viralMechanics&&<div style={{marginBottom:7}}><div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>Viral mechanics</div><div style={{fontSize:11}}>{distro.viralMechanics}</div></div>}
                        {distro?.referralLoop&&<div style={{marginBottom:7}}><div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>Referral loop</div><div style={{fontSize:11}}>{distro.referralLoop}</div></div>}
                        {distro?.affiliateStructure&&<div style={{marginBottom:7}}><div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>Affiliate structure</div><div style={{fontSize:11}}>{distro.affiliateStructure}</div></div>}
                        {dist?.youtubeOpportunity&&<div style={{fontSize:11,marginBottom:5}}><b>YouTube:</b> {dist.youtubeOpportunity}</div>}
                        {dist?.tiktokOpportunity&&<div style={{fontSize:11}}><b>TikTok:</b> {dist.tiktokOpportunity}</div>}
                      </Section>
                    )}

                    {/* Communities */}
                    {dist?.communityPlaybook?.length>0&&(
                      <Section title="👥 Communities & where users gather" color="#6741D9" bg="#F3F0FF">
                        {dist.communityPlaybook.map((c,i)=>(
                          <div key={i} style={{padding:"8px 10px",borderRadius:7,border:`1px solid ${LINE}`,background:"#F9F8F5",marginBottom:6}}>
                            <div style={{display:"flex",justifyContent:"space-between",gap:6,marginBottom:3}}>
                              <span style={{fontSize:12,fontWeight:700}}>{c.community}</span>
                              <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"#F3F0FF",color:"#6741D9",fontWeight:600}}>{c.platform}</span>
                            </div>
                            {c.postTemplate&&<div style={{fontSize:11,color:MUTED,fontStyle:"italic",marginBottom:3}}>"{c.postTemplate}"</div>}
                            {c.doNot&&<div style={{fontSize:10,color:DANGER}}>Don't: {c.doNot}</div>}
                          </div>
                        ))}
                      </Section>
                    )}

                    {/* Forecast */}
                    {forecast&&(
                      <Section title="🔮 Trend forecast — next 12 months" color="#0C8599" bg="#E3FAFC">
                        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7,marginBottom:8}}>
                          {forecast.forecastScore&&<div style={{padding:"8px 10px",borderRadius:7,background:"#F9F8F5",border:`1px solid ${LINE}`}}><div style={{fontSize:9,color:MUTED,textTransform:"uppercase",fontWeight:700}}>Forecast score</div><div style={{fontFamily:"monospace",fontSize:18,fontWeight:700,color:parseInt(forecast.forecastScore)>=6?MONEY:SIGNAL,marginTop:2}}>{forecast.forecastScore}/10</div></div>}
                          {forecast.aiDisruptionRisk&&<div style={{padding:"8px 10px",borderRadius:7,background:"#F9F8F5",border:`1px solid ${LINE}`}}><div style={{fontSize:9,color:MUTED,textTransform:"uppercase",fontWeight:700}}>AI disruption risk</div><div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:forecast.aiDisruptionRisk==="high"?DANGER:forecast.aiDisruptionRisk==="medium"?SIGNAL:MONEY,marginTop:2}}>{forecast.aiDisruptionRisk}</div></div>}
                        </div>
                        {forecast.demandIn6Months&&<div style={{fontSize:11,marginBottom:3}}><b>6 months:</b> {forecast.demandIn6Months}</div>}
                        {forecast.demandIn12Months&&<div style={{fontSize:11}}><b>12 months:</b> {forecast.demandIn12Months}</div>}
                      </Section>
                    )}

                  </div>;
                })()}

                {/* ── YOUR PRODUCT VIEW ───────────────────────────────────── */}
                {intelView === "product" && (() => {
                  const strat = results.strategist;
                  const pricing = results.pricing;
                  const builder = results.builder;
                  const seo = results.seo;
                  const mkt = results.marketing;
                  const cs = results.cs;
                  const finance = results.finance;
                  const moat = results.moat;
                  const execrisk = results.execrisk;
                  const oppscore = results.oppscore;
                  const psychol = results.psychol;
                  const legal = results.legal;
                  if (!strat) return <div style={{textAlign:"center",padding:30,color:MUTED}}>Strategist agent hasn't run yet.</div>;
                  return <div style={{display:"grid",gap:12}}>

                    {/* Hero */}
                    <div style={{background:"#fff",border:`1px solid ${LINE}`,borderRadius:12,overflow:"hidden"}}>
                      <div style={{background:MONEY,color:"#fff",padding:"14px 18px"}}>
                        <div style={{fontSize:10,letterSpacing:".12em",textTransform:"uppercase",opacity:.7,fontWeight:700}}>Your product blueprint</div>
                        <div style={{fontSize:isMobile?16:22,fontWeight:700,marginTop:4}}>{strat.name}</div>
                        <div style={{fontSize:13,opacity:.8,marginTop:2,fontStyle:"italic"}}>{strat.tagline}</div>
                      </div>
                      {oppscore&&(
                        <div style={{padding:"12px 18px",display:"flex",alignItems:"center",gap:14,borderBottom:`1px solid ${LINE}`}}>
                          <div style={{textAlign:"center",padding:"8px 14px",borderRadius:8,background:oppscore.totalWeightedScore>=70?MONEY_BG:oppscore.totalWeightedScore>=50?SIGNAL_BG:DANGER_BG,border:`1px solid ${oppscore.totalWeightedScore>=70?"#BFDECB":oppscore.totalWeightedScore>=50?"#EAD09A":"#F0B4B4"}`}}>
                            <div style={{fontFamily:"monospace",fontSize:24,fontWeight:700,color:oppscore.totalWeightedScore>=70?MONEY:oppscore.totalWeightedScore>=50?SIGNAL:DANGER}}>{oppscore.totalWeightedScore}</div>
                            <div style={{fontSize:10,color:MUTED}}>/ 100</div>
                            <div style={{fontSize:16,fontWeight:700,color:oppscore.totalWeightedScore>=70?MONEY:oppscore.totalWeightedScore>=50?SIGNAL:DANGER}}>{oppscore.grade}</div>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:600,color:INK,marginBottom:4}}>{oppscore.verdict}</div>
                            <div style={{display:"inline-block",padding:"3px 12px",borderRadius:20,background:oppscore.recommendation==="proceed"?MONEY_BG:oppscore.recommendation==="pivot"?SIGNAL_BG:DANGER_BG,color:oppscore.recommendation==="proceed"?MONEY:oppscore.recommendation==="pivot"?SIGNAL:DANGER,fontSize:11,fontWeight:700,textTransform:"uppercase"}}>{oppscore.recommendation}</div>
                          </div>
                        </div>
                      )}
                      <div style={{padding:"12px 18px"}}>
                        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:5}}>What to build (MVP)</div>
                            {strat.coreFeatures?.map((f,i)=><div key={i} style={{fontSize:11,marginBottom:3}}>· {f}</div>)}
                          </div>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:MONEY,textTransform:"uppercase",marginBottom:5}}>Your differentiators</div>
                            {strat.differentiators?.map((f,i)=><div key={i} style={{fontSize:11,color:MONEY,fontWeight:600,marginBottom:3}}>✓ {f}</div>)}
                          </div>
                        </div>
                        <div style={{marginTop:10,padding:"8px 10px",borderRadius:7,background:DANGER_BG,border:`1px solid #F0B4B4`}}>
                          <span style={{fontSize:10,fontWeight:700,color:DANGER,textTransform:"uppercase"}}>Do NOT build: </span>
                          <span style={{fontSize:11,color:DANGER}}>{strat.notMVP}</span>
                        </div>
                      </div>
                    </div>

                    {/* Execution scores */}
                    {execrisk&&(
                      <Section title="⚠️ Execution risk scorecard" color={SIGNAL} bg={SIGNAL_BG}>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:6,marginBottom:8}}>
                          {[["Technical",execrisk.technicalRisk],["Sales",execrisk.salesRisk],["Regulatory",execrisk.regulatoryRisk],["Support",execrisk.supportBurden],["Capital",execrisk.capitalRequirements]].map(([k,v])=>v&&(
                            <div key={k} style={{padding:"8px 10px",borderRadius:7,background:"#fff",border:`1px solid ${LINE}`,textAlign:"center"}}>
                              <div style={{fontSize:9,color:MUTED,fontWeight:700,textTransform:"uppercase"}}>{k} risk</div>
                              <div style={{fontSize:12,fontWeight:700,marginTop:3,color:v==="low"?MONEY:v==="medium"?SIGNAL:DANGER,textTransform:"capitalize"}}>{v}</div>
                            </div>
                          ))}
                        </div>
                        {execrisk.overallExecutionScore&&<div style={{textAlign:"center",padding:"10px",borderRadius:8,background:"#fff",border:`1px solid ${LINE}`}}>
                          <div style={{fontSize:10,color:MUTED,fontWeight:700,textTransform:"uppercase"}}>Overall execution score</div>
                          <div style={{fontFamily:"monospace",fontSize:24,fontWeight:700,color:parseInt(execrisk.overallExecutionScore)>=70?MONEY:parseInt(execrisk.overallExecutionScore)>=50?SIGNAL:DANGER,marginTop:2}}>{execrisk.overallExecutionScore}/100</div>
                        </div>}
                      </Section>
                    )}

                    {/* Pricing plan */}
                    {pricing?.recommendedTiers&&(
                      <Section title="💰 Your pricing plan" color="#2F9E44" bg="#EBFBEE">
                        <div style={{fontSize:11,fontWeight:600,color:MONEY,marginBottom:8}}>{pricing.pricingInsight}</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:7,marginBottom:8}}>
                          {pricing.recommendedTiers.map((t,i)=>(
                            <div key={i} style={{padding:"10px 12px",borderRadius:8,border:`2px solid ${i===0?MONEY:LINE}`,background:i===0?MONEY_BG:"#F9F8F5"}}>
                              <div style={{fontSize:11,fontWeight:700}}>{t.name}</div>
                              <div style={{fontFamily:"monospace",fontSize:18,fontWeight:700,color:MONEY,margin:"4px 0"}}>{t.monthlyPrice}<span style={{fontSize:10,color:MUTED,fontWeight:400}}>/mo</span></div>
                              {t.annualPrice&&<div style={{fontSize:10,color:SIGNAL}}>{t.annualPrice}/yr (save 20%)</div>}
                              <div style={{fontSize:10,color:MUTED,marginTop:3}}>{t.targetCustomer}</div>
                              {t.features?.map((f,j)=><div key={j} style={{fontSize:10,marginTop:3}}>· {f}</div>)}
                            </div>
                          ))}
                        </div>
                        <div style={{padding:"8px 10px",borderRadius:7,background:"#fff",border:`1px solid ${LINE}`,fontSize:11}}><b>Path to $100K MRR:</b> {pricing.revenueToTarget?.calculation}</div>
                      </Section>
                    )}

                    {/* Tech stack */}
                    {builder&&(
                      <Section title="⚙️ Tech stack & build plan" color={SIGNAL} bg={SIGNAL_BG}>
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:5}}>Recommended stack</div>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:4}}>
                            {[["Frontend",builder.recommendedStack?.frontend],["Backend",builder.recommendedStack?.backend],["Database",builder.recommendedStack?.database],["Auth",builder.recommendedStack?.auth],["Payments",builder.recommendedStack?.payments],["Hosting",builder.recommendedStack?.hosting]].map(([k,v])=>v&&(
                              <span key={k} style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:SIGNAL_BG,color:SIGNAL,fontWeight:600,border:`1px solid #EAD09A`}}>{k}: {v}</span>
                            ))}
                          </div>
                          <div style={{fontSize:10,color:MUTED}}>{builder.recommendedStack?.reasoning}</div>
                        </div>
                        {builder.openSourceStarters?.length>0&&(
                          <div style={{marginBottom:8}}>
                            <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:4}}>GitHub starters to use</div>
                            {builder.openSourceStarters.map((s,i)=>(
                              <a key={i} href={`https://github.com/search?q=${encodeURIComponent(s)}`} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:11,color:"#3B5BDB",marginBottom:3,textDecoration:"none"}}>· {s} ↗</a>
                            ))}
                          </div>
                        )}
                        <div style={{padding:"7px 10px",borderRadius:7,background:DANGER_BG,border:`1px solid #F0B4B4`,fontSize:11}}>
                          <b style={{color:DANGER}}>Biggest technical risk: </b>{builder.biggestTechnicalRisk}
                        </div>
                      </Section>
                    )}

                    {/* Customer psychology */}
                    {psychol&&(
                      <Section title="🧬 Customer psychology" color="#6741D9" bg="#F3F0FF">
                        <div style={{background:"#F3F0FF",border:"1px solid #C5B4F3",borderRadius:7,padding:"8px 10px",marginBottom:8}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#6741D9",textTransform:"uppercase",marginBottom:2}}>Primary buying emotion</div>
                          <div style={{fontSize:13,fontWeight:700,color:"#6741D9"}}>{psychol.primaryEmotion}</div>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8,marginBottom:8}}>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:4}}>Top trigger moments</div>
                            {psychol.triggerMoments?.slice(0,3).map((t,i)=><div key={i} style={{fontSize:11,color:SIGNAL,marginBottom:3}}>⚡ {t}</div>)}
                          </div>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:4}}>Urgency triggers</div>
                            {psychol.urgencyTriggers?.slice(0,3).map((t,i)=><div key={i} style={{fontSize:11,color:DANGER,marginBottom:3}}>→ {t}</div>)}
                          </div>
                        </div>
                        <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:5}}>Messaging angles</div>
                        {psychol.messagingAngles?.map((a,i)=>(
                          <div key={i} style={{padding:"6px 9px",borderRadius:6,border:`1px solid ${LINE}`,marginBottom:4,background:"#F9F8F5"}}>
                            <div style={{fontSize:11,fontWeight:600,color:"#6741D9"}}>"{a.headline}"</div>
                            <div style={{fontSize:10,color:MUTED,marginTop:2}}>{a.why}</div>
                          </div>
                        ))}
                        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7,marginTop:6}}>
                          <div style={{background:MONEY_BG,border:`1px solid #BFDECB`,borderRadius:6,padding:"7px 9px"}}><div style={{fontSize:9,fontWeight:700,color:MONEY,textTransform:"uppercase",marginBottom:2}}>Pricing psychology</div><div style={{fontSize:11}}>{psychol.pricingPsychology}</div></div>
                          <div style={{background:"#F3F0FF",border:"1px solid #C5B4F3",borderRadius:6,padding:"7px 9px"}}><div style={{fontSize:9,fontWeight:700,color:"#6741D9",textTransform:"uppercase",marginBottom:2}}>Best social proof</div><div style={{fontSize:12,fontWeight:700,color:"#6741D9"}}>{psychol.socialProofType}</div></div>
                        </div>
                      </Section>
                    )}

                    {/* Moat */}
                    {moat&&(
                      <Section title="🏰 Your defensibility moat" color="#862E9C" bg="#F8F0FC">
                        {moat.primaryMoat&&<div style={{background:"#F8F0FC",border:"1px solid #D8A8F0",borderRadius:7,padding:"8px 10px",marginBottom:8}}><div style={{fontSize:10,fontWeight:700,color:"#862E9C",textTransform:"uppercase",marginBottom:2}}>Primary moat</div><div style={{fontSize:13,fontWeight:700,color:"#862E9C"}}>{moat.primaryMoat}</div></div>}
                        {moat.defensibilityPlan&&<div style={{fontSize:11,marginBottom:6}}>{moat.defensibilityPlan}</div>}
                        {moat.moatStrength&&<div style={{fontSize:11,color:MUTED}}>Moat strength: <b style={{color:moat.moatStrength==="high"?MONEY:moat.moatStrength==="medium"?SIGNAL:DANGER}}>{moat.moatStrength}</b></div>}
                      </Section>
                    )}

                    {/* SEO quick wins */}
                    {seo&&(
                      <Section title="📈 SEO quick wins" color="#0C8599" bg="#E3FAFC">
                        <div style={{marginBottom:7}}>
                          {seo.quickWins?.map((w,i)=><div key={i} style={{fontSize:11,color:MONEY,marginBottom:3}}>→ {w}</div>)}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:5}}>
                          {seo.primaryKeywords?.slice(0,6).map((k,i)=>(
                            <div key={i} style={{padding:"5px 8px",borderRadius:6,background:"#F9F8F5",border:`1px solid ${LINE}`,display:"flex",justifyContent:"space-between",gap:4}}>
                              <span style={{fontSize:11,fontWeight:600}}>{k.keyword}</span>
                              <span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:k.difficulty==="low"?MONEY_BG:k.difficulty==="medium"?SIGNAL_BG:DANGER_BG,color:k.difficulty==="low"?MONEY:k.difficulty==="medium"?SIGNAL:DANGER,flexShrink:0}}>{k.difficulty}</span>
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {/* Marketing copy */}
                    {mkt&&(
                      <Section title="📣 Your marketing copy" color="#C2255C" bg="#FFF0F6">
                        <div style={{background:"#F3F0FF",border:"1px solid #C5B4F3",borderRadius:7,padding:"8px 10px",marginBottom:8}}>
                          <div style={{fontSize:12,fontWeight:700,color:"#6741D9"}}>{mkt.positioning?.statement}</div>
                          <div style={{fontSize:11,color:MUTED,marginTop:2}}>{mkt.positioning?.vsCompetitor}</div>
                        </div>
                        <div style={{marginBottom:7}}><div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:4}}>Headlines to test</div>
                          {mkt.headlines?.map((h,i)=><div key={i} style={{fontSize:11,padding:"3px 0",borderBottom:`1px solid ${LINE}`}}>"{h}"</div>)}
                        </div>
                        <div style={{background:SIGNAL_BG,border:`1px solid #EAD09A`,borderRadius:6,padding:"7px 9px"}}>
                          <div style={{fontSize:9,fontWeight:700,color:SIGNAL,textTransform:"uppercase",marginBottom:2}}>Validation post for communities</div>
                          <div style={{fontSize:11,fontStyle:"italic",color:"#6B4A0F"}}>"{mkt.validationPost}"</div>
                        </div>
                      </Section>
                    )}

                    {/* Finance */}
                    {finance&&(
                      <Section title="📊 Financial model" color="#3B5BDB" bg="#EDF2FF">
                        {finance.criticalWarning&&<div style={{background:DANGER_BG,border:`1px solid #F0B4B4`,borderRadius:6,padding:"7px 9px",marginBottom:8,fontSize:11,color:DANGER}}><b>⚠ Warning: </b>{finance.criticalWarning}</div>}
                        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:6,marginBottom:8}}>
                          {[["LTV",finance.unitEconomics?.ltv],["CAC target",finance.unitEconomics?.cacTarget],["LTV/CAC",finance.unitEconomics?.ltvCacRatio],["Churn",finance.unitEconomics?.churnRate],["Break-even MRR",finance.breakEven?.mrrNeeded],["Exit multiple",finance.exitMultiple]].map(([k,v])=>v&&(
                            <div key={k} style={{padding:"7px 9px",borderRadius:6,background:"#F9F8F5",border:`1px solid ${LINE}`}}>
                              <div style={{fontSize:9,color:MUTED,fontWeight:700,textTransform:"uppercase"}}>{k}</div>
                              <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:INK,marginTop:1}}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{fontSize:11,fontWeight:600,color:MONEY}}>{finance.breakEven?.customersNeeded} customers needed · estimated {finance.breakEven?.estimatedMonth}</div>
                      </Section>
                    )}

                    {/* Legal */}
                    {legal&&(
                      <Section title="⚖️ Legal & compliance" color="#862E9C" bg="#F8F0FC">
                        {legal.priorityActions?.slice(0,4).map((a,i)=>(
                          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${LINE}`,gap:8}}>
                            <span style={{fontSize:11}}>{a.action}</span>
                            <div style={{display:"flex",gap:4,flexShrink:0}}>
                              {a.canDIY&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:MONEY_BG,color:MONEY}}>DIY</span>}
                              <span style={{fontSize:9,fontWeight:700,color:a.urgency==="before-launch"?DANGER:SIGNAL}}>{a.urgency}</span>
                            </div>
                          </div>
                        ))}
                        <div style={{fontSize:9,color:MUTED,marginTop:7,fontStyle:"italic"}}>{legal.disclaimer}</div>
                      </Section>
                    )}

                    {/* Milestones */}
                    {strat.milestones&&(
                      <Section title="🎯 Revenue milestones" color={MONEY} bg={MONEY_BG}>
                        {strat.milestones.map((m,i)=>(
                          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<strat.milestones.length-1?`1px solid ${LINE}`:"none"}}>
                            <span style={{fontSize:12,fontWeight:600}}>{m.week}</span>
                            <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:MONEY}}>{m.target}</span>
                          </div>
                        ))}
                      </Section>
                    )}

                  </div>;
                })()}
              </div>
            )}
          </div>
        )}

        {tab === "sources" && (() => {
          // Build flat list of all sources — built-in + custom
          const builtInFlat = ALL_SOURCES.flatMap(section =>
            section.sources.map(s => ({ ...s, agent: section.agent, color: section.color, bg: section.bg,
              enabled: activeSources ? (activeSources[s.url] !== false) : true, custom: false }))
          );
          const customFlat = customSources.map(s => ({
            ...s, color: "#6741D9", bg: "#F3F0FF",
            enabled: activeSources ? (activeSources[s.url] !== false) : true
          }));
          const allFlat = [...builtInFlat, ...customFlat];
          const toggleSource = async (url) => {
            const current = activeSources || Object.fromEntries(allFlat.map(s => [s.url, true]));
            const updated = { ...current, [url]: !current[url] };
            setActiveSources(updated);
            await saveActiveSources(updated);
          };
          const toggleAll = async (enable) => {
            const updated = Object.fromEntries(allFlat.map(s => [s.url, enable]));
            setActiveSources(updated);
            await saveActiveSources(updated);
          };
          const resetSources = async () => {
            setActiveSources(null);
            await saveActiveSources(null);
          };
          const enabledCount = allFlat.filter(s => s.enabled).length;
          const agentOptions = ALL_SOURCES.map(s => s.agent);

          return <div>
            {/* Header controls */}
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 3 }}>Data source manager</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                    <b style={{ color: MONEY }}>{enabledCount}</b> of {allFlat.length} sources active across 19 agents.
                    Disabled sources are excluded from agent search prompts.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => toggleAll(true)} style={{ padding: "7px 12px", background: MONEY_BG, color: MONEY, border: `1px solid #BFDECB`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Enable all</button>
                  <button onClick={() => toggleAll(false)} style={{ padding: "7px 12px", background: DANGER_BG, color: DANGER, border: `1px solid #F0B4B4`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Disable all</button>
                  <button onClick={resetSources} style={{ padding: "7px 12px", background: "#fff", color: MUTED, border: `1px solid ${LINE}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Reset to default</button>
                  <button onClick={() => { setShowAddSource(true); setEditingSourceId(null); setNewSource({ name:"", url:"", what:"", cost:"Free", agent:"Pre-flight: Niche Scorer" }); }}
                    style={{ padding: "7px 14px", background: MONEY, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add source</button>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 6, background: LINE, borderRadius: 3 }}>
                  <div style={{ width: `${(enabledCount/allFlat.length)*100}%`, height: "100%", background: MONEY, borderRadius: 3, transition: "width .3s" }} />
                </div>
              </div>
            </div>

            {/* Add / Edit Source Form */}
            {showAddSource && (
              <div style={{ background:"#fff",border:`2px solid ${MONEY}`,borderRadius:10,padding:"16px",marginBottom:14 }}>
                <div style={{ fontSize:13,fontWeight:700,color:INK,marginBottom:12 }}>{editingSourceId?"Edit source":"Add new data source"}</div>
                <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10,marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:11,fontWeight:600,color:INK,marginBottom:4 }}>Source name *</div>
                    <input value={newSource.name} onChange={e=>setNewSource(p=>({...p,name:e.target.value}))} placeholder="e.g. Ahrefs, Niche Scraper, SpyFu"
                      style={{ width:"100%",padding:"8px 10px",fontSize:12,border:`1px solid ${LINE}`,borderRadius:6,fontFamily:"inherit",outline:"none",color:INK,boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize:11,fontWeight:600,color:INK,marginBottom:4 }}>URL (without https://) *</div>
                    <input value={newSource.url} onChange={e=>setNewSource(p=>({...p,url:e.target.value.replace(/^https?:\/\//,"")}))} placeholder="e.g. ahrefs.com"
                      style={{ width:"100%",padding:"8px 10px",fontSize:12,border:`1px solid ${LINE}`,borderRadius:6,fontFamily:"inherit",outline:"none",color:INK,boxSizing:"border-box" }} />
                  </div>
                  <div style={{ gridColumn:"1 / -1" }}>
                    <div style={{ fontSize:11,fontWeight:600,color:INK,marginBottom:4 }}>What it tells the agent *</div>
                    <input value={newSource.what} onChange={e=>setNewSource(p=>({...p,what:e.target.value}))} placeholder="e.g. Competitor backlinks, keyword difficulty scores, traffic estimates"
                      style={{ width:"100%",padding:"8px 10px",fontSize:12,border:`1px solid ${LINE}`,borderRadius:6,fontFamily:"inherit",outline:"none",color:INK,boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize:11,fontWeight:600,color:INK,marginBottom:4 }}>Which agent uses it</div>
                    <select value={newSource.agent} onChange={e=>setNewSource(p=>({...p,agent:e.target.value}))}
                      style={{ width:"100%",padding:"8px 10px",fontSize:12,border:`1px solid ${LINE}`,borderRadius:6,fontFamily:"inherit",outline:"none",color:INK,background:"#fff",boxSizing:"border-box" }}>
                      {agentOptions.map(a=><option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:11,fontWeight:600,color:INK,marginBottom:4 }}>Cost</div>
                    <select value={newSource.cost} onChange={e=>setNewSource(p=>({...p,cost:e.target.value}))}
                      style={{ width:"100%",padding:"8px 10px",fontSize:12,border:`1px solid ${LINE}`,borderRadius:6,fontFamily:"inherit",outline:"none",color:INK,background:"#fff",boxSizing:"border-box" }}>
                      {["Free","Free tier","Free plan","Paid","Freemium"].map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {(!newSource.name||!newSource.url||!newSource.what)&&(
                  <div style={{ fontSize:11,color:SIGNAL,marginBottom:8 }}>* Fill in name, URL and description to save.</div>
                )}
                <div style={{ display:"flex",gap:7 }}>
                  <button onClick={async()=>{
                    if(!newSource.name||!newSource.url||!newSource.what) return;
                    if(editingSourceId){ await updateCustomSource(editingSourceId,newSource); }
                    else { const ok=await addCustomSource(newSource); if(!ok){alert("A source with that URL already exists.");return;} }
                    setShowAddSource(false); setEditingSourceId(null);
                    const updated=await loadCustomSources(); setCustomSources(updated);
                  }} style={{ padding:"8px 18px",background:MONEY,color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:(!newSource.name||!newSource.url||!newSource.what)?0.5:1 }}>
                    {editingSourceId?"Save changes":"Add source"}
                  </button>
                  <button onClick={()=>{setShowAddSource(false);setEditingSourceId(null);}}
                    style={{ padding:"8px 14px",background:"#fff",color:MUTED,border:`1px solid ${LINE}`,borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Custom sources — shown at top if any exist */}
            {customSources.length>0&&(
              <div style={{ border:`2px solid #6741D9`,borderRadius:10,marginBottom:12,overflow:"hidden" }}>
                <div style={{ padding:"10px 14px",background:"#F3F0FF",borderBottom:`1px solid #C5B4F3`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#6741D9" }}>⭐ Your custom sources ({customSources.length})</div>
                  <div style={{ fontSize:11,color:"#6741D9",fontWeight:600 }}>{customFlat.filter(s=>s.enabled).length}/{customSources.length} active</div>
                </div>
                <div style={{ background:"#fff" }}>
                  <div style={{ display:"grid",gridTemplateColumns:"40px 160px 1fr 60px 110px",padding:"5px 14px",background:"#F9F8F5",borderBottom:`1px solid ${LINE}`,fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase" }}>
                    <div>On</div><div>Source</div><div>What it tells the agent</div><div>Cost</div><div>Actions</div>
                  </div>
                  {customSources.map((s,j)=>{
                    const isEnabled=activeSources?(activeSources[s.url]!==false):true;
                    return(
                      <div key={j} style={{ display:"grid",gridTemplateColumns:"40px 160px 1fr 60px 110px",padding:"8px 14px",borderBottom:j<customSources.length-1?`1px solid ${LINE}`:"none",alignItems:"flex-start",opacity:isEnabled?1:0.4,transition:"opacity .2s" }}>
                        <div>
                          <button onClick={()=>toggleSource(s.url)}
                            style={{ width:28,height:16,borderRadius:8,background:isEnabled?MONEY:LINE,border:"none",cursor:"pointer",position:"relative",transition:"background .2s",padding:0 }}>
                            <div style={{ width:12,height:12,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:isEnabled?14:2,transition:"left .2s",boxShadow:"0 1px 2px rgba(0,0,0,.2)" }} />
                          </button>
                        </div>
                        <div>
                          <div style={{ fontSize:12,fontWeight:600,color:"#6741D9" }}>{s.name}</div>
                          <div style={{ fontSize:9,color:MUTED }}>{s.url}</div>
                          <div style={{ fontSize:9,color:"#6741D9",marginTop:1,fontStyle:"italic" }}>{s.agent?.split(":")[0]}</div>
                        </div>
                        <div style={{ fontSize:11,color:INK,lineHeight:1.5,paddingRight:8 }}>{s.what}</div>
                        <div style={{ fontSize:11,color:s.cost==="Free"?MONEY:SIGNAL,fontWeight:600 }}>{s.cost}</div>
                        <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                          <a href={`https://${s.url}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize:10,padding:"3px 7px",borderRadius:20,background:"#EDF2FF",color:"#3B5BDB",textDecoration:"none",fontWeight:600,border:"1px solid #BAD3F8" }}>Open ↗</a>
                          <button onClick={()=>{setEditingSourceId(s.url);setNewSource({name:s.name,url:s.url,what:s.what,cost:s.cost,agent:s.agent});setShowAddSource(true);}}
                            style={{ fontSize:10,padding:"3px 7px",borderRadius:20,background:SIGNAL_BG,color:SIGNAL,border:`1px solid #EAD09A`,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>Edit</button>
                          <button onClick={async()=>{await deleteCustomSource(s.url);const updated=await loadCustomSources();setCustomSources(updated);}}
                            style={{ fontSize:10,padding:"3px 7px",borderRadius:20,background:DANGER_BG,color:DANGER,border:`1px solid #F0B4B4`,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick filter by agent */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
              {ALL_SOURCES.map((section, i) => {
                const agentEnabled = allFlat.filter(s => s.agent === section.agent && s.enabled).length;
                const agentTotal  = allFlat.filter(s => s.agent === section.agent).length;
                return (
                  <div key={i} style={{ padding: "4px 10px", borderRadius: 20, background: section.bg, border: `1px solid ${section.color}40`, fontSize: 10, fontWeight: 600, color: section.color }}>
                    {section.agent.split(":")[0]} ({agentEnabled}/{agentTotal})
                  </div>
                );
              })}
            </div>

            {/* Source list grouped by agent */}
            {ALL_SOURCES.map((section, i) => {
              const sectionSources = allFlat.filter(s => s.agent === section.agent);
              const enabledInSection = sectionSources.filter(s => s.enabled).length;
              return (
                <div key={i} style={{ border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: section.bg, borderBottom: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: section.color }}>{section.agent}</div>
                    <div style={{ fontSize: 11, color: section.color, fontWeight: 600 }}>{enabledInSection}/{sectionSources.length} active</div>
                  </div>
                  <div style={{ background: "#fff" }}>
                    {/* Column headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "40px 150px 1fr 70px 60px", padding: "5px 14px", background: "#F9F8F5", borderBottom: `1px solid ${LINE}`, fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>
                      <div>On</div><div>Source</div><div>What it tells the agent</div><div>Cost</div><div>Verify</div>
                    </div>
                    {sectionSources.map((s, j) => (
                      <div key={j} style={{ display: "grid", gridTemplateColumns: "40px 150px 1fr 70px 60px", padding: "8px 14px", borderBottom: j < sectionSources.length-1 ? `1px solid ${LINE}` : "none", alignItems: "flex-start", opacity: s.enabled ? 1 : 0.4, transition: "opacity .2s" }}>
                        {/* Toggle */}
                        <div>
                          <button onClick={() => toggleSource(s.url)}
                            style={{ width: 28, height: 16, borderRadius: 8, background: s.enabled ? MONEY : LINE, border: "none", cursor: "pointer", position: "relative", transition: "background .2s", padding: 0 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: s.enabled ? 14 : 2, transition: "left .2s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
                          </button>
                        </div>
                        {/* Name */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: section.color }}>{s.name}</div>
                          <div style={{ fontSize: 9, color: MUTED }}>{s.url}</div>
                        </div>
                        {/* What */}
                        <div style={{ fontSize: 11, color: INK, lineHeight: 1.5, paddingRight: 8 }}>{s.what}</div>
                        {/* Cost */}
                        <div style={{ fontSize: 11, color: s.cost === "Free" ? MONEY : SIGNAL, fontWeight: 600 }}>{s.cost}</div>
                        {/* Link */}
                        <div>
                          <a href={`https://${s.url}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "#EDF2FF", color: "#3B5BDB", textDecoration: "none", fontWeight: 600, border: "1px solid #BAD3F8" }}>Open ↗</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>;
        })()}


        {tab === "history" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:12 }}>
              <div style={{ fontSize:12,color:MUTED }}>Sessions saved to Cloudflare KV and Google Sheets. Track outcomes to improve scoring. Use change detection to spot when markets shift.</div>
              <button onClick={checkAllSessions} style={{ padding:"7px 14px",background:"#fff",color:INK,border:`1px solid ${LINE}`,borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap" }}>
                🔄 Check all for changes
              </button>
            </div>
            {/* Outcome summary */}
            {Object.keys(outcomes).length > 0 && (() => {
              const built = Object.values(outcomes).filter(o => o.built).length;
              const succeeded = Object.values(outcomes).filter(o => o.built && o.mrr >= 10000).length;
              const avgMrr = Object.values(outcomes).filter(o => o.built && o.mrr).reduce((a,b,_,arr) => a + b.mrr/arr.length, 0);
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8, marginBottom: 16 }}>
                  {[
                    ["Niches researched", Object.keys(outcomes).length, INK],
                    ["Actually built", built, SIGNAL],
                    ["Reached $10K MRR", succeeded, MONEY],
                    ["Avg MRR reached", built > 0 ? "$"+Math.round(avgMrr).toLocaleString() : "—", MONEY],
                    ["Build rate", built ? Math.round((built/Object.keys(outcomes).length)*100)+"%" : "—", SIGNAL],
                    ["Success rate", built ? Math.round((succeeded/built)*100)+"%" : "—", succeeded>0?MONEY:MUTED],
                  ].map(([k,v,c]) => (
                    <div key={k} style={{ padding: "8px 10px", borderRadius: 8, background: "#fff", border: `1px solid ${LINE}` }}>
                      <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {/* Weight learning status */}
            {Object.values(outcomes).filter(o => o.built).length >= 2 && (
              <div style={{ background: MONEY_BG, border: `1px solid #BFDECB`, borderRadius: 8, padding: "9px 12px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MONEY, marginBottom: 4 }}>🧠 Score weights are being adapted from your outcomes</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {Object.entries(outcomeWeights).sort((a,b)=>b[1]-a[1]).map(([k,v]) => (
                    <span key={k} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: "#fff", color: MONEY, border: "1px solid #BFDECB", fontWeight: 600 }}>
                      {k.replace(/([A-Z])/g," $1").toLowerCase()}: {Math.round(v*100)}%
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!dbReady && <div style={{ textAlign: "center", padding: 30 }}><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /></div>}
            {dbReady && sessions.length===0 && <div style={{ textAlign: "center", padding: "40px 16px", color: MUTED }}><Database size={26} style={{ marginBottom: 10, opacity: 0.3 }} /><div style={{ fontSize: 13, fontWeight: 600, color: INK }}>No saved sessions yet</div><div style={{ fontSize: 11, marginTop: 3 }}>Run the agent pipeline to save your first session.</div></div>}
            {sessions.map(s => (
              <div key={s.id} style={{ border: `1px solid ${outcomes[s.id]?.built ? MONEY : LINE}`, borderRadius: 9, marginBottom: 10, background: "#fff", overflow: "hidden" }}>
                {/* Session header */}
                <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{s.niche}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "1px 6px", borderRadius: 20, color: s.status==="complete"?MONEY:s.status==="error"?DANGER:SIGNAL, background: s.status==="complete"?MONEY_BG:s.status==="error"?DANGER_BG:SIGNAL_BG }}>{s.status}</span>
                      {s.nicheScore && <span style={{ fontSize: 10, color: MUTED }}>Score: <b style={{ color: INK }}>{s.nicheScore}/50</b></span>}
                      {s.viability && <span style={{ fontSize: 10, color: MUTED }}>Viability: <b style={{ color: s.viability==="high"?MONEY:s.viability==="medium"?SIGNAL:DANGER }}>{s.viability}</b></span>}
                    </div>
                    {s.blueprintName && <div style={{ fontSize: 11, color: MUTED }}>Blueprint: <b style={{ color: INK }}>{s.blueprintName}</b></div>}
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{s.date}</div>
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => loadSession(s)} style={{ padding: "6px 12px", background: INK, color: "#fff", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Load</button>
                    <button onClick={async () => { await deleteSession(s.id); setSessions(await loadSessions()); }} style={{ padding: "6px 9px", background: "#fff", color: DANGER, border: `1px solid #F0B4B4`, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center" }}><Trash2 size={12} /></button>
                  </div>
                </div>
                {/* Outcome tracker */}
                {(() => {
                  const out = outcomes[s.id] || {};
                  const [localMrr, setLocalMrr] = useState(out.mrr?.toString() || "");
                  const [localNotes, setLocalNotes] = useState(out.notes || "");
                  return (
                    <div style={{ borderTop: `1px solid ${LINE}`, padding: "10px 14px", background: out.built ? MONEY_BG : "#F9F8F5" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 8 }}>📊 Outcome tracking — feeds back into scoring weights</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                        {/* Did you build it? */}
                        <div>
                          <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>Did you build it?</div>
                          <div style={{ display: "flex", gap: 5 }}>
                            {[["yes","Built ✓"],["no","Didn't build"]].map(([v,l]) => (
                              <button key={v} onClick={async () => { await saveOutcome(s.id, { ...out, built: v==="yes" }); }}
                                style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: `1px solid ${out.built===(v==="yes") ? MONEY : LINE}`, background: out.built===(v==="yes") ? MONEY_BG : "#fff", color: out.built===(v==="yes") ? MONEY : MUTED, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
                            ))}
                          </div>
                        </div>
                        {/* MRR reached */}
                        {out.built && (
                          <div>
                            <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>MRR reached ($)</div>
                            <div style={{ display: "flex", gap: 5 }}>
                              <input value={localMrr} onChange={e => setLocalMrr(e.target.value.replace(/[^0-9]/g,""))}
                                placeholder="e.g. 4500"
                                style={{ width: 100, padding: "5px 8px", fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 6, fontFamily: "monospace", outline: "none", color: INK, background: "#fff" }} />
                              <button onClick={async () => { await saveOutcome(s.id, { ...out, mrr: Number(localMrr)||0 }); }}
                                style={{ padding: "5px 10px", background: MONEY, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                            </div>
                          </div>
                        )}
                        {/* Notes */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>Notes (what happened?)</div>
                          <div style={{ display: "flex", gap: 5 }}>
                            <input value={localNotes} onChange={e => setLocalNotes(e.target.value)}
                              placeholder="e.g. Too crowded, pivoted to B2B angle..."
                              style={{ flex: 1, padding: "5px 8px", fontSize: 11, border: `1px solid ${LINE}`, borderRadius: 6, fontFamily: "inherit", outline: "none", color: INK, background: "#fff" }} />
                            <button onClick={async () => { await saveOutcome(s.id, { ...out, notes: localNotes }); }}
                              style={{ padding: "5px 10px", background: INK, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                          </div>
                        </div>
                      </div>
                      {/* Show saved outcome */}
                      {out.built !== undefined && (
                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: out.built ? MONEY_BG : "#F1F0EC", color: out.built ? MONEY : MUTED, fontWeight: 600 }}>{out.built ? "✓ Built" : "✗ Not built"}</span>
                          {out.mrr !== undefined && <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: out.mrr>=10000 ? MONEY_BG : SIGNAL_BG, color: out.mrr>=10000 ? MONEY : SIGNAL, fontWeight: 600, fontFamily: "monospace" }}>${out.mrr?.toLocaleString()}/mo MRR</span>}
                          {out.notes && <span style={{ fontSize: 11, color: MUTED, fontStyle: "italic" }}>{out.notes}</span>}
                          {out.mrr>=10000 && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: MONEY_BG, color: MONEY }}>🏆 Success — improving score weights</span>}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* ── CHANGE DETECTION PANEL ── */}
                {s.status==="complete"&&(()=>{
                  const rs=rerunStatus[s.id];
                  const ch=rs?.changes;
                  return(
                    <div style={{borderTop:`1px solid ${LINE}`,padding:"10px 14px",background:ch?.changesDetected?"#FFF8E6":"#F9F8F5"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:ch?8:0}}>
                        <div style={{fontSize:10,fontWeight:700,color:MUTED,textTransform:"uppercase"}}>
                          🔄 Change detection
                          {rs?.lastChecked&&<span style={{fontWeight:400,marginLeft:6,textTransform:"none"}}>· checked {rs.lastChecked}</span>}
                        </div>
                        <button onClick={async()=>{const full=await loadFullSession(s.id);if(full)await checkForChanges({...s,results:full.results});}}
                          disabled={rs?.running}
                          style={{padding:"5px 11px",background:rs?.running?LINE:"#fff",color:rs?.running?MUTED:INK,border:`1px solid ${LINE}`,borderRadius:6,fontSize:11,fontWeight:600,cursor:rs?.running?"wait":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                          {rs?.running?<><Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/> Checking...</>:"Check for changes"}
                        </button>
                      </div>
                      {ch&&(
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                            <div style={{fontSize:12,fontWeight:700,color:ch.changesDetected?SIGNAL:MONEY}}>
                              {ch.changesDetected?"⚠ Changes detected":"✓ Market stable — no significant changes"}
                            </div>
                            {ch.changeScore>0&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:ch.changeScore>=6?DANGER_BG:SIGNAL_BG,color:ch.changeScore>=6?DANGER:SIGNAL,fontWeight:700}}>Change score: {ch.changeScore}/10</span>}
                          </div>
                          {ch.summary&&<div style={{fontSize:11,color:INK,marginBottom:7,lineHeight:1.5}}>{ch.summary}</div>}
                          {ch.signals?.filter(sg=>sg.changed).length>0&&(
                            <div style={{display:"grid",gap:4,marginBottom:7}}>
                              {ch.signals.filter(sg=>sg.changed).map((sg,i)=>(
                                <div key={i} style={{display:"flex",gap:8,padding:"5px 8px",borderRadius:6,background:sg.severity==="high"?DANGER_BG:SIGNAL_BG,border:`1px solid ${sg.severity==="high"?"#F0B4B4":"#EAD09A"}`,flexWrap:"wrap"}}>
                                  <span style={{fontSize:10,fontWeight:700,color:MUTED,flexShrink:0,textTransform:"capitalize"}}>{sg.signal}</span>
                                  <span style={{fontSize:10}}>{sg.previous} → <b>{sg.current}</b></span>
                                  <span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:"#fff",color:sg.severity==="high"?DANGER:SIGNAL,marginLeft:"auto",flexShrink:0}}>{sg.severity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                            {ch.recommendation==="rerun"&&(
                              <button onClick={()=>{loadSession(s);setTab("agents");}}
                                style={{padding:"6px 14px",background:MONEY,color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                                Re-run full pipeline →
                              </button>
                            )}
                            {ch.recommendationReason&&<span style={{fontSize:11,color:MUTED,fontStyle:"italic"}}>{ch.recommendationReason}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        {tab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 9, marginBottom: 20 }}>
              <Metric label="Execution progress" value={pct+"%"} sub={doneCount+" of "+totalTasks+" tasks"} />
              <Metric label="Current MRR" value={"$"+mrr.toLocaleString()} sub={mrrPct+"% of $100K MRR"} money />
              <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 9, padding: "11px 13px" }}>
                <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Update MRR</div>
                <div style={{ display: "flex", gap: 5 }}>
                  <input value={mrrIn} onChange={e => setMrrIn(e.target.value.replace(/[^0-9]/g,""))} placeholder="e.g. 4200" style={{ flex: 1, minWidth: 0, padding: "6px 8px", fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 5, fontFamily: "monospace", outline: "none", color: INK, background: "#fff" }} />
                  <button onClick={() => { setMrr(Number(mrrIn)||0); setMrrIn(""); }} style={{ padding: "6px 10px", background: INK, color: "#fff", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><RefreshCw size={11} /></button>
                </div>
              </div>
            </div>
            <div style={{ height: 6, background: LINE, borderRadius: 3, marginBottom: 20 }}><div style={{ width: pct+"%", height: "100%", background: INK, borderRadius: 3, transition: "width .4s" }} /></div>

            {/* ── PRODUCT INTELLIGENCE PANEL ─────────────────────────────── */}
            {(results.scout || results.pricing || results.psychol || results.marketing || results.distributor || results.validator) && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${INK}` }}>
                  Product intelligence — {niche || "current niche"}
                </div>
                <div style={{ display: "grid", gap: 10 }}>

                  {/* Row 1: Competition Level + Evergreen Demand + Build Complexity */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile?"1fr":`repeat(3, 1fr)`, gap: 10 }}>

                    {/* Competition Level */}
                    {results.validator && (
                      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#F9F8F5", borderBottom: `1px solid ${LINE}` }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>⚔ Competition level</div>
                        </div>
                        <div style={{ padding: "12px" }}>
                          {(() => {
                            const score = parseInt(results.validator.competitionScore || 5);
                            const level = score >= 7 ? "Low" : score >= 5 ? "Medium" : "High";
                            const color = score >= 7 ? MONEY : score >= 5 ? SIGNAL : DANGER;
                            const bg = score >= 7 ? MONEY_BG : score >= 5 ? SIGNAL_BG : DANGER_BG;
                            return (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                  <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 700, color }}>{score}<span style={{ fontSize: 12, color: MUTED }}>/10</span></div>
                                  <div style={{ padding: "4px 12px", borderRadius: 20, background: bg, color, fontSize: 12, fontWeight: 700 }}>{level} competition</div>
                                </div>
                                <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>{results.validator.competitionEvidence}</div>
                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: results.validator.trendDirection === "growing" ? MONEY_BG : SIGNAL_BG, color: results.validator.trendDirection === "growing" ? MONEY : SIGNAL, fontWeight: 600 }}>Trend: {results.validator.trendDirection}</span>
                                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#F1F0EC", color: MUTED }}>Ads: {results.validator.adActivity}</span>
                                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#F1F0EC", color: MUTED }}>Community: {results.validator.communitySize}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Evergreen Demand */}
                    {results.pricing?.evergreenScore && (
                      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#F9F8F5", borderBottom: `1px solid ${LINE}` }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>🌿 Evergreen demand</div>
                        </div>
                        <div style={{ padding: "12px" }}>
                          {(() => {
                            const ev = results.pricing.evergreenScore;
                            const score = parseInt(ev.score || 5);
                            const color = score >= 7 ? MONEY : score >= 5 ? SIGNAL : DANGER;
                            const bg = score >= 7 ? MONEY_BG : score >= 5 ? SIGNAL_BG : DANGER_BG;
                            return (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                  <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 700, color }}>{score}<span style={{ fontSize: 12, color: MUTED }}>/10</span></div>
                                  <div style={{ padding: "4px 12px", borderRadius: 20, background: bg, color, fontSize: 12, fontWeight: 700 }}>{score >= 7 ? "Evergreen" : score >= 5 ? "Moderate" : "Seasonal"}</div>
                                </div>
                                <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>{ev.rationale}</div>
                                {ev.seasonalPeaks?.length > 0 && (
                                  <div style={{ marginBottom: 5 }}>
                                    <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Peak months</div>
                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                      {ev.seasonalPeaks.map((m, i) => <span key={i} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: SIGNAL_BG, color: SIGNAL }}>{m}</span>)}
                                    </div>
                                  </div>
                                )}
                                {ev.evergreenEvidence && <div style={{ fontSize: 10, color: MUTED, fontStyle: "italic" }}>{ev.evergreenEvidence}</div>}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Build Complexity */}
                    {results.scout?.products?.[0] && (
                      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#F9F8F5", borderBottom: `1px solid ${LINE}` }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>🔧 Easy to make / sell</div>
                        </div>
                        <div style={{ padding: "12px" }}>
                          {(() => {
                            const p = results.scout.products[0];
                            const complexity = p.buildComplexity || "medium";
                            const color = complexity === "easy" ? MONEY : complexity === "medium" ? SIGNAL : DANGER;
                            const bg = complexity === "easy" ? MONEY_BG : complexity === "medium" ? SIGNAL_BG : DANGER_BG;
                            return (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                  <div style={{ padding: "6px 16px", borderRadius: 20, background: bg, color, fontSize: 16, fontWeight: 700, textTransform: "capitalize" }}>{complexity}</div>
                                </div>
                                <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>{p.what}</div>
                                {p.productTags?.length > 0 && (
                                  <div>
                                    <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Product tags</div>
                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                      {p.productTags.map((tag, i) => (
                                        <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#F3F0FF", color: "#6741D9", fontWeight: 600 }}>#{tag}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Margins + Suppliers */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap: 10 }}>

                    {/* Margins */}
                    {results.pricing?.productMargins?.length > 0 && (
                      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#F9F8F5", borderBottom: `1px solid ${LINE}` }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>💰 Margin per product</div>
                        </div>
                        <div style={{ padding: "12px" }}>
                          {results.pricing.productMargins.map((m, i) => (
                            <div key={i} style={{ padding: "8px 0", borderBottom: i < results.pricing.productMargins.length - 1 ? `1px solid ${LINE}` : "none" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 4 }}>{m.productType}</div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginBottom: 4 }}>
                                {[["COGS", m.estimatedCOGS, MUTED], ["Price", m.sellingPrice, INK], ["Gross margin", m.grossMargin, MONEY]].map(([k, v, c]) => (
                                  <div key={k} style={{ textAlign: "center", padding: "5px", background: "#F9F8F5", borderRadius: 6 }}>
                                    <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase" }}>{k}</div>
                                    <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: c, marginTop: 1 }}>{v}</div>
                                  </div>
                                ))}
                              </div>
                              {m.netMarginAfterAds && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 10, color: MUTED }}>Net after ads:</span>
                                  <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: parseFloat(m.netMarginAfterAds) > 20 ? MONEY : SIGNAL }}>{m.netMarginAfterAds}</span>
                                  {m.source && <span style={{ fontSize: 9, color: MUTED, fontStyle: "italic" }}>({m.source})</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suppliers */}
                    {results.scout?.products?.[0]?.suppliers?.length > 0 && (
                      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#F9F8F5", borderBottom: `1px solid ${LINE}` }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>🏭 Suppliers used by sellers</div>
                        </div>
                        <div style={{ padding: "12px" }}>
                          <div style={{ display: "grid", gap: 6 }}>
                            {results.scout.products.slice(0, 3).map((p, i) => (
                              p.suppliers?.length > 0 && (
                                <div key={i}>
                                  {i === 0 && <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 5 }}>Top competitor: {p.name}</div>}
                                  {i > 0 && <div style={{ fontSize: 10, color: MUTED, marginBottom: 3, borderTop: `1px solid ${LINE}`, paddingTop: 6 }}>{p.name}</div>}
                                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                    {p.suppliers.map((s, j) => (
                                      <span key={j} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: MONEY_BG, color: MONEY, fontWeight: 600, border: `1px solid #BFDECB` }}>{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                          <div style={{ marginTop: 10, padding: "7px 10px", borderRadius: 7, background: "#F9F8F5", border: `1px solid ${LINE}` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 4 }}>Verify suppliers</div>
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                              {[["USADrop", "usadrop.com/products"], ["CJ Dropshipping", "cjdropshipping.com"], ["AliExpress", "aliexpress.com"]].map(([name, url]) => (
                                <a key={name} href={`https://${url}`} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "#EDF2FF", color: "#3B5BDB", textDecoration: "none", fontWeight: 600, border: "1px solid #BAD3F8" }}>{name} ↗</a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Ideal Customer + Marketing Hook Analysis */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap: 10 }}>

                    {/* Ideal Customer */}
                    {results.psychol?.idealCustomerProfile && (
                      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#F3F0FF", borderBottom: `1px solid #C5B4F3` }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#6741D9", textTransform: "uppercase" }}>👤 Ideal customer</div>
                        </div>
                        <div style={{ padding: "12px" }}>
                          {(() => {
                            const icp = results.psychol.idealCustomerProfile;
                            return (
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 8 }}>{icp.dayInLife}</div>
                                <div style={{ display: "grid", gap: 6 }}>
                                  {[
                                    ["Demographics", icp.demographics],
                                    ["Psychographics", icp.psychographics],
                                    ["Where they search", icp.searchBehavior],
                                  ].map(([k, v]) => v && (
                                    <div key={k} style={{ padding: "6px 8px", borderRadius: 6, background: "#F9F8F5", border: `1px solid ${LINE}` }}>
                                      <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                                      <div style={{ fontSize: 11, color: INK }}>{v}</div>
                                    </div>
                                  ))}
                                  {icp.painLevel && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: 10, color: MUTED }}>Pain level:</span>
                                      <span style={{ fontSize: 11, fontWeight: 700, color: icp.painLevel === "high" ? DANGER : icp.painLevel === "medium" ? SIGNAL : MONEY, padding: "2px 8px", borderRadius: 20, background: icp.painLevel === "high" ? DANGER_BG : icp.painLevel === "medium" ? SIGNAL_BG : MONEY_BG }}>
                                        {icp.painLevel}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {results.psychol.primaryEmotion && (
                                  <div style={{ marginTop: 8, padding: "7px 10px", borderRadius: 7, background: "#F3F0FF", border: "1px solid #C5B4F3" }}>
                                    <div style={{ fontSize: 9, color: "#6741D9", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Primary buying emotion</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6741D9" }}>{results.psychol.primaryEmotion}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Marketing Hook Analysis */}
                    {results.marketing?.hookAnalysis && (
                      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#FFF0F6", borderBottom: `1px solid #F9C8DC` }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#C2255C", textTransform: "uppercase" }}>🎣 Marketing hook analysis</div>
                        </div>
                        <div style={{ padding: "12px" }}>
                          {(() => {
                            const h = results.marketing.hookAnalysis;
                            return (
                              <div>
                                <div style={{ background: "#FFF0F6", border: "1px solid #F9C8DC", borderRadius: 7, padding: "8px 10px", marginBottom: 10 }}>
                                  <div style={{ fontSize: 9, color: "#C2255C", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Primary hook</div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: "#C2255C" }}>{h.primaryHook}</div>
                                  {h.hookFormula && <div style={{ fontSize: 11, color: MUTED, marginTop: 3, fontStyle: "italic" }}>Formula: "{h.hookFormula}"</div>}
                                </div>
                                {h.topHooks?.length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>Top performing hooks</div>
                                    {h.topHooks.map((hook, i) => (
                                      <div key={i} style={{ padding: "6px 8px", borderRadius: 6, background: "#F9F8F5", border: `1px solid ${LINE}`, marginBottom: 4 }}>
                                        <div style={{ display: "flex", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
                                          <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 20, background: "#EDF2FF", color: "#3B5BDB", fontWeight: 600 }}>{hook.format}</span>
                                          <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 20, background: "#F3F0FF", color: "#6741D9", fontWeight: 600 }}>{hook.platform}</span>
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: INK, marginBottom: 2 }}>"{hook.hook}"</div>
                                        <div style={{ fontSize: 10, color: MUTED }}>{hook.whyItWorks}</div>
                                        {hook.exampleFromCompetitor && <div style={{ fontSize: 9, color: SIGNAL, marginTop: 2 }}>→ {hook.exampleFromCompetitor}</div>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {h.antiHooks?.length > 0 && (
                                  <div style={{ padding: "7px 10px", borderRadius: 7, background: DANGER_BG, border: `1px solid #F0B4B4` }}>
                                    <div style={{ fontSize: 9, color: DANGER, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Avoid these overused angles</div>
                                    {h.antiHooks.map((a, i) => <div key={i} style={{ fontSize: 10, color: DANGER, marginBottom: 2 }}>✗ {a}</div>)}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 4: Scale Strategy — full width */}
                  {results.distributor?.scaleStrategy && (
                    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ padding: "8px 12px", background: "#EBFBEE", borderBottom: `1px solid #BFDECB` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MONEY, textTransform: "uppercase" }}>🚀 Scale strategy — path to $100K MRR</div>
                      </div>
                      <div style={{ padding: "12px" }}>
                        {(() => {
                          const ss = results.distributor.scaleStrategy;
                          return (
                            <div>
                              <div style={{ display: "grid", gridTemplateColumns: isMobile?"1fr":"repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
                                {[ss.phase1, ss.phase2, ss.phase3].filter(Boolean).map((phase, i) => (
                                  <div key={i} style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${LINE}`, background: "#F9F8F5" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? SIGNAL : i === 1 ? "#3B5BDB" : MONEY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{phase.title}</div>
                                    </div>
                                    <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Timeframe: {phase.timeframe}</div>
                                    <div style={{ fontSize: 10, color: MONEY, fontWeight: 600, marginBottom: 4 }}>Key channel: {phase.keyChannel}</div>
                                    {phase.actions?.map((a, j) => <div key={j} style={{ fontSize: 10, color: INK, marginBottom: 2 }}>· {a}</div>)}
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap: 8 }}>
                                {ss.bottleneck && (
                                  <div style={{ padding: "8px 10px", borderRadius: 7, background: DANGER_BG, border: `1px solid #F0B4B4` }}>
                                    <div style={{ fontSize: 9, color: DANGER, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Bottleneck to watch</div>
                                    <div style={{ fontSize: 11, color: DANGER }}>{ss.bottleneck}</div>
                                  </div>
                                )}
                                {ss.unfairAdvantage && (
                                  <div style={{ padding: "8px 10px", borderRadius: 7, background: MONEY_BG, border: `1px solid #BFDECB` }}>
                                    <div style={{ fontSize: 9, color: MONEY, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Your unfair advantage at scale</div>
                                    <div style={{ fontSize: 11, color: MONEY }}>{ss.unfairAdvantage}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {PHASES.map(p => {
              const pd = p.tasks.filter((_,i) => done[`${p.id}-${i}`]).length;
              const complete = pd===p.tasks.length;
              const Icon = p.icon;
              return (
                <div key={p.id} style={{ border: `1px solid ${complete?MONEY:LINE}`, background: complete?MONEY_BG:"#fff", borderRadius: 9, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", background: complete?MONEY_BG:"#F9F8F5", borderBottom: `1px solid ${complete?"#BFDECB":LINE}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: complete?MONEY:INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={15} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Phase {p.id} — {p.name}</div>
                      <div style={{ fontSize: 10, color: MUTED }}>{p.window} · {pd}/{p.tasks.length} done</div>
                    </div>
                    {complete ? <CheckCircle2 size={18} color={MONEY} /> : <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, background: LINE, padding: "2px 8px", borderRadius: 20 }}>{p.tasks.length-pd} left</span>}
                  </div>
                  <div style={{ padding: "5px 10px 9px" }}>
                    {p.tasks.map((t,i) => { const k=`${p.id}-${i}`, isDone=done[k]; return (
                      <button key={i} onClick={() => toggleTask(p.id,i)} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "8px 6px", borderRadius: 6, width: "100%", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", background: isDone?"rgba(14,122,78,.05)":"transparent", borderBottom: i<p.tasks.length-1?`1px solid ${LINE}`:"none" }}>
                        <div style={{ flexShrink: 0, marginTop: 1 }}>{isDone?<CheckCircle2 size={17} color={MONEY} />:<Circle size={17} color="#C6C4BC" />}</div>
                        <span style={{ fontSize: 13, lineHeight: 1.5, color: isDone?MUTED:INK, textDecoration: isDone?"line-through":"none" }}>{t}</span>
                      </button>
                    );})}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function AgentOutput({ agent, data: d }) {
  const payColor = s => s==="high"?{c:MONEY,bg:MONEY_BG}:s==="medium"?{c:SIGNAL,bg:SIGNAL_BG}:{c:MUTED,bg:"#F1F0EC"};
  if (!d) return null;
  const S = (children, extra={}) => <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:MUTED,marginBottom:3,...extra}}>{children}</div>;

  if (agent.id==="scorer") {
    const vs = d.verdict==="strong"?{color:MONEY,bg:MONEY_BG}:d.verdict==="promising"?{color:SIGNAL,bg:SIGNAL_BG}:d.verdict==="risky"?{color:"#862E9C",bg:"#F8F0FC"}:{color:DANGER,bg:DANGER_BG};
    return <div style={{padding:"10px 13px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <div style={{fontFamily:"monospace",fontSize:26,fontWeight:700,color:d.overallScore>=35?MONEY:d.overallScore>=25?SIGNAL:DANGER}}>{d.overallScore}<span style={{fontSize:12,color:MUTED}}>/50</span></div>
        <div style={{padding:"3px 10px",borderRadius:20,background:vs.bg,color:vs.color,fontSize:11,fontWeight:700,textTransform:"uppercase"}}>{d.verdict}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:5,marginBottom:8}}>
        {d.scores && Object.entries(d.scores).map(([k,v])=>(
          <div key={k} style={{padding:"6px 8px",borderRadius:6,background:"#F9F8F5",border:`1px solid ${LINE}`}}>
            <div style={{fontSize:9,color:MUTED,fontWeight:600,textTransform:"capitalize"}}>{k.replace(/([A-Z])/g," $1")}</div>
            <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:v.score>=7?MONEY:v.score>=5?SIGNAL:DANGER}}>{v.score}<span style={{fontSize:9,color:MUTED}}>/{v.max}</span></div>
            <div style={{fontSize:9,color:MUTED,lineHeight:1.4,marginTop:1}}>{v.rationale}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:11,color:INK,marginBottom:4}}>{d.verdictReason}</div>
      <div style={{fontSize:11,color:MONEY,fontWeight:600}}>Best angle: {d.bestAngle}</div>
      {d.trendingSignals?.length>0 && <div style={{marginTop:5}}>{d.trendingSignals.map((s,i)=><div key={i} style={{fontSize:10,color:SIGNAL}}>→ {s}</div>)}</div>}
      {d.sourcesChecked?.length>0 && <div style={{fontSize:9,color:MUTED,marginTop:5}}>Checked: {d.sourcesChecked.join(" · ")}</div>}
    </div>;
  }

  if (agent.id==="scout") return <div style={{padding:"10px 13px"}}>
    {d.products?.map((p,i)=>(
      <div key={i} style={{padding:"8px 10px",borderRadius:7,border:`1px solid ${i===0?MONEY:LINE}`,background:i===0?MONEY_BG:"#F9F8F5",marginBottom:5}}>
        {i===0&&<div style={{fontSize:9,fontWeight:700,color:MONEY,textTransform:"uppercase",marginBottom:2}}>Primary target</div>}
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:5}}>
          <span style={{fontSize:12,fontWeight:700}}>{p.name}</span>
          <div style={{display:"flex",gap:5}}>
            <span style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:MONEY}}>{p.revenue}</span>
            {p.adActivity&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:p.adActivity==="high"?MONEY_BG:SIGNAL_BG,color:p.adActivity==="high"?MONEY:SIGNAL}}>ads:{p.adActivity}</span>}
          </div>
        </div>
        <div style={{fontSize:11,color:MUTED}}>{p.what}</div>
        <div style={{fontSize:10,color:MUTED}}>Source: {p.evidence}</div>
        {p.weaknesses?.length>0&&<div style={{marginTop:3}}>{p.weaknesses.map((w,j)=><span key={j} style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:DANGER_BG,color:DANGER,marginRight:3}}>⚠ {w}</span>)}</div>}
        {p.communities?.length>0&&<div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:3}}>{p.communities.map((c,j)=><span key={j} style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:"#F1F0EC"}}>{c}</span>)}</div>}
      </div>
    ))}
  </div>;

  if (agent.id==="analyst") return <div style={{padding:"10px 13px"}}>
    {d.marketOpening&&<div style={{background:SIGNAL_BG,border:`1px solid #EAD09A`,borderRadius:6,padding:"6px 9px",fontSize:11,color:"#6B4A0F",marginBottom:7}}>{d.marketOpening}</div>}
    {d.gaps?.map((g,i)=>{const pc=payColor(g.paySignal);return(
      <div key={i} style={{padding:"6px 9px",borderRadius:6,border:`1px solid ${LINE}`,borderLeft:`3px solid ${pc.c}`,marginBottom:4,background:"#F9F8F5"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:5}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:MUTED,fontStyle:"italic"}}>"{g.complaint}"</div>
            <div style={{fontSize:11,fontWeight:600,marginTop:2}}>→ {g.feature}</div>
            <div style={{fontSize:9,color:MUTED,marginTop:1}}>{g.evidence} · ~{g.mentionCount} mentions · {g.recency}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
            <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",padding:"2px 5px",borderRadius:20,color:pc.c,background:pc.bg}}>{g.paySignal}</span>
            {g.switchRisk==="yes"&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:DANGER_BG,color:DANGER}}>switch</span>}
          </div>
        </div>
        {g.exactQuote&&<div style={{fontSize:9,color:MUTED,fontStyle:"italic",marginTop:3,borderTop:`1px solid ${LINE}`,paddingTop:3}}>"{g.exactQuote}"</div>}
      </div>
    );})}
    {d.sourcesSearched?.length>0&&<div style={{fontSize:9,color:MUTED,marginTop:5}}>Searched: {d.sourcesSearched.join(" · ")}</div>}
  </div>;

  if (agent.id==="pricing") return <div style={{padding:"10px 13px"}}>
    <div style={{fontSize:11,fontWeight:600,color:MONEY,marginBottom:6}}>{d.pricingInsight}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:5,marginBottom:7}}>
      {d.recommendedTiers?.map((t,i)=>(
        <div key={i} style={{padding:"8px 9px",borderRadius:7,border:`1px solid ${LINE}`,background:"#F9F8F5"}}>
          <div style={{fontSize:11,fontWeight:700}}>{t.name}</div>
          <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:MONEY,margin:"2px 0"}}>{t.monthlyPrice}<span style={{fontSize:9,color:MUTED}}>/mo</span></div>
          <div style={{fontSize:9,color:MUTED}}>{t.targetCustomer}</div>
        </div>
      ))}
    </div>
    <div style={{fontSize:11,marginBottom:3}}>Range: {d.marketPricingRange?.lowest} – {d.marketPricingRange?.highest} ({d.marketPricingRange?.source})</div>
    <div style={{fontSize:11,color:MONEY,fontWeight:600}}>{d.revenueToTarget?.calculation}</div>
    {d.sourcesChecked?.length>0&&<div style={{fontSize:9,color:MUTED,marginTop:5}}>Checked: {d.sourcesChecked.join(" · ")}</div>}
  </div>;

  if (agent.id==="strategist") return <div style={{padding:"10px 13px"}}>
    <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{d.name}</div>
    <div style={{fontSize:11,color:MUTED,marginBottom:7}}>{d.tagline}</div>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7,marginBottom:7}}>
      <div><S>Core features</S>{d.coreFeatures?.map((f,i)=><div key={i} style={{fontSize:11,marginBottom:2}}>· {f}</div>)}</div>
      <div><S style={{color:MONEY}}>Differentiators</S>{d.differentiators?.map((f,i)=><div key={i} style={{fontSize:11,color:MONEY,marginBottom:2,fontWeight:600}}>· {f}</div>)}</div>
    </div>
    <div style={{fontSize:11,marginBottom:3}}><b>MVP:</b> {d.mvpScope}</div>
    <div style={{fontSize:11,color:DANGER,marginBottom:4}}><b>Cut:</b> {d.notMVP}</div>
    {d.competitorTrafficSources?.length>0&&<div style={{fontSize:10,color:MUTED}}>Traffic via: {d.competitorTrafficSources.join(", ")}</div>}
    {d.techStackInsight&&<div style={{fontSize:10,color:MUTED,marginTop:2}}>Built with: {d.techStackInsight}</div>}
  </div>;

  if (agent.id==="validator") return <div style={{padding:"10px 13px"}}>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:5,marginBottom:7}}>
      <ScoreCard label="Demand" value={d.demandScore+"/10"} good={parseInt(d.demandScore)>=6} />
      <ScoreCard label="Competition" value={d.competitionScore+"/10"} good={parseInt(d.competitionScore)>=5} />
      <ScoreCard label="Trend" value={d.trendDirection} good={d.trendDirection==="growing"} />
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:7}}>
      {d.communitySize&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"#F1F0EC"}}>Community: {d.communitySize}</span>}
      {d.vcActivity&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"#F1F0EC"}}>VC: {d.vcActivity}</span>}
      {d.adActivity&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:d.adActivity==="high"?MONEY_BG:SIGNAL_BG,color:d.adActivity==="high"?MONEY:SIGNAL}}>Ads: {d.adActivity}</span>}
    </div>
    <div style={{fontSize:11,color:MUTED,marginBottom:7}}>{d.viabilityReason}</div>
    <div style={{padding:"6px 9px",borderRadius:6,background:d.gateDecision==="proceed"?MONEY_BG:SIGNAL_BG,border:`1px solid ${d.gateDecision==="proceed"?"#BFDECB":"#EAD09A"}`,marginBottom:6}}>
      <div style={{fontSize:11,fontWeight:700,color:d.gateDecision==="proceed"?MONEY:SIGNAL}}>Gate: {d.gateDecision?.toUpperCase()}</div>
      <div style={{fontSize:11,color:INK,marginTop:1}}>{d.gateReason}</div>
    </div>
    {d.greenLights?.map((g,i)=><div key={i} style={{fontSize:11,color:MONEY,marginBottom:2}}>✓ {g}</div>)}
    {d.redFlags?.map((f,i)=><div key={i} style={{fontSize:11,color:DANGER,marginBottom:2}}>⚠ {f}</div>)}
    {d.sourcesChecked?.length>0&&<div style={{fontSize:9,color:MUTED,marginTop:5}}>Checked: {d.sourcesChecked.join(" · ")}</div>}
  </div>;

  if (agent.id==="legal") return <div style={{padding:"10px 13px"}}>
    <S>Priority actions</S>
    {d.priorityActions?.map((a,i)=>(
      <div key={i} style={{padding:"5px 7px",borderRadius:5,border:`1px solid ${LINE}`,marginBottom:4,background:"#F9F8F5",display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:11}}>{a.action}</span>
        <div style={{display:"flex",gap:4}}>
          {a.canDIY&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:MONEY_BG,color:MONEY}}>DIY</span>}
          <span style={{fontSize:9,fontWeight:700,color:a.urgency==="before-launch"?DANGER:SIGNAL}}>{a.urgency}</span>
        </div>
      </div>
    ))}
    {d.freeComplianceTools?.length>0&&<div style={{marginTop:7}}><S>Free tools</S>{d.freeComplianceTools.map((t,i)=><div key={i} style={{fontSize:11,color:MONEY,marginBottom:2}}>✓ {t}</div>)}</div>}
    {d.ipRisks?.length>0&&<div style={{marginTop:7}}><S>IP risks</S>{d.ipRisks.map((r,i)=><div key={i} style={{fontSize:11,color:r.severity==="high"?DANGER:SIGNAL,marginBottom:2}}>⚠ {r.risk}</div>)}</div>}
    {d.disclaimer&&<div style={{fontSize:9,color:MUTED,marginTop:7,fontStyle:"italic",borderTop:`1px solid ${LINE}`,paddingTop:5}}>{d.disclaimer}</div>}
  </div>;

  if (agent.id==="builder") return <div style={{padding:"10px 13px"}}>
    <S>Tech stack (competitor uses: {d.competitorStack})</S>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
      {[["FE",d.recommendedStack?.frontend],["BE",d.recommendedStack?.backend],["DB",d.recommendedStack?.database],["Auth",d.recommendedStack?.auth],["Pay",d.recommendedStack?.payments],["Host",d.recommendedStack?.hosting]].map(([k,v])=>v&&<span key={k} style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:SIGNAL_BG,color:SIGNAL,fontWeight:600}}>{k}: {v}</span>)}
    </div>
    <div style={{fontSize:10,color:MUTED,marginBottom:8}}>{d.recommendedStack?.reasoning}</div>
    {d.openSourceStarters?.length>0&&<div style={{marginBottom:7}}><S>GitHub starters</S>{d.openSourceStarters.map((s,i)=><div key={i} style={{fontSize:11,color:"#3B5BDB",marginBottom:2}}>· {s}</div>)}</div>}
    <S>MVP features</S>
    {d.mvpFeatures?.map((f,i)=>(
      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${LINE}`,gap:6}}>
        <span style={{fontSize:11}}>{f.feature}</span>
        <div style={{display:"flex",gap:3,flexShrink:0}}>
          <span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:f.priority==="must"?DANGER_BG:"#F1F0EC",color:f.priority==="must"?DANGER:MUTED}}>{f.priority}</span>
          <span style={{fontSize:9,color:f.difficulty==="hard"?DANGER:f.difficulty==="medium"?SIGNAL:MONEY}}>{f.difficulty}</span>
        </div>
      </div>
    ))}
    <div style={{fontSize:11,color:DANGER,fontWeight:600,marginTop:7}}>Risk: {d.biggestTechnicalRisk}</div>
    <div style={{fontSize:11,marginTop:3}}>Cost: {d.monthlyCost}/mo</div>
  </div>;

  if (agent.id==="qa") return <div style={{padding:"10px 13px"}}>
    <div style={{background:MONEY_BG,border:`1px solid #BFDECB`,borderRadius:6,padding:"7px 9px",marginBottom:7}}>
      <S>Pre-launch checklist</S>
      {d.preLaunchChecklist?.map((c,i)=><div key={i} style={{fontSize:11,marginBottom:2}}>☐ {c}</div>)}
    </div>
    {d.lighthouseTargets&&<div style={{marginBottom:7}}><S>Lighthouse targets</S>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {Object.entries(d.lighthouseTargets).map(([k,v])=><span key={k} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"#F1F0EC"}}>{k}: {v}</span>)}
      </div>
    </div>}
    {d.freeTestingTools?.length>0&&<div style={{marginBottom:5}}><S>Free testing tools</S>{d.freeTestingTools.map((t,i)=><div key={i} style={{fontSize:11,marginBottom:2}}><a href={t.url} target="_blank" rel="noopener noreferrer" style={{color:"#3B5BDB",textDecoration:"none"}}>{t.tool}</a> — {t.purpose}</div>)}</div>}
    {d.founderTestingGuide&&<div style={{background:"#F3F0FF",border:"1px solid #C5B4F3",borderRadius:6,padding:"7px 9px"}}><S>Testing guide</S><div style={{fontSize:11,color:"#6741D9"}}>{d.founderTestingGuide}</div></div>}
  </div>;

  if (agent.id==="seo") return <div style={{padding:"10px 13px"}}>
    <div style={{marginBottom:7}}><S>Quick wins — first 30 days</S>{d.quickWins?.map((w,i)=><div key={i} style={{fontSize:11,color:MONEY,marginBottom:2}}>→ {w}</div>)}</div>
    <S>Primary keywords</S>
    {d.primaryKeywords?.map((k,i)=>(
      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${LINE}`,gap:5}}>
        <span style={{fontSize:11,fontWeight:600}}>{k.keyword}</span>
        <div style={{display:"flex",gap:3,flexShrink:0}}>
          <span style={{fontSize:9,color:MUTED}}>{k.monthlySearches}/mo</span>
          <span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:k.difficulty==="low"?MONEY_BG:k.difficulty==="medium"?SIGNAL_BG:DANGER_BG,color:k.difficulty==="low"?MONEY:k.difficulty==="medium"?SIGNAL:DANGER}}>{k.difficulty}</span>
        </div>
      </div>
    ))}
    <div style={{marginTop:6,fontSize:11,color:MUTED}}>Time to rank: {d.timeToRank}</div>
    {d.comparisonKeywords?.length>0&&<div style={{marginTop:6}}><S>Comparison keywords</S>{d.comparisonKeywords.map((k,i)=><div key={i} style={{fontSize:11,color:"#3B5BDB",marginBottom:1}}>· {k}</div>)}</div>}
  </div>;

  if (agent.id==="marketing") return <div style={{padding:"10px 13px"}}>
    {d.competitorAdInsights&&<div style={{background:"#F9F8F5",border:`1px solid ${LINE}`,borderRadius:6,padding:"7px 9px",marginBottom:7}}>
      <S>Competitor ad intel (Facebook Ad Library + Minea)</S>
      <div style={{fontSize:11}}><b>Core message:</b> {d.competitorAdInsights.coreMessage}</div>
      {d.competitorAdInsights.facebookAds&&<div style={{fontSize:11,marginTop:2}}><b>FB:</b> {d.competitorAdInsights.facebookAds}</div>}
      {d.competitorAdInsights.tiktokAds&&<div style={{fontSize:11,marginTop:2}}><b>TikTok:</b> {d.competitorAdInsights.tiktokAds}</div>}
    </div>}
    <div style={{background:"#F3F0FF",border:"1px solid #C5B4F3",borderRadius:6,padding:"7px 9px",marginBottom:7}}>
      <div style={{fontSize:12,fontWeight:600,color:"#6741D9"}}>{d.positioning?.statement}</div>
      <div style={{fontSize:11,color:MUTED,marginTop:2}}>{d.positioning?.vsCompetitor}</div>
      {d.positioningGap&&<div style={{fontSize:10,color:SIGNAL,marginTop:3}}>Gap: {d.positioningGap}</div>}
    </div>
    <div style={{marginBottom:7}}><S>Headlines</S>{d.headlines?.map((h,i)=><div key={i} style={{fontSize:11,padding:"3px 0",borderBottom:`1px solid ${LINE}`}}>"{h}"</div>)}</div>
    {d.adCopy?.map((a,i)=>(
      <div key={i} style={{padding:"6px 8px",borderRadius:6,background:"#F9F8F5",border:`1px solid ${LINE}`,marginBottom:4}}>
        <div style={{fontSize:9,fontWeight:700,color:MUTED}}>{a.platform}</div>
        <div style={{fontSize:11,fontWeight:600}}>{a.headline}</div>
        <div style={{fontSize:10,color:MUTED}}>{a.body}</div>
        <div style={{fontSize:10,color:MONEY,fontWeight:600}}>CTA: {a.cta}</div>
      </div>
    ))}
    <div style={{background:SIGNAL_BG,border:`1px solid #EAD09A`,borderRadius:6,padding:"7px 9px",marginTop:5}}>
      <S>Validation post</S>
      <div style={{fontSize:11,fontStyle:"italic",color:"#6B4A0F"}}>"{d.validationPost}"</div>
    </div>
  </div>;

  if (agent.id==="cs") return <div style={{padding:"10px 13px"}}>
    {d.competitorOnboardingWeaknesses?.length>0&&<div style={{background:DANGER_BG,border:`1px solid #F0B4B4`,borderRadius:6,padding:"7px 9px",marginBottom:7}}><S>Competitor onboarding weaknesses</S>{d.competitorOnboardingWeaknesses.map((w,i)=><div key={i} style={{fontSize:11,color:DANGER,marginBottom:2}}>⚠ {w}</div>)}</div>}
    <div style={{background:MONEY_BG,border:`1px solid #BFDECB`,borderRadius:6,padding:"7px 9px",marginBottom:7}}>
      <S>Activation metric</S>
      <div style={{fontSize:12,fontWeight:700,color:MONEY}}>{d.activationMetric?.metric}</div>
      <div style={{fontSize:10,color:MUTED}}>Target: {d.activationMetric?.targetTime} · Benchmark: {d.activationMetric?.benchmark}</div>
    </div>
    <S>Onboarding — {d.weeklyTimeRequired}</S>
    {d.onboardingFlow?.map((s,i)=>(
      <div key={i} style={{display:"flex",gap:7,padding:"4px 0",borderBottom:`1px solid ${LINE}`}}>
        <div style={{width:18,height:18,borderRadius:"50%",background:MONEY,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0}}>{s.step}</div>
        <div><div style={{fontSize:11,fontWeight:600}}>{s.name} <span style={{fontSize:9,color:s.automated?MONEY:SIGNAL}}>({s.automated?"auto":"manual"} · {s.duration})</span></div><div style={{fontSize:10,color:MUTED}}>{s.goal}</div></div>
      </div>
    ))}
    <div style={{marginTop:7}}>
      {d.churnSignals?.map((s,i)=><div key={i} style={{fontSize:11,marginBottom:3}}><span style={{color:s.severity==="high"?DANGER:SIGNAL,fontWeight:600}}>⚠ {s.signal}</span><span style={{color:MUTED}}> → {s.intervention}</span></div>)}
    </div>
  </div>;

  if (agent.id==="distributor") return <div style={{padding:"10px 13px"}}>
    {d.competitorTrafficBreakdown&&<div style={{background:"#F9F8F5",border:`1px solid ${LINE}`,borderRadius:6,padding:"7px 9px",marginBottom:7}}>
      <S>Competitor traffic (SimilarWeb)</S>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {Object.entries(d.competitorTrafficBreakdown).filter(([k])=>k!=="topReferrers").map(([k,v])=><span key={k} style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"#F1F0EC"}}>{k}: {v}</span>)}
      </div>
      {d.competitorTrafficBreakdown.topReferrers?.length>0&&<div style={{fontSize:10,color:MUTED,marginTop:4}}>Top referrers: {d.competitorTrafficBreakdown.topReferrers.join(", ")}</div>}
    </div>}
    <S>Channels</S>
    {d.channelStrategy?.map((c,i)=>(
      <div key={i} style={{padding:"6px 8px",borderRadius:6,border:`1px solid ${LINE}`,marginBottom:4,background:"#F9F8F5"}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:600}}>#{c.priority} {c.channel}</span><span style={{fontSize:10,color:MUTED}}>{c.weeklyHours}</span></div>
        <div style={{fontSize:10,color:MUTED}}>{c.why}</div>
        <div style={{fontSize:11,color:MONEY}}>→ {c.firstAction}</div>
      </div>
    ))}
    {d.youtubeOpportunity&&<div style={{marginTop:5,fontSize:11}}><b>YouTube:</b> {d.youtubeOpportunity}</div>}
    {d.tiktokOpportunity&&<div style={{marginTop:3,fontSize:11}}><b>TikTok:</b> {d.tiktokOpportunity}</div>}
    <div style={{marginTop:7}}><S>Launch sequence</S>
      {d.launchSequence?.map((s,i)=>(
        <div key={i} style={{display:"flex",gap:7,padding:"4px 0",borderTop:i>0?`1px solid ${LINE}`:"none"}}>
          <div style={{width:65,fontSize:10,color:MUTED,flexShrink:0}}>{s.week}<br/><span style={{color:SIGNAL}}>{s.hoursRequired}h</span></div>
          <div><div style={{fontSize:11,fontWeight:600}}>{s.phase}</div><div style={{fontSize:10,color:MONEY}}>{s.goal}</div></div>
        </div>
      ))}
    </div>
  </div>;

  if (agent.id==="finance") return <div style={{padding:"10px 13px"}}>
    {d.criticalWarning&&<div style={{background:DANGER_BG,border:`1px solid #F0B4B4`,borderRadius:6,padding:"7px 9px",marginBottom:7}}>
      <S style={{color:DANGER}}>Critical warning</S>
      <div style={{fontSize:11,color:DANGER}}>{d.criticalWarning}</div>
    </div>}
    {d.benchmarkData&&<div style={{background:"#F9F8F5",border:`1px solid ${LINE}`,borderRadius:6,padding:"7px 9px",marginBottom:7}}>
      <S>Benchmark data from {d.benchmarkData.source}</S>
      <div style={{fontSize:10,color:MUTED}}>Churn: {d.benchmarkData.industryChurnRate} · ARPU: {d.benchmarkData.industryARPU} · Time to revenue: {d.benchmarkData.medianTimeToFirstRevenue}</div>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:5,marginBottom:7}}>
      {[["LTV",d.unitEconomics?.ltv],["CAC target",d.unitEconomics?.cacTarget],["LTV/CAC",d.unitEconomics?.ltvCacRatio],["Monthly burn",d.monthlyBurnEstimate?.total]].map(([k,v])=>(
        <div key={k} style={{padding:"6px 9px",borderRadius:6,background:"#F9F8F5",border:`1px solid ${LINE}`}}>
          <div style={{fontSize:9,color:MUTED,fontWeight:600,textTransform:"uppercase"}}>{k}</div>
          <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:INK,marginTop:1}}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{marginBottom:7}}><S>Break-even</S>
      <div style={{fontSize:13,fontWeight:700,color:MONEY}}>{d.breakEven?.mrrNeeded} MRR</div>
      <div style={{fontSize:11,color:MUTED}}>{d.breakEven?.customersNeeded} customers · {d.breakEven?.estimatedMonth}</div>
    </div>
    <S>Cash flow</S>
    {d.cashFlowProjection?.map((m,i)=>(
      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${LINE}`,fontSize:11,gap:5}}>
        <span style={{color:MUTED,flexShrink:0}}>{m.month}</span>
        <span style={{fontFamily:"monospace",color:MONEY,fontWeight:600}}>{m.mrr}</span>
        <span style={{fontFamily:"monospace",color:MUTED}}>{m.netCash}</span>
      </div>
    ))}
    <div style={{background:"#F9F8F5",border:`1px solid ${LINE}`,borderRadius:6,padding:"7px 9px",marginTop:7}}>
      <S>Scenarios</S>
      <div style={{fontSize:11,color:MONEY}}>Best: {d.sensitivityAnalysis?.bestCase}</div>
      <div style={{fontSize:11,color:INK}}>Base: {d.sensitivityAnalysis?.baseCase}</div>
      <div style={{fontSize:11,color:DANGER}}>Worst: {d.sensitivityAnalysis?.worstCase}</div>
    </div>
    {d.exitMultiple&&<div style={{fontSize:11,color:MUTED,marginTop:5}}>Exit multiple (Flippa): {d.exitMultiple}</div>}
    {d.sourcesChecked?.length>0&&<div style={{fontSize:9,color:MUTED,marginTop:4}}>Benchmarks from: {d.sourcesChecked.join(" · ")}</div>}
  </div>;


  if (agent.id==="forecast") return <div style={{padding:"10px 13px"}}>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:5,marginBottom:8}}>
      {[["6 months",d.demandForecast?.sixMonths],["12 months",d.demandForecast?.twelveMonths],["18 months",d.demandForecast?.eighteenMonths]].map(([k,v])=>(
        <div key={k} style={{textAlign:"center",padding:"8px 5px",borderRadius:6,background:v==="growing"?MONEY_BG:v==="declining"?DANGER_BG:SIGNAL_BG,border:`1px solid ${v==="growing"?"#BFDECB":v==="declining"?"#F0B4B4":"#EAD09A"}`}}>
          <div style={{fontSize:9,color:MUTED,fontWeight:600,textTransform:"uppercase"}}>{k}</div>
          <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,marginTop:2,color:v==="growing"?MONEY:v==="declining"?DANGER:SIGNAL}}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{fontSize:11,color:INK,marginBottom:8}}>{d.demandForecast?.rationale}</div>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7,marginBottom:7}}>
      <div style={{padding:"7px 9px",borderRadius:6,background:d.aiDisruptionRisk==="low"?MONEY_BG:d.aiDisruptionRisk==="high"?DANGER_BG:SIGNAL_BG,border:`1px solid ${d.aiDisruptionRisk==="low"?"#BFDECB":d.aiDisruptionRisk==="high"?"#F0B4B4":"#EAD09A"}`}}>
        <div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:2}}>AI disruption risk</div>
        <div style={{fontSize:13,fontWeight:700,color:d.aiDisruptionRisk==="low"?MONEY:d.aiDisruptionRisk==="high"?DANGER:SIGNAL}}>{d.aiDisruptionRisk}</div>
        <div style={{fontSize:10,color:MUTED,marginTop:2}}>{d.aiDisruptionDetail}</div>
      </div>
      <div style={{padding:"7px 9px",borderRadius:6,background:d.regulatoryOutlook==="tailwind"?MONEY_BG:d.regulatoryOutlook==="headwind"?DANGER_BG:SIGNAL_BG,border:`1px solid ${LINE}`}}>
        <div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:2}}>Regulatory outlook</div>
        <div style={{fontSize:13,fontWeight:700,color:d.regulatoryOutlook==="tailwind"?MONEY:d.regulatoryOutlook==="headwind"?DANGER:SIGNAL}}>{d.regulatoryOutlook}</div>
        <div style={{fontSize:10,color:MUTED,marginTop:2}}>{d.regulatoryDetail}</div>
      </div>
    </div>
    <div style={{marginBottom:6}}><div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>Growth drivers</div>{d.growthDrivers?.map((g,i)=><div key={i} style={{fontSize:11,color:MONEY,marginBottom:2}}>→ {g}</div>)}</div>
    <div style={{marginBottom:6}}><div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>Growth threats</div>{d.growthThreats?.map((g,i)=><div key={i} style={{fontSize:11,color:DANGER,marginBottom:2}}>⚠ {g}</div>)}</div>
    <div style={{background:SIGNAL_BG,border:`1px solid #EAD09A`,borderRadius:6,padding:"7px 9px",marginTop:5}}>
      <div style={{fontSize:10,fontWeight:700,color:SIGNAL}}>Window of opportunity</div>
      <div style={{fontSize:11,color:"#6B4A0F"}}>{d.windowOfOpportunity}</div>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6,fontSize:10,color:MUTED}}>
      <span>GitHub: {d.githubSignal}</span> · <span>Hiring: {d.hiringSignal}</span> · <span>Funding: {d.fundingSignal}</span>
    </div>
  </div>;

  if (agent.id==="distro") return <div style={{padding:"10px 13px"}}>
    <div style={{background:MONEY_BG,border:`1px solid #BFDECB`,borderRadius:6,padding:"8px 10px",marginBottom:8}}>
      <div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>Primary growth engine</div>
      <div style={{fontSize:13,fontWeight:700,color:MONEY}}>{d.primaryGrowthEngine}</div>
      <div style={{fontSize:11,color:INK,marginTop:3}}>{d.viralMechanics}</div>
    </div>
    <div style={{marginBottom:7}}>
      <div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:5}}>Growth timeline</div>
      {d.growthTimeline?.map((g,i)=>(
        <div key={i} style={{padding:"7px 9px",borderRadius:6,border:`1px solid ${LINE}`,background:"#F9F8F5",marginBottom:5}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:11,fontWeight:700}}>{g.phase}</span>
            <span style={{fontSize:10,color:MONEY,fontWeight:600}}>{g.primaryChannel}</span>
          </div>
          {g.tactics?.map((t,j)=><div key={j} style={{fontSize:10,color:MUTED}}>· {t}</div>)}
        </div>
      ))}
    </div>
    <div style={{marginBottom:6}}><div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>5 tactics to copy</div>
      {d.copyablePlaybook?.map((t,i)=><div key={i} style={{fontSize:11,marginBottom:3,padding:"4px 8px",borderRadius:5,background:"#F3F0FF",color:"#6741D9"}}>→ {t}</div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7,marginBottom:5}}>
      <div><div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:2}}>Estimated CAC</div><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:INK}}>{d.cac}</div></div>
      <div><div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:2}}>Payback period</div><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:INK}}>{d.paybackPeriod}</div></div>
    </div>
    <div style={{fontSize:11,color:DANGER,marginTop:4}}><b>Unfair advantage to overcome:</b> {d.unfairAdvantage}</div>
  </div>;

  if (agent.id==="moat") return <div style={{padding:"10px 13px"}}>
    <div style={{background:"#F8F0FC",border:"1px solid #D18EE2",borderRadius:7,padding:"10px 12px",marginBottom:8}}>
      <div style={{fontSize:9,fontWeight:700,color:"#862E9C",textTransform:"uppercase",marginBottom:3}}>Moat statement</div>
      <div style={{fontSize:13,fontWeight:600,color:"#862E9C"}}>{d.moatStatement}</div>
    </div>
    <div style={{marginBottom:7}}>
      <div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:5}}>Moat design</div>
      {d.moatDesign?.map((m,i)=>(
        <div key={i} style={{padding:"7px 9px",borderRadius:6,border:`1px solid ${LINE}`,background:"#F9F8F5",marginBottom:5}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8}}>
            <span style={{fontSize:12,fontWeight:700}}>#{m.priority} {m.moatType}</span>
            <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:m.strength==="strong"?MONEY_BG:m.strength==="weak"?DANGER_BG:SIGNAL_BG,color:m.strength==="strong"?MONEY:m.strength==="weak"?DANGER:SIGNAL}}>{m.strength}</span>
          </div>
          <div style={{fontSize:11,color:INK,marginTop:3}}>{m.description}</div>
          <div style={{fontSize:10,color:MUTED,marginTop:2}}>→ {m.howToBuild}</div>
          <div style={{fontSize:10,color:SIGNAL,marginTop:1}}>Time: {m.timeToEstablish}</div>
        </div>
      ))}
    </div>
    <div style={{marginBottom:5}}><div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>Defense timeline</div>
      {d.defenseTimeline?.map((t,i)=>(
        <div key={i} style={{display:"flex",gap:8,padding:"3px 0",borderBottom:`1px solid ${LINE}`}}>
          <span style={{fontSize:10,color:MUTED,flexShrink:0,width:60}}>{t.milestone}</span>
          <span style={{fontSize:11,color:MONEY}}>{t.moatBuilt}</span>
        </div>
      ))}
    </div>
    <div style={{fontSize:11,color:MUTED,marginTop:5}}><b>Data asset:</b> {d.dataAsset}</div>
    {d.vulnerabilities?.length>0&&<div style={{marginTop:5}}>{d.vulnerabilities.map((v,i)=><div key={i} style={{fontSize:10,color:DANGER}}>⚠ {v}</div>)}</div>}
  </div>;

  if (agent.id==="execrisk") return <div style={{padding:"10px 13px"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,padding:"10px 12px",borderRadius:8,background:execriskBg(d.overallRiskLevel),border:`1px solid ${execriskBorder(d.overallRiskLevel)}`}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"monospace",fontSize:28,fontWeight:700,color:execriskColor(d.overallRiskLevel)}}>{d.overallExecutionScore}</div>
        <div style={{fontSize:9,color:MUTED}}>/ 100</div>
      </div>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:execriskColor(d.overallRiskLevel)}}>{d.overallRiskLevel} execution risk</div>
        <div style={{fontSize:11,color:MUTED,marginTop:2}}>{d.bootstrappable?"✓ Bootstrappable":"✗ Likely needs funding"} — {d.bootstrapRationale}</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:5,marginBottom:8}}>
      {d.riskScores && Object.entries(d.riskScores).map(([k,v])=>(
        <div key={k} style={{padding:"6px 8px",borderRadius:6,border:`1px solid ${LINE}`,background:"#F9F8F5"}}>
          <div style={{fontSize:9,color:MUTED,fontWeight:600,textTransform:"capitalize"}}>{k.replace(/([A-Z])/g," $1")}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
            <span style={{fontSize:12,fontWeight:700,color:v.level==="Low"?MONEY:v.level==="Medium"?SIGNAL:DANGER}}>{v.level}</span>
            <span style={{fontSize:9,color:MUTED}}>({v.score}/10)</span>
          </div>
          <div style={{fontSize:9,color:MUTED,marginTop:1}}>{v.mitigation}</div>
        </div>
      ))}
    </div>
    <div style={{background:DANGER_BG,border:`1px solid #F0B4B4`,borderRadius:6,padding:"7px 9px",marginBottom:6}}>
      <div style={{fontSize:10,fontWeight:700,color:DANGER,marginBottom:2}}>Biggest risk</div>
      <div style={{fontSize:11,color:DANGER}}>{d.biggestRisk}</div>
      <div style={{fontSize:11,color:INK,marginTop:3}}><b>Mitigation:</b> {d.riskMitigation}</div>
    </div>
    {d.earlyWarningSignals?.length>0&&<div><div style={{fontSize:9,fontWeight:700,color:MUTED,textTransform:"uppercase",marginBottom:3}}>Early warning signals (90 days)</div>{d.earlyWarningSignals.map((s,i)=><div key={i} style={{fontSize:11,color:SIGNAL,marginBottom:2}}>⚠ {s}</div>)}</div>}
  </div>;

  if (agent.id==="oppscore") {
    const grade = d.grade;
    const gradeColor = ["A+","A"].includes(grade)?MONEY:["B+","B"].includes(grade)?SIGNAL:DANGER;
    const scorePct = (d.totalWeightedScore || 0);
    return <div style={{padding:"10px 13px"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12,padding:"14px 16px",borderRadius:10,background:scorePct>=70?MONEY_BG:scorePct>=50?SIGNAL_BG:DANGER_BG,border:`1px solid ${scorePct>=70?"#BFDECB":scorePct>=50?"#EAD09A":"#F0B4B4"}`}}>
        <div style={{textAlign:"center",flexShrink:0}}>
          <div style={{fontFamily:"monospace",fontSize:36,fontWeight:700,color:gradeColor,lineHeight:1}}>{d.totalWeightedScore}</div>
          <div style={{fontSize:11,color:MUTED}}>/100</div>
        </div>
        <div style={{width:3,height:48,background:LINE,borderRadius:2,flexShrink:0}} />
        <div>
          <div style={{fontSize:22,fontWeight:700,color:gradeColor}}>{grade}</div>
          <div style={{fontSize:12,color:INK,marginTop:2}}>{d.verdict}</div>
          <div style={{marginTop:6,display:"inline-flex",padding:"4px 12px",borderRadius:20,background:d.recommendation==="proceed"?MONEY:d.recommendation==="avoid"?DANGER:SIGNAL,color:"#fff",fontSize:11,fontWeight:700,textTransform:"uppercase"}}>{d.recommendation}</div>
        </div>
      </div>
      <div style={{display:"grid",gap:4,marginBottom:10}}>
        {d.dimensions && Object.entries(d.dimensions).map(([k,v])=>{
          const pct = Math.round((v.score/(v.max||10))*100);
          return (
            <div key={k} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:10,color:MUTED,width:130,flexShrink:0,textTransform:"capitalize"}}>{k.replace(/([A-Z])/g," $1")} <span style={{color:MUTED}}>({v.weight}%)</span></div>
              <div style={{flex:1,height:6,background:LINE,borderRadius:3}}>
                <div style={{width:pct+"%",height:"100%",background:pct>=70?MONEY:pct>=50?SIGNAL:DANGER,borderRadius:3}} />
              </div>
              <div style={{fontSize:10,fontFamily:"monospace",color:INK,width:30,textAlign:"right"}}>{v.score}/{v.max}</div>
            </div>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7,marginBottom:7}}>
        <div><div style={{fontSize:9,fontWeight:700,color:MONEY,textTransform:"uppercase",marginBottom:3}}>Top reasons</div>{d.topReasons?.map((r,i)=><div key={i} style={{fontSize:11,color:MONEY,marginBottom:2}}>✓ {r}</div>)}</div>
        <div><div style={{fontSize:9,fontWeight:700,color:DANGER,textTransform:"uppercase",marginBottom:3}}>Top risks</div>{d.topRisks?.map((r,i)=><div key={i} style={{fontSize:11,color:DANGER,marginBottom:2}}>⚠ {r}</div>)}</div>
      </div>
      {d.pivotSuggestion&&d.recommendation!=="proceed"&&<div style={{background:SIGNAL_BG,border:`1px solid #EAD09A`,borderRadius:6,padding:"7px 9px"}}><div style={{fontSize:10,fontWeight:700,color:SIGNAL,marginBottom:2}}>Pivot suggestion</div><div style={{fontSize:11,color:"#6B4A0F"}}>{d.pivotSuggestion}</div></div>}
      <div style={{fontSize:10,color:MUTED,marginTop:6}}>Confidence: {d.confidenceLevel}</div>
    </div>;
  }


  if (agent.id==="psychol") return <div style={{padding:"10px 13px"}}>
    <div style={{background:"#F3F0FF",border:"1px solid #C5B4F3",borderRadius:8,padding:"10px 12px",marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:"#6741D9",marginBottom:4}}>Primary buying emotion</div>
      <div style={{fontSize:14,fontWeight:700,color:"#6741D9"}}>{d.primaryEmotion}</div>
      <div style={{fontSize:11,color:MUTED,marginTop:3}}>{d.onboardingEmotion}</div>
    </div>
    <div style={{marginBottom:9}}>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:MUTED,marginBottom:5}}>Buying motivations</div>
      {d.buyingMotivations?.map((m,i)=>(
        <div key={i} style={{padding:"6px 9px",borderRadius:6,border:`1px solid ${LINE}`,marginBottom:4,background:"#F9F8F5",display:"flex",justifyContent:"space-between",gap:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:600}}>{m.motivation}</div>
            <div style={{fontSize:10,color:MUTED}}>{m.evidence}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end",flexShrink:0}}>
            <span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"#F3F0FF",color:"#6741D9",fontWeight:600}}>{m.emotionalDriver}</span>
            <span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:m.strength==="high"?MONEY_BG:m.strength==="medium"?SIGNAL_BG:"#F1F0EC",color:m.strength==="high"?MONEY:m.strength==="medium"?SIGNAL:MUTED}}>{m.strength}</span>
          </div>
        </div>
      ))}
    </div>
    <div style={{marginBottom:9}}>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:MUTED,marginBottom:5}}>Objections + how to overcome them</div>
      {d.buyingObjections?.map((o,i)=>(
        <div key={i} style={{padding:"6px 9px",borderRadius:6,border:`1px solid ${LINE}`,borderLeft:`3px solid ${DANGER}`,marginBottom:4,background:"#F9F8F5"}}>
          <div style={{fontSize:11,fontWeight:600,color:DANGER}}>"{o.objection}"</div>
          <div style={{fontSize:10,color:MUTED,marginTop:2}}>Fear: {o.underlyingFear}</div>
          <div style={{fontSize:11,color:MONEY,marginTop:2}}>→ {o.howToOvercome}</div>
          {o.urgency&&<div style={{fontSize:10,color:SIGNAL,marginTop:2}}>⏱ {o.urgency}</div>}
        </div>
      ))}
    </div>
    {d.trustBarriers?.length>0&&<div style={{marginBottom:9}}>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:MUTED,marginBottom:4}}>Trust barriers</div>
      {d.trustBarriers.map((b,i)=>(
        <div key={i} style={{padding:"5px 8px",borderRadius:5,border:`1px solid ${LINE}`,marginBottom:3,background:"#F9F8F5",display:"flex",justifyContent:"space-between",gap:6}}>
          <span style={{fontSize:11}}>{b.barrier} → <span style={{color:MONEY}}>{b.solution}</span></span>
          <span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:b.severity==="high"?DANGER_BG:SIGNAL_BG,color:b.severity==="high"?DANGER:SIGNAL,flexShrink:0}}>{b.severity}</span>
        </div>
      ))}
    </div>}
    {d.triggerMoments?.length>0&&<div style={{marginBottom:9}}>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:MUTED,marginBottom:4}}>Trigger moments — when they decide to buy</div>
      {d.triggerMoments.map((t,i)=><div key={i} style={{fontSize:11,color:SIGNAL,marginBottom:2}}>⚡ {t}</div>)}
    </div>}
    {d.messagingAngles?.length>0&&<div style={{marginBottom:9}}>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:MUTED,marginBottom:4}}>Messaging angles that hit emotionally</div>
      {d.messagingAngles.map((a,i)=>(
        <div key={i} style={{padding:"6px 9px",borderRadius:6,border:`1px solid ${LINE}`,marginBottom:4,background:"#F9F8F5"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#6741D9"}}>"{a.headline}"</div>
          <div style={{fontSize:10,color:MUTED,marginTop:2}}>{a.why}</div>
        </div>
      ))}
    </div>}
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7,marginBottom:7}}>
      {d.pricingPsychology&&<div style={{background:MONEY_BG,border:`1px solid #BFDECB`,borderRadius:6,padding:"7px 9px"}}><div style={{fontSize:9,fontWeight:700,color:MONEY,textTransform:"uppercase",marginBottom:3}}>Pricing psychology</div><div style={{fontSize:11}}>{d.pricingPsychology}</div></div>}
      {d.socialProofType&&<div style={{background:"#F3F0FF",border:"1px solid #C5B4F3",borderRadius:6,padding:"7px 9px"}}><div style={{fontSize:9,fontWeight:700,color:"#6741D9",textTransform:"uppercase",marginBottom:3}}>Best social proof type</div><div style={{fontSize:12,color:"#6741D9",fontWeight:700}}>{d.socialProofType}</div></div>}
    </div>
    {d.urgencyTriggers?.length>0&&<div style={{background:SIGNAL_BG,border:`1px solid #EAD09A`,borderRadius:6,padding:"7px 9px"}}><div style={{fontSize:9,fontWeight:700,color:SIGNAL,textTransform:"uppercase",marginBottom:3}}>Urgency triggers</div>{d.urgencyTriggers.map((t,i)=><div key={i} style={{fontSize:11,color:"#6B4A0F",marginBottom:2}}>→ {t}</div>)}</div>}
  </div>;

  return null;
}

function ScoreCard({ label, value, good }) {
  return <div style={{textAlign:"center",padding:"8px 5px",borderRadius:6,background:good?MONEY_BG:DANGER_BG,border:`1px solid ${good?"#BFDECB":"#F0B4B4"}`}}>
    <div style={{fontSize:9,color:MUTED,fontWeight:600,textTransform:"uppercase"}}>{label}</div>
    <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,marginTop:2,color:good?MONEY:DANGER}}>{value}</div>
  </div>;
}

function Metric({ label, value, sub, money }) {
  return <div style={{background:"#fff",border:"1px solid #E3E1DA",borderRadius:9,padding:"11px 13px"}}>
    <div style={{fontSize:10,color:"#6B7280",fontWeight:600,textTransform:"uppercase",letterSpacing:".08em"}}>{label}</div>
    <div style={{fontFamily:"monospace",fontSize:20,fontWeight:700,marginTop:3,color:money?"#0E7A4E":"#141B2E"}}>{value}</div>
    <div style={{fontSize:10,color:"#6B7280",marginTop:2}}>{sub}</div>
  </div>;
}function Section({ title, color, bg, children }) {
  return (
    <div style={{border:`1px solid ${color}30`,borderRadius:10,overflow:"hidden",marginBottom:0}}>
      <div style={{padding:"9px 14px",background:bg,borderBottom:`1px solid ${color}30`}}>
        <div style={{fontSize:13,fontWeight:700,color:color}}>{title}</div>
      </div>
      <div style={{padding:"12px 14px",background:"#fff"}}>{children}</div>
    </div>
  );
}


