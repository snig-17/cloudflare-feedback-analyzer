# Feedback Analyzer

A Cloudflare Workers application that aggregates and analyzes customer feedback using AI.

## 🚀 Features

- **Real-time Sentiment Analysis**: Uses Cloudflare Workers AI to analyze feedback sentiment
- **Theme Extraction**: Automatically identifies common themes and pain points
- **Multi-source Aggregation**: Combines feedback from GitHub, Discord, Support Tickets, Twitter, and more
- **Beautiful Dashboard**: Clean, responsive UI showing key metrics and insights
- **Serverless & Fast**: Built on Cloudflare's edge network for global low-latency access

## 🏗️ Architecture

This project uses multiple Cloudflare Developer Platform products:

1. **Workers** - Serverless compute running the application
2. **Workers AI** - AI model for sentiment analysis (`@cf/huggingface/distilbert-sst-2-int8`)
3. **D1 Database** - SQL database for storing feedback (configured but using mock data for demo)
4. **KV Storage** - Caching layer for sentiment analysis results

## 🛠️ Tech Stack

- TypeScript
- Cloudflare Workers
- Workers AI (Hugging Face DistilBERT)
- D1 Database
- KV Storage

## 📦 Project Structure

```
feedback-analyzer/
├── src/
│   └── index.ts          # Main Worker code
├── wrangler.toml         # Cloudflare configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Cloudflare account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Deploy to Cloudflare:
   ```bash
   npm run deploy
   ```

## 📊 What It Does

The Feedback Analyzer:

1. **Collects** feedback from multiple sources (mock data in this demo)
2. **Analyzes** each piece of feedback using Workers AI for sentiment
3. **Caches** sentiment results in KV for performance
4. **Extracts** common themes using keyword analysis
5. **Displays** everything in an intuitive dashboard

## 🎨 Dashboard Features

- **Stats Overview**: Total feedback count and sentiment breakdown
- **Sentiment Visualization**: Interactive bar showing positive/neutral/negative distribution
- **Top Themes**: Most common topics mentioned in feedback
- **Recent Feedback**: Latest feedback items with sentiment tags

## 🔧 Configuration

Key bindings are configured in `wrangler.toml`:

- `AI` - Workers AI binding
- `FEEDBACK_DB` - D1 database binding
- `FEEDBACK_CACHE` - KV namespace binding

## 📝 Future Enhancements

- Real integrations with GitHub, Discord, Zendesk APIs
- Historical trend analysis
- Automated alerts for urgent feedback
- Export functionality
- Team collaboration features

## 👤 Author

Built for Cloudflare Product Manager Intern Assignment (Summer 2026)

## 📄 License

MIT
