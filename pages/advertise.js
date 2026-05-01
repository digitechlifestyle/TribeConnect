/**
 * TribeConnect — Advertise with Us
 * Self-serve ad booking page. Payments accepted in XRP via Xaman.
 */
import Layout      from "../components/Layout/Layout";
import { useWeb3 } from "../contexts/Web3Context";
import { useXrpPrice } from "../lib/useXrpPrice";

const AD_PACKAGES = [
  {
    id:    "starter",
    name:  "Starter",
    usd:   50,
    color: "#6C63FF",
    period: "per week",
    features: [
      "Sidebar banner (300×250)",
      "~5,000 impressions/week",
      "Crypto-native audience",
      "Pay in XRP or USD",
    ],
  },
  {
    id:    "growth",
    name:  "Growth",
    usd:   200,
    color: "#F5A623",
    badge: "Most Popular",
    period: "per week",
    features: [
      "Feed sponsored posts",
      "Sidebar banner",
      "~25,000 impressions/week",
      "Click analytics dashboard",
      "Target by interest / location",
      "Pay in XRP or USD",
    ],
  },
  {
    id:    "premium",
    name:  "Premium",
    usd:   600,
    color: "#9C6FFF",
    period: "per week",
    features: [
      "Everything in Growth",
      "Video feed overlay ads",
      "Homepage takeover (24h)",
      "~80,000 impressions/week",
      "Dedicated account manager",
      "Custom creative support",
      "Pay in XRP or USD",
    ],
  },
];

const STATS = [
  ["👥", "50,000+", "Monthly active users"],
  ["💰", "80%", "Hold or trade XRP"],
  ["📱", "3.2 min", "Avg session length"],
  ["🌍", "120+", "Countries"],
];

export default function AdvertisePage({ theme, setTheme }) {
  const { isConnected, openModal, xamanSendTx, xrplAddress } = useWeb3();
  const { xrpPrice, usdToXrp, usdToDrops, loading: priceLoading } = useXrpPrice();

  async function handleBook(pkg) {
    if (!isConnected) { openModal(); return; }
    const drops = usdToDrops(pkg.usd);
    const p = await xamanSendTx({
      TransactionType: "Payment",
      Account:          xrplAddress,
      Destination:      "rTribeConnectAds",
      Amount:           drops,
      Memos: [{ Memo: {
        MemoType: Buffer.from("tc:ad-booking", "utf8").toString("hex").toUpperCase(),
        MemoData: Buffer.from(pkg.id, "utf8").toString("hex").toUpperCase(),
      }}],
    }, { identifier: "tc-ad-booking", instruction: `Book ${pkg.name} ad package — $${pkg.usd}` });
    if (p?.deepLink) window.open(p.deepLink, "_blank");
  }

  return (
    <Layout title="Advertise" theme={theme} setTheme={setTheme}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📣</div>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 12px" }}>Advertise on TribeConnect</h1>
          <p style={{ fontSize: 16, color: "var(--tc-text-muted, #64748b)", maxWidth: 520, margin: "0 auto 24px" }}>
            Reach a crypto-native, creator-focused audience. Pay with XRP — converted from USD at the live rate.
          </p>

          {/* XRP price chip */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "var(--tc-card, #1e293b)", borderRadius: 9999, border: "1px solid var(--tc-border, rgba(255,255,255,0.08))", fontSize: 13 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            {priceLoading ? "Fetching XRP rate…" : <>1 XRP = <strong style={{ marginLeft: 4 }}>${xrpPrice?.toFixed(4)}</strong></>}
          </div>
        </div>

        {/* Audience stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 48 }}>
          {STATS.map(([icon, val, lbl]) => (
            <div key={lbl} style={{ background: "var(--tc-card, #1e293b)", borderRadius: 12, padding: "18px 16px", border: "1px solid var(--tc-border, rgba(255,255,255,0.08))", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#6C63FF" }}>{val}</div>
              <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Packages */}
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, textAlign: "center" }}>Ad Packages</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 48 }}>
          {AD_PACKAGES.map(pkg => (
            <div key={pkg.id} style={{
              background:   "var(--tc-card, #1e293b)",
              border:       `2px solid ${pkg.badge ? pkg.color : "var(--tc-border, rgba(255,255,255,0.08))"}`,
              borderRadius: 16,
              padding:      "24px",
              position:     "relative",
            }}>
              {pkg.badge && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: pkg.color, color: "#1A1D2E", fontSize: 11, fontWeight: 800, padding: "4px 16px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                  {pkg.badge}
                </div>
              )}

              <h3 style={{ fontSize: 20, fontWeight: 800, color: pkg.color, margin: "0 0 8px" }}>{pkg.name}</h3>

              {/* USD primary */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 900 }}>${pkg.usd}</span>
                <span style={{ fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>{pkg.period}</span>
              </div>
              {/* XRP equivalent */}
              <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginBottom: 20 }}>
                ≈ {priceLoading ? "…" : `${usdToXrp(pkg.usd)} XRP`} at live rate
              </div>

              <ul style={{ padding: 0, margin: "0 0 20px", listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {pkg.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--tc-text-secondary, #94a3b8)" }}>
                    <span style={{ color: "#22c55e", flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBook(pkg)}
                style={{ width: "100%", padding: "11px", background: `linear-gradient(135deg, ${pkg.color}, ${pkg.color}CC)`, color: pkg.color === "#F5A623" ? "#1A1D2E" : "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Book with Xaman
              </button>
            </div>
          ))}
        </div>

        {/* Custom / Enterprise */}
        <div style={{ padding: "28px", background: "linear-gradient(135deg,rgba(108,99,255,0.1),rgba(156,111,255,0.05))", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 16, textAlign: "center" }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>Need something custom?</h3>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--tc-text-muted, #64748b)" }}>
            Sponsored Spaces sessions, creator takeovers, NFT drops, token-gated campaigns — we can build it.
          </p>
          <a
            href="mailto:ads@tribeconnect.io"
            style={{ display: "inline-block", padding: "10px 28px", background: "#6C63FF", color: "#fff", borderRadius: 9999, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
          >
            Contact Partnerships →
          </a>
        </div>

      </div>
    </Layout>
  );
}
