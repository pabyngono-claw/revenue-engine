# Skill: claude-seo

claude-seo — 25 sub-skills for comprehensive SEO agent workflows. Covers keyword research, content optimization, technical audits, link building, and programmatic SEO. Each sub-skill is independently invokable and chains into end-to-end SEO campaigns.

## When to Use

- Full SEO audit and strategy for new niche entry
- Keyword research and clustering for content planning
- On-page optimization for existing pages
- Technical SEO diagnostics and fixes
- Link building prospecting and outreach
- Programmatic SEO page generation at scale
- Competitor SEO intelligence and gap analysis

## The 25 Sub-Skills

### Keyword Research (5 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `keyword-discovery` | Find seed keywords from competitors, GSC, autosuggest, PAA |
| `keyword-clustering` | Group keywords by search intent and semantic similarity |
| `keyword-difficulty` | Score KD using SERP authority, content depth, backlink profiles |
| `search-intent-classify` | Classify as informational/navigational/commercial/transactional |
| `long-tail-expansion` | Generate 100s of long-tails from head terms with volume estimates |

### Content Optimization (5 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `content-brief-generator` | Create SEO briefs: target KWs, outline, word count, entities |
| `on-page-optimizer` | Optimize title, H1, headers, density, LSI, schema markup |
| `content-gap-analyzer` | Compare vs top 10 competitors, find missing topics/entities |
| `entities-extractor` | Extract NLP entities (people, orgs, products, concepts) |
| `readability-scorer` | Flesch-Kincaid, SMOG, passive voice, sentence variety |

### Technical SEO (4 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `site-auditor` | Crawl: indexability, speed, mobile, Core Web Vitals, schema |
| `internal-link-optimizer` | Map link equity flow, suggest strategic internal links |
| `schema-validator` | Validate JSON-LD, recommend schema types per page template |
| `crawl-budget-analyzer` | Identify waste: redirects, 404s, noindex, canonical loops |

### Link Building (4 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `backlink-auditor` | Analyze profile: toxicity, anchor diversity, link velocity |
| `link-prospector` | Find opportunities: guest posts, resource pages, broken links |
| `outreach-sequence-builder` | Generate personalized email sequences with follow-ups |
| `competitor-backlink-gap` | Links competitors have that you don't — prioritized by DR |

### Programmatic SEO (3 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `pseo-template-builder` | Design page templates with dynamic slots for scale |
| `data-source-mapper` | Connect APIs/CSV to template fields with transforms |
| `pseo-quality-gate` | Validate generated pages: uniqueness, thin content, indexability |

### Strategy & Reporting (4 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `seo-strategy-synthesizer` | Combine all audits into prioritized 90-day roadmap |
| `traffic-forecaster` | Model traffic from ranking improvements, seasonality |
| `roi-calculator` | Estimate revenue from SEO investment vs paid alternatives |
| `client-report-generator` | Executive summaries with visualizations, next actions |

## Configuration

```bash
# Optional API keys for enhanced data
SEMRUSH_API_KEY=xxx
AHREFS_API_KEY=xxx
DATAFORSEO_LOGIN=xxx
DATAFORSEO_PASSWORD=xxx
GOOGLE_SEARCH_CONSOLE_CREDENTIALS=path/to/sa.json
```

## Usage Examples

### Full niche SEO audit
```json
{
  "domain": "competitor.com",
  "scope": "full",
  "include": ["keywords", "content", "technical", "backlinks", "competitors"],
  "target_keywords": ["project management software", "task management", "team collaboration"]
}
```

### Keyword research for new product
```json
{
  "seed_keywords": ["AI code assistant", "copilot alternative"],
  "geo": "US",
  "language": "en",
  "include_questions": true,
  "include_related": true,
  "min_volume": 100,
  "max_kd": 40
}
```

### Programmatic SEO for template pages
```json
{
  "template": "best-{category}-tools-for-{use_case}",
  "data_sources": {
    "categories": ["project-management", "crm", "email-marketing"],
    "use_cases": ["startups", "enterprise", "freelancers", "agencies"]
  },
  "content_fields": ["intro", "comparison_table", "pros_cons", "pricing", "verdict"],
  "quality_threshold": 0.85
}
```

## Integration with Revenue Engine Agents

| Agent | Sub-Skills Used |
|-------|-----------------|
| SEO (Agent 9) | All 25 — primary consumer |
| Scout (Agent 1) | `keyword-discovery`, `competitor-backlink-gap` |
| Strategist (Agent 4) | `site-auditor`, `traffic-forecaster` |
| Marketing (Agent 10) | `content-brief-generator`, `entities-extractor` |
| Distributor (Agent 12) | `link-prospector`, `outreach-sequence-builder` |
| Trend Forecast (Agent 14) | `long-tail-expansion`, `search-intent-classify` |

## Chaining Example: End-to-End Content Campaign

```
1. keyword-discovery(seed="project management") 
   → 2. keyword-clustering(intent="commercial")
   → 3. keyword-difficulty(filter KD<35)
   → 4. content-brief-generator(top_20_clusters)
   → 5. pseo-template-builder(briefs)
   → 6. data-source-mapper(competitor_data.csv)
   → 7. pseo-quality-gate(generated_pages)
   → 8. on-page-optimizer(published_pages)
   → 9. internal-link-optimizer(site)
   → 10. seo-strategy-synthesizer(all_audits)
```

## Output Format (Standardized)

All sub-skills return:
```json
{
  "sub_skill": "keyword-clustering",
  "status": "completed",
  "data": { ... },
  "metadata": {
    "tokens_used": 12450,
    "api_calls": 3,
    "duration_ms": 4200,
    "confidence": 0.92
  },
  "next_recommended": ["keyword-difficulty", "content-brief-generator"]
}
```

## Rate Limits & Best Practices

- Cache keyword data for 7 days
- Batch API calls (DataForSEO supports 100 keywords/request)
- Respect search engine ToS — no automated SERP scraping without API
- Use `site-auditor` incrementally (weekly) not full crawl daily
- Validate `pseo-quality-gate` before indexing at scale

## Related Skills

- `firecrawl` — extract competitor content for gap analysis
- `/last30days` — find trending topics for keyword expansion
- `agent-reach` — source backlink prospects from social
- `marketingskills` — align SEO content with marketing hooks