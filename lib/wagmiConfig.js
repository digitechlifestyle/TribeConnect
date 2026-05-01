/**
 * TribeConnect — wagmi config (WalletConnect only, no MetaMask)
 * Used for XRPL EVM Sidechain smart contract interactions.
 */
import { createConfig, http } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";

// ── XRPL EVM chain definitions ─────────────────────────────────────────
export const xrplEvmDevnet = defineChain({
  id: 1440002,
  name: "XRPL EVM Devnet",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.evm.devnet.xrpl.org"] },
    public:  { http: ["https://rpc.evm.devnet.xrpl.org"] },
  },
  blockExplorers: {
    default: { name: "XRPL EVM Explorer", url: "https://evm-sidechain.xrpl.org" },
  },
  testnet: true,
});

export const xrplEvmTestnet = defineChain({
  id: 1449000,
  name: "XRPL EVM Testnet",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.evm.testnet.xrpl.org"] },
    public:  { http: ["https://rpc.evm.testnet.xrpl.org"] },
  },
  blockExplorers: {
    default: { name: "XRPL EVM Testnet Explorer", url: "https://explorer.evm.testnet.xrpl.org" },
  },
  testnet: true,
});

export const xrplEvmMainnet = defineChain({
  id: 1440001,
  name: "XRPL EVM",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.evm.xrpl.org"] },
    public:  { http: ["https://rpc.evm.xrpl.org"] },
  },
  blockExplorers: {
    default: { name: "XRPL EVM Explorer", url: "https://evm.xrpl.org" },
  },
});

// ── WalletConnect-only wagmi config ────────────────────────────────────
const WC_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

export const wagmiConfig = createConfig({
  chains: [xrplEvmDevnet, xrplEvmTestnet, xrplEvmMainnet],
  connectors: [
    walletConnect({
      projectId: WC_PROJECT_ID,
      metadata: {
        name:        "TribeConnect",
        description: "Decentralised social media on XRPL",
        url:         process.env.NEXT_PUBLIC_APP_URL || "https://tribeconnect.app",
        icons:       ["https://tribeconnect.app/logo.png"],
      },
      showQrModal: true,          // WalletConnect shows its own QR modal
    }),
  ],
  transports: {
    [xrplEvmDevnet.id]:  http("https://rpc.evm.devnet.xrpl.org"),
    [xrplEvmTestnet.id]: http("https://rpc.evm.testnet.xrpl.org"),
    [xrplEvmMainnet.id]: http("https://rpc.evm.xrpl.org"),
  },
});

export const ACTIVE_CHAIN = (() => {
  const net = process.env.NEXT_PUBLIC_XRPL_NETWORK || "devnet";
  if (net === "mainnet") return xrplEvmMainnet;
  if (net === "testnet") return xrplEvmTestnet;
  return xrplEvmDevnet;
})();
