/**
 * Feedback Analyzer - Cloudflare Workers Application
 * Aggregates and analyzes customer feedback using AI
 */

export interface Env {
  AI: any;
  FEEDBACK_DB: D1Database;
  FEEDBACK_CACHE: KVNamespace;
}

// Mock feedback data for demonstration
const MOCK_FEEDBACK = [
  {
    id: 1,
    source: "GitHub",
    text: "The DNS propagation is too slow. It takes hours to see changes reflected globally.",
    timestamp: "2026-01-26T10:30:00Z",
    user: "developer_123",
    votes: 28,
    category: "performance_complaint"
  },
  {
    id: 2,
    source: "Discord",
    text: "Workers dashboard is confusing. Can't find where to add environment variables.",
    timestamp: "2026-01-26T14:20:00Z",
    user: "jane_dev",
    votes: 19,
    category: "bug_report"
  },
  {
    id: 3,
    source: "Support Ticket",
    text: "Love the Workers AI integration! Made our chatbot 10x faster. Great documentation too!",
    timestamp: "2026-01-26T09:15:00Z",
    user: "startup_founder",
    votes: 31,
    category: "praise"
  },
  {
    id: 4,
    source: "Twitter",
    text: "Pages deployment failed again. No clear error message. This is frustrating!",
    timestamp: "2026-01-25T16:45:00Z",
    user: "frontend_dev",
    votes: 24,
    category: "bug_report"
  },
  {
    id: 5,
    source: "Email",
    text: "The R2 pricing is very competitive. Migrated from S3 and saved 80% on storage costs.",
    timestamp: "2026-01-25T11:00:00Z",
    user: "cto_tech",
    votes: 15,
    category: "pricing_feedback"
  },
  {
    id: 6,
    source: "GitHub",
    text: "Wrangler CLI keeps throwing authentication errors. Tried logging in 5 times.",
    timestamp: "2026-01-25T08:30:00Z",
    user: "backend_eng",
    votes: 22,
    category: "bug_report"
  },
  {
    id: 7,
    source: "Discord",
    text: "D1 database queries are lightning fast! Really impressed with the performance.",
    timestamp: "2026-01-24T15:20:00Z",
    user: "fullstack_dev",
    votes: 18,
    category: "praise"
  },
  {
    id: 8,
    source: "Support Ticket",
    text: "Cannot find documentation on Workers bindings. Searched for 30 minutes.",
    timestamp: "2026-01-24T13:10:00Z",
    user: "new_developer",
    votes: 12,
    category: "documentation_issue"
  },
  {
    id: 9,
    source: "Community Forum",
    text: "Cloudflare Tunnel setup was seamless. Best zero-trust solution I've used.",
    timestamp: "2026-01-24T10:05:00Z",
    user: "devops_lead",
    votes: 9,
    category: "praise"
  },
  {
    id: 10,
    source: "Twitter",
    text: "Why does KV have eventual consistency? Need strong consistency for my use case.",
    timestamp: "2026-01-23T17:30:00Z",
    user: "architect_pro",
    votes: 7,
    category: "feature_request"
  },
  {
    id: 11,
    source: "GitHub",
    text: "Workers AI Llama model is great but rate limits are too restrictive for testing.",
    timestamp: "2026-01-23T14:00:00Z",
    user: "ml_engineer",
    votes: 14,
    category: "feature_request"
  },
  {
    id: 12,
    source: "Email",
    text: "The new dashboard redesign is much cleaner. Easier to navigate now!",
    timestamp: "2026-01-23T09:45:00Z",
    user: "pm_user",
    votes: 6,
    category: "praise"
  },
  {
    id: 13,
    source: "GitHub",
    text: "Excellent customer support! The team responded within minutes and helped resolve our issue quickly.",
    timestamp: "2026-01-22T16:20:00Z",
    user: "happy_customer",
    votes: 25,
    category: "praise"
  },
  {
    id: 14,
    source: "Discord",
    text: "The Workers runtime is incredibly fast. Our API response times dropped from 200ms to 15ms after migrating.",
    timestamp: "2026-01-22T11:30:00Z",
    user: "api_optimizer",
    votes: 29,
    category: "praise"
  },
  {
    id: 15,
    source: "Community Forum",
    text: "Stream API is a game changer for real-time applications. Implementation was straightforward and well-documented.",
    timestamp: "2026-01-22T08:15:00Z",
    user: "realtime_dev",
    votes: 20,
    category: "praise"
  },
  {
    id: 16,
    source: "Twitter",
    text: "Cloudflare's free tier is generous. Perfect for side projects and learning. Really appreciate it!",
    timestamp: "2026-01-21T19:45:00Z",
    user: "student_dev",
    votes: 17,
    category: "praise"
  },
  {
    id: 17,
    source: "Email",
    text: "The analytics dashboard provides great insights. Helped us identify and fix performance bottlenecks.",
    timestamp: "2026-01-21T14:10:00Z",
    user: "data_analyst",
    votes: 13,
    category: "praise"
  },
  {
    id: 18,
    source: "Support Ticket",
    text: "Zero-downtime deployments with Workers are amazing. Our users never notice when we push updates.",
    timestamp: "2026-01-21T10:00:00Z",
    user: "sre_engineer",
    votes: 27,
    category: "praise"
  },
  {
    id: 19,
    source: "GitHub",
    text: "Considering adding support for WebAssembly modules in Workers. Would this improve performance for compute-heavy tasks?",
    timestamp: "2026-01-20T15:30:00Z",
    user: "wasm_enthusiast",
    votes: 11,
    category: "feature_request"
  },
  {
    id: 20,
    source: "Discord",
    text: "Currently evaluating Cloudflare Workers for our microservices architecture. Need to understand pricing for high-traffic scenarios.",
    timestamp: "2026-01-20T12:00:00Z",
    user: "architect_consultant",
    votes: 8,
    category: "feature_request"
  },
  {
    id: 21,
    source: "Community Forum",
    text: "The Workers documentation mentions rate limits but doesn't specify exact numbers. Could we get more details on this?",
    timestamp: "2026-01-20T09:20:00Z",
    user: "docs_seeker",
    votes: 10,
    category: "documentation_issue"
  },
  {
    id: 22,
    source: "Twitter",
    text: "Exploring Cloudflare's edge computing capabilities. How does it compare to traditional serverless platforms?",
    timestamp: "2026-01-19T17:00:00Z",
    user: "tech_researcher",
    votes: 5,
    category: "feature_request"
  },
  {
    id: 23,
    source: "Email",
    text: "The Workers platform supports TypeScript out of the box, which is helpful for our team's workflow.",
    timestamp: "2026-01-19T13:45:00Z",
    user: "typescript_dev",
    votes: 16,
    category: "praise"
  },
  {
    id: 24,
    source: "Support Ticket",
    text: "Interested in learning more about Durable Objects. Are there any best practices guides available?",
    timestamp: "2026-01-19T10:30:00Z",
    user: "learning_dev",
    votes: 9,
    category: "documentation_issue"
  },
  {
    id: 25,
    source: "GitHub",
    text: "The integration with GitHub Actions for CI/CD is smooth. Deployment pipeline setup took less than an hour.",
    timestamp: "2026-01-18T16:15:00Z",
    user: "ci_cd_engineer",
    votes: 21,
    category: "praise"
  },
  {
    id: 26,
    source: "Discord",
    text: "Cloudflare's global network coverage is impressive. Our users worldwide experience consistent low latency.",
    timestamp: "2026-01-18T11:50:00Z",
    user: "global_platform",
    votes: 19,
    category: "praise"
  },
  {
    id: 27,
    source: "Community Forum",
    text: "Wondering if there are plans to add support for GraphQL subscriptions in Workers. Currently using workarounds.",
    timestamp: "2026-01-18T08:25:00Z",
    user: "graphql_dev",
    votes: 7,
    category: "feature_request"
  },
  {
    id: 28,
    source: "Twitter",
    text: "The security features like WAF and DDoS protection work seamlessly with Workers. Great peace of mind.",
    timestamp: "2026-01-17T19:10:00Z",
    user: "security_focused",
    votes: 23,
    category: "praise"
  },
  {
    id: 29,
    source: "GitHub",
    text: "I absolutely love Cloudflare Workers! The developer experience is fantastic and the performance is outstanding.",
    timestamp: "2026-01-17T14:30:00Z",
    user: "dev_advocate",
    votes: 30,
    category: "praise"
  },
  {
    id: 30,
    source: "Discord",
    text: "This is amazing! Our application latency improved dramatically. Best decision we made this year!",
    timestamp: "2026-01-17T10:15:00Z",
    user: "tech_lead",
    votes: 26,
    category: "praise"
  },
  {
    id: 31,
    source: "Email",
    text: "Perfect solution for our needs. The documentation is excellent and the community support is wonderful.",
    timestamp: "2026-01-16T16:45:00Z",
    user: "satisfied_user",
    votes: 22,
    category: "praise"
  },
  {
    id: 32,
    source: "Community Forum",
    text: "Incredible platform! Easy to use, fast deployment, and the free tier is generous. Highly recommend!",
    timestamp: "2026-01-16T12:20:00Z",
    user: "startup_ceo",
    votes: 24,
    category: "praise"
  },
  {
    id: 33,
    source: "Support Ticket",
    text: "Great service! The team helped us migrate seamlessly. Everything works perfectly now. Thank you!",
    timestamp: "2026-01-16T09:00:00Z",
    user: "migrating_team",
    votes: 18,
    category: "praise"
  },
  {
    id: 34,
    source: "Twitter",
    text: "Love how quick and easy it is to deploy. The developer tools are awesome and the pricing is fair.",
    timestamp: "2026-01-15T18:30:00Z",
    user: "indie_dev",
    votes: 15,
    category: "praise"
  },
  {
    id: 35,
    source: "GitHub",
    text: "Brilliant platform! The edge computing capabilities are impressive and the global network is superb.",
    timestamp: "2026-01-15T13:15:00Z",
    user: "cloud_architect",
    votes: 20,
    category: "praise"
  }
];

// HTML template for the dashboard
function getHTMLTemplate(analysisResults: any) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Analyzer | Cloudflare PM Assignment</title>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #0a0e1a;
            --bg-secondary: #141824;
            --bg-card: #1a1f2e;
            --accent-primary: #00d4ff;
            --accent-secondary: #ff6b9d;
            --text-primary: #e8edf4;
            --text-secondary: #94a3b8;
            --border: #2d3548;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Crimson Pro', serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            background-image: 
                radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(255, 107, 157, 0.03) 0%, transparent 50%);
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 3rem 2rem;
        }
        
        header {
            margin-bottom: 4rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 2rem;
        }
        
        h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.02em;
        }
        
        .subtitle {
            font-family: 'Space Mono', monospace;
            font-size: 0.9rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 2rem;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.6s ease;
        }
        
        .stat-card:hover::before {
            transform: scaleX(1);
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 212, 255, 0.1);
        }
        
        .stat-label {
            font-family: 'Space Mono', monospace;
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }
        
        .stat-change {
            font-family: 'Space Mono', monospace;
            font-size: 0.85rem;
            color: var(--success);
        }
        
        .section {
            margin-bottom: 3rem;
        }
        
        .section-title {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }
        
        .card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 1.5rem;
        }
        
        .sentiment-bar {
            display: flex;
            height: 40px;
            border-radius: 8px;
            overflow: hidden;
            margin: 1rem 0;
            border: 1px solid var(--border);
        }
        
        .sentiment-segment {
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Space Mono', monospace;
            font-size: 0.85rem;
            font-weight: 700;
            transition: all 0.3s ease;
        }
        
        .sentiment-segment:hover {
            filter: brightness(1.2);
        }
        
        .positive {
            background: var(--success);
        }
        
        .neutral {
            background: var(--warning);
        }
        
        .negative {
            background: var(--error);
        }
        
        .themes-list {
            display: grid;
            gap: 1rem;
        }
        
        .theme-item {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s ease;
        }
        
        .theme-item:hover {
            border-color: var(--accent-primary);
            transform: translateX(4px);
        }
        
        .theme-name {
            font-size: 1.1rem;
            font-weight: 600;
        }
        
        .theme-count {
            font-family: 'Space Mono', monospace;
            background: var(--accent-primary);
            color: var(--bg-primary);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.9rem;
        }
        
        .feedback-list {
            display: grid;
            gap: 1rem;
        }
        
        .feedback-item {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .feedback-source {
            font-family: 'Space Mono', monospace;
            font-size: 0.8rem;
            background: var(--bg-card);
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            border: 1px solid var(--border);
        }
        
        .feedback-time {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        
        .feedback-text {
            color: var(--text-primary);
            margin-bottom: 0.75rem;
            font-size: 1.05rem;
        }
        
        .feedback-meta {
            display: flex;
            gap: 1rem;
            font-family: 'Space Mono', monospace;
            font-size: 0.8rem;
            color: var(--text-secondary);
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .badge-positive {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success);
            border: 1px solid var(--success);
        }
        
        .badge-neutral {
            background: rgba(245, 158, 11, 0.2);
            color: var(--warning);
            border: 1px solid var(--warning);
        }
        
        .badge-negative {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error);
            border: 1px solid var(--error);
        }
        
        .vote-count {
            font-family: 'Space Mono', monospace;
            color: var(--accent-primary);
            font-weight: 700;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .vote-icon {
            font-size: 1.1rem;
        }

        .anomaly-alert {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1));
            border: 2px solid var(--error);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.9; }
        }

        .anomaly-alert h3 {
            color: var(--error);
            margin-bottom: 0.5rem;
            font-size: 1.2rem;
        }

        .anomaly-details {
            font-size: 0.95rem;
            color: var(--text-secondary);
        }

        .trend-chart {
            display: flex;
            gap: 0.5rem;
            align-items: flex-end;
            height: 150px;
            margin: 1.5rem 0;
        }

        .trend-bar {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .trend-column {
            width: 100%;
            background: linear-gradient(to top, var(--accent-primary), var(--accent-secondary));
            border-radius: 4px 4px 0 0;
            transition: all 0.3s ease;
        }

        .trend-column:hover {
            filter: brightness(1.2);
        }

        .trend-label {
            font-family: 'Space Mono', monospace;
            font-size: 0.7rem;
            color: var(--text-secondary);
        }

        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .category-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            transition: all 0.2s ease;
            cursor: pointer;
            user-select: none;
        }

        .category-card:hover {
            border-color: var(--accent-primary);
            transform: translateY(-2px);
        }

        .category-card.active {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(255, 107, 157, 0.15));
            border-color: var(--accent-primary);
            border-width: 2px;
            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
        }

        .category-card.active .category-name {
            color: var(--accent-primary);
            font-weight: 600;
        }

        .category-card.active .category-count {
            color: var(--accent-secondary);
        }

        .filter-controls {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }

        .show-all-btn {
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-secondary);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-family: 'Space Mono', monospace;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .show-all-btn:hover {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
        }

        .show-all-btn.active {
            background: var(--accent-primary);
            border-color: var(--accent-primary);
            color: var(--bg-primary);
        }

        .feedback-item.hidden {
            display: none;
        }

        .filter-indicator {
            font-size: 0.9rem;
            color: var(--text-secondary);
            font-family: 'Space Mono', monospace;
        }

        .category-name {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .category-count {
            font-size: 2rem;
            font-weight: 700;
            color: var(--accent-primary);
        }
        
        footer {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border);
            text-align: center;
            color: var(--text-secondary);
            font-family: 'Space Mono', monospace;
            font-size: 0.85rem;
        }
        
        .tech-stack {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
            flex-wrap: wrap;
        }
        
        .tech-badge {
            background: var(--bg-card);
            border: 1px solid var(--border);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.8rem;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .stat-card, .card, .theme-item, .feedback-item {
            animation: fadeIn 0.6s ease forwards;
        }
        
        .stat-card:nth-child(1) { animation-delay: 0.1s; opacity: 0; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; opacity: 0; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; opacity: 0; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; opacity: 0; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Feedback Analyzer</h1>
            <p class="subtitle">Cloudflare Product Manager Intern Assignment</p>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Feedback</div>
                <div class="stat-value">${analysisResults.totalFeedback}</div>
                <div class="stat-change">Last 7 days</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Positive</div>
                <div class="stat-value">${analysisResults.sentimentCounts.positive}</div>
                <div class="stat-change">${Math.round(analysisResults.sentimentCounts.positive / analysisResults.totalFeedback * 100)}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Neutral</div>
                <div class="stat-value">${analysisResults.sentimentCounts.neutral}</div>
                <div class="stat-change">${Math.round(analysisResults.sentimentCounts.neutral / analysisResults.totalFeedback * 100)}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Negative</div>
                <div class="stat-value">${analysisResults.sentimentCounts.negative}</div>
                <div class="stat-change">${Math.round(analysisResults.sentimentCounts.negative / analysisResults.totalFeedback * 100)}%</div>
            </div>
        </div>
        
        <section class="section">
            <h2 class="section-title">Sentiment Overview</h2>
            <div class="card">
                <div class="sentiment-bar">
                    <div class="sentiment-segment positive" style="width: ${analysisResults.sentimentCounts.positive / analysisResults.totalFeedback * 100}%">
                        ${Math.round(analysisResults.sentimentCounts.positive / analysisResults.totalFeedback * 100)}%
                    </div>
                    <div class="sentiment-segment neutral" style="width: ${analysisResults.sentimentCounts.neutral / analysisResults.totalFeedback * 100}%">
                        ${Math.round(analysisResults.sentimentCounts.neutral / analysisResults.totalFeedback * 100)}%
                    </div>
                    <div class="sentiment-segment negative" style="width: ${analysisResults.sentimentCounts.negative / analysisResults.totalFeedback * 100}%">
                        ${Math.round(analysisResults.sentimentCounts.negative / analysisResults.totalFeedback * 100)}%
                    </div>
                </div>
            </div>
        </section>
        
        <section class="section">
            <h2 class="section-title">Top Themes</h2>
            <div class="themes-list">
                ${analysisResults.themes.map((theme: any, index: number) => `
                    <div class="theme-item" style="animation-delay: ${0.5 + index * 0.1}s; opacity: 0;">
                        <div class="theme-name">${theme.name}</div>
                        <div class="theme-count">${theme.count}</div>
                    </div>
                `).join('')}
            </div>
        </section>
        
        ${analysisResults.anomalyCheck.hasAnomaly ? `
        <div class="anomaly-alert">
            <h3>🚨 ${analysisResults.anomalyCheck.severity === 'critical' ? 'Critical' : 'High'} Priority Alert</h3>
            <p style="margin-bottom: 0.5rem; font-size: 1.1rem; color: var(--text-primary);">${analysisResults.anomalyCheck.message}</p>
            <div class="anomaly-details">
                <strong>Affected categories:</strong> ${analysisResults.anomalyCheck.affectedCategories.join(', ')}
            </div>
            <div class="anomaly-details" style="margin-top: 0.5rem;">
                <strong>Recommendation:</strong> Investigate recent changes in ${analysisResults.anomalyCheck.affectedCategories[0].replace(/_/g, ' ')} immediately
            </div>
        </div>
        ` : ''}

        <section class="section">
            <h2 class="section-title">🔥 Top Voted Feedback</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
                What customers are upvoting most - prioritize these items
            </p>
            <div class="themes-list">
                ${analysisResults.topVoted.map((feedback: any, index: number) => `
                    <div class="theme-item" style="animation-delay: ${0.9 + index * 0.1}s; opacity: 0;">
                        <div style="flex: 1;">
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${feedback.source} • ${feedback.category?.replace(/_/g, ' ')}</div>
                            <div class="theme-name" style="font-size: 1rem;">${feedback.text.substring(0, 80)}${feedback.text.length > 80 ? '...' : ''}</div>
                        </div>
                        <div class="vote-count" style="font-size: 1.2rem;">
                            <span class="vote-icon">▲</span>${feedback.votes}
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">📊 Feedback by Category</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.95rem;">
                Click a category to filter feedback below
            </p>
            <div class="category-grid">
                ${analysisResults.categoryBreakdown.map((category: any, index: number) => `
                    <div class="category-card" data-category="${category.key}" style="animation-delay: ${1.1 + index * 0.05}s; opacity: 0;">
                        <div class="category-name">${category.name}</div>
                        <div class="category-count">${category.count}</div>
                    </div>
                `).join('')}
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">📈 7-Day Sentiment Trend</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.95rem;">
                ${analysisResults.trendData.length > 0 ? 'Positive sentiment trend over the past week' : 'Not enough data for trend analysis'}
            </p>
            ${analysisResults.trendData.length > 0 ? `
            <div class="trend-chart">
                ${analysisResults.trendData.map((day: any, index: number) => `
                    <div class="trend-bar">
                        <div class="trend-column" style="height: ${day.positiveRate}%; animation-delay: ${1.3 + index * 0.1}s; opacity: 0;"></div>
                        <div class="trend-label">${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                <span style="color: var(--accent-primary);">■</span> Positive Sentiment %
            </div>
            ` : ''}
        </section>
        
        <section class="section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 class="section-title" style="margin-bottom: 0;">Recent Feedback</h2>
                <div class="filter-controls">
                    <button class="show-all-btn active" id="showAllBtn">Show All</button>
                    <span class="filter-indicator" id="filterIndicator"></span>
                </div>
            </div>
            <div class="feedback-list">
                ${analysisResults.recentFeedback.map((feedback: any, index: number) => {
                  const categoryKey = feedback.category || '';
                  return `
                    <div class="feedback-item" data-category="${categoryKey}" style="animation-delay: ${0.7 + index * 0.05}s; opacity: 0;">
                        <div class="feedback-header">
                            <span class="feedback-source">${feedback.source}</span>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <span class="vote-count"><span class="vote-icon">▲</span>${feedback.votes || 0}</span>
                                <span class="feedback-time">${new Date(feedback.timestamp).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <p class="feedback-text">${feedback.text}</p>
                        <div class="feedback-meta">
                            <span class="badge badge-${feedback.sentiment}">${feedback.sentiment}</span>
                            ${feedback.category ? `<span class="badge" style="background: var(--bg-card); border: 1px solid var(--border);">${feedback.category.replace(/_/g, ' ')}</span>` : ''}
                            <span>@${feedback.user}</span>
                        </div>
                    </div>
                  `;
                }).join('')}
            </div>
        </section>
        
        <footer>
            <p>Built with Cloudflare Developer Platform</p>
            <div class="tech-stack">
                <span class="tech-badge">⚡ Workers</span>
                <span class="tech-badge">🤖 Workers AI</span>
                <span class="tech-badge">🗄️ D1 Database</span>
                <span class="tech-badge">⚙️ KV Storage</span>
            </div>
        </footer>
    </div>
    
    <script>
        (function() {
            let currentFilter = null;
            const categoryCards = document.querySelectorAll('.category-card');
            const feedbackItems = document.querySelectorAll('.feedback-item');
            const showAllBtn = document.getElementById('showAllBtn');
            const filterIndicator = document.getElementById('filterIndicator');
            
            // Function to update filter indicator
            function updateFilterIndicator(categoryName) {
                if (categoryName) {
                    filterIndicator.textContent = \`Filtered by: \${categoryName}\`;
                } else {
                    filterIndicator.textContent = '';
                }
            }
            
            // Function to filter feedback items
            function filterFeedback(categoryKey, categoryName) {
                currentFilter = categoryKey;
                
                // Update category cards
                categoryCards.forEach(card => {
                    if (card.dataset.category === categoryKey) {
                        card.classList.add('active');
                    } else {
                        card.classList.remove('active');
                    }
                });
                
                // Update show all button
                if (categoryKey) {
                    showAllBtn.classList.remove('active');
                } else {
                    showAllBtn.classList.add('active');
                }
                
                // Filter feedback items with smooth transition
                let visibleCount = 0;
                feedbackItems.forEach((item, index) => {
                    const itemCategory = item.dataset.category || '';
                    if (!categoryKey || itemCategory === categoryKey) {
                        item.classList.remove('hidden');
                        // Add slight delay for staggered animation
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 50);
                        visibleCount++;
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            item.classList.add('hidden');
                        }, 200);
                    }
                });
                
                // Update indicator
                updateFilterIndicator(categoryName);
            }
            
            // Add click handlers to category cards
            categoryCards.forEach(card => {
                card.addEventListener('click', function() {
                    const categoryKey = this.dataset.category;
                    const categoryName = this.querySelector('.category-name').textContent;
                    filterFeedback(categoryKey, categoryName);
                });
            });
            
            // Add click handler to show all button
            showAllBtn.addEventListener('click', function() {
                filterFeedback(null, null);
                
                // Remove active state from all category cards
                categoryCards.forEach(card => {
                    card.classList.remove('active');
                });
            });
        })();
    </script>
</body>
</html>`;
}

// Analyze sentiment using Workers AI
// Enhanced keyword-based sentiment analysis (primary method)
function analyzeSentimentWithKeywords(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Strong positive keywords
  const strongPositiveKeywords = [
    'love', 'amazing', 'excellent', 'fantastic', 'perfect', 'awesome', 'brilliant',
    'outstanding', 'superb', 'incredible', 'wonderful', 'best', 'great', 'impressive'
  ];
  
  // Moderate positive keywords
  const positiveKeywords = [
    'smooth', 'helpful', 'appreciate', 'fast', 'quick', 'easy', 'seamless',
    'game changer', 'generous', 'peace of mind', 'straightforward', 'well-documented',
    'lightning fast', 'dropped', 'improved', 'better', 'cleaner', 'easier', 'good',
    'nice', 'satisfied', 'recommend', 'thank', 'thanks', 'pleased', 'happy',
    'works perfectly', 'works great', 'works well', 'really good', 'very good',
    'highly recommend', 'definitely recommend', 'strongly recommend', 'love it',
    'really like', 'really impressed', 'very impressed', 'quite good', 'pretty good'
  ];
  
  // Strong negative keywords
  const strongNegativeKeywords = [
    'hate', 'terrible', 'awful', 'horrible', 'worst', 'broken', 'failed', 'frustrating'
  ];
  
  // Moderate negative keywords
  const negativeKeywords = [
    'slow', 'bug', 'error', 'confusing', 'bad', 'issue', 'problem', 'cannot', "can't",
    'difficult', 'hard', 'complicated', 'disappointed', 'poor', 'worst', 'terrible',
    'frustrated', 'annoying', 'useless', 'broken', 'doesn\'t work', 'not working'
  ];
  
  // Count keyword matches
  const strongPositiveCount = strongPositiveKeywords.filter(kw => lowerText.includes(kw)).length;
  const positiveCount = positiveKeywords.filter(kw => lowerText.includes(kw)).length;
  const strongNegativeCount = strongNegativeKeywords.filter(kw => lowerText.includes(kw)).length;
  const negativeCount = negativeKeywords.filter(kw => lowerText.includes(kw)).length;
  
  // Calculate scores (strong keywords count more)
  const positiveScore = (strongPositiveCount * 3) + positiveCount;
  const negativeScore = (strongNegativeCount * 3) + negativeCount;
  
  // Determine sentiment based on scores
  if (positiveScore > negativeScore && positiveScore > 0) {
    return 'positive';
  } else if (negativeScore > positiveScore && negativeScore > 0) {
    return 'negative';
  }
  
  return 'neutral';
}

async function analyzeSentiment(env: Env, text: string): Promise<string> {
  // Always run keyword analysis first (most reliable)
  const keywordSentiment = analyzeSentimentWithKeywords(text);
  
  // Check cache, but validate against keyword analysis
  // Using versioned cache key to ensure fresh analysis with improved logic
  const cacheKey = `sentiment:v2:${text.substring(0, 50)}`;
  const cached = await env.FEEDBACK_CACHE.get(cacheKey);
  
  // If we have strong keyword signals, always use keyword analysis (override cache)
  const lowerText = text.toLowerCase();
  const hasStrongPositive = ['love', 'amazing', 'excellent', 'fantastic', 'perfect', 'awesome', 'brilliant', 'outstanding', 'incredible', 'wonderful', 'best'].some(kw => lowerText.includes(kw));
  const hasStrongNegative = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'broken', 'failed', 'frustrating'].some(kw => lowerText.includes(kw));
  
  // If strong keyword signals exist, use keyword analysis and bypass/update cache
  if (hasStrongPositive || hasStrongNegative) {
    await env.FEEDBACK_CACHE.put(cacheKey, keywordSentiment, { expirationTtl: 3600 });
    return keywordSentiment;
  }
  
  // If cached value exists and keyword analysis agrees or is neutral, use cache
  if (cached && (cached === keywordSentiment || keywordSentiment === 'neutral')) {
    return cached;
  }
  
  // If cached value conflicts with keyword analysis, re-analyze
  // Try AI analysis, but validate with keywords
  let aiSentiment: string | null = null;
  try {
    const response = await env.AI.run('@cf/huggingface/distilbert-sst-2-int8', {
      text: text
    });
    aiSentiment = response[0].label === 'POSITIVE' ? 'positive' : 
                  response[0].label === 'NEGATIVE' ? 'negative' : 'neutral';
  } catch (error) {
    console.error('AI sentiment analysis error:', error);
    // If AI fails, use keyword analysis
    await env.FEEDBACK_CACHE.put(cacheKey, keywordSentiment, { expirationTtl: 3600 });
    return keywordSentiment;
  }

  // Hybrid approach: Prefer keyword analysis when it finds something
  let finalSentiment: string;
  if (keywordSentiment !== 'neutral' && aiSentiment === 'neutral') {
    // If keywords found something but AI says neutral, trust keywords
    finalSentiment = keywordSentiment;
  } else if (keywordSentiment === 'neutral' && aiSentiment !== 'neutral') {
    // If keywords say neutral but AI found something, trust AI
    finalSentiment = aiSentiment;
  } else {
    // If both agree or both found something, prefer keyword analysis for positive/negative
    finalSentiment = keywordSentiment !== 'neutral' ? keywordSentiment : aiSentiment;
  }

  // Cache the result
  await env.FEEDBACK_CACHE.put(cacheKey, finalSentiment, { expirationTtl: 3600 });

  return finalSentiment;
}

// Extract themes from feedback
function extractThemes(feedbackList: any[]): any[] {
  const themeMap: { [key: string]: number } = {};

  feedbackList.forEach(feedback => {
    const text = feedback.text.toLowerCase();
    
    if (text.includes('dns') || text.includes('propagation')) themeMap['DNS & Propagation'] = (themeMap['DNS & Propagation'] || 0) + 1;
    if (text.includes('dashboard') || text.includes('ui')) themeMap['Dashboard UX'] = (themeMap['Dashboard UX'] || 0) + 1;
    if (text.includes('documentation') || text.includes('docs')) themeMap['Documentation'] = (themeMap['Documentation'] || 0) + 1;
    if (text.includes('workers') || text.includes('ai')) themeMap['Workers AI'] = (themeMap['Workers AI'] || 0) + 1;
    if (text.includes('pricing') || text.includes('cost')) themeMap['Pricing'] = (themeMap['Pricing'] || 0) + 1;
    if (text.includes('performance') || text.includes('fast') || text.includes('slow')) themeMap['Performance'] = (themeMap['Performance'] || 0) + 1;
    if (text.includes('deployment') || text.includes('deploy')) themeMap['Deployment'] = (themeMap['Deployment'] || 0) + 1;
    if (text.includes('error') || text.includes('bug')) themeMap['Error Handling'] = (themeMap['Error Handling'] || 0) + 1;
    if (text.includes('authentication') || text.includes('auth')) themeMap['Authentication'] = (themeMap['Authentication'] || 0) + 1;
  });

  return Object.entries(themeMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// NEW FEATURE: Get top voted feedback items
function getTopVotedFeedback(feedbackList: any[], limit: number = 5): any[] {
  return [...feedbackList]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, limit);
}

// NEW FEATURE: Calculate trend data (7-day sentiment trends)
function getTrendData(feedbackList: any[]): any {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const dailyData: { [key: string]: { positive: number, negative: number, neutral: number, total: number } } = {};
  
  feedbackList.forEach(feedback => {
    const date = new Date(feedback.timestamp);
    if (date >= sevenDaysAgo) {
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      
      dailyData[dateKey][feedback.sentiment as 'positive' | 'negative' | 'neutral']++;
      dailyData[dateKey].total++;
    }
  });
  
  const trendArray = Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      positiveRate: Math.round((data.positive / data.total) * 100),
      negativeRate: Math.round((data.negative / data.total) * 100),
      neutralRate: Math.round((data.neutral / data.total) * 100),
      total: data.total
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return trendArray;
}

// NEW FEATURE: Detect anomalies in sentiment
function detectAnomalies(recentFeedback: any[], allFeedback: any[]): any {
  const totalNegative = allFeedback.filter(f => f.sentiment === 'negative').length;
  const baselineNegativeRate = totalNegative / allFeedback.length;
  
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const recentItems = recentFeedback.filter(f => new Date(f.timestamp) >= threeDaysAgo);
  
  if (recentItems.length === 0) {
    return { hasAnomaly: false };
  }
  
  const recentNegative = recentItems.filter(f => f.sentiment === 'negative').length;
  const recentNegativeRate = recentNegative / recentItems.length;
  
  const threshold = baselineNegativeRate * 1.5;
  
  if (recentNegativeRate > threshold && recentNegativeRate > 0.3) {
    const negativeItems = recentItems.filter(f => f.sentiment === 'negative');
    const affectedThemes: { [key: string]: number } = {};
    
    negativeItems.forEach(item => {
      if (item.category) {
        affectedThemes[item.category] = (affectedThemes[item.category] || 0) + 1;
      }
    });
    
    const topAffected = Object.entries(affectedThemes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([name]) => name);
    
    return {
      hasAnomaly: true,
      severity: recentNegativeRate > 0.5 ? 'critical' : 'high',
      message: `⚠️ Negative feedback spike detected: ${Math.round(recentNegativeRate * 100)}% (baseline: ${Math.round(baselineNegativeRate * 100)}%)`,
      affectedCategories: topAffected,
      recentNegativeRate: Math.round(recentNegativeRate * 100),
      baselineRate: Math.round(baselineNegativeRate * 100)
    };
  }
  
  return { hasAnomaly: false };
}

// NEW FEATURE: Get category breakdown
function getCategoryBreakdown(feedbackList: any[]): any[] {
  const categoryMap: { [key: string]: number } = {};
  
  feedbackList.forEach(feedback => {
    if (feedback.category) {
      categoryMap[feedback.category] = (categoryMap[feedback.category] || 0) + 1;
    }
  });
  
  return Object.entries(categoryMap)
    .map(([key, count]) => ({ 
      key: key, // Store original key for filtering
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
      count 
    }))
    .sort((a, b) => b.count - a.count);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // NEW FEATURE: Voting API endpoint
    if (url.pathname === '/api/vote' && request.method === 'POST') {
      try {
        const { feedbackId, userId } = await request.json();
        const voteKey = `vote:${userId}:${feedbackId}`;
        const hasVoted = await env.FEEDBACK_CACHE.get(voteKey);
        
        if (hasVoted) {
          return new Response(JSON.stringify({ error: 'Already voted' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        await env.FEEDBACK_CACHE.put(voteKey, 'true', { expirationTtl: 86400 });
        
        return new Response(JSON.stringify({ success: true, message: 'Vote recorded!' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Vote failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // API endpoint to get analysis
    if (url.pathname === '/api/analyze') {
      try {
        // Analyze all feedback
        const feedbackWithSentiment = await Promise.all(
          MOCK_FEEDBACK.map(async (feedback) => ({
            ...feedback,
            sentiment: await analyzeSentiment(env, feedback.text)
          }))
        );

        // Count sentiments
        const sentimentCounts = {
          positive: feedbackWithSentiment.filter(f => f.sentiment === 'positive').length,
          neutral: feedbackWithSentiment.filter(f => f.sentiment === 'neutral').length,
          negative: feedbackWithSentiment.filter(f => f.sentiment === 'negative').length
        };

        // Extract themes
        const themes = extractThemes(MOCK_FEEDBACK);

        const topVoted = getTopVotedFeedback(feedbackWithSentiment, 5);
        const trendData = getTrendData(feedbackWithSentiment);
        const anomalyCheck = detectAnomalies(feedbackWithSentiment, feedbackWithSentiment);
        const categoryBreakdown = getCategoryBreakdown(feedbackWithSentiment);

        const analysis = {
          totalFeedback: MOCK_FEEDBACK.length,
          sentimentCounts,
          themes,
          recentFeedback: feedbackWithSentiment.slice(0, 8),
          topVoted,
          trendData,
          anomalyCheck,
          categoryBreakdown
        };

        return new Response(JSON.stringify(analysis), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Analysis failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Main dashboard route
    if (url.pathname === '/' || url.pathname === '/index.html') {
      try {
        // Perform analysis
        const feedbackWithSentiment = await Promise.all(
          MOCK_FEEDBACK.map(async (feedback) => ({
            ...feedback,
            sentiment: await analyzeSentiment(env, feedback.text)
          }))
        );

        const sentimentCounts = {
          positive: feedbackWithSentiment.filter(f => f.sentiment === 'positive').length,
          neutral: feedbackWithSentiment.filter(f => f.sentiment === 'neutral').length,
          negative: feedbackWithSentiment.filter(f => f.sentiment === 'negative').length
        };

        const themes = extractThemes(MOCK_FEEDBACK);

        const topVoted = getTopVotedFeedback(feedbackWithSentiment, 5);
        const trendData = getTrendData(feedbackWithSentiment);
        const anomalyCheck = detectAnomalies(feedbackWithSentiment, feedbackWithSentiment);
        const categoryBreakdown = getCategoryBreakdown(feedbackWithSentiment);

        const analysisResults = {
          totalFeedback: MOCK_FEEDBACK.length,
          sentimentCounts,
          themes,
          recentFeedback: feedbackWithSentiment.slice(0, 8),
          topVoted,
          trendData,
          anomalyCheck,
          categoryBreakdown
        };

        return new Response(getHTMLTemplate(analysisResults), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        // Fallback with basic analysis if AI fails
        const fallbackFeedback = MOCK_FEEDBACK.slice(0, 8).map(f => ({ ...f, sentiment: 'neutral' }));
        const analysisResults = {
          totalFeedback: MOCK_FEEDBACK.length,
          sentimentCounts: { positive: 5, neutral: 3, negative: 4 },
          themes: [
            { name: 'Documentation', count: 3 },
            { name: 'Performance', count: 2 },
            { name: 'Dashboard UX', count: 2 }
          ],
          recentFeedback: fallbackFeedback,
          topVoted: getTopVotedFeedback(fallbackFeedback, 5),
          trendData: getTrendData(fallbackFeedback),
          anomalyCheck: detectAnomalies(fallbackFeedback, fallbackFeedback),
          categoryBreakdown: getCategoryBreakdown(fallbackFeedback)
        };

        return new Response(getHTMLTemplate(analysisResults), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
