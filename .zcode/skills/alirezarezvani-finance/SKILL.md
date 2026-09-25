# Skill: alirezarezvani-finance

alirezarezvani/claude-skills finance bundle — SaaS metric modeling, financial projections, unit economics, and valuation frameworks. Based on the battle-tested financial modeling patterns from the claude-skills repository. Provides 12 specialized sub-skills for end-to-end financial intelligence.

## When to Use

- Build financial models for new SaaS opportunities (Agent 13 Finance)
- Calculate unit economics: CAC, LTV, payback, gross margin
- Project revenue, expenses, cash flow, runway
- Model pricing scenarios and packaging optimization
- Evaluate funding needs and dilution
- Benchmark against public comps and M&A multiples
- Stress-test assumptions with Monte Carlo simulation

## The 12 Sub-Skills

### Unit Economics (3 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `cac-calculator` | Blended CAC by channel: paid, organic, viral, sales-assisted. Includes attribution windows, overhead allocation |
| `ltv-modeler` | Cohort-based LTV: retention curves, expansion revenue, churn models (logo vs dollar), discount rate |
| `payback-analyzer` | Months to recover CAC: gross margin adjusted, cash vs accrual, payback period distribution |

### Financial Projections (3 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `revenue-projector` | Bottom-up: funnel × conversion × ARPU × expansion. Top-down: TAM × share × ramp. Scenario builder (base/bull/bear) |
| `expense-modeler` | Headcount plan (role, level, start date, burden), OpEx categories, COGS scaling, variable vs fixed |
| `cash-flow-forecaster` | Monthly cash flow: collections, payables, capex, debt service, runway, cash zero date |

### Pricing & Packaging (2 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `pricing-optimizer` | Van Westendorp, Gabor-Granger, conjoint analysis simulation. Price elasticity, willingness-to-pay curves |
| `packaging-architect` | Good/Better/Best design: feature fencing, usage limits, buyer segments. Migration path planning |

### Valuation & Fundraising (2 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `saas-valuation` | ARR multiple method: public comps, private comps, growth-adjusted. Rule of 40, Bessemer Efficiency Score |
| `fundraising-simulator` | Round sizing: pre/post-money, dilution waterfall, option pool refresh, pro-rata, participation rights |

### Strategic Finance (2 skills)

| Sub-Skill | Purpose |
|-----------|---------|
| `unit-economics-dashboard` | Unified view: LTV:CAC, payback, gross margin, churn, NRR, magic number, burn multiple. Red/amber/green thresholds |
| `monte-carlo-stress-test` | 10,000 simulations: vary churn, growth, CAC, expansion. Output: percentile outcomes, probability of success, key sensitivities |

## Configuration

```bash
# Optional for benchmark data
CAPITALIQ_API_KEY=xxx
PITCHBOOK_API_KEY=xxx
BARE_METRICS_OPEN=public (no key needed)
```

## Usage Examples

### Build full financial model for new SaaS opportunity
```json
{
  "workflow": "full_model",
  "inputs": {
    "product": "DevFlow - Git-native PM for dev teams",
    "pricing": {"starter": 15, "pro": 49, "enterprise": 199},
    "funnel": {"monthly_visitors": 50000, "trial_rate": 0.03, "trial_to_paid": 0.20},
    "churn": {"monthly_logo": 0.03, "monthly_dollar": 0.02},
    "expansion": {"annual_uplift": 0.25, "seat_expansion": 0.15},
    "cac_by_channel": {"content": 120, "paid_social": 450, "sales": 2500},
    "headcount_plan": [
      {"role": "Engineer", "level": "Senior", "start_month": 1, "count": 3},
      {"role": "Sales", "level": "AE", "start_month": 4, "count": 2}
    ],
    "opEx_monthly_fixed": 15000,
    "starting_cash": 100000
  },
  "projection_months": 24,
  "scenarios": ["base", "bull", "bear"]
}
```

### Quick unit economics check
```json
{
  "sub_skill": "unit-economics-dashboard",
  "inputs": {
    "arr": 1200000,
    "gross_margin": 0.82,
    "cac_blended": 850,
    "ltv": 4200,
    "payback_months": 6.2,
    "logo_churn_monthly": 0.025,
    "dollar_churn_monthly": 0.018,
    "nrr": 1.12,
    "magic_number": 0.8,
    "burn_multiple": 1.4
  }
}
```

### Pricing optimization for new tier
```json
{
  "sub_skill": "pricing-optimizer",
  "method": "van_westendorp",
  "inputs": {
    "survey_responses": [
      {"too_cheap": 19, "cheap": 39, "expensive": 79, "too_expensive": 129},
      {"too_cheap": 29, "cheap": 49, "expensive": 99, "too_expensive": 149}
    ],
    "current_price": 49,
    "competitor_prices": [39, 79, 99, 149]
  }
}
```

### Monte Carlo stress test
```json
{
  "sub_skill": "monte-carlo-stress-test",
  "base_case": {
    "arr_growth_yoy": 1.5,
    "churn_monthly": 0.025,
    "cac_growth": 1.1,
    "expansion_rate": 0.25
  },
  "distributions": {
    "arr_growth_yoy": {"type": "normal", "mean": 1.5, "sd": 0.3},
    "churn_monthly": {"type": "lognormal", "mean": 0.025, "sd": 0.008},
    "cac_growth": {"type": "normal", "mean": 1.1, "sd": 0.15}
  },
  "simulations": 10000,
  "horizon_months": 24
}
```

## Integration with Revenue Engine Agents

| Agent | Sub-Skills Consumed | Sub-Skills Produced |
|-------|---------------------|---------------------|
| Finance (Agent 13) | **Primary consumer** | All 12 — builds models, validates assumptions |
| Scout (Agent 1) | — | Supplier costs, margins → COGS inputs |
| Pricing (Agent 3) | `pricing-optimizer`, `packaging-architect` | Willingness-to-pay data, competitor pricing |
| Strategist (Agent 4) | `saas-valuation` | TAM, growth rates, competitive dynamics |
| Distributor (Agent 12) | `cac-calculator` | Channel CAC, viral coefficients |
| Execution Risk (Agent 17) | `monte-carlo-stress-test` | Risk-adjusted projections, runway scenarios |
| Opportunity Score (Agent 18) | `unit-economics-dashboard` | Financial viability dimension score |

## Output Format (Standardized)

```json
{
  "sub_skill": "revenue-projector",
  "status": "completed",
  "data": {
    "projections": [
      {"month": 1, "arr": 18000, "mrr": 1500, "customers": 12, "cash": 85000},
      {"month": 6, "arr": 240000, "mrr": 20000, "customers": 145, "cash": 42000},
      {"month": 12, "arr": 720000, "mrr": 60000, "customers": 380, "cash": 180000}
    ],
    "scenarios": {
      "base": {"month_12_arr": 720000, "runway_months": 18},
      "bull": {"month_12_arr": 1200000, "runway_months": "profitable"},
      "bear": {"month_12_arr": 360000, "runway_months": 8}
    },
    "key_metrics": {
      "ltv_cac": 4.9,
      "payback_months": 5.8,
      "gross_margin": 0.82,
      "nrr": 1.15,
      "burn_multiple": 1.2,
      "rule_of_40": 52
    }
  },
  "metadata": {"tokens_used": 22100, "duration_ms": 5800, "assumptions_documented": 47}
}
```

## Financial Modeling Best Practices

1. **Document every assumption** — source, confidence, last updated
2. **Separate inputs from calculations** — single source of truth
3. **Model monthly for first 24 months**, quarterly thereafter
4. **Track unit economics monthly** — not just annually
5. **Include working capital** — AR/AP timing matters for cash
6. **Stress test the 3 killers**: churn, CAC inflation, growth stall
7. **Version control models** — git commit with assumption changelog

## Benchmarks (B2B SaaS, <$10M ARR)

| Metric | Good | Great | Elite |
|--------|------|-------|-------|
| LTV:CAC | 3:1 | 5:1 | 8:1+ |
| Payback (months) | <12 | <6 | <3 |
| Gross Margin | 70% | 80% | 85%+ |
| Net Revenue Retention | 100% | 110% | 120%+ |
| Logo Churn (monthly) | <3% | <2% | <1% |
| Burn Multiple | <2x | <1.5x | <1x |
| Magic Number | >0.5 | >0.75 | >1.0 |
| Rule of 40 | >40 | >50 | >60 |

## Related Skills

- `marketingskills` — CAC by channel, funnel conversion inputs
- `claude-seo` — Organic CAC, content ROI modeling
- `agent-reach` — Competitor funding, headcount for benchmarks
- `firecrawl` — Extract pricing pages, public financials
- `/last30days` — Market sentiment for TAM validation