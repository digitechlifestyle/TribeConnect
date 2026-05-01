/**
 * TribeConnect — XRPL EVM Chain Definitions
 *
 * The XRPL EVM Sidechain is an EVM-compatible layer anchored to the
 * XRP Ledger. It uses XRP as its native gas token and settles in ~3-5s.
 *
 * Official docs: https://docs.xrplevm.org
 * Faucet:        https://faucet.tequ.dev (devnet)
 */
import { defineChain } from "viem";

// ── XRPL EVM Devnet ───────────────────────────────────────────────────
export const xrplEvmDevnet = defineChain({
  id:   1440002,
  name: "XRPL EVM Devnet",
  nativeCurrency: {
    decimals: 18,
    name:     "XRP",
    symbol:   "XRP",
  },
  rpcUrls: {
    default: { http: ["https://rpc.evm.devnet.xrpl.org"] },
    public:  { http: ["https://rpc.evm.devnet.xrpl.org"] },
  },
  blockExplorers: {
    default: {
      name: "XRPL EVM Explorer",
      url:  "https://evm-sidechain.xrpl.org",
    },
  },
  testnet: true,
});

// ── XRPL EVM Testnet ──────────────────────────────────────────────────
export const xrplEvmTestnet = defineChain({
  id:   1449000,
  name: "XRPL EVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name:     "XRP",
    symbol:   "XRP",
  },
  rpcUrls: {
    default: { http: ["https://rpc.evm.testnet.xrpl.org"] },
    public:  { http: ["https://rpc.evm.testnet.xrpl.org"] },
  },
  blockExplorers: {
    default: {
      name: "XRPL EVM Testnet Explorer",
      url:  "https://explorer.evm.testnet.xrpl.org",
    },
  },
  testnet: true,
});

// ── XRPL EVM Mainnet (update RPC/chainId when officially launched) ───
export const xrplEvmMainnet = defineChain({
  id:   1440001,
  name: "XRPL EVM",
  nativeCurrency: {
    decimals: 18,
    name:     "XRP",
    symbol:   "XRP",
  },
  rpcUrls: {
    default: { http: ["https://rpc.evm.xrpl.org"] },
    public:  { http: ["https://rpc.evm.xrpl.org"] },
  },
  blockExplorers: {
    default: {
      name: "XRPL EVM Explorer",
      url:  "https://evm.xrpl.org",
    },
  },
  testnet: false,
});

/**
 * XRP pricing helpers
 * On XRPL EVM, 1 XRP = 1e18 wei (same as ETH but denominated in XRP)
 * Premium prices in XRP (not USD — adjust as XRP price changes)
 */
export const XRP_PRICES = {
  PRO_PER_MONTH:     "5",    // 5 XRP/month  (~$9.99 at $2 XRP)
  CREATOR_PER_MONTH: "12",   // 12 XRP/month (~$24.99 at $2 XRP)
};

export const CHAIN_EXPLORER = {
  1440002: "https://evm-sidechain.xrpl.org",
  1449000: "https://explorer.evm.testnet.xrpl.org",
  1440001: "https://evm.xrpl.org",
};

export function getTxExplorerUrl(chainId, txHash) {
  const base = CHAIN_EXPLORER[chainId] || CHAIN_EXPLORER[1440002];
  return `${base}/tx/${txHash}`;
}

export function getAddressExplorerUrl(chainId, address) {
  const base = CHAIN_EXPLORER[chainId] || CHAIN_EXPLORER[1440002];
  return `${base}/address/${address}`;
}
