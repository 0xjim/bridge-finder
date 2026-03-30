# Technical Architecture

## System Overview

```mermaid
graph TB
    User([User]) -->|Natural language query| UI[Next.js Frontend]
    UI -->|POST /api/bridges/start| API[API Route]
    API -->|Extract chains| OpenAI[OpenAI GPT-3.5-turbo]
    OpenAI -->|source + destination| API
    API -->|Lookup chains| DB[(PostgreSQL)]
    DB -->|Network + Bridge data| API
    API -->|JSON response| UI
    UI -->|Bridge links| User
```

## Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as page.tsx (Client)
    participant API as /api/bridges/start
    participant AI as OpenAI
    participant DB as PostgreSQL

    U->>FE: Enter query ("Base to Arbitrum")
    FE->>API: POST { query }
    API->>AI: Extract chains (GPT-3.5-turbo)
    AI-->>API: { source: "Base", destination: "Arbitrum" }
    API->>DB: Find Network by name/alias (source)
    DB-->>API: Network record (canonical name)
    API->>DB: Find Network by name/alias (destination)
    DB-->>API: Network record (canonical name)
    API->>DB: Find Bridges where supportedChains contains both
    DB-->>API: Matching bridges[]
    API-->>FE: { sourceChain, destinationChain, bridges[] }
    FE-->>U: Display bridge cards with links
```

## Database Schema

```mermaid
erDiagram
    Network {
        string id PK "CUID"
        string networkName UK "Canonical name"
        string[] commonAliases "Fuzzy match aliases"
    }

    Bridge {
        string id PK "CUID"
        string bridgeName UK "Bridge name"
        string baseUrl "Bridge website URL"
        string[] supportedChains "Network names"
    }

    BridgeRequest {
        string id PK "CUID"
        string requestId UK
        string rawQuery "Original user input"
        string status "pending | completed | error"
        string sourceChain "optional"
        string destinationChain "optional"
        json bridges "Matched bridges"
        string error "optional"
        datetime createdAt
        datetime updatedAt
    }

    Network ||--o{ Bridge : "referenced in supportedChains"
```

## Component Architecture

```mermaid
graph TD
    RootLayout["RootLayout (layout.tsx)"] --> Page["BridgeFinder Page (page.tsx)"]
    Page --> Banner["Beta Banner"]
    Page --> Header["Header + Wojak Image"]
    Page --> Form["Search Form"]
    Page --> Loading["Loading State"]
    Page --> Error["Error State"]
    Page --> Results["Results Container"]

    Form --> Input["Text Input"]
    Form --> Submit["Submit Button"]

    Results --> ChainBadges["Chain Badges (src -> dst)"]
    Results --> BridgeGrid["Bridge Cards Grid"]
    BridgeGrid --> BridgeCard1["Bridge Card (name + CTA link)"]
    BridgeGrid --> BridgeCard2["Bridge Card (name + CTA link)"]
```

## Chain Matching Logic

```mermaid
flowchart TD
    A[Receive AI-extracted chain name] --> B{Exact name match?}
    B -->|Yes| C[Return Network]
    B -->|No| D{Alias match?}
    D -->|Yes| C
    D -->|No| E[Return error: chain not found]

    style B fill:#ffd,stroke:#333
    style D fill:#ffd,stroke:#333
```

The chain matching uses a two-step fuzzy lookup:
1. **Exact match** - case-insensitive search on `networkName`
2. **Alias match** - checks if the AI-extracted name appears in `commonAliases` array

## Data Seeding Pipeline

```mermaid
flowchart LR
    CSV1["Networks-Grid view.csv"] -->|PapaParse| Script["scripts/migrate.js"]
    CSV2["Bridges-Grid view.csv"] -->|PapaParse| Script
    Script -->|Prisma upsert| DB[(PostgreSQL)]
```

CSV files from Airtable are parsed and upserted into the database. The migration script handles alias normalization (e.g., zkSync Era special case).

## Deployment Architecture

```mermaid
graph LR
    Git[GitHub Repo] -->|Push| Vercel[Vercel]
    Vercel -->|prisma generate + next build| Deploy[Serverless Functions]
    Deploy --> SSR[Next.js SSR]
    Deploy --> API[API Routes]
    Deploy --> Edge[OG Image - Edge Runtime]
    API --> PG[(PostgreSQL)]
    API --> OpenAI[OpenAI API]
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| GPT-3.5-turbo for extraction | Cost-effective for simple JSON extraction task |
| String array for supportedChains | Simple bridge-to-chain mapping without join table |
| Alias-based fuzzy matching | Handles user variations ("eth" vs "Ethereum") |
| Single page app | Simple UX - one input, one result |
| Edge runtime for OG images | Fast social preview generation |
| CSV seed data | Easy data management from Airtable exports |
