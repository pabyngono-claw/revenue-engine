# Skill: Firecrawl

Firecrawl — infrastructure for reliable source extraction. Converts any URL into clean markdown or structured data with a single API call. Handles JavaScript rendering, bypasses anti-bot measures, and returns LLM-ready content.

## When to Use

- Extract full article content from news sites, blogs, documentation pages
- Scrape product pages, pricing pages, competitor websites
- Convert any web page to clean markdown for LLM consumption
- Batch extract multiple URLs in parallel
- Crawl entire sites with sitemap discovery

## Capabilities

- **Single URL scrape** — returns markdown, HTML, or structured JSON
- **Batch scrape** — up to 100 URLs in one request
- **Crawl** — discover and extract all pages from a domain
- **Extract** — use LLMs to pull structured data from pages (schema-defined)
- **Map** — get all URLs from a site without scraping content
- **JavaScript rendering** — handles SPAs, infinite scroll, lazy-loaded content
- **Anti-bot bypass** — rotates proxies, handles Cloudflare, CAPTCHAs
- **Authentication** — supports cookies, headers, basic auth

## Configuration

Requires `FIRECRAWL_API_KEY` environment variable (get from firecrawl.dev).

```bash
# Set in Cloudflare Pages dashboard or .dev.vars
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxxxxx
```

## Usage Examples

### Scrape a single URL to markdown
```json
{
  "url": "https://competitor.com/pricing",
  "formats": ["markdown"],
  "onlyMainContent": true
}
```

### Extract structured data with schema
```json
{
  "url": "https://saashub.com/product/xyz",
  "formats": ["extract"],
  "extract": {
    "schema": {
      "type": "object",
      "properties": {
        "pricing_tiers": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "price": {"type": "number"}, "features": {"type": "array", "items": {"type": "string"}}}}},
        "target_audience": {"type": "string"},
        "integrations": {"type": "array", "items": {"type": "string"}}
      }
    }
  }
}
```

### Crawl a competitor's blog for content strategy
```json
{
  "url": "https://competitor.com/blog",
  "crawlerOptions": {
    "limit": 50,
    "allowBackwardLinks": false,
    "allowExternalLinks": false
  },
  "formats": ["markdown"]
}
```

## Integration with Revenue Engine Agents

| Agent | Use Case |
|-------|----------|
| Scout (Agent 1) | Extract product details from IndieHackers, Starter Story, Product Hunt |
| Analyst (Agent 2) | Scrape G2/Capterra review pages for structured complaint data |
| Pricing (Agent 3) | Extract pricing tables from competitor sites, SaaSHub |
| Strategist (Agent 4) | Capture full SimilarWeb/BuiltWith pages for traffic/stack analysis |
| Marketing (Agent 10) | Scrape Facebook Ad Library, TikTok Creative Center for ad copy |
| SEO (Agent 9) | Extract keyword data from Ubersuggest, AnswerThePublic results |
| Trend Forecast (Agent 14) | Crawl GitHub trending, Crunchbase for funding signals |
| Distribution Intel (Agent 15) | Scrape referral program pages, affiliate terms |

## Rate Limits & Best Practices

- Free tier: 500 credits/month (1 credit = 1 page scrape)
- Paid tiers: 10K–1M credits/month
- Batch up to 100 URLs per request for efficiency
- Use `onlyMainContent: true` to reduce token usage
- Cache results in KV for 24h to avoid re-scraping
- Respect `robots.txt` — Firecrawl handles this automatically

## Error Handling

- `429` — rate limited, implement exponential backoff
- `402` — credits exhausted, upgrade plan
- `500` — Firecrawl internal error, retry once
- Timeout: 60s per request, increase for large crawls

## Related Skills

- `/last30days` — engagement-weighted research on scraped content
- `agent-reach` — Reddit/X/YouTube scraping complement
- `claude-seo` — SEO analysis on extracted content