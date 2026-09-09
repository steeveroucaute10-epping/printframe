# PrintFrame — Custom Cardboard Photo Frames

Print-on-demand e-commerce platform for custom cardboard photo frames with real-time preview engine, built with Next.js 14 and AI agent support for a Mac Mini.

## Features

- **Customer-facing**: Landing page, product catalog, photo upload, real-time preview, checkout (Stripe/Apple Pay/PayPal), customer accounts, order tracking
- **Back-office**: Dashboard, order management, product management, print production queue, shipping integration, marketing, analytics
- **AI Agent**: Local LLM-powered Dev, Design, Content, Ops, and QA agents running on Ollama via Docker Compose

## Quick Start

1. Clone and install dependencies:
   ```bash
   git clone git@github.com:steeveroucaute10-epping/printframe.git
   cd printframe
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Set up database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Background Jobs**: BullMQ + Redis
- **Storage**: Cloudflare R2
- **Payments**: Stripe
- **Email**: Resend
- **LLM**: Ollama (local)
- **Deployment**: Docker Compose / Vercel

## AI Agent Configuration

Five agents run via Ollama on your Mac Mini:

| Agent | Model | Purpose |
|-------|-------|---------|
| Dev   | Llama 3.1 8B | Code review, PR descriptions |
| Design | Qwen 2.5 7B | UI suggestions, color palettes |
| Content | Qwen 2.5 7B | Product descriptions, SEO |
| Ops   | Llama 3.1 8B | Order routing, inventory alerts |
| QA    | Stable Diffusion | Image quality checks |

## Project Structure

```
src/
├── app/                  # Next.js pages & API routes
│   ├── (auth)/          # Auth pages (login, register, etc.)
│   ├── (marketing)/     # Landing page, about, gallery
│   ├── account/         # Customer account pages
│   ├── admin/           # Back-office admin
│   ├── api/             # API routes
│   └── ...
├── components/          # React components
│   └── ui/              # shadcn/ui primitives
├── lib/                 # Utilities, DB, cart context
└── types/               # TypeScript type definitions
prisma/                  # Database schema & migrations
agents/                  # AI agent configurations
```

## License

MIT
