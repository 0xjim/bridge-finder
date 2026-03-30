# Data Model & API Reference

## API Endpoint

### POST `/api/bridges/start`

**Request:**
```json
{
  "query": "I want to go from Base to Arbitrum"
}
```

**Success Response:**
```json
{
  "sourceChain": "Base",
  "destinationChain": "Arbitrum",
  "bridges": [
    { "name": "Across", "url": "https://across.to" },
    { "name": "Stargate", "url": "https://stargate.finance" }
  ]
}
```

**Error Responses:**
- Chain not found: `{ "error": "Could not find source chain: ..." }`
- No bridges: `{ "error": "No bridges found supporting both ..." }`
- AI failure: `{ "error": "Failed to process your query" }`

## OpenAI Prompt

The API sends the user's query to GPT-3.5-turbo with a system prompt instructing it to return JSON:
```json
{ "source": "<chain name>", "destination": "<chain name>" }
```

The model extracts blockchain network names from natural language input.

## Database Tables

### Network
| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| networkName | String | Unique, canonical name (e.g., "Ethereum") |
| commonAliases | String[] | Lowercase variants (e.g., ["eth", "mainnet"]) |

### Bridge
| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| bridgeName | String | Unique (e.g., "Across") |
| baseUrl | String | Bridge website URL |
| supportedChains | String[] | Array of canonical network names |

### BridgeRequest
| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| requestId | String | Unique request identifier |
| rawQuery | String | Original user input |
| status | String | "pending", "completed", or "error" |
| sourceChain | String? | Extracted source chain |
| destinationChain | String? | Extracted destination chain |
| bridges | JSON | Matched bridge results |
| error | String? | Error message if failed |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

## Data Seeding

Source data comes from two CSV files (Airtable exports):
- `Networks-Grid view.csv` - network definitions with aliases
- `Bridges-Grid view.csv` - bridge definitions with supported chains

Run `npm run migrate:data` to seed the database via `scripts/migrate.js`.
