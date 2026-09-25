# Skill: /last30days

/last30days — Reddit/X/HackerNews engagement-weighted research. Fetches posts from the last 30 days, scores them by engagement (upvotes, comments, shares, views), and returns the most signal-dense discussions for any topic. Designed to replace generic web search with community-validated intelligence.

## When to Use

- Find real user pain points and complaints (not marketing copy)
- Discover emerging trends before they hit mainstream media
- Validate demand by measuring organic community engagement
- Identify trigger moments and buying signals in discussions
- Map competitor sentiment across platforms

## Capabilities

- **Multi-platform search** — Reddit, X (Twitter), Hacker News in one query
- **Engagement scoring** — weighted algorithm: (upvotes × 1.0) + (comments × 1.5) + (shares × 2.0) + (views^0.5 × 0.1)
- **Time-window filtering** — last 7/30/90 days, custom ranges
- **Subreddit/domain filtering** — target specific communities
- **Sentiment classification** — positive/negative/neutral with confidence
- **Entity extraction** — products, companies, features mentioned
- **Thread reconstruction** — full comment trees for context
- **Deduplication** — cross-platform duplicate detection

## Configuration

Optional API keys for higher rate limits:
```bash
REDDIT_CLIENT_ID=xxx
REDDIT_CLIENT_SECRET=xxx
TWITTER_BEARER_TOKEN=xxx
HN_ALGOLIA_API=public (no key needed)
```

## Usage Examples

### Find pain points for "project management software"
```json
{
  "query": "project management software",
  "platforms": ["reddit", "x", "hackernews"],
  "timeframe": "30d",
  "min_engagement": 50,
  "subreddits": ["saas", "projectmanagement", "startups", "productivity"],
  "sort_by": "engagement_score"
}
```

### Track competitor mentions with sentiment
```json
{
  "query": "notion OR clickup OR monday.com OR asana",
  "platforms": ["reddit", "x"],
  "timeframe": "7d",
  "sentiment_filter": "negative",
  "min_engagement": 20
}
```

### Discover emerging trends in AI coding tools
```json
{
  "query": "cursor OR copilot OR windsurf OR vscode AI",
  "platforms": ["hackernews", "reddit"],
  "timeframe": "30d",
  "subreddits": ["programming", "MachineLearning", "LocalLLaMA"],
  "sort_by": "velocity"  // engagement growth rate
}
```

## Engagement Scoring Algorithm

```
engagement_score = 
  (upvotes × 1.0) + 
  (comments × 1.5) + 
  (shares_or_retweets × 2.0) + 
  (views^0.5 × 0.1) +
  (awards × 3.0) +
  (crossposts × 1.5)

velocity = (engagement_score_today - engagement_score_yesterday) / max(1, engagement_score_yesterday)
```

## Output Format

```json
{
  "results": [
    {
      "platform": "reddit",
      "url": "https://reddit.com/r/saas/comments/xyz",
      "title": "Why we switched from Notion to...",
      "author": "u/founder123",
      "created_utc": 1700000000,
      "engagement_score": 1247.5,
      "velocity": 0.34,
      "sentiment": "negative",
      "sentiment_confidence": 0.89,
      "entities": ["Notion", "Obsidian", "productivity"],
      "excerpt": "The offline sync broke for the third time...",
      "comment_count": 234,
      "upvote_ratio": 0.92
    }
  ],
  "summary": {
    "total_posts": 1247,
    "platforms_searched": 3,
    "top_sentiment": "negative",
    "top_entities": [{"name": "Notion", "mentions": 342}, {"name": "Obsidian", "mentions": 198}],
    "trending_topics": ["offline sync", "pricing", "mobile app"]
  }
}
```

## Integration with Revenue Engine Agents

| Agent | Use Case |
|-------|----------|
| Scout (Agent 1) | Find products gaining traction on IndieHackers, r/SaaS |
| Analyst (Agent 2) | Mine negative reviews/complaints from Reddit, HN |
| Pricing (Agent 3) | Track willingness-to-pay discussions, pricing complaints |
| Marketing (Agent 10) | Identify viral hooks, anti-patterns from high-engagement posts |
| Customer Psychology (Agent 19) | Map emotional triggers, buying motivations from discussions |
| Trend Forecast (Agent 14) | Detect velocity signals for emerging categories |
| Distribution Intel (Agent 15) | Find referral/affiliate discussions, channel strategies |

## Rate Limits & Best Practices

- Reddit: 60 req/min (oauth), 10 req/min (anonymous)
- X/Twitter: 300 req/15min (v2 API)
- HN: Unlimited via Algolia
- Cache results for 1h minimum
- Use `min_engagement` filter to reduce noise
- Combine with Firecrawl for full thread content extraction

## Related Skills

- `firecrawl` — extract full content from discovered URLs
- `agent-reach` — deeper Reddit/X/YouTube scraping
- `claude-seo` — keyword extraction from discussions