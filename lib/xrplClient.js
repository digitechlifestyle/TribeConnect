/**
 * TribeConnect — Native XRPL Client (xrpl.js)
 * Handles all native XRP Ledger operations:
 *   – account info, balance
 *   – XRP payments (premium, creator subs)
 *   – XRPL NFTs (verification badges, membership tokens)
 *   – Transaction memos (post CID anchoring)
 */
import { Client, convertStringToHex, dropsToXrp, xrpToDrops } from "xrpl";

const WS_URLS = {
  mainnet: process.env.NEXT_PUBLIC_XRPL_WS_MAINNET || "wss://xrplcluster.com",
  testnet: process.env.NEXT_PUBLIC_XRPL_WS_TESTNET || "wss://s.altnet.rippletest.net:51233",
  devnet:  process.env.NEXT_PUBLIC_XRPL_WS_DEVNET  || "wss://s.devnet.rippletest.net:51233",
};

const NETWORK = process.env.NEXT_PUBLIC_XRPL_NETWORK || "testnet";
const WS_URL  = WS_URLS[NETWORK];

let _client = null;

/** Get (or create) a singleton XRPL client */
export async function getXrplClient() {
  if (_client && _client.isConnected()) return _client;
  _client = new Client(WS_URL);
  await _client.connect();
  return _client;
}

/** Disconnect cleanly (call on page unload / SSR) */
export async function disconnectXrplClient() {
  if (_client && _client.isConnected()) {
    await _client.disconnect();
    _client = null;
  }
}

// ── Account ────────────────────────────────────────────────────────────

/** Fetch account info + XRP balance */
export async function getAccountInfo(address) {
  const client = await getXrplClient();
  try {
    const res = await client.request({ command: "account_info", account: address, ledger_index: "validated" });
    const acct = res.result.account_data;
    return {
      address,
      balance:      dropsToXrp(acct.Balance),
      sequence:     acct.Sequence,
      ownerCount:   acct.OwnerCount,
      domain:       acct.Domain ? Buffer.from(acct.Domain, "hex").toString() : null,
      emailHash:    acct.EmailHash || null,
    };
  } catch (e) {
    if (e?.data?.error === "actNotFound") return null; // unfunded account
    throw e;
  }
}

/** Fetch XRP balance in drops */
export async function getBalance(address) {
  const info = await getAccountInfo(address);
  return info ? info.balance : "0";
}

// ── NFTs (Verification Badges & Membership Tokens) ────────────────────

/** Fetch all NFTs owned by an address */
export async function getAccountNFTs(address) {
  const client = await getXrplClient();
  const res = await client.request({ command: "account_nfts", account: address });
  return res.result.account_nfts || [];
}

/**
 * Build an NFTokenMint transaction for a verification badge.
 * Must be signed and submitted via Xaman.
 * @param {string} issuer         – platform treasury address
 * @param {string} metadataCID    – IPFS CID of badge metadata JSON
 * @param {string} recipient      – wallet to mint to (same as issuer for self-mint + transfer)
 */
export function buildVerificationBadgeMint(issuer, metadataCID) {
  return {
    TransactionType: "NFTokenMint",
    Account:         issuer,
    NFTokenTaxon:    1,           // 1 = Verification badges
    Flags:           8,           // tfTransferable
    URI:             convertStringToHex(`ipfs://${metadataCID}`),
    Memos: [{
      Memo: {
        MemoType: convertStringToHex("tc:badge"),
        MemoData: convertStringToHex("verification"),
      },
    }],
  };
}

/**
 * Build an NFTokenMint for a premium membership token.
 * @param {string} issuer
 * @param {string} metadataCID
 * @param {number} tierLevel  1=Pro, 2=Creator
 */
export function buildMembershipTokenMint(issuer, metadataCID, tierLevel) {
  return {
    TransactionType: "NFTokenMint",
    Account:         issuer,
    NFTokenTaxon:    2,           // 2 = Membership tokens
    Flags:           0,           // non-transferable
    URI:             convertStringToHex(`ipfs://${metadataCID}`),
    Memos: [{
      Memo: {
        MemoType: convertStringToHex("tc:membership"),
        MemoData: convertStringToHex(tierLevel === 2 ? "creator" : "pro"),
      },
    }],
  };
}

// ── XRP Payments ──────────────────────────────────────────────────────

const PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_XRPL_ADDRESS ||
                         process.env.PLATFORM_XRPL_ADDRESS || "";

/**
 * Build an XRP Payment tx for premium upgrade.
 * Must be signed and submitted via Xaman.
 */
export function buildPremiumPaymentTx(fromAddress, tierLabel, months) {
  const pricePerMonth = tierLabel === "creator"
    ? Number(process.env.NEXT_PUBLIC_CREATOR_PRICE_DROPS || 12_000_000)
    : Number(process.env.NEXT_PUBLIC_PRO_PRICE_DROPS     || 5_000_000);

  const totalDrops = String(pricePerMonth * months);

  return {
    TransactionType: "Payment",
    Account:         fromAddress,
    Destination:     PLATFORM_ADDRESS,
    Amount:          totalDrops,
    Memos: [{
      Memo: {
        MemoType: convertStringToHex("tc:premium"),
        MemoData: convertStringToHex(JSON.stringify({ tier: tierLabel, months })),
      },
    }],
  };
}

/**
 * Build an XRP Payment tx for a creator subscription.
 */
export function buildCreatorSubPaymentTx(fromAddress, creatorAddress, tierName, priceDrops) {
  // Platform takes 15%, creator gets 85%
  const creatorCut  = Math.floor(Number(priceDrops) * 0.85);
  const platformCut = Number(priceDrops) - creatorCut;

  // Primary payment to creator; platform fee tracked separately
  return {
    TransactionType: "Payment",
    Account:         fromAddress,
    Destination:     creatorAddress,
    Amount:          String(creatorCut),
    Memos: [{
      Memo: {
        MemoType: convertStringToHex("tc:sub"),
        MemoData: convertStringToHex(JSON.stringify({ tier: tierName, fee: platformCut })),
      },
    }],
  };
}

// ── Post anchoring on XRPL ────────────────────────────────────────────

/**
 * Build an AccountSet tx that anchors a post IPFS CID on-chain.
 * Cheap (base fee ~10 drops) — creates an immutable on-chain reference.
 */
export function buildPostAnchorTx(fromAddress, ipfsCid, postId) {
  return {
    TransactionType: "Payment",
    Account:         fromAddress,
    Destination:     fromAddress,   // self-payment (0 drops — just to attach memo)
    Amount:          "0",
    Memos: [{
      Memo: {
        MemoType: convertStringToHex("tc:post"),
        MemoData: convertStringToHex(JSON.stringify({ cid: ipfsCid, id: postId })),
      },
    }],
  };
}

// ── Utilities ─────────────────────────────────────────────────────────

export { dropsToXrp, xrpToDrops };

export function truncateAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export function xrplExplorerUrl(type, value) {
  const base = process.env.NEXT_PUBLIC_XRPL_EXPLORER ||
    (NETWORK === "mainnet" ? "https://livenet.xrpl.org" : "https://testnet.xrpl.org");
  return `${base}/${type}/${value}`;
}
