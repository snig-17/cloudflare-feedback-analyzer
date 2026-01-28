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
    category: "Performance",
    segment: "Enterprise",
    status: "In Progress",
    priority: 85,
    sentiment: "negative"
  },
  {
    id: 2,
    source: "Discord",
    text: "Workers dashboard is confusing. Can't find where to add environment variables.",
    timestamp: "2026-01-26T14:20:00Z",
    user: "jane_dev",
    votes: 19,
    category: "UX/UI",
    segment: "Free",
    status: "Open",
    priority: 45,
    sentiment: "negative"
  },
  {
    id: 3,
    source: "Support Ticket",
    text: "Love the Workers AI integration! Made our chatbot 10x faster. Great documentation too!",
    timestamp: "2026-01-26T09:15:00Z",
    user: "startup_founder",
    votes: 31,
    category: "AI",
    segment: "Paid",
    status: "Shipped",
    priority: 20,
    sentiment: "positive"
  },
  {
    id: 4,
    source: "Twitter",
    text: "Pages deployment failed again. No clear error message. This is frustrating!",
    timestamp: "2026-01-25T16:45:00Z",
    user: "frontend_dev",
    votes: 24,
    category: "Bugs",
    segment: "Paid",
    status: "Open",
    priority: 78,
    sentiment: "negative"
  },
  {
    id: 5,
    source: "Email",
    text: "The R2 pricing is very competitive. Migrated from S3 and saved 80% on storage costs.",
    timestamp: "2026-01-25T11:00:00Z",
    user: "cto_tech",
    votes: 15,
    category: "Pricing",
    segment: "Enterprise",
    status: "Shipped",
    priority: 10,
    sentiment: "positive"
  },
  {
    id: 6,
    source: "GitHub",
    text: "Wrangler CLI keeps throwing authentication errors. Tried logging in 5 times.",
    timestamp: "2026-01-25T08:30:00Z",
    user: "backend_eng",
    votes: 22,
    category: "Dev Tools",
    segment: "Free",
    status: "In Progress",
    priority: 92,
    sentiment: "negative"
  },
  {
    id: 7,
    source: "Discord",
    text: "D1 database queries are lightning fast! Really impressed with the performance.",
    timestamp: "2026-01-24T15:20:00Z",
    user: "fullstack_dev",
    votes: 18,
    category: "Performance",
    segment: "Paid",
    status: "Shipped",
    priority: 15,
    sentiment: "positive"
  },
  {
    id: 8,
    source: "Support Ticket",
    text: "Cannot find documentation on Workers bindings. Searched for 30 minutes.",
    timestamp: "2026-01-24T13:10:00Z",
    user: "new_developer",
    votes: 12,
    category: "Documentation",
    segment: "Free",
    status: "Open",
    priority: 30,
    sentiment: "negative"
  },
  {
    id: 9,
    source: "Community Forum",
    text: "Cloudflare Tunnel setup was seamless. Best zero-trust solution I've used.",
    timestamp: "2026-01-24T10:05:00Z",
    user: "devops_lead",
    votes: 9,
    category: "Security",
    segment: "Enterprise",
    status: "Shipped",
    priority: 12,
    sentiment: "positive"
  },
  {
    id: 10,
    source: "Twitter",
    text: "Why does KV have eventual consistency? Need strong consistency for my use case.",
    timestamp: "2026-01-23T17:30:00Z",
    user: "architect_pro",
    votes: 7,
    category: "Features",
    segment: "Enterprise",
    status: "Acknowledged",
    priority: 60,
    sentiment: "neutral"
  },
  {
    id: 11,
    source: "GitHub",
    text: "Workers AI Llama model is great but rate limits are too restrictive for testing.",
    timestamp: "2026-01-23T14:00:00Z",
    user: "ml_engineer",
    votes: 14,
    category: "AI",
    segment: "Paid",
    status: "Acknowledged",
    priority: 55,
    sentiment: "neutral"
  },
  {
    id: 12,
    source: "Email",
    text: "The new dashboard redesign is much cleaner. Easier to navigate now!",
    timestamp: "2026-01-23T09:45:00Z",
    user: "pm_user",
    votes: 6,
    category: "UX/UI",
    segment: "Free",
    status: "Shipped",
    priority: 5,
    sentiment: "positive"
  },
  {
    id: 13,
    source: "GitHub",
    text: "Excellent customer support! The team responded within minutes and helped resolve our issue quickly.",
    timestamp: "2026-01-22T16:20:00Z",
    user: "happy_customer",
    votes: 25,
    category: "Support",
    segment: "Paid",
    status: "Shipped",
    priority: 8,
    sentiment: "positive"
  },
  {
    id: 14,
    source: "Discord",
    text: "The Workers runtime is incredibly fast. Our API response times dropped from 200ms to 15ms after migrating.",
    timestamp: "2026-01-22T11:30:00Z",
    user: "api_optimizer",
    votes: 29,
    category: "Performance",
    segment: "Enterprise",
    status: "Shipped",
    priority: 18,
    sentiment: "positive"
  },
  {
    id: 15,
    source: "Community Forum",
    text: "Stream API is a game changer for real-time applications. Implementation was straightforward and well-documented.",
    timestamp: "2026-01-22T08:15:00Z",
    user: "realtime_dev",
    votes: 20,
    category: "Features",
    segment: "Paid",
    status: "Shipped",
    priority: 25,
    sentiment: "positive"
  },
  {
    id: 16,
    source: "Twitter",
    text: "Cloudflare's free tier is generous. Perfect for side projects and learning. Really appreciate it!",
    timestamp: "2026-01-21T19:45:00Z",
    user: "student_dev",
    votes: 17,
    category: "Pricing",
    segment: "Free",
    status: "Shipped",
    priority: 5,
    sentiment: "positive"
  },
  {
    id: 17,
    source: "Email",
    text: "The analytics dashboard provides great insights. Helped us identify and fix performance bottlenecks.",
    timestamp: "2026-01-21T14:10:00Z",
    user: "data_analyst",
    votes: 13,
    category: "Analytics",
    segment: "Paid",
    status: "Shipped",
    priority: 22,
    sentiment: "positive"
  },
  {
    id: 18,
    source: "Support Ticket",
    text: "Zero-downtime deployments with Workers are amazing. Our users never notice when we push updates.",
    timestamp: "2026-01-21T10:00:00Z",
    user: "sre_engineer",
    votes: 27,
    category: "DevOps",
    segment: "Enterprise",
    status: "Shipped",
    priority: 15,
    sentiment: "positive"
  },
  {
    id: 19,
    source: "GitHub",
    text: "Considering adding support for WebAssembly modules in Workers. Would this improve performance for compute-heavy tasks?",
    timestamp: "2026-01-20T15:30:00Z",
    user: "wasm_enthusiast",
    votes: 11,
    category: "Features",
    segment: "Paid",
    status: "Acknowledged",
    priority: 40,
    sentiment: "neutral"
  },
  {
    id: 20,
    source: "Discord",
    text: "Currently evaluating Cloudflare Workers for our microservices architecture. Need to understand pricing for high-traffic scenarios.",
    timestamp: "2026-01-20T12:00:00Z",
    user: "architect_consultant",
    votes: 8,
    category: "Pricing",
    segment: "Enterprise",
    status: "Open",
    priority: 70,
    sentiment: "neutral"
  },
  {
    id: 21,
    source: "Community Forum",
    text: "The Workers documentation mentions rate limits but doesn't specify exact numbers. Could we get more details on this?",
    timestamp: "2026-01-20T09:20:00Z",
    user: "docs_seeker",
    votes: 10,
    category: "Documentation",
    segment: "Free",
    status: "Open",
    priority: 50,
    sentiment: "neutral"
  },
  {
    id: 22,
    source: "Twitter",
    text: "Exploring Cloudflare's edge computing capabilities. How does it compare to traditional serverless platforms?",
    timestamp: "2026-01-19T17:00:00Z",
    user: "tech_researcher",
    votes: 5,
    category: "Features",
    segment: "Free",
    status: "Open",
    priority: 10,
    sentiment: "neutral"
  },
  {
    id: 23,
    source: "Email",
    text: "The Workers platform supports TypeScript out of the box, which is helpful for our team's workflow.",
    timestamp: "2026-01-19T13:45:00Z",
    user: "typescript_dev",
    votes: 16,
    category: "Dev Tools",
    segment: "Paid",
    status: "Shipped",
    priority: 12,
    sentiment: "positive"
  },
  {
    id: 24,
    source: "Support Ticket",
    text: "Interested in learning more about Durable Objects. Are there any best practices guides available?",
    timestamp: "2026-01-19T10:30:00Z",
    user: "learning_dev",
    votes: 9,
    category: "Documentation",
    segment: "Paid",
    status: "Open",
    priority: 35,
    sentiment: "neutral"
  },
  {
    id: 25,
    source: "GitHub",
    text: "The integration with GitHub Actions for CI/CD is smooth. Deployment pipeline setup took less than an hour.",
    timestamp: "2026-01-18T16:15:00Z",
    user: "ci_cd_engineer",
    votes: 21,
    category: "DevOps",
    segment: "Enterprise",
    status: "Shipped",
    priority: 20,
    sentiment: "positive"
  },
  {
    id: 26,
    source: "Discord",
    text: "Cloudflare's global network coverage is impressive. Our users worldwide experience consistent low latency.",
    timestamp: "2026-01-18T11:50:00Z",
    user: "global_platform",
    votes: 19,
    category: "Performance",
    segment: "Enterprise",
    status: "Shipped",
    priority: 15,
    sentiment: "positive"
  },
  {
    id: 27,
    source: "Community Forum",
    text: "Wondering if there are plans to add support for GraphQL subscriptions in Workers. Currently using workarounds.",
    timestamp: "2026-01-18T08:25:00Z",
    user: "graphql_dev",
    votes: 7,
    category: "Features",
    segment: "Paid",
    status: "Acknowledged",
    priority: 65,
    sentiment: "neutral"
  },
  {
    id: 28,
    source: "Twitter",
    text: "The security features like WAF and DDoS protection work seamlessly with Workers. Great peace of mind.",
    timestamp: "2026-01-17T19:10:00Z",
    user: "security_focused",
    votes: 23,
    category: "Security",
    segment: "Enterprise",
    status: "Shipped",
    priority: 10,
    sentiment: "positive"
  },
  {
    id: 29,
    source: "GitHub",
    text: "I absolutely love Cloudflare Workers! The developer experience is fantastic and the performance is outstanding.",
    timestamp: "2026-01-17T14:30:00Z",
    user: "dev_advocate",
    votes: 30,
    category: "Praise",
    segment: "Paid",
    status: "Shipped",
    priority: 5,
    sentiment: "positive"
  },
  {
    id: 30,
    source: "Discord",
    text: "This is amazing! Our application latency improved dramatically. Best decision we made this year!",
    timestamp: "2026-01-17T10:15:00Z",
    user: "tech_lead",
    votes: 26,
    category: "Praise",
    segment: "Enterprise",
    status: "Shipped",
    priority: 5,
    sentiment: "positive"
  },
  {
    id: 31,
    source: "Email",
    text: "Perfect solution for our needs. The documentation is excellent and the community support is wonderful.",
    timestamp: "2026-01-16T16:45:00Z",
    user: "satisfied_user",
    votes: 22,
    category: "Praise",
    segment: "Paid",
    status: "Shipped",
    priority: 8,
    sentiment: "positive"
  },
  {
    id: 32,
    source: "Community Forum",
    text: "Incredible platform! Easy to use, fast deployment, and the free tier is generous. Highly recommend!",
    timestamp: "2026-01-16T12:20:00Z",
    user: "startup_ceo",
    votes: 24,
    category: "Praise",
    segment: "Free",
    status: "Shipped",
    priority: 5,
    sentiment: "positive"
  },
  {
    id: 33,
    source: "Support Ticket",
    text: "Great service! The team helped us migrate seamlessly. Everything works perfectly now. Thank you!",
    timestamp: "2026-01-16T09:00:00Z",
    user: "migrating_team",
    votes: 18,
    category: "Praise",
    segment: "Enterprise",
    status: "Shipped",
    priority: 5,
    sentiment: "positive"
  },
  {
    id: 34,
    source: "Twitter",
    text: "Love how quick and easy it is to deploy. The developer tools are awesome and the pricing is fair.",
    timestamp: "2026-01-15T18:30:00Z",
    user: "indie_dev",
    votes: 15,
    category: "Praise",
    segment: "Free",
    status: "Shipped",
    priority: 10,
    sentiment: "positive"
  },
  {
    id: 35,
    source: "GitHub",
    text: "Brilliant platform! The edge computing capabilities are impressive and the global network is superb.",
    timestamp: "2026-01-15T13:15:00Z",
    user: "cloud_architect",
    votes: 20,
    category: "Praise",
    segment: "Enterprise",
    status: "Shipped",
    priority: 5,
    sentiment: "positive"
  }
];

// HTML template for the dashboard
function getHTMLTemplate(analysisResults: any) {
  const initialData = JSON.stringify(analysisResults).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Analyzer | Cloudflare</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-app: #0f1115;
            --bg-panel: #161920;
            --bg-card: #1c202a;
            --bg-highlight: #252a36;
            
            --border: #2d3342;
            --border-light: #3a4254;
            
            /* Brightened Text Colors */
            --text-primary: #f1f5f9;  /* Creating higher contrast */
            --text-secondary: #cbd5e1; /* Much lighter than previous */
            --text-muted: #94a3b8;    /* Lighter grey */
            
            --accent: #3b82f6;
            --accent-glow: rgba(59, 130, 246, 0.15);
            
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #0ea5e9;
            
            --radius-sm: 6px;
            --radius-md: 8px;
            --radius-lg: 12px;
            
            --font-sans: 'Inter', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        html, body {
            height: 100%;
            width: 100%;
            overflow: hidden;
        }

        body {
            font-family: var(--font-sans);
            background: var(--bg-app);
            color: var(--text-primary);
            font-size: 16px; 
            -webkit-font-smoothing: antialiased;
        }
        
        /* Layout */
        .app-layout {
            display: grid;
            grid-template-columns: 260px 1fr 380px;
            grid-template-rows: 60px minmax(0, 1fr); /* minmax(0, 1fr) is critical for scrolling */
            height: 100%;
            width: 100%;
        }
        
        @media (max-width: 1200px) {
            .app-layout {
                grid-template-columns: 240px 1fr 0; 
            }
            .app-layout.details-open {
                grid-template-columns: 240px 1fr 380px;
            }
        }
        
        /* Header */
        header {
            grid-column: 1 / -1;
            grid-row: 1;
            background: var(--bg-panel);
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            padding: 0 1.5rem;
            justify-content: space-between;
            z-index: 10;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 600;
            font-size: 1.1rem;
            color: var(--text-primary);
        }
        
        .brand-icon {
            color: #f6821f; /* Cloudflare orange-ish */
        }
        
        .global-search {
            flex: 1;
            max-width: 600px;
            margin: 0 2rem;
            position: relative;
        }
        
        .search-input {
            width: 100%;
            background: var(--bg-app);
            border: 1px solid var(--border);
            padding: 0.6rem 1rem 0.6rem 2.5rem;
            border-radius: var(--radius-sm);
            color: var(--text-primary);
            font-family: var(--font-sans);
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        
        .search-input:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 2px var(--accent-glow);
        }
        
        .search-icon {
            position: absolute;
            left: 0.8rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
        }

        .header-actions {
            display: flex;
            gap: 1rem;
        }

        /* Sidebar */
        aside {
            grid-row: 2; /* Explicit row placement */
            background: var(--bg-panel);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1rem;
            overflow-y: auto;
            min-height: 0; /* Fix flex/grid overflow issues */
        }
        
        .nav-section {
            margin-bottom: 2rem;
        }
        
        .nav-title {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 0.75rem;
            padding-left: 0.5rem;
            font-weight: 600;
        }
        
        .nav-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 0.75rem;
            border-radius: var(--radius-sm);
            cursor: pointer;
            color: var(--text-secondary);
            transition: all 0.15s;
            margin-bottom: 0.25rem;
            font-size: 0.95rem;
            text-decoration: none;
        }
        
        .nav-item:hover, .nav-item.active {
            background: var(--bg-highlight);
            color: var(--text-primary);
        }
        
        .nav-item.active {
            font-weight: 500;
        }
        
        .nav-icon {
            margin-right: 0.75rem;
            opacity: 0.7;
            width: 16px;
            text-align: center;
        }
        
        .nav-count {
            background: var(--bg-card);
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-family: var(--font-mono);
            color: var(--text-muted);
        }

        .theme-sparkline {
            width: 40px;
            height: 16px;
            border-bottom: 1px solid var(--border);
            position: relative;
            margin-left: auto;
            margin-right: 0.5rem;
            opacity: 0.6;
        }

        /* Main Feed */
        main {
            grid-row: 2; /* Explicit row placement */
            background: var(--bg-app);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            min-height: 0; /* Fix flex/grid overflow issues */
        }
        
        .feed-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .feed-title h2 {
            font-size: 1.25rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .feed-meta {
            color: var(--text-muted);
            font-size: 0.9rem;
        }
        
        .feed-list {
            flex: 1;
            overflow-y: auto;
            padding: 0;
        }
        
        .feedback-card {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid var(--border);
            cursor: pointer;
            transition: background 0.15s;
            position: relative;
        }
        
        .feedback-card:hover {
            background: var(--bg-panel);
        }
        
        .feedback-card.selected {
            background: var(--bg-highlight);
            border-left: 3px solid var(--accent);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: var(--text-primary);
            font-weight: 500;
        }
        
        .segment-badge {
            font-size: 0.7rem;
            padding: 0.1rem 0.35rem;
            border-radius: 4px;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.03em;
        }
        
        .segment-enterprise { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .segment-paid { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .segment-free { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); }
        
        .timestamp {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        
        .card-body {
            font-size: 0.95rem;
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .card-footer {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.85rem;
        }
        
        .source-badge {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            color: var(--text-muted);
        }
        
        .priority-indicator {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-feature-settings: "tnum";
            font-family: var(--font-mono);
            font-size: 0.8rem;
        }
        
        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        
        .priority-high { color: var(--danger); }
        .priority-med { color: var(--warning); }
        .priority-low { color: var(--text-muted); }
        
        /* Details Panel */
        aside.details-panel {
            background: var(--bg-panel);
            border-left: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            border-right: none;
        }
        
        .details-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
        }
        
        .details-actions {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .btn {
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-primary);
            padding: 0.4rem 0.8rem;
            border-radius: var(--radius-sm);
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.15s;
        }
        
        .btn:hover { background: var(--bg-highlight); border-color: var(--text-muted); }
        .btn-primary { background: var(--accent); border-color: var(--accent); color: white; }
        .btn-primary:hover { background: #2563eb; }
        
        .details-content {
            padding: 1.5rem;
        }
        
        .full-text {
            font-size: 1.05rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            padding: 1rem;
            background: var(--bg-card);
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
        }
        
        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .meta-item label {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: 0.4rem;
            font-weight: 600;
        }
        
        .meta-value {
            font-size: 0.95rem;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .analysis-section {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border);
        }
        
        .analysis-title {
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .sentiment-bar-large {
            height: 6px;
            background: var(--bg-card);
            border-radius: 3px;
            overflow: hidden;
            display: flex;
            margin-bottom: 0.5rem;
        }
        
        .sentiment-fill { height: 100%; transition: width 0.3s; }
        
        .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .tag {
            background: var(--bg-card);
            border: 1px solid var(--border);
            padding: 0.2rem 0.6rem;
            border-radius: 100px;
            font-size: 0.8rem;
            color: var(--text-secondary);
        }
        
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--text-muted);
            text-align: center;
            padding: 2rem;
        }
        
        /* Utils */
        .hidden { display: none !important; }
        .text-pos { color: var(--success); }
        .text-neg { color: var(--danger); }
        .text-neu { color: var(--text-muted); }
        
    </style>
</head>
<body>
    <div id="app" class="app-layout">
        <!-- Sidebar -->
        <aside>
            <div class="nav-section">
                <div class="nav-title">Views</div>
                <a href="#" class="nav-item active" onclick="setView('inbox')">
                    <span><span class="nav-icon">📥</span>Unified Inbox</span>
                </a>
                <a href="#" class="nav-item" onclick="setView('top-voted')">
                    <span><span class="nav-icon">🔥</span>Top Voted</span>
                </a>
                <a href="#" class="nav-item" onclick="setView('anomalies')">
                    <span><span class="nav-icon">⚠️</span>Anomalies</span>
                    ${analysisResults.anomalyCheck.hasAnomaly ? '<span class="nav-count text-neg">!</span>' : ''}
                </a>
            </div>
            
            <div class="nav-section">
                <div class="nav-title">Themes</div>
                <div id="theme-nav-list">
                    <!-- Themes injected via JS -->
                </div>
            </div>
            
            <div class="nav-section">
                <div class="nav-title">Segments</div>
                <label class="nav-item"><span style="margin-left: 24px;">Enterprise</span> <input type="checkbox" checked onchange="toggleSegment('Enterprise')"></label>
                <label class="nav-item"><span style="margin-left: 24px;">Paid</span> <input type="checkbox" checked onchange="toggleSegment('Paid')"></label>
                <label class="nav-item"><span style="margin-left: 24px;">Free</span> <input type="checkbox" checked onchange="toggleSegment('Free')"></label>
            </div>
        </aside>

        <!-- Main Feed -->
        <main>
            <div class="feed-header">
                <div class="feed-title">
                    <h2 id="view-title">Unified Inbox</h2>
                </div>
                <div class="feed-meta" id="feed-count">Loading...</div>
            </div>
            <div class="feed-list" id="feed-list">
                <!-- Feedback items injected via JS -->
            </div>
        </main>

        <!-- Details Panel -->
        <aside class="details-panel" id="details-panel">
            <div class="empty-state">
                <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.2">👈</div>
                <p>Select a feedback item to view details</p>
            </div>
            <!-- Details content injected via JS -->
        </aside>
    </div>

    <script>
        // Initialize State
        const data = ${initialData};
        let currentView = 'inbox'; // inbox, theme, empty
        let activeTheme = null;
        let activeSegments = new Set(['Enterprise', 'Paid', 'Free']);
        let selectedFeedbackId = null;

        // Icons map
        const sourceIcons = {
            'GitHub': '🐙', 'Discord': '💬', 'Twitter': '🐦', 'Email': '✉️', 
            'Support Ticket': '🎫', 'Community Forum': '👥'
        };

        function init() {
            renderThemes();
            renderFeed();
        }

        // Render Sidebar Themes
        function renderThemes() {
            const container = document.getElementById('theme-nav-list');
            container.innerHTML = data.themes.map(theme => \`
                <div class="nav-item" onclick="filterByTheme('\${theme.name}')">
                    <span style="flex:1">\${theme.name}</span>
                    <div class="theme-sparkline">
                         <!-- Simplified sparkline viz using gradient for now -->
                        <div style="height:100%;background:linear-gradient(90deg, \${theme.sentimentTrend.map(v => v > 0 ? '#10b981' : v < 0 ? '#ef4444' : '#3a4254').join(', ')})"></div>
                    </div>
                    <span class="nav-count">\${theme.count}</span>
                </div>
            \`).join('');
        }

        // Filter Logic
        function getFilteredFeedback() {
            let items = [];
            
            if (currentView === 'inbox') items = data.recentFeedback; // Note: 'recentFeedback' in backend is just a slice, likely want full list in real app but using what's available
            else if (currentView === 'top-voted') items = data.topVoted;
            else if (currentView === 'theme' && activeTheme) {
                // Client-side filter for demo, ideally backend would serve
                // Since MOCK_FEEDBACK isn't fully passed in 'recentFeedback' (it was sliced), this might be limited. 
                // In a real app we'd have the full list or fetch it. 
                // For this demo, we'll try to use relevant items from what we have.
                // Re-using 'recentFeedback' as the main pool for now.
                items = data.recentFeedback.filter(f => f.category === activeTheme);
            }

            // Segment Filter
            return items.filter(item => activeSegments.has(item.segment || 'Free'));
        }

        // Render Feed
        function renderFeed() {
            const items = getFilteredFeedback();
            const container = document.getElementById('feed-list');
            document.getElementById('feed-count').textContent = \`\${items.length} items\`;
            
            if (items.length === 0) {
                container.innerHTML = '<div class="empty-state">No items match your filters</div>';
                return;
            }

            container.innerHTML = items.map(item => \`
                <div class="feedback-card \${selectedFeedbackId === item.id ? 'selected' : ''}" onclick="selectFeedback(\${item.id})">
                    <div class="card-header">
                        <div class="user-info">
                            \${item.user}
                            <span class="segment-badge segment-\${(item.segment||'free').toLowerCase()}">\${item.segment || 'Free'}</span>
                        </div>
                        <span class="timestamp">\${new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div class="card-body">\${item.text}</div>
                    <div class="card-footer">
                        <span class="source-badge">
                           \${sourceIcons[item.source] || '📄'} \${item.source}
                        </span>
                        <div style="flex:1"></div>
                        <span class="priority-indicator \${getPriorityClass(item.priority)}">
                            <div class="dot" style="background:currentColor"></div>
                            Priority \${item.priority || 0}
                        </span>
                    </div>
                </div>
            \`).join('');
        }

        function getPriorityClass(p) {
            if (p > 70) return 'priority-high';
            if (p > 40) return 'priority-med';
            return 'priority-low';
        }

        // Interactions
        window.setView = (view) => {
            currentView = view;
            activeTheme = null;
            document.getElementById('view-title').textContent = view === 'inbox' ? 'Unified Inbox' : view === 'top-voted' ? 'Top Voted' : 'Anomalies';
            // update nav active state logic omitted for brevity
            renderFeed();
        };

        window.filterByTheme = (themeName) => {
            currentView = 'theme';
            activeTheme = themeName;
            document.getElementById('view-title').textContent = \`Theme: \${themeName}\`;
            renderFeed();
        };
        
        window.toggleSegment = (segment) => {
            if (activeSegments.has(segment)) activeSegments.delete(segment);
            else activeSegments.add(segment);
            renderFeed();
        };

        window.selectFeedback = (id) => {
            selectedFeedbackId = id;
            renderFeed(); // Re-render to update selected state
            renderDetails(id);
        };

        function renderDetails(id) {
            // Find item in any of our lists
            const allItems = [...data.recentFeedback, ...data.topVoted]; 
            const item = allItems.find(i => i.id === id);
            
            if (!item) return;

            const panel = document.getElementById('details-panel');
            panel.innerHTML = \`
                <div class="details-header">
                    <div class="details-actions">
                        <button class="btn btn-primary">Open in Jira</button>
                        <button class="btn">Mark Resolved</button>
                        <div style="flex:1"></div>
                        <button class="btn">Share</button>
                    </div>
                    <h3 style="font-size:1.2rem; margin-bottom:0.5rem">Feedback Details</h3>
                    <div class="source-badge">\${sourceIcons[item.source] || ''} \${item.source} • ID: #\${item.id}</div>
                </div>
                <div class="details-content">
                    <div class="meta-grid">
                        <div class="meta-item">
                            <label>User Segment</label>
                            <div class="meta-value">
                                <span class="segment-badge segment-\${(item.segment||'free').toLowerCase()}">\${item.segment || 'Free'}</span>
                            </div>
                        </div>
                        <div class="meta-item">
                            <label>Priority Score</label>
                            <div class="meta-value" style="font-family:var(--font-mono); font-weight:700">
                                \${item.priority || 0}/100
                            </div>
                        </div>
                        <div class="meta-item">
                            <label>Status</label>
                            <div class="meta-value">\${item.status || 'Open'}</div>
                        </div>
                         <div class="meta-item">
                            <label>Category</label>
                            <div class="meta-value">\${item.category || 'Uncategorized'}</div>
                        </div>
                    </div>

                    <div class="full-text">
                        "\${item.text}"
                    </div>

                    <div class="analysis-section">
                        <div class="analysis-title">
                            AI Analysis
                            <span class="tag \${item.sentiment === 'positive' ? 'text-pos' : item.sentiment === 'negative' ? 'text-neg' : 'text-neu'}">\${item.sentiment.toUpperCase()}</span>
                        </div>
                        
                        <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.9rem">
                            Key insight: User is discussing <strong>\${item.category}</strong> with <strong>\${item.sentiment}</strong> sentiment.
                        </p>
                    </div>
                </div>
            \`;
        }
        
        // Start
        init();
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

// Extract themes from feedback (now utilizing explicit categories)
function extractThemes(feedbackList: any[]): any[] {
  const themeMap: { [key: string]: { count: number, totalPriority: number, mentions: number[] } } = {};

  feedbackList.forEach(feedback => {
    // Use the explicit category if available, fallback to 'Uncategorized'
    const category = feedback.category || 'Uncategorized';

    if (!themeMap[category]) {
      themeMap[category] = { count: 0, totalPriority: 0, mentions: [] };
    }

    themeMap[category].count++;
    themeMap[category].totalPriority += (feedback.priority || 0);
    // basic simulated sparkline data (1 for positive, -1 for negative, 0 neutral) - just pushing recent sentiment for visual
    const sentimentVal = feedback.sentiment === 'positive' ? 1 : feedback.sentiment === 'negative' ? -1 : 0;
    themeMap[category].mentions.push(sentimentVal);
  });

  return Object.entries(themeMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgPriority: Math.round(data.totalPriority / data.count),
      sentimentTrend: data.mentions.slice(-10) // Last 10 sentiment points for sparkline
    }))
    .sort((a, b) => b.avgPriority - a.avgPriority) // Sort by priority
    .slice(0, 8);
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
      .sort(([, a], [, b]) => b - a)
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



export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // NEW FEATURE: Voting API endpoint
    if (url.pathname === '/api/vote' && request.method === 'POST') {
      try {
        const { feedbackId, userId } = await request.json() as any;
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


        const analysis = {
          totalFeedback: MOCK_FEEDBACK.length,
          sentimentCounts,
          themes,
          recentFeedback: feedbackWithSentiment.slice(0, 8),
          topVoted,
          trendData,
          anomalyCheck,

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


        const analysisResults = {
          totalFeedback: MOCK_FEEDBACK.length,
          sentimentCounts,
          themes,
          recentFeedback: feedbackWithSentiment,
          topVoted,
          trendData,
          anomalyCheck,

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

        };

        return new Response(getHTMLTemplate(analysisResults), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
