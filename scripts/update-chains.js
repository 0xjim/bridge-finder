const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Load .env.local since plain Node doesn't auto-load it
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

const prisma = new PrismaClient();

// ── Native bridges to skip (static pairs, won't change) ──────────────
const NATIVE_BRIDGES = new Set([
  'Arbitrum Native Bridge',
  'Avalanche Bridge',
  'Base Native Bridge',
  'Blast Native Bridge',
  'Gnosis Bridge',
  'Linea Bridge',
  'Manta Pacific Bridge',
  'Mantle Bridge',
  'Polygon PoS Bridge',
  'Polygon zkEVM Bridge',
  'Rainbow Bridge',
  'Scroll Native Bridge',
  'Sui Bridge',
  'TON Bridge',
  'ZKsync Era Bridge',
]);

// ── EVM chain ID → canonical name mapping ────────────────────────────
const EVM_CHAIN_IDS = {
  1: 'Ethereum',
  10: 'Optimism',
  25: 'Cronos',
  56: 'BNB Chain',
  100: 'Gnosis',
  122: 'Fuse',
  130: 'Unichain',
  137: 'Polygon',
  169: 'Manta',
  185: 'Mint',
  196: 'X Layer',
  204: 'opBNB',
  250: 'Fantom',
  252: 'Fraxtal',
  255: 'Kroma',
  288: 'Boba',
  291: 'Orderly Network',
  324: 'zkSync Era',
  360: 'Shape',
  480: 'World Chain',
  570: 'Rollux',
  660279: 'Xai',
  690: 'Redstone',
  842: 'Hychain',
  894: 'Proof of Play Boss',
  957: 'Lyra',
  1088: 'Metis',
  1101: 'Polygon zkEVM',
  1135: 'Lisk',
  1284: 'Moonbeam',
  1285: 'Moonriver',
  1329: 'Sei',
  1337: 'Hyperliquid',
  1625: 'Gravity',
  1750: 'Metal',
  2192: 'Snaxchain',
  2222: 'Kava',
  2741: 'Abstract',
  2999: 'Bitrock',
  4078: 'Muster',
  5000: 'Mantle',
  5112: 'Ham',
  7560: 'Cyber',
  7777777: 'Zora',
  8453: 'Base',
  33139: 'ApeChain',
  34443: 'Mode',
  42161: 'Arbitrum',
  42170: 'Arbitrum Nova',
  42220: 'Celo',
  43114: 'Avalanche',
  59144: 'Linea',
  60808: 'BOB',
  62049: 'Xterio Chain',
  70700: 'Proof of Play Apex',
  78225: 'Race',
  81457: 'Blast',
  167000: 'Taiko',
  534352: 'Scroll',
  666666666: 'Degen',
  888888888: 'Ancient8',
  984122: 'Forma',
  1313161554: 'Aurora',
  // Newer chains
  143: 'Monad',
  232: 'Lens',
  747: 'Flow',
  999: 'Hyperliquid',
  1424: 'Perennial',
  1514: 'Story',
  1868: 'Soneium',
  1923: 'Swell',
  2020: 'Ronin',
  4217: 'Tempo',
  4326: 'MegaETH',
  5031: 'Somnia',
  5330: 'Superseed',
  9745: 'Plasma',
  42018: 'Mythos',
  43111: 'Hemi',
  43419: 'Gunz',
  57073: 'Ink',
  69000: 'Animechain',
  80094: 'Berachain',
  97477: 'Doma',
  98866: 'Plume',
  510003: 'Syndicate',
  543210: 'ZERO',
  747474: 'Katana',
  3586256: 'Lighter',
  5064014: 'Ethereal',
  9286186: 'Soon',
  21000000: 'Corn',
};

// ── LI.FI bridge key → CSV bridge name mapping ──────────────────────
const LIFI_BRIDGE_MAP = {
  across: 'Across',
  stargate: 'Stargate',
  hop: 'Hop',
  cbridge: 'cBridge',
  connext: 'Connext',
  symbiosis: 'Symbiosis',
  allbridge: 'Allbridge',
  mayan: 'Mayan Finance',
  thorswap: 'ThorSwap',
  debridge: 'deBridge',
  relay: 'Relay',
  squid: 'Squid',
  chainflip: 'Chainflip',
  orbiter: 'Orbiter',
  jumper: 'Jumper',
  hyphen: 'Hyphen',
  amarok: 'Connext',
  lifi: 'Jumper',
  'gas.zip': 'Gas.zip',
  gaszip: 'Gas.zip',
};

// ── Stargate chainKey → canonical name mapping ──────────────────────
const STARGATE_CHAIN_MAP = {
  ethereum: 'Ethereum',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  polygon: 'Polygon',
  bsc: 'BNB Chain',
  base: 'Base',
  scroll: 'Scroll',
  linea: 'Linea',
  mantle: 'Mantle',
  avalanche: 'Avalanche',
  metis: 'Metis',
  kava: 'Kava',
  sei: 'Sei',
  zkconsensys: 'Linea',
  fantom: 'Fantom',
  aurora: 'Aurora',
  klaytn: 'Kaia',
  iota: 'IOTA EVM',
  flare: 'Flare',
  gravity: 'Gravity',
  taiko: 'Taiko',
  rarible: 'RARI',
  abstract: 'Abstract',
  ink: 'Ink',
  unichain: 'Unichain',
  bera: 'Berachain',
  coredao: 'Core',
  cronosevm: 'Cronos',
  doma: 'Doma',
  hemi: 'Hemi',
  horizen: 'Horizen EON',
  injectiveevm: 'Injective',
  nibiru: 'Nibiru',
  peaq: 'Peaq',
  plumephoenix: 'Plume',
  soneium: 'Soneium',
  somnia: 'Somnia',
  stable: 'Stable',
  story: 'Story',
  tempo: 'Tempo',
  hedera: 'Hedera',
  plasma: 'Plasma',
  swell: 'Swell',
  corn: 'Corn',
};

// ── Build normalization map from Networks CSV ────────────────────────
function buildNormalizationMap() {
  const networksData = fs.readFileSync('Networks-Grid view.csv', 'utf-8');
  const parsed = Papa.parse(networksData, {
    header: true,
    skipEmptyLines: true,
  });

  const map = new Map();

  for (const row of parsed.data) {
    const canonical = row.network_name?.trim();
    if (!canonical) continue;

    map.set(canonical.toLowerCase(), canonical);

    if (row.common_aliases) {
      const aliases = row.common_aliases.split(',').map((a) => a.trim());
      for (const alias of aliases) {
        if (alias) {
          map.set(alias.toLowerCase(), canonical);
        }
      }
    }
  }

  // Extra common variations APIs might return
  const extras = {
    bsc: 'BNB Chain',
    'binance smart chain': 'BNB Chain',
    bnb: 'BNB Chain',
    'op mainnet': 'Optimism',
    'optimism mainnet': 'Optimism',
    poly: 'Polygon',
    'polygon pos': 'Polygon',
    'polygon mainnet': 'Polygon',
    avax: 'Avalanche',
    'avalanche c-chain': 'Avalanche',
    arb: 'Arbitrum',
    'arbitrum one': 'Arbitrum',
    zksync: 'zkSync Era',
    'zksync era': 'zkSync Era',
    ftm: 'Fantom',
    'ethereum mainnet': 'Ethereum',
    eth: 'Ethereum',
    sol: 'Solana',
    matic: 'Polygon',
    nova: 'Arbitrum Nova',
    celo: 'Celo',
    gnosis: 'Gnosis',
    xdai: 'Gnosis',
    klay: 'Kaia',
    klaytn: 'Kaia',
    core: 'Core',
    'core dao': 'Core',
    'flow evm': 'Flow',
    hypervm: 'Hyperliquid',
    hyperevm: 'Hyperliquid',
    swellchain: 'Swell',
    'swell chain': 'Swell',
  };

  for (const [key, val] of Object.entries(extras)) {
    if (!map.has(key)) {
      map.set(key, val);
    }
  }

  return map;
}

function normalizeChainName(rawName, normMap) {
  if (!rawName) return null;
  const key = rawName.trim().toLowerCase();
  return normMap.get(key) || null;
}

function normalizeChainId(chainId) {
  return EVM_CHAIN_IDS[chainId] || null;
}

// Helper: resolve a chain ID to canonical name using static map + normMap fallback
function resolveChainId(id, lifiChainIdToName, normMap) {
  let canonical = normalizeChainId(id);
  if (!canonical && lifiChainIdToName) {
    const name = lifiChainIdToName[id];
    if (name) canonical = normalizeChainName(name, normMap);
  }
  return canonical;
}

// ── Load current bridges from CSV ────────────────────────────────────
function loadCurrentBridges() {
  const bridgesData = fs.readFileSync('Bridges-Grid view.csv', 'utf-8');
  const parsed = Papa.parse(bridgesData, {
    header: true,
    skipEmptyLines: true,
  });

  const bridges = {};
  for (const row of parsed.data) {
    const name = row.bridge_name?.trim();
    if (!name) continue;
    bridges[name] = {
      bridgeName: name,
      baseUrl: row.base_url?.trim() || '',
      supportedChains: row.supported_chains
        ? row.supported_chains.split(',').map((c) => c.trim())
        : [],
    };
  }
  return bridges;
}

// ── API Fetchers ─────────────────────────────────────────────────────

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLiFiBridges(normMap) {
  console.log('\n📡 Fetching from LI.FI API...');
  const results = {};

  try {
    const [toolsData, chainsData] = await Promise.all([
      fetchWithTimeout('https://li.quest/v1/tools'),
      fetchWithTimeout('https://li.quest/v1/chains'),
    ]);

    // Build chainId → name map from LI.FI chains
    const chainIdToName = {};
    const chainsList = Array.isArray(chainsData)
      ? chainsData
      : chainsData?.chains || Object.values(chainsData || {});
    for (const chain of chainsList) {
      if (chain && chain.id && chain.name) {
        chainIdToName[chain.id] = chain.name;
      }
    }

    const bridges = toolsData.bridges || [];
    for (const bridge of bridges) {
      const csvName = LIFI_BRIDGE_MAP[bridge.key];
      if (!csvName) continue;

      const chainIds = new Set();
      for (const route of bridge.supportedChains || []) {
        chainIds.add(route.fromChainId);
        chainIds.add(route.toChainId);
      }

      const chains = [];
      for (const id of chainIds) {
        const canonical = resolveChainId(id, chainIdToName, normMap);
        if (canonical && !chains.includes(canonical)) {
          chains.push(canonical);
        } else if (!canonical) {
          const lifiName = chainIdToName[id] || `ID:${id}`;
          console.log(
            `  ⚠️  LI.FI: unrecognized chain for ${csvName}: ${lifiName} (${id})`
          );
        }
      }

      if (chains.length > 0) {
        results[csvName] = chains.sort();
        console.log(`  ✅ ${csvName}: ${chains.length} chains via LI.FI`);
      }
    }
  } catch (err) {
    console.error(`  ❌ LI.FI API failed: ${err.message}`);
  }

  return results;
}

async function fetchBungeeChains(normMap) {
  console.log('\n📡 Fetching from Bungee API...');
  const results = {};

  try {
    const data = await fetchWithTimeout(
      'https://public-backend.bungee.exchange/api/v1/supported-chains'
    );

    const chainList = data?.result || data || [];
    const chains = [];
    for (const chain of chainList) {
      if (!chain.sendingEnabled && !chain.receivingEnabled) continue;
      const id = chain.chainId;
      const name = chain.name;
      let canonical = null;
      if (id) canonical = normalizeChainId(Number(id));
      if (!canonical && name) canonical = normalizeChainName(name, normMap);
      if (canonical && !chains.includes(canonical)) {
        chains.push(canonical);
      } else if (!canonical) {
        console.log(
          `  ⚠️  Bungee: unrecognized chain: ${name || 'unknown'} (${id})`
        );
      }
    }

    if (chains.length > 0) {
      results['Bungee Exchange'] = chains.sort();
      console.log(`  ✅ Bungee Exchange: ${chains.length} chains`);
    }
  } catch (err) {
    console.error(`  ❌ Bungee API failed: ${err.message}`);
  }

  return results;
}

async function fetchAcrossChains(normMap) {
  console.log('\n📡 Fetching from Across API...');
  const results = {};

  try {
    const data = await fetchWithTimeout(
      'https://app.across.to/api/available-routes'
    );

    const chainIds = new Set();
    const routes = Array.isArray(data) ? data : [];
    for (const route of routes) {
      if (route.originChainId) chainIds.add(route.originChainId);
      if (route.destinationChainId) chainIds.add(route.destinationChainId);
    }

    const chains = [];
    for (const id of chainIds) {
      const canonical = normalizeChainId(id);
      if (canonical && !chains.includes(canonical)) {
        chains.push(canonical);
      } else if (!canonical) {
        console.log(`  ⚠️  Across: unrecognized chain ID ${id}`);
      }
    }

    if (chains.length > 0) {
      results['Across'] = chains.sort();
      console.log(`  ✅ Across: ${chains.length} chains`);
    }
  } catch (err) {
    console.error(`  ❌ Across API failed: ${err.message}`);
  }

  return results;
}

async function fetchRelayChains(normMap) {
  console.log('\n📡 Fetching from Relay API...');
  const results = {};

  try {
    const data = await fetchWithTimeout('https://api.relay.link/chains');

    const chainList = Array.isArray(data) ? data : data?.chains || [];
    const chains = [];
    for (const chain of chainList) {
      const id = chain.id;
      const name = chain.displayName || chain.name;
      let canonical = null;
      if (id) canonical = normalizeChainId(Number(id));
      if (!canonical && name) canonical = normalizeChainName(name, normMap);
      if (canonical && !chains.includes(canonical)) {
        chains.push(canonical);
      } else if (!canonical) {
        console.log(
          `  ⚠️  Relay: unrecognized chain: ${name || 'unknown'} (${id})`
        );
      }
    }

    if (chains.length > 0) {
      results['Relay'] = chains.sort();
      console.log(`  ✅ Relay: ${chains.length} chains`);
    }
  } catch (err) {
    console.error(`  ❌ Relay API failed: ${err.message}`);
  }

  return results;
}

async function fetchStargateChains(normMap) {
  console.log('\n📡 Fetching from Stargate API...');
  const results = {};

  try {
    const data = await fetchWithTimeout(
      'https://mainnet.stargate-api.com/v1/metadata'
    );

    // Extract unique chainKeys from v1 and v2 pool entries
    const chainKeys = new Set();
    const versions = data?.data || data;
    for (const version of ['v1', 'v2']) {
      const pools = versions?.[version] || [];
      for (const pool of pools) {
        if (pool.chainKey) chainKeys.add(pool.chainKey);
      }
    }

    const chains = [];
    for (const key of chainKeys) {
      // Try our static Stargate map first, then normalization
      let canonical = STARGATE_CHAIN_MAP[key];
      if (!canonical) canonical = normalizeChainName(key, normMap);
      if (canonical && !chains.includes(canonical)) {
        chains.push(canonical);
      } else if (!canonical) {
        console.log(`  ⚠️  Stargate: unrecognized chainKey: ${key}`);
      }
    }

    if (chains.length > 0) {
      results['Stargate'] = chains.sort();
      console.log(`  ✅ Stargate: ${chains.length} chains`);
    }
  } catch (err) {
    console.error(`  ❌ Stargate API failed: ${err.message}`);
  }

  return results;
}

async function fetchDeBridgeChains(normMap) {
  console.log('\n📡 Fetching from deBridge API...');
  const results = {};

  try {
    const data = await fetchWithTimeout(
      'https://deswap.debridge.finance/v1.0/supported-chains-info'
    );

    const chains = [];
    const chainList = data.chains || Object.values(data);
    for (const chain of chainList) {
      const name = chain.chainName || chain.name;
      const id = chain.chainId;
      let canonical = null;
      if (id) canonical = normalizeChainId(Number(id));
      if (!canonical && name) canonical = normalizeChainName(name, normMap);
      if (canonical && !chains.includes(canonical)) {
        chains.push(canonical);
      }
    }

    if (chains.length > 0) {
      results['deBridge'] = chains.sort();
      console.log(`  ✅ deBridge: ${chains.length} chains`);
    }
  } catch (err) {
    console.error(`  ❌ deBridge API failed: ${err.message}`);
  }

  return results;
}

// ── Diff & Output ────────────────────────────────────────────────────

function diffChains(oldChains, newChains) {
  const oldSet = new Set(oldChains);
  const newSet = new Set(newChains);
  const added = newChains.filter((c) => !oldSet.has(c));
  const removed = oldChains.filter((c) => !newSet.has(c));
  return { added, removed };
}

function writeUpdatedCSV(bridges) {
  const rows = Object.values(bridges).map((b) => ({
    bridge_name: b.bridgeName,
    supported_chains: b.supportedChains.join(','),
    base_url: b.baseUrl,
  }));

  const csv = Papa.unparse(rows, {
    columns: ['bridge_name', 'supported_chains', 'base_url'],
  });

  fs.writeFileSync('Bridges-Grid view.csv', csv + '\n');
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 Bridge Chain Update Script');
  console.log('='.repeat(50));

  // Step 1: Build normalization map and load current data
  const normMap = buildNormalizationMap();
  console.log(`📋 Loaded ${normMap.size} chain name mappings`);

  const bridges = loadCurrentBridges();
  const bridgeNames = Object.keys(bridges);
  console.log(`📋 Loaded ${bridgeNames.length} bridges from CSV`);

  // Track results
  const updated = {};
  const skipped = [];
  const changes = [];

  // Step 2: Skip native bridges
  for (const name of bridgeNames) {
    if (NATIVE_BRIDGES.has(name)) {
      skipped.push(name);
    }
  }
  console.log(`\n⏭️  Skipping ${skipped.length} native bridges`);

  // Step 3: Fetch from all APIs in parallel
  const [lifiResults, acrossResults, relayResults, stargateResults, debridgeResults, bungeeResults] =
    await Promise.all([
      fetchLiFiBridges(normMap),
      fetchAcrossChains(normMap),
      fetchRelayChains(normMap),
      fetchStargateChains(normMap),
      fetchDeBridgeChains(normMap),
      fetchBungeeChains(normMap),
    ]);

  // Merge results — direct APIs override LI.FI for bridges that have both
  const apiResults = {
    ...lifiResults,
    ...debridgeResults,
    ...acrossResults,
    ...relayResults,
    ...stargateResults,
    ...bungeeResults,
  };

  for (const [name, chains] of Object.entries(apiResults)) {
    if (bridges[name]) {
      updated[name] = chains;
    }
  }

  console.log(`\n📊 API coverage: ${Object.keys(updated).length} bridges`);

  // Bridges not covered by any API
  const notCovered = bridgeNames.filter(
    (name) => !NATIVE_BRIDGES.has(name) && !updated[name]
  );
  if (notCovered.length > 0) {
    console.log(
      `\n⏭️  No API data for ${notCovered.length} bridges (keeping existing): ${notCovered.join(', ')}`
    );
  }

  // Step 4: Apply updates and compute diffs
  console.log('\n' + '='.repeat(50));
  console.log('📝 CHANGES:');
  console.log('='.repeat(50));

  for (const name of bridgeNames) {
    if (updated[name]) {
      const diff = diffChains(bridges[name].supportedChains, updated[name]);
      bridges[name].supportedChains = updated[name];

      if (diff.added.length > 0 || diff.removed.length > 0) {
        changes.push({ name, diff });
        console.log(`\n  ${name}:`);
        if (diff.added.length > 0) {
          console.log(`    + Added: ${diff.added.join(', ')}`);
        }
        if (diff.removed.length > 0) {
          console.log(`    - Removed: ${diff.removed.join(', ')}`);
        }
      }
    }
  }

  if (changes.length === 0) {
    console.log('\n  No changes detected.');
  }

  // Step 5: Write CSV
  console.log('\n💾 Writing updated CSV...');
  writeUpdatedCSV(bridges);
  console.log('  ✅ Bridges-Grid view.csv updated');

  // Step 5.5: Sync networks from CSV to database
  console.log('\n💾 Syncing networks to database...');
  const networksData = fs.readFileSync('Networks-Grid view.csv', 'utf-8');
  const networksParsed = Papa.parse(networksData, {
    header: true,
    skipEmptyLines: true,
  });
  let networksUpserted = 0;
  for (const row of networksParsed.data) {
    const name = row.network_name?.trim();
    if (!name) continue;
    const aliases = row.common_aliases
      ? row.common_aliases.split(',').map((a) => a.trim())
      : [];
    try {
      await prisma.network.upsert({
        where: { networkName: name },
        update: { commonAliases: aliases },
        create: { networkName: name, commonAliases: aliases },
      });
      networksUpserted++;
    } catch (err) {
      console.error(`  ❌ Network upsert failed for ${name}: ${err.message}`);
    }
  }
  console.log(`  ✅ Synced ${networksUpserted} networks`);

  // Step 6: Update database
  console.log('\n💾 Updating database...');
  let dbUpdated = 0;
  let dbErrors = 0;

  for (const name of bridgeNames) {
    if (updated[name]) {
      try {
        await prisma.bridge.update({
          where: { bridgeName: name },
          data: { supportedChains: updated[name] },
        });
        dbUpdated++;
      } catch (err) {
        dbErrors++;
        console.error(`  ❌ DB update failed for ${name}: ${err.message}`);
      }
    }
  }

  console.log(`  ✅ Updated ${dbUpdated} bridges in database`);
  if (dbErrors > 0) {
    console.log(`  ❌ ${dbErrors} database update errors`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`  Updated via APIs: ${Object.keys(updated).length} bridges`);
  console.log(`  Skipped (native): ${skipped.length} bridges`);
  console.log(`  Not covered (kept existing): ${notCovered.length} bridges`);
  console.log(`  Total changes: ${changes.length} bridges modified`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  prisma.$disconnect();
  process.exit(1);
});
