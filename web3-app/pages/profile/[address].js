/**
 * TribeConnect — Profile Page
 * Route: /profile/[address]
 *
 * Shows XRPL native profile info (NFTs, balance, verified badge)
 * and EVM smart-contract social data (posts, followers, creator tiers).
 */
import { useRouter }         from "next/router";
import { useState, useEffect } from "react";
import Layout                from "../../components/Layout/Layout";
import { useWeb3 }           from "../../contexts/Web3Context";
import { getAccountInfo, getAccountNFTs, truncateAddress, xrplExplorerUrl } from "../../lib/xrplClient";

// ── Helpers ───────────────────────────────────────────────────────────────
function StatBox({ label, value }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 16px" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--tc-text-primary, #E8ECF4)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Creator Tiers Panel ───────────────────────────────────────────────────
function CreatorTiers({ address, isOwn }) {
  const { sendCreatorSub, xrplAddress, openModal, isConnected } = useWeb3();
  const [payload, setPayload] = useState(null);

  // Demo tiers — in production, fetch from smart contract
  const tiers = [
    { id: 1, name: "Supporter",  price: "1000000",  desc: "Access to supporter-only posts" },
    { id: 2, name: "Insider",    price: "3000000",  desc: "Behind-the-scenes + early access" },
    { id: 3, name: "VIP",        price: "10000000", desc: "1-on-1 DM + exclusive content" },
  ];

  async function handleSubscribe(tier) {
    if (!isConnected) { openModal(); return; }
    const p = await sendCreatorSub(address, tier.name, tier.price);
    if (p?.deepLink) window.open(p.deepLink, "_blank");
    setPayload(p);
  }

  if (!tiers.length) return null;

  return (
    <div style={card}>
      <h3 style={sectionTitle}>🎬 Creator Tiers</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tiers.map(t => (
          <div key={t.id} style={{
            display:      "flex",
            alignItems:   "center",
            gap:          16,
            padding:      "14px",
            background:   "var(--tc-bg-input, #252840)",
            borderRadius: 10,
            border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tc-text-primary, #E8ECF4)" }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginTop: 2 }}>{t.desc}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF", marginTop: 4 }}>
                {(Number(t.price) / 1_000_000).toFixed(1)} XRP/month
              </div>
            </div>
            {!isOwn && (
              <button onClick={() => handleSubscribe(t)} style={purpleBtn}>
                Subscribe
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NFT Gallery ───────────────────────────────────────────────────────────
function NFTGallery({ nfts }) {
  if (!nfts.length) return null;
  return (
    <div style={card}>
      <h3 style={sectionTitle}>🖼️ XRPL NFTs ({nfts.length})</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: 8 }}>
        {nfts.slice(0, 12).map(n => (
          <div key={n.NFTokenID} style={{
            aspectRatio:  "1",
            borderRadius: 8,
            background:   "linear-gradient(135deg,rgba(108,99,255,0.2),rgba(156,111,255,0.1))",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            fontSize:     20,
            border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
            title:        n.NFTokenID,
          }}>
            {n.NFTokenTaxon === 1 ? "✓" : n.NFTokenTaxon === 2 ? "👑" : "🎨"}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function ProfilePage({ theme, setTheme }) {
  const router   = useRouter();
  const { address: routeAddress } = router.query;

  const { xrplAddress, evmAddress, isConnected, followUser, openModal } = useWeb3();

  const [xrplInfo,  setXrplInfo]  = useState(null);
  const [nfts,      setNfts]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [following, setFollowing] = useState(false);

  const isOwn = routeAddress === xrplAddress || routeAddress === evmAddress;

  useEffect(() => {
    if (!routeAddress) return;
    setLoading(true);

    async function load() {
      // Fetch native XRPL data if address starts with "r" (native XRPL)
      if (routeAddress.startsWith("r")) {
        const [info, nftList] = await Promise.all([
          getAccountInfo(routeAddress).catch(() => null),
          getAccountNFTs(routeAddress).catch(() => []),
        ]);
        setXrplInfo(info);
        setNfts(nftList);
      }
      setLoading(false);
    }

    load();
  }, [routeAddress]);

  async function handleFollow() {
    if (!isConnected) { openModal(); return; }
    setFollowing(f => !f);
    await followUser(routeAddress);
  }

  if (!routeAddress || loading) {
    return (
      <Layout title="Profile" theme={theme} setTheme={setTheme}>
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 20px" }}>
          <p style={{ color: "var(--tc-text-muted, #64748b)" }}>Loading profile…</p>
        </div>
      </Layout>
    );
  }

  const isVerified = nfts.some(n => n.NFTokenTaxon === 1);
  const isCreatorBadge = nfts.some(n => n.NFTokenTaxon === 2 && n.Flags === 0);

  return (
    <Layout title="Profile" theme={theme} setTheme={setTheme}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>

        {/* Cover + Avatar */}
        <div style={{ position: "relative", marginBottom: 60 }}>
          {/* Cover */}
          <div style={{
            height:       180,
            borderRadius: "14px 14px 0 0",
            background:   "linear-gradient(135deg,#6C63FF 0%,#9C6FFF 50%,#F5A623 100%)",
          }} />

          {/* Avatar */}
          <div style={{
            position:       "absolute",
            bottom:         -44,
            left:           24,
            width:          88,
            height:         88,
            borderRadius:   "50%",
            background:     "#6C63FF",
            border:         "4px solid var(--tc-card, #1e293b)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            color:          "#fff",
            fontSize:       32,
            fontWeight:     800,
          }}>
            {routeAddress?.[1]?.toUpperCase() || "?"}
          </div>

          {/* Action buttons */}
          {!isOwn && isConnected && (
            <div style={{ position: "absolute", bottom: -36, right: 0, display: "flex", gap: 8 }}>
              <button onClick={handleFollow} style={following ? outlineBtn : purpleBtn}>
                {following ? "Following ✓" : "Follow"}
              </button>
              <button style={outlineBtn}>Message</button>
            </div>
          )}
        </div>

        {/* Identity */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                {truncateAddress(routeAddress)}
                {isVerified && (
                  <span style={{ fontSize: 16, color: "#6C63FF" }} title="Verified on XRPL">✓</span>
                )}
                {isCreatorBadge && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: "linear-gradient(135deg,#F5A623,#FFD700)", color: "#1A1D2E" }}>
                    ✦ Creator
                  </span>
                )}
              </h1>
              <a
                href={xrplExplorerUrl("accounts", routeAddress)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#6C63FF" }}
              >
                View on XRPL Explorer ↗
              </a>
            </div>

            {/* XRPL Balance */}
            {xrplInfo && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#6C63FF" }}>
                  {Number(xrplInfo.balance).toFixed(2)} XRP
                </div>
                <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)" }}>Balance</div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", borderTop: "1px solid var(--tc-border, rgba(255,255,255,0.08))", marginTop: 16, paddingTop: 16, gap: 4 }}>
            <StatBox label="Posts"     value="42"  />
            <StatBox label="Followers" value="1.2K" />
            <StatBox label="Following" value="340" />
            {xrplInfo && <StatBox label="NFTs" value={nfts.length} />}
          </div>
        </div>

        {/* NFT Gallery */}
        {nfts.length > 0 && <NFTGallery nfts={nfts} />}

        {/* Creator Tiers */}
        {isCreatorBadge && <CreatorTiers address={routeAddress} isOwn={isOwn} />}

        {/* Posts placeholder */}
        <div style={card}>
          <h3 style={sectionTitle}>📝 Posts</h3>
          <p style={{ color: "var(--tc-text-muted, #64748b)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
            No posts yet.
          </p>
        </div>
      </div>
    </Layout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const card = {
  background:   "var(--tc-card, #1e293b)",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
  borderRadius: 14,
  padding:      "20px",
  marginBottom: 16,
};

const sectionTitle = {
  fontSize:     14,
  fontWeight:   700,
  color:        "var(--tc-text-muted, #64748b)",
  textTransform:"uppercase",
  letterSpacing:"0.05em",
  margin:       "0 0 16px",
};

const purpleBtn = {
  padding:      "8px 18px",
  background:   "#6C63FF",
  color:        "#fff",
  border:       "none",
  borderRadius: 9999,
  fontWeight:   600,
  fontSize:     13,
  cursor:       "pointer",
};

const outlineBtn = {
  padding:      "8px 18px",
  background:   "transparent",
  color:        "var(--tc-text-primary, #E8ECF4)",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.2))",
  borderRadius: 9999,
  fontWeight:   600,
  fontSize:     13,
  cursor:       "pointer",
};
