---
name: refresh
description: Refresh bridge chain data from APIs and update both the CSV and database
user_invocable: true
---

# Refresh Bridge Data

Run the chain update script to pull the latest supported chains from bridge APIs (LI.FI, Across, Relay, Stargate, deBridge, Bungee) and update both CSVs and the PostgreSQL database.

The script does three things:
1. Fetches current chain support from 6 bridge APIs
2. Syncs all networks from `Networks-Grid view.csv` into the `Network` DB table (upsert)
3. Updates bridge `supportedChains` in both `Bridges-Grid view.csv` and the `Bridge` DB table

## Steps

1. Run `npm run update:chains` from the project root
2. Show the user the summary output (which bridges were updated, what chains were added/removed)
3. If there are new unrecognized chains in the warnings, add them to:
   - `Networks-Grid view.csv` (with aliases)
   - `EVM_CHAIN_IDS` map in `scripts/update-chains.js` (with chain ID)
   - `STARGATE_CHAIN_MAP` in `scripts/update-chains.js` (if it's a Stargate chainKey)
   Then re-run the script
