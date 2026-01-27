# Deployment Guide

This guide will walk you through deploying the Feedback Analyzer to Cloudflare Workers.

## Prerequisites

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com/sign-up
2. **Node.js**: Version 16 or higher
3. **Wrangler CLI**: Cloudflare's command-line tool

## Step-by-Step Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window asking you to authorize Wrangler.

### 3. Create D1 Database (Production)

```bash
npx wrangler d1 create feedback-database
```

**Important**: Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "FEEDBACK_DB"
database_name = "feedback-database"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

### 4. Create KV Namespace (Production)

```bash
npx wrangler kv:namespace create "FEEDBACK_CACHE"
```

**Important**: Copy the `id` from the output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "FEEDBACK_CACHE"
id = "YOUR_KV_ID_HERE"  # Replace with actual ID
```

### 5. Test Locally (Optional)

```bash
npm run dev
```

Visit http://localhost:8787 to see your app running locally with preview bindings.

### 6. Deploy to Production

```bash
npm run deploy
```

### 7. Access Your Live App

After deployment, Wrangler will output your Workers URL:

```
Published feedback-analyzer (X.XX sec)
  https://feedback-analyzer.YOUR_SUBDOMAIN.workers.dev
```

Visit this URL to see your live application!

## Updating Your Submission PDF

After deployment, update the PDF with your actual URLs:

1. **Live Demo URL**: Replace `[To be filled: your-project.account.workers.dev]` with your actual Workers URL
2. **GitHub URL**: Replace `[To be filled: https://github.com/yourusername/feedback-analyzer]` with your GitHub repo URL

## Troubleshooting

### Error: "AI binding not found"

Make sure Workers AI is enabled for your account. It should work automatically for most accounts.

### Error: "Database not found"

Make sure you:
1. Created the D1 database with `wrangler d1 create`
2. Updated the `database_id` in `wrangler.toml`

### Error: "KV namespace not found"

Make sure you:
1. Created the KV namespace with `wrangler kv:namespace create`
2. Updated the `id` in `wrangler.toml`

### Deployment fails with authentication error

Run `npx wrangler login` again to refresh your authentication.

## Viewing Bindings in Dashboard

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Click on your **feedback-analyzer** worker
4. Click **Settings** → **Bindings**
5. Take a screenshot of this page for your submission

## Cost Considerations

This project uses:
- **Workers**: Free tier includes 100,000 requests/day
- **Workers AI**: Free tier includes 10,000 neurons/day (sufficient for this demo)
- **D1**: Free tier includes 5GB storage
- **KV**: Free tier includes 100,000 reads/day

The demo should run completely within free tier limits.

## Next Steps

1. Deploy your app following this guide
2. Update your PDF with the live URLs
3. Take a screenshot of the Bindings page
4. Push your code to GitHub
5. Submit via the assignment email link

Good luck! 🚀
