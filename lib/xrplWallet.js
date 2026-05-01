/**
 * TribeConnect — XRPL Wallet Manager
 *
 * Supports:
 *   • Crossmark  — browser extension, native XRPL + EVM (primary)
 *   • XUMM/Xaman — mobile QR-code wallet, native XRPL
 *
 * No MetaMask. No Ethereum-centric wallet kit.
 * Crossmark signs both native XRPL txs AND XRPL EVM txs.
 */
import { ethers } from "ethers";

// ── Wallet types ───────────────────────────────────────────────────────
export const WALLET_TYPE = {
  CROSSMARK: "crossmark",
  XUMM:      "xumm",
  NONE:      null,
};

// ── Crossmark ─────────────────────────────────────────────────────────

/**
 * Check if Crossmark extension is installed
 */
export function isCrossmarkInstalled() {
  if (typeof window === "undefined") return false;
  return typeof window.crossmark !== "undefined";
}

/**
 * Connect to Crossmark wallet
 * @returns {{ address: string, evmAddress: string, provider: ethers.providers.Web3Provider }}
 */
export async function connectCrossmark() {
  if (!isCrossmarkInstalled()) {
    throw new Error("Crossmark not installed. Get it at https://crossmark.io");
  }

  // Request sign-in
  const { response } = await window.crossmark.signInAndWait();
  if (!response?.data?.address) {
    throw new Error("Crossmark: no address returned");
  }

  const xrplAddress = response.data.address; // r... address

  // Crossmark also exposes an EVM provider (for XRPL EVM Sidechain)
  // The EVM address is derived from the same key
  let provider = null;
  let evmAddress = null;

  if (window.crossmark?.ethereum) {
    provider   = new ethers.providers.Web3Provider(window.crossmark.ethereum, "any");
    const signer = provider.getSigner();
    evmAddress   = await signer.getAddress();
  }

  return { xrplAddress, evmAddress, provider, walletType: WALLET_TYPE.CROSSMARK };
}

/**
 * Get a signer for XRPL EVM transactions via Crossmark
 */
export function getCrossmarkSigner() {
  if (!isCrossmarkInstalled() || !window.crossmark?.ethereum) {
    throw new Error("Crossmark EVM provider not available");
  }
  const provider = new ethers.providers.Web3Provider(window.crossmark.ethereum, "any");
  return provider.getSigner();
}

/**
 * Sign and submit a native XRPL transaction via Crossmark
 * @param {object} tx  — XRPL transaction object (e.g. Payment, NFTokenMint…)
 */
export async function crossmarkSignAndSubmit(tx) {
  if (!isCrossmarkInstalled()) throw new Error("Crossmark not installed");
  const { response } = await window.crossmark.signAndSubmitAndWait(tx);
  if (!response?.data?.resp?.result) throw new Error("Crossmark: tx failed");
  return response.data.resp.result;
}

// ── XUMM/Xaman ────────────────────────────────────────────────────────

/**
 * Initiate a XUMM sign-in QR code flow
 * Returns a QR URL to display to the user + a resolve function that
 * resolves with { xrplAddress } once the user scans and approves.
 *
 * Requires your XUMM API key set server-side via /api/xumm/signin
 */
export async function initiateXUMMSignIn() {
  const res = await fetch("/api/xumm/signin", { method: "POST" });
  if (!res.ok) throw new Error("XUMM sign-in request failed");
  const { uuid, qrUrl, wsUrl } = await res.json();

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.signed && data.account) {
          ws.close();
          resolve({ xrplAddress: data.account, uuid });
        }
        if (data.expired || data.rejected) {
          ws.close();
          reject(new Error("XUMM sign-in expired or rejected"));
        }
      } catch (_) {}
    };
    ws.onerror = (e) => reject(e);
  });
}

// ── Unified wallet state ───────────────────────────────────────────────

/**
 * Restore a session from localStorage
 */
export function restoreSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("tc-wallet-session");
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

export function saveSession(session) {
  if (typeof window === "undefined") return;
  localStorage.setItem("tc-wallet-session", JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tc-wallet-session");
}

// ── EVM contract helper ────────────────────────────────────────────────

/**
 * Build an ethers contract instance backed by the active wallet
 * Works with Crossmark EVM provider
 */
export function buildContract(contractAddress, abi, signerOrProvider) {
  return new ethers.Contract(contractAddress, abi, signerOrProvider);
}

/**
 * Switch the Crossmark EVM provider to the XRPL EVM chain
 */
export async function switchToXrplEVM(chainId = 1440002) {
  if (!window.crossmark?.ethereum) return;
  try {
    await window.crossmark.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (e) {
    // Chain not added — add it
    if (e.code === 4902) {
      await addXrplEvmNetwork(chainId);
    }
  }
}

async function addXrplEvmNetwork(chainId) {
  const networks = {
    1440002: {
      chainName:            "XRPL EVM Devnet",
      rpcUrls:              ["https://rpc.evm.devnet.xrpl.org"],
      nativeCurrency:       { name: "XRP", symbol: "XRP", decimals: 18 },
      blockExplorerUrls:    ["https://evm-sidechain.xrpl.org"],
    },
    1449000: {
      chainName:            "XRPL EVM Testnet",
      rpcUrls:              ["https://rpc.evm.testnet.xrpl.org"],
      nativeCurrency:       { name: "XRP", symbol: "XRP", decimals: 18 },
      blockExplorerUrls:    ["https://explorer.evm.testnet.xrpl.org"],
    },
    1440001: {
      chainName:            "XRPL EVM",
      rpcUrls:              ["https://rpc.evm.xrpl.org"],
      nativeCurrency:       { name: "XRP", symbol: "XRP", decimals: 18 },
      blockExplorerUrls:    ["https://evm.xrpl.org"],
    },
  };

  const net = networks[chainId];
  if (!net) throw new Error("Unknown XRPL EVM chain ID: " + chainId);

  await window.crossmark.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{ chainId: `0x${chainId.toString(16)}`, ...net }],
  });
}
