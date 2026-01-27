# Quick Reference Cheat Sheet

## Essential Commands

```bash
# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create feedback-database

# Create KV namespace  
npx wrangler kv:namespace create "FEEDBACK_CACHE"

# Test locally
npm run dev

# Deploy to production
npm run deploy
```

## Project Structure

```
feedback-analyzer/
├── src/
│   └── index.ts          # Main Worker code (sentiment analysis, dashboard)
├── wrangler.toml         # Cloudflare configuration (bindings)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── README.md            # Project documentation
├── DEPLOYMENT.md        # Deployment guide
└── PM_Assignment_Submission.pdf  # Your submission document
```

## Cloudflare Products Used

| Product | Purpose | Binding Name |
|---------|---------|--------------|
| **Workers** | Serverless compute | N/A (main runtime) |
| **Workers AI** | Sentiment analysis | `AI` (env.AI) |
| **D1 Database** | Feedback storage | `FEEDBACK_DB` (env.FEEDBACK_DB) |
| **KV Storage** | Result caching | `FEEDBACK_CACHE` (env.FEEDBACK_CACHE) |

## Key URLs

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Workers Docs**: https://developers.cloudflare.com/workers/
- **Workers AI Docs**: https://developers.cloudflare.com/workers-ai/
- **D1 Docs**: https://developers.cloudflare.com/d1/
- **KV Docs**: https://developers.cloudflare.com/kv/

## Submission Checklist

- [ ] Deploy to Cloudflare Workers
- [ ] Get live URL (your-project.account.workers.dev)
- [ ] Push code to GitHub
- [ ] Update PDF with live URLs
- [ ] Take screenshot of Bindings page in dashboard
- [ ] Submit PDF via assignment email link
- [ ] Submission deadline: 11:59 PM GMT on February 1, 2026

## Code Highlights

### Sentiment Analysis (with caching)
```typescript
const cacheKey = `sentiment:${text.substring(0, 50)}`;
const cached = await env.FEEDBACK_CACHE.get(cacheKey);
if (cached) return cached;

const response = await env.AI.run(
  '@cf/huggingface/distilbert-sst-2-int8',
  { text }
);

const sentiment = response[0].label === 'POSITIVE' ? 'positive' : 'negative';
await env.FEEDBACK_CACHE.put(cacheKey, sentiment, { expirationTtl: 3600 });
```

### Theme Extraction (keyword-based)
```typescript
if (text.includes('dns')) themeMap['DNS & Propagation'] = (themeMap['DNS & Propagation'] || 0) + 1;
if (text.includes('dashboard')) themeMap['Dashboard UX'] = (themeMap['Dashboard UX'] || 0) + 1;
// ... more keywords
```

## Product Insights Summary

1. **Workers AI Model Discovery** - Add task-based filtering
2. **Bindings Configuration** - Improve error messages and docs
3. **D1 Preview vs Production** - Create unified quick-start guide
4. **Local Development** - Add offline mode for development
5. **Dashboard Navigation** - Make Bindings page easier to find

## Tips for Success

- ✅ Focus on insights over perfection
- ✅ Document friction as you encounter it
- ✅ Test your deployment before submitting
- ✅ Keep responses within time budget (3-4 hours)
- ✅ Make sure GitHub repo is public
- ✅ Double-check all URLs work before submitting
