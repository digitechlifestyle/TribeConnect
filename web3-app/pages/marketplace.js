/**
 * TribeConnect — NFT Marketplace
 * Buy, sell, and mint content NFTs — all settled in XRP via Xaman.
 * Every viral post, video, or moment can be minted as an XRPL NFT.
 */
import { useState }  from "react";
import Layout        from "../components/Layout/Layout";
import { useWeb3 }   from "../contexts/Web3Context";
import { xrplExplorerUrl } from "../lib/xrplClient";

const FEATURED = [
  { id: 1, title: "XRPL Genesis Block Art",  creator: "Carol", price: "120 XRP", bids: 14, type: "Image",  rarity: "Legendary", img: "https://picsum.photos/seed/nft1/300/300", verified: true },
  { id: 2, title: "Viral Moment #1 — XRPL",  creator: "Alice", price: "45 XRP",  bids: 7,  type: "Video",  rarity: "Rare",      img: "https://picsum.photos/seed/nft2/300/300", verified: true },
  { id: 3, title: "Tribe OG Badge",           creator: "TC",    price: "10 XRP",  bids: 32, type: "Badge",  rarity: "Common",    img: "https://picsum.photos/seed/nft3/300/300", verified: false },
  { id: 4, title: "DeFi Dreams — Generative", creator: "Frank", price: "78 XRP",  bids: 5,  type: "Image",  rarity: "Epic",      img: "https://picsum.photos/seed/nft4/300/300", verified: false },
  { id: 5, title: "Live Stream Highlight #7", creator: "Carol", price: "25 XRP",  bids: 9,  type: "Video",  rarity: "Rare",      img: "https://picsum.photos/seed/nft5/300/300", verified: true },
  { id: 6, title: "Creator Verified Seal",    creator: "TC",    price: "5 XRP",   bids: 61, type: "Badge",  rarity: "Common",    img: "https://picsum.photos/seed/nft6/300/300", verified: false },
];

const RARITY_COLORS = { Legendary: "#F5A623", Epic: "#9C6FFF", Rare: "#3b82f6", Common: "#64748b" };

function NFTCard({ nft, onBuy, onMint }) {
  return (
    <div style={{ background: "var(--tc-card, #1e293b)", borderRadius: 16, overflow: "hidden", border: "1px solid var(--tc-border, rgba(255,255,255,0.08))", transition: "transform 0.2s" }}>
      <div style={{ position: "relative" }}>
        <img src={nft.img} alt={nft.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 9999, background: RARITY_COLORS[nft.rarity], color: nft.rarity === "Common" ? "#fff" : "#1A1D2E" }}>
          {nft.rarity}
        </span>
        <span style={{ position: "absolute", top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 9999, background: "rgba(0,0,0,0.7)", color: "#fff" }}>
          {nft.type}
        </span>
      </div>
      <div style={{ padding: "14px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: "var(--tc-text-primary, #E8ECF4)" }}>{nft.title}</div>
        <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginBottom: 12 }}>
          by {nft.creator} {nft.verified && "✓"} · {nft.bids} bids
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)" }}>Current price</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#F5A623" }}>💰 {nft.price}</div>
          </div>
          <button onClick={() => onBuy(nft)} style={{ padding: "8px 16px", background: "#6C63FF", border: "none", borderRadius: 9999, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage({ theme, setTheme }) {
  const { isConnected, openModal, xamanSendTx, xrplAddress, mintVerificationBadge } = useWeb3();
  const [filter,   setFilter]   = useState("All");
  const [buying,   setBuying]   = useState(null);
  const [payload,  setPayload]  = useState(null);

  const filters = ["All", "Image", "Video", "Badge", "Legendary", "Rare"];

  const filtered = filter === "All" ? FEATURED : FEATURED.filter(n => n.type === filter || n.rarity === filter);

  async function handleBuy(nft) {
    if (!isConnected) { openModal(); return; }
    setBuying(nft.id);
    const priceDrops = String(parseFloat(nft.price) * 1_000_000);
    const p = await xamanSendTx({
      TransactionType: "Payment",
      Account:          xrplAddress,
      Destination:      "rNFTMarketTreasury",
      Amount:           priceDrops,
      Memos: [{ Memo: {
        MemoType: Buffer.from("tc:nft-buy","utf8").toString("hex").toUpperCase(),
        MemoData: Buffer.from(nft.title,"utf8").toString("hex").toUpperCase(),
      }}],
    }, { identifier: "tc-nft-buy", instruction: `Buy "${nft.title}" — ${nft.price}` });
    if (p?.deepLink) window.open(p.deepLink, "_blank");
    setPayload(p);
    setBuying(null);
  }

  return (
    <Layout title="Marketplace" theme={theme} setTheme={setTheme}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>🎨 NFT Marketplace</h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>All NFTs on XRPL · Instant settlement · Near-zero fees</p>
          </div>
          <button
            onClick={() => isConnected ? {} : openModal()}
            style={{ padding: "10px 20px", background: "linear-gradient(135deg,#6C63FF,#9C6FFF)", color: "#fff", border: "none", borderRadius: 9999, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            + Mint NFT
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {[["🎨","2,840","NFTs Minted"],["💰","14,203 XRP","Total Volume"],["👥","892","Collectors"],["⚡","3s","Avg Settle Time"]].map(([icon,val,lbl]) => (
            <div key={lbl} style={{ flex: 1, minWidth: 140, background: "var(--tc-card, #1e293b)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--tc-border, rgba(255,255,255,0.08))", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#6C63FF" }}>{val}</div>
              <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)" }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:      "7px 16px",
              background:   filter === f ? "#6C63FF" : "var(--tc-card, #1e293b)",
              border:       `1px solid ${filter === f ? "#6C63FF" : "var(--tc-border, rgba(255,255,255,0.1))"}`,
              borderRadius: 9999,
              color:        filter === f ? "#fff" : "var(--tc-text-secondary, #94a3b8)",
              fontWeight:   filter === f ? 700 : 500,
              fontSize:     13,
              cursor:       "pointer",
            }}>{f}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {filtered.map(nft => (
            <NFTCard key={nft.id} nft={nft} onBuy={handleBuy} />
          ))}
        </div>

        {/* XRPL proof */}
        <div style={{ marginTop: 32, padding: "16px 20px", background: "rgba(108,99,255,0.06)", borderRadius: 14, border: "1px solid rgba(108,99,255,0.2)", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>
            🔗 All NFTs are native XRPL NFTokens — view on{" "}
            <a href="https://testnet.xrpl.org/nfts" target="_blank" rel="noopener noreferrer" style={{ color: "#6C63FF" }}>XRPL Explorer ↗</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
