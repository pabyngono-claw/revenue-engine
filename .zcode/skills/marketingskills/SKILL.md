# Skill: marketingskills

marketingskills — structured marketing workflows for SaaS and digital products. Covers positioning, copywriting, channel strategy, launch sequences, and growth experiments. Designed to turn intelligence from Revenue Engine agents into executable marketing assets.

## When to Use

- Develop positioning and messaging from competitor intelligence
- Write high-converting landing page copy, emails, ads
- Design multi-channel launch sequences
- Plan and prioritize growth experiments
- Create sales enablement assets (battle cards, one-pagers)
- Build referral/affiliate programs

## Workflows (8 Core Modules)

### 1. Positioning Architect
- **Inputs**: Competitor feature matrix, pricing, reviews, target ICP
- **Outputs**: Positioning statement, value props (primary + 3 supporting), differentiation map, category framing
- **Frameworks**: April Dunford's Obviously Awesome, Jobs-to-be-Done, Value Proposition Canvas

### 2. Hook Library Builder
- **Inputs**: Customer pain points (Agent 19), competitor ads (Agent 10), viral posts (/last30days)
- **Outputs**: 50+ hooks categorized by: problem-agitate-solve, before-after-bridge, curiosity-gap, social-proof, authority, anti-pattern
- **Format**: Hook formula, platform variants (LinkedIn, X, Meta, TikTok, cold email), test priority

### 3. Landing Page Copy Generator
- **Inputs**: Positioning, hooks, ICP, competitor pages (Firecrawl), SEO keywords (claude-seo)
- **Outputs**: Hero (headline, subhead, CTA), problem section, solution tour, social proof, pricing, FAQ, footer
- **Variants**: Long-form (SEO), short-form (paid), PLG (self-serve), sales-led (demo request)

### 4. Email Sequence Architect
- **Inputs**: ICP, customer psychology (Agent 19), product type, funnel stage
- **Outputs**: 
  - Cold outreach (5-touch + breakup)
  - Warm nurture (7-day education sequence)
  - Trial onboarding (day 0/1/3/7/14)
  - Win-back (30/60/90 day inactive)
  - Referral ask (post-activation)

### 5. Ad Creative Factory
- **Inputs**: Hook library, competitor ad library (Agent 10), platform specs
- **Outputs**: 
  - Static: 10+ concepts with headline, body, CTA, image direction
  - Video: 15s/30s/60s scripts with hook, demo, proof, CTA beats
  - Carousel: 5-card narrative structures
  - UGC briefs: creator instructions, talking points, deliverables

### 6. Channel Strategy Designer
- **Inputs**: Distribution intel (Agent 15), competitor traffic (Agent 4), budget, team skills
- **Outputs**: Channel prioritization matrix (ICE scoring), 90-day channel roadmap, budget allocation %, KPI targets per channel, resource requirements

### 7. Launch Sequence Orchestrator
- **Inputs**: Product readiness, audience size, launch type (Product Hunt, HN, Twitter, BetaList, AppSumo)
- **Outputs**: Pre-launch (14-day), launch day (hour-by-hour), post-launch (30-day) checklists with owners, assets, dependencies
- **Integrations**: Calendar invites, asset checklist, metric tracking template

### 8. Growth Experiment Designer
- **Inputs**: Funnel metrics, ICE backlog, experiment history
- **Outputs**: Hypothesis cards (metric, variant, MDE, sample size, duration), prioritization score, implementation spec, analysis plan, ship/kill criteria

## Configuration

```bash
# Optional for enhanced competitor data
FACEBOOK_AD_LIBRARY_TOKEN=xxx
MINEA_API_KEY=xxx
WINNING_HUNTER_API_KEY=xxx
```

## Usage Examples

### Full positioning + messaging from competitor intel
```json
{
  "workflow": "positioning_architect",
  "inputs": {
    "competitors": [
      {"name": "Notion", "positioning": "All-in-one workspace", "price": "$8-15/user/mo"},
      {"name": "Obsidian", "positioning": "Local-first knowledge base", "price": "Free/$50 lifetime"}
    ],
    "icp": "Technical founders building B2B SaaS, 1-10 person teams",
    "differentiators": ["Offline-first", "Local data ownership", "Plugin ecosystem"]
  }
}
```

### Generate launch sequence for Product Hunt
```json
{
  "workflow": "launch_sequence_orchestrator",
  "launch_type": "product_hunt",
  "inputs": {
    "product_name": "DevFlow",
    "tagline": "Git-native project management for dev teams",
    "launch_date": "2026-02-15",
    "audience": {"twitter_followers": 2400, "newsletter_subs": 800, "waitlist": 3200},
    "assets_ready": ["hero_video", "screenshots", "demo_gif", "founder_story"]
  }
}
```

### Design growth experiments for activation
```json
{
  "workflow": "growth_experiment_designer",
  "funnel_stage": "activation",
  "current_metrics": {"signup_to_activated": 0.18, "activated_to_paid": 0.22},
  "ice_backlog": [
    {"idea": "Interactive onboarding checklist", "impact": 8, "confidence": 7, "ease": 6},
    {"idea": "Video tutorial in empty state", "impact": 6, "confidence": 8, "ease": 9},
    {"idea": "SSO for teams >5", "impact": 9, "confidence": 5, "ease": 3}
  ],
  "constraints": {"dev_hours_per_week": 20, "max_concurrent": 3}
}
```

## Integration with Revenue Engine Agents

| Agent | Workflows Consumed | Workflows Produced |
|-------|-------------------|-------------------|
| Scout (1) | — | Product tags, supplier info → Hook Library |
| Analyst (2) | Pain points, complaints | — | Positioning differentiators |
| Pricing (3) | Margin data, pricing models | — | Pricing page copy, objection handling |
| Strategist (4) | Competitor blueprints | — | Channel strategy, launch sequence |
| Marketing (10) | **Primary consumer** | Hook library, ad creative, email sequences | — |
| Customer Success (11) | Onboarding patterns | — | Nurture sequences, win-back campaigns |
| Distributor (12) | Scale strategies | — | Referral program, affiliate terms |
| Customer Psychology (19) | Emotional triggers, hooks | — | All copy, positioning, email sequences |

## Output Format (Standardized)

```json
{
  "workflow": "hook_library_builder",
  "status": "completed",
  "data": {
    "hooks": [
      {
        "id": "hook_001",
        "formula": "PAS",
        "angle": "Data ownership anxiety",
        "headline": "Your notes. Their servers. What happens when they shut down?",
        "body": "Notion went down for 6 hours last week. 50,000 teams couldn't work. Obsidian users didn't notice.",
        "cta": "Keep your data local",
        "platform_variants": {
          "linkedin": "🧵 Your notes. Their servers...",
          "x": "Your notes. Their servers. What happens when they shut down? 👇",
          "meta": "Stop renting your second brain. Own it forever.",
          "email": "Subject: What happens to your Notion workspace if they shut down?"
        },
        "test_priority": 1,
        "source_evidence": ["reddit_r_obsidian_12345", "twitter_competitor_down_67890"]
      }
    ],
    "total_hooks": 52,
    "by_formula": {"PAS": 15, "BAB": 12, "Curiosity": 10, "Social Proof": 8, "Authority": 7}
  },
  "metadata": {"tokens_used": 18400, "duration_ms": 6200}
}
```

## Rate Limits & Best Practices

- Cache competitor ad data for 24h (Facebook Ad Library, Minea)
- Batch copy generation — 10+ assets per LLM call
- A/B test hooks at scale: 5 variants × 3 platforms = 15 tests/week
- Document learnings in KV for weight learning engine
- Align messaging with SEO keyword clusters (claude-seo)

## Related Skills

- `claude-seo` — keyword alignment for landing pages
- `/last30days` — source hooks from viral community posts
- `agent-reach` — deep-dive competitor social for ad inspiration
- `firecrawl` — extract full competitor landing pages
- `alirezarezvani-finance` — model CAC/LTV for channel economics