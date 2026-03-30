# Bridge Finder

AI-powered cross-chain bridge discovery tool. Users enter natural language queries (e.g., "go from Base to Arbitrum"), OpenAI extracts chain names, and the app finds matching bridges from a PostgreSQL database.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript 5
- **Database**: PostgreSQL via Prisma ORM 6
- **AI**: OpenAI GPT-3.5-turbo for chain extraction
- **Styling**: Tailwind CSS 3
- **Deployment**: Vercel (serverless)
- **Icons**: Lucide React

## Project Structure

```
src/
  app/
    api/bridges/start/route.ts   # Main API endpoint
    og/route.tsx                  # OG image generation (edge)
    layout.tsx                    # Root layout + metadata
    page.tsx                      # Single-page UI (client component)
    globals.css                   # Global styles
  lib/
    prisma.ts                    # Prisma client singleton
prisma/
  schema.prisma                  # Database schema (Network, Bridge, BridgeRequest)
  migrations/                    # Prisma migrations
scripts/
  migrate.js                     # CSV-to-DB seed script (PapaParse)
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run migrate:data` | Seed DB from CSV files |
| `npm run migrate:db` | Run Prisma migrations |
| `npm run db:push` | Push schema without migration |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key

## Database Models

- **Network** - Blockchain networks with canonical names and aliases
- **Bridge** - Bridge services with URLs and supported chain arrays
- **BridgeRequest** - Request logging (audit trail)

## Code Conventions

- Prettier: semicolons, single quotes, 2-space tabs, ES5 trailing commas
- ESLint: Next.js core web vitals + Prettier integration
- Path alias: `@/*` maps to `./src/*`

## Git Commits

- Never run `git commit` directly - the user's SSH key requires a passphrase
- Stage files with `git add`, then give the user the exact `git commit` command to run
