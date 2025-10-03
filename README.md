drama-studio is an AI engine that auto-generates episodic fantasy/soap-opera stories, renders Instagram-ready carousel frames and a short trailer, and can publish to Instagram via the Instagram Graph API. Built with Next.js 14 (App Router, TS), Tailwind, shadcn/ui, Drizzle + SQLite.

## Getting Started

Quickstart:

```bash
pnpm i
pnpm dlx shadcn@latest init
pnpm db:push
pnpm seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

Environment variables are defined in `.env.example` with notes for OpenAI and Instagram tokens. Use `MOCK_MODE=true` to simulate IG posting during demos.

### Instagram Graph API (overview)

- Create media containers for each image with `is_carousel_item=true`, then create a carousel container with `children=[...]` and publish via `/media_publish`.
- For Reels, create a video media container and publish.
- Required scopes: `instagram_basic`, `instagram_content_publish`, `pages_show_list`.
- In dev, keep posting minimal; respect rate caps. Use Mock Mode to avoid real posts.

### Demo script (3 min)
1) Create Episode → Generate (AI) → Render (panels + trailer)
2) Preview in dashboard
3) Publish (mock or real IG)

_Screenshots placeholders to be added after first render._
