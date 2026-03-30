import { CHAIN_IDS, CHAIN_SLUGS } from './chain-ids';

type UrlBuilder = (
  baseUrl: string,
  fromChain: string,
  toChain: string
) => string | null;

function id(chain: string): number | null {
  return CHAIN_IDS[chain] ?? null;
}

function slug(chain: string): string | null {
  return CHAIN_SLUGS[chain] ?? null;
}

// Per-bridge URL builders
const BRIDGE_BUILDERS: Record<string, UrlBuilder> = {
  Across: (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://app.across.to/bridge?originChainId=${f}&destinationChainId=${t}`;
  },

  Jumper: (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://jumper.exchange/?fromChain=${f}&toChain=${t}`;
  },

  Stargate: (_, from, to) => {
    const f = slug(from),
      t = slug(to);
    if (!f || !t) return null;
    return `https://stargate.finance/bridge?srcChain=${f}&dstChain=${t}`;
  },

  'Bungee Exchange': (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://bungee.exchange/?originChainId=${f}&destinationChainId=${t}`;
  },

  Relay: (_, from, to) => {
    const f = id(from),
      t = slug(to);
    if (!f || !t) return null;
    return `https://relay.link/bridge/${t}?fromChainId=${f}`;
  },

  deBridge: (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://app.debridge.finance/deswap?inputChain=${f}&outputChain=${t}`;
  },

  Hop: (_, from, to) => {
    const f = slug(from),
      t = slug(to);
    if (!f || !t) return null;
    return `https://app.hop.exchange/send?sourceNetwork=${f}&destNetwork=${t}`;
  },

  Orbiter: (_, from, to) => {
    return `https://www.orbiter.finance/bridge/${from}/${to}`;
  },

  Synapse: (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://synapseprotocol.com/?fromChainId=${f}&toChainId=${t}`;
  },

  cBridge: (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://cbridge.celer.network/${f}/${t}/USDC`;
  },

  Nitro: (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://app.routernitro.com/swap?fromChainId=${f}&toChainId=${t}`;
  },

  Rubic: (_, from, to) => {
    // Rubic uses uppercase short slugs
    const RUBIC_SLUGS: Record<string, string> = {
      Ethereum: 'ETH',
      Arbitrum: 'ARBITRUM',
      Optimism: 'OPTIMISM',
      Polygon: 'POLYGON',
      'BNB Chain': 'BSC',
      Base: 'BASE',
      Avalanche: 'AVALANCHE',
      Fantom: 'FANTOM',
      Linea: 'LINEA',
      'zkSync Era': 'ZKSYNC',
      Scroll: 'SCROLL',
      Blast: 'BLAST',
      Mantle: 'MANTLE',
      Solana: 'SOLANA',
      Metis: 'METIS',
      Moonbeam: 'MOONBEAM',
      Cronos: 'CRONOS',
      Gnosis: 'GNOSIS',
      Celo: 'CELO',
      Aurora: 'AURORA',
      Tron: 'TRON',
      Bitcoin: 'BITCOIN',
    };
    const f = RUBIC_SLUGS[from],
      t = RUBIC_SLUGS[to];
    if (!f || !t) return null;
    return `https://app.rubic.exchange/?fromChain=${f}&toChain=${t}`;
  },

  Squid: (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://app.squidrouter.com/?chains=${f},${t}`;
  },

  'OP Superchain Bridge': (_, _from, to) => {
    // Superbridge is always from Ethereum to an L2
    const s = slug(to);
    if (!s) return null;
    return `https://superbridge.app/${s}`;
  },

  yBridge: (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://app.xy.finance/?sourceChainId=${f}&targetChainId=${t}`;
  },

  Symbiosis: (_, from, to) => {
    const f = id(from),
      t = id(to);
    if (!f || !t) return null;
    return `https://app.symbiosis.finance/swap?chainIn=${f}&chainOut=${t}`;
  },
};

export function buildBridgeUrl(
  bridgeName: string,
  baseUrl: string,
  sourceChain: string,
  destChain: string
): string {
  const builder = BRIDGE_BUILDERS[bridgeName];
  if (builder) {
    const url = builder(baseUrl, sourceChain, destChain);
    if (url) return url;
  }
  // Fallback to base URL
  return baseUrl;
}
