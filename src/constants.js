import { Search, TrendingUp, AlertTriangle, Rocket, CheckCircle2, Users } from "lucide-react";

// ── Design tokens ────────────────────────────────────────────
export const INK      = "#141B2E";
export const PAPER    = "#FAFAF7";
export const MONEY    = "#0E7A4E";
export const MONEY_BG = "#E7F4EC";
export const SIGNAL   = "#B45309";
export const SIGNAL_BG = "#FDF3E3";
export const LINE     = "#E3E1DA";
export const MUTED    = "#6B7280";
export const DANGER   = "#C0392B";
export const DANGER_BG = "#FDECEC";

export const PHASES = [
  { id: 1, name: "Intelligence sweep", window: "Days 1-3", icon: Search, tasks: ["Identify 2-3 products already earning $50K-$200K/month in the niche", "Map every community they target (subreddits, FB groups, X, Discord, YouTube)", "Collect viral posts that surface frustration or workarounds", "Shortlist the single best product to attack"] },
  { id: 2, name: "Pain & gap analysis", window: "Days 4-6", icon: AlertTriangle, tasks: ["Pull negative reviews (G2, Capterra, Trustpilot, App Store, Reddit)", "Pull community pain posts and merge into one master list", "Cluster complaints into feature categories", "Weight by willingness-to-pay signals (cancelled, switched, would pay for)", "Lock the top 3 gaps as core differentiators"] },
  { id: 3, name: "Pre-build validation", window: "Days 7-14", icon: Users, tasks: ["Launch landing page with real pricing + waitlist", "Post in mapped communities as building this, want early access", "Reach 200+ interested signups", "Run 5-10 direct user conversations", "Collect pre-orders or deposits"] },
  { id: 4, name: "Rapid MVP build", window: "Weeks 3-6", icon: Rocket, tasks: ["Build core value loop + top 2 differentiators only", "Replicate validated UX patterns from the competitor", "Invite waitlist to closed beta", "Fix the 2 highest-friction beta complaints", "First paying users live"] },
  { id: 5, name: "Distribution & scale", window: "Weeks 7-16", icon: TrendingUp, tasks: ["Enter every marketing channel the competitor uses", "Lead all messaging with differentiators, not features", "Activate waitlist users to post genuine results", "Launch affiliate / referral program", "Hit milestones: $10K MRR wk 8, $50K wk 12, $100K wk 16"] },
];

export const AGENTS = [
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
    { id: "validator2",  name: "Validation Platforms", label: "Agent 21",  role: "Finds platforms to validate the product before building", icon: "✅", color: "#0C8599", bg: "#E3FAFC" },
  { id: "copyhow",    name: "Copy Blueprint",      label: "Agent 22",  role: "Step by step instructions to copy the product with exact tools", icon: "📋", color: "#6741D9", bg: "#F3F0FF" },
  { id: "compurls",   name: "Competitor URLs",     label: "Agent 23",  role: "Real competitors with URLs, revenue, and weaknesses", icon: "🔗", color: "#2F9E44", bg: "#EBFBEE" },
  { id: "mktcopy",    name: "Marketing Copy",      label: "Agent 24",  role: "Competitor target audience, content and platforms to copy", icon: "📣", color: "#E67700", bg: "#FFF3BF" },
  { id: "mktcopy2",   name: "Copy Marketing",      label: "Agent 25",  role: "Step by step to copy competitor marketing strategy", icon: "🎯", color: "#C2255C", bg: "#FFF0F6" },
  { id: "frenchfit",  name: "French Market Fit",   label: "Agent 26",  role: "Will this work in Francophone West Africa and how to adapt it", icon: "🇫🇷", color: "#1971C2", bg: "#E7F5FF" },
{ id: "psychol",    name: "Customer psychology",label: "Agent 19",  role: "Maps emotional triggers, buying motivations, objections, urgency and trust barriers",   icon: "🧬", color: "#6741D9", bg: "#F3F0FF" },
  { id: "oppscore",   name: "Opportunity score", label: "Agent 20",   role: "Computes a weighted 0-100 score across 12 dimensions — the final go/no-go verdict",                icon: "🏆", color: MONEY,     bg: MONEY_BG },
];
