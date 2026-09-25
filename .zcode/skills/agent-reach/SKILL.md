# Skill: Agent Reach

Agent Reach — reliable Reddit/X/YouTube scraping for deep intelligence gathering. Goes beyond engagement-weighted discovery to extract full conversation threads, user profiles, video transcripts, and channel analytics. Built for systematic competitor and market research at scale.

## When to Use

- Extract complete Reddit threads with full comment trees
- Scrape X/Twitter user timelines, replies, and quote tweets
- Download YouTube video transcripts, comments, and channel data
- Build user persona profiles from cross-platform activity
- Track competitor social presence longitudinally
- Monitor specific accounts for strategy changes

## Capabilities

### Reddit
- **Subreddit scrape** — all posts from a subreddit (new/hot/top/rising)
- **Post deep-dive** — full comment tree with nested replies, author profiles
- **User profile** — submission history, comment history, karma breakdown
- **Search** — Pushshift/Reddit API with advanced filters
- **Real-time monitoring** — webhook/polling for new posts matching criteria

### X (Twitter)
- **User timeline** — tweets, replies, retweets, media (up to 3200)
- **Tweet thread** — full conversation with quote tweets
- **List members** — scrape curated lists (competitors, investors, influencers)
- **Spaces** — metadata and participant lists
- **Advanced search** — date ranges, engagement filters, geo

### YouTube
- **Channel scrape** — all videos, shorts, playlists, metadata
- **Video transcript** — auto-generated or manual captions (multiple languages)
- **Comments** — top-level + replies, sorted by relevance/newest
- **Channel analytics** — view trends, upload frequency, engagement rates
- **Search** — videos by keyword, channel, date range

## Configuration

```bash
# Reddit (required for deep scraping)
REDDIT_CLIENT_ID=xxx
REDDIT_CLIENT_SECRET=xxx
REDDIT_USER_AGENT=RevenueEngine/1.0

# X/Twitter (required)
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
TWITTER_BEARER_TOKEN=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_SECRET=xxx

# YouTube (required)
YOUTUBE_API_KEY=xxx
```

## Usage Examples

### Deep-dive a competitor's Reddit presence
```json
{
  "platform": "reddit",
  "operation": "user_profile",
  "username": "competitor_founder",
  "include": ["submissions", "comments", "karma_breakdown", "subreddits_active"],
  "limit": 1000
}
```

### Extract full discussion thread
```json
{
  "platform": "reddit",
  "operation": "post_thread",
  "post_id: "abc123",
  "comment_depth": 5,
  "min_comment_score": 2,
  "sort": "top"
}
```

### Scrape competitor's YouTube channel for content strategy
```json
{
  "platform": "youtube",
  "operation": "channel_videos",
  "channel_id: "UC_xxxxx",
  "include": ["transcripts", "comments", "analytics"],
  "date_range": "last_90_days",
  "max_videos": 50
}
```

### Monitor X accounts for strategy shifts
```json
{
  "platform": "x",
  "operation": "user_timeline",
  "usernames": ["competitor1", "competitor2", "industry_influencer"],
  "include_replies": true,
  "include_retweets": false,
  "since_id": "last_known_tweet_id"
}
```

## Output Format

```json
{
  "platform": "reddit",
  "operation": "post_thread",
  "data": {
    "post": {
      "id": "abc123",
      "title": "Launching our new feature...",
      "author": "u/founder",
      "subreddit": "SaaS",
      "score": 1247,
      "num_comments": 342,
      "created_utc": 1700000000,
      "selftext": "Full post content...",
      "url": "https://reddit.com/r/SaaS/comments/abc123"
    },
    "comments": [
      {
        "id": "c1",
        "author": "u/user1",
        "body": "Great launch! How does it compare to X?",
        "score": 89,
        "depth": 0,
        "replies": [
          {"id": "c2", "author": "u/founder", "body": "We're 3x faster...", "score": 45, "depth": 1}
        ]
      }
    ],
    "stats": {"total_comments": 342, "unique_authors": 198, "sentiment": "positive"}
  }
}
```

## Integration with Revenue Engine Agents

| Agent | Use Case |
|-------|----------|
| Scout (Agent 1) | Deep-dive founder stories on IndieHackers cross-posted to Reddit |
| Analyst (Agent 2) | Full G2/Capterra complaint threads from Reddit discussions |
| Pricing (Agent 3) | Extract pricing discussions from X founder threads |
| Strategist (Agent 4) | YouTube competitor teardowns, founder interviews |
| Marketing (Agent 10) | Analyze competitor X threads for hook patterns |
| Customer Psychology (Agent 19) | Build personas from cross-platform user activity |
| Trend Forecast (Agent 14) | Track hiring announcements, funding tweets, launch videos |
| Distribution Intel (Agent 15) | Map influencer networks, referral programs on X/YouTube |

## Rate Limits & Best Practices

- Reddit: 60 req/min authenticated, respect `X-RateLimit-Remaining`
- X: 300 req/15min (v2), 900 req/15min (v1.1), use pagination cursors
- YouTube: 10,000 units/day (1 video = 1 unit, search = 100 units)
- Implement exponential backoff on 429
- Store `since_id`/`after` cursors for incremental sync
- Batch related requests (e.g., all competitor channels at once)
- Cache transcripts/comments for 24h

## Data Privacy & Compliance

- Only scrape public data — no private DMs, circles, or restricted content
- Respect `robots.txt` and platform ToS
- Don't store PII beyond what's needed for analysis
- Implement data retention policy (default 90 days)
- Provide opt-out mechanism for user data requests

## Related Skills

- `/last30days` — engagement-weighted discovery (use first, then deep-dive)
- `firecrawl` — extract linked articles from social posts
- `claude-seo` — keyword extraction from transcripts
- `marketingskills` — hook analysis from social content