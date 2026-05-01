/**
 * TribeConnect — Creator Studio
 * Only accessible to Creator-tier members.
 * Manage subscription tiers, see revenue, analytics, affiliate links.
 */
import { useState }   from "react";
import Layout         from "../components/Layout/Layout";
import { useWeb3 }    from "../contexts/Web3Context";
import { xrplExplorerUrl } from "../lib/xrplClient";

// ── Revenue Card ──────────────────────────────────────────────────────────
function RevenueCard({ title, value, sub, color = "#6C63FF" }) {
  return (
    <div style={{
      background:   "var(--tc-card, #1e293b)",
      border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
      borderRadius: 14,
      padding:      "20px",
      flex:         1,
    }}>
      <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Tier Manager ──────────────────────────────────────────────────────────
function TierManager() {
  const { createCreatorTier } = useWeb3();
  const [tiers, setTiers]     = useState([
    { id: 1, name: "Supporter", priceXrp: 1,  subs: 48,  desc: "Access to supporter-only posts" },
    { id: 2, name: "Insider",   priceXrp: 3,  subs: 19,  desc: "Behind-the-scenes + early access" },
    { id: 3, name: "VIP",       priceXrp: 10, subs: 5,   desc: "1-on-1 DM + all exclusive content" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ name: "", price: "", desc: "" });
  const [saving,   setSaving]   = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const priceDrops = String(Math.round(parseFloat(form.price) * 1_000_000));
      await createCreatorTier(priceDrops, form.name, form.desc);
      setTiers(t => [...t, { id: Date.now(), name: form.name, priceXrp: parseFloat(form.price), subs: 0, desc: form.desc }]);
      setForm({ name: "", price: "", desc: "" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={sectionTitle}>🎬 Subscription Tiers</h3>
        <button onClick={() => setShowForm(s => !s)} style={purpleBtn}>+ New Tier</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} style={{ marginBottom: 16, padding: 14, background: "var(--tc-bg-input, #252840)", borderRadius: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tier name" style={inputStyle} />
            <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price (XRP/month)" type="number" min="0.1" step="0.1" style={inputStyle} />
          </div>
          <input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Description" style={{ ...inputStyle, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving} style={{ ...purpleBtn, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving…" : "Create Tier"}</button>
            <button type="button" onClick={() => setShowForm(false)} style={outlineBtn}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tiers.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px", background: "var(--tc-bg-input, #252840)", borderRadius: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tc-text-primary, #E8ECF4)" }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginTop: 2 }}>{t.desc}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#6C63FF" }}>{t.priceXrp} XRP/mo</div>
              <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)" }}>{t.subs} subscribers</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function CreatorPage({ theme, setTheme }) {
  const { isCreator, xrplAddress, withdrawRevenue, xamanSendTx, isConnected, openModal } = useWeb3();
  const [withdrawing, setWithdrawing] = useState(false);

  if (!isConnected) {
    return (
      <Layout title="Creator Studio" theme={theme} setTheme={setTheme}>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <h2>Creator Studio</h2>
          <p style={{ color: "var(--tc-text-muted, #64748b)", marginBottom: 24 }}>Connect your wallet to access Creator Studio.</p>
          <button onClick={openModal} style={purpleBtn}>Connect Wallet</button>
        </div>
      </Layout>
    );
  }

  if (!isCreator) {
    return (
      <Layout title="Creator Studio" theme={theme} setTheme={setTheme}>
        <div style={{ maxWidth: 520, margin: "60px auto", textAlign: "center", padding: "0 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px" }}>Creator Studio</h2>
          <p style={{ color: "var(--tc-text-muted, #64748b)", marginBottom: 28, lineHeight: 1.7 }}>
            Creator Studio is exclusive to <strong>Creator</strong> plan members.
            Upgrade to unlock subscription tiers, revenue analytics, affiliate links and more.
          </p>
          <a href="/premium" style={{ ...purpleBtn, textDecoration: "none", display: "inline-block" }}>
            Upgrade to Creator — 12 XRP/mo
          </a>
        </div>
      </Layout>
    );
  }

  async function handleWithdraw() {
    setWithdrawing(true);
    try {
      await withdrawRevenue();
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <Layout title="Creator Studio" theme={theme} setTheme={setTheme}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>Creator Studio</h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>
              Manage your content, tiers, and revenue on XRPL
            </p>
          </div>
          <span style={{
            padding:    "4px 14px",
            background: "linear-gradient(135deg,#F5A623,#FFD700)",
            borderRadius: 9999,
            color:      "#1A1D2E",
            fontWeight: 800,
            fontSize:   13,
          }}>✦ Creator</span>
        </div>

        {/* Revenue stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <RevenueCard title="Total Subscribers" value="72"    sub="across all tiers"         color="#6C63FF" />
          <RevenueCard title="Monthly Revenue"   value="157 XRP" sub="≈ $94 · 85% creator share" color="#F5A623" />
          <RevenueCard title="Total Earned"      value="892 XRP" sub="all time"                  color="#22c55e" />
          <RevenueCard title="Pending Withdraw"  value="43 XRP"  sub="available now"              color="#6C63FF" />
        </div>

        {/* Withdraw button */}
        <div style={{ ...card, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Withdraw Revenue</div>
            <div style={{ fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>
              Pull your 85% creator share from the smart contract to your EVM wallet.
            </div>
          </div>
          <button onClick={handleWithdraw} disabled={withdrawing} style={{ ...purpleBtn, opacity: withdrawing ? 0.7 : 1 }}>
            {withdrawing ? "Withdrawing…" : "Withdraw 43 XRP"}
          </button>
        </div>

        {/* XRPL explorer link */}
        {xrplAddress && (
          <div style={{ ...card, marginBottom: 20 }}>
            <h3 style={sectionTitle}>🔗 On-Chain Activity</h3>
            <a
              href={xrplExplorerUrl("accounts", xrplAddress)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#6C63FF", fontSize: 14 }}
            >
              View all transactions on XRPL Explorer ↗
            </a>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--tc-text-muted, #64748b)" }}>
              Every post, payment, and NFT mint is anchored on the XRP Ledger.
            </p>
          </div>
        )}

        {/* Tier manager */}
        <TierManager />

        {/* Affiliate products (stub) */}
        <div style={{ ...card, marginTop: 20 }}>
          <h3 style={sectionTitle}>🛒 Affiliate Products</h3>
          <p style={{ color: "var(--tc-text-muted, #64748b)", fontSize: 13 }}>
            Add affiliate links to products you recommend. Earn commission when subscribers purchase.
            <br />
            <em style={{ fontSize: 12 }}>Coming soon — launch with XRP settlements</em>
          </p>
          <button style={{ ...outlineBtn, marginTop: 10, cursor: "not-allowed", opacity: 0.5 }}>
            Add Product Link (soon)
          </button>
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
};

const sectionTitle = {
  fontSize:     13,
  fontWeight:   700,
  color:        "var(--tc-text-muted, #64748b)",
  textTransform:"uppercase",
  letterSpacing:"0.05em",
  margin:       "0 0 14px",
};

const purpleBtn = {
  padding:      "9px 18px",
  background:   "#6C63FF",
  color:        "#fff",
  border:       "none",
  borderRadius: 9999,
  fontWeight:   600,
  fontSize:     13,
  cursor:       "pointer",
  whiteSpace:   "nowrap",
};

const outlineBtn = {
  padding:      "9px 18px",
  background:   "transparent",
  color:        "var(--tc-text-primary, #E8ECF4)",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.2))",
  borderRadius: 9999,
  fontWeight:   600,
  fontSize:     13,
  cursor:       "pointer",
};

const inputStyle = {
  width:        "100%",
  padding:      "10px 14px",
  background:   "var(--tc-bg-alt, rgba(255,255,255,0.05))",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.1))",
  borderRadius: 10,
  color:        "var(--tc-text-primary, #E8ECF4)",
  fontFamily:   "var(--tc-font, Inter, sans-serif)",
  fontSize:     14,
  outline:      "none",
  boxSizing:    "border-box",
};
