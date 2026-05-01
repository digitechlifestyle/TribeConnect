/**
 * TribeConnect — Premium Upgrade Page
 *
 * XRP payments are initiated via Xaman (QR payload).
 * A membership NFT is minted on XRPL after payment confirmation.
 * Pricing: 5 XRP/month Pro · 12 XRP/month Creator
 */
import { useState }   from "react";
import Layout         from "../components/Layout/Layout";
import { useWeb3 }    from "../contexts/Web3Context";

const PLANS = [
  {
    id:       "free",
    label:    "Free",
    price:    0,
    drops:    0,
    color:    "var(--tc-text-muted, #64748b)",
    features: [
      "Up to 20 posts/day",
      "Basic profile",
      "Public feed",
      "Standard ads shown",
    ],
    cta: "Current plan",
    disabled: true,
  },
  {
    id:       "pro",
    label:    "Pro",
    price:    5,
    drops:    5_000_000,
    color:    "#6C63FF",
    badge:    null,
    features: [
      "Unlimited posts",
      "Ad-free experience",
      "Verified ✓ badge",
      "Priority support",
      "XRPL membership NFT",
    ],
    cta: "Upgrade to Pro",
    popular: false,
  },
  {
    id:       "creator",
    label:    "Creator",
    price:    12,
    drops:    12_000_000,
    color:    "#F5A623",
    badge:    "Most Popular",
    features: [
      "Everything in Pro",
      "Creator subscription tiers",
      "Exclusive posts for subscribers",
      "Revenue analytics",
      "Affiliate product links",
      "Gold ✦ Creator badge",
      "85% revenue share on subs",
    ],
    cta:     "Go Creator",
    popular: true,
  },
];

// ── Xaman Payment Flow Panel ─────────────────────────────────────────────
function XamanPaymentPanel({ plan, months, onClose }) {
  const { sendPremiumPayment } = useWeb3();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);

  async function initiate() {
    setLoading(true);
    try {
      const p = await sendPremiumPayment(plan.id, months);
      setPayload(p);
      if (p?.deepLink) window.open(p.deepLink, "_blank");
    } finally {
      setLoading(false);
    }
  }

  const totalXrp  = (plan.price * months).toFixed(0);
  const totalDrops = plan.drops * months;

  return (
    <div style={{
      position:   "fixed",
      inset:      0,
      zIndex:     999,
      display:    "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div style={{
        position:     "relative",
        background:   "var(--tc-card, #1e293b)",
        borderRadius: 16,
        padding:      "28px",
        width:        "min(420px, 92vw)",
        boxShadow:    "0 24px 60px rgba(0,0,0,0.4)",
        zIndex:       1000,
      }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>
          Upgrade to {plan.label}
        </h2>
        <p style={{ margin: "0 0 20px", color: "var(--tc-text-muted, #64748b)", fontSize: 14 }}>
          {months} month{months > 1 ? "s" : ""} · {totalXrp} XRP ({totalDrops.toLocaleString()} drops)
        </p>

        {!payload ? (
          <>
            <div style={{
              padding:    "16px",
              background: "rgba(108,99,255,0.08)",
              borderRadius: 10,
              marginBottom: 20,
              fontSize:   13,
              color:      "var(--tc-text-secondary, #94a3b8)",
              lineHeight: 1.6,
            }}>
              💡 A Xaman (XUMM) QR code will open in a new tab. Scan it with your Xaman mobile app to sign the XRP payment.
              Your membership NFT will be minted on XRPL after confirmation.
            </div>

            <button
              onClick={initiate}
              disabled={loading}
              style={{
                width:        "100%",
                padding:      "12px",
                background:   "linear-gradient(135deg,#6C63FF,#9C6FFF)",
                color:        "#fff",
                border:       "none",
                borderRadius: 10,
                fontWeight:   700,
                fontSize:     15,
                cursor:       loading ? "wait" : "pointer",
                opacity:      loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating payment…" : `Pay ${totalXrp} XRP with Xaman`}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
            <p style={{ fontSize: 14, color: "var(--tc-text-secondary, #94a3b8)", marginBottom: 16 }}>
              Check your Xaman app to complete the payment.
            </p>
            {payload.qrUrl && (
              <img src={payload.qrUrl} alt="Xaman QR" style={{ width: 180, height: 180, background: "#fff", padding: 8, borderRadius: 10, marginBottom: 12 }} />
            )}
            <p style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)" }}>
              Or{" "}
              <a href={payload.deepLink} target="_blank" rel="noopener noreferrer" style={{ color: "#6C63FF" }}>
                open in Xaman app ↗
              </a>
            </p>
          </div>
        )}

        <button onClick={onClose} style={{ marginTop: 12, width: "100%", padding: "10px", background: "transparent", border: "1px solid var(--tc-border, rgba(255,255,255,0.1))", borderRadius: 10, color: "var(--tc-text-muted, #64748b)", cursor: "pointer", fontSize: 13 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function PremiumPage({ theme, setTheme }) {
  const { isConnected, isPro, isCreator, openModal } = useWeb3();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [months,       setMonths]       = useState(1);

  function handleUpgrade(plan) {
    if (!isConnected) { openModal(); return; }
    setSelectedPlan(plan);
  }

  return (
    <Layout title="Premium" theme={theme} setTheme={setTheme}>
      {selectedPlan && (
        <XamanPaymentPanel
          plan={selectedPlan}
          months={months}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 10px" }}>
            Unlock Your Full Potential
          </h1>
          <p style={{ fontSize: 16, color: "var(--tc-text-muted, #64748b)", maxWidth: 480, margin: "0 auto 24px" }}>
            Premium memberships are paid in XRP via Xaman. A membership NFT is minted on XRPL as proof.
          </p>

          {/* Month selector */}
          <div style={{ display: "inline-flex", background: "var(--tc-card, #1e293b)", borderRadius: 9999, padding: 4, border: "1px solid var(--tc-border, rgba(255,255,255,0.08))" }}>
            {[1, 3, 6, 12].map(m => (
              <button key={m} onClick={() => setMonths(m)} style={{
                padding:      "7px 18px",
                borderRadius: 9999,
                border:       "none",
                background:   months === m ? "#6C63FF" : "transparent",
                color:        months === m ? "#fff" : "var(--tc-text-muted, #64748b)",
                fontWeight:   600,
                fontSize:     13,
                cursor:       "pointer",
              }}>
                {m} mo{m > 1 ? "s" : ""}
                {m === 12 && <span style={{ marginLeft: 4, fontSize: 10, color: "#22c55e" }}>-17%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap:                 20,
        }}>
          {PLANS.map(plan => {
            const isActive = (plan.id === "pro" && isPro && !isCreator) || (plan.id === "creator" && isCreator) || (plan.id === "free" && !isPro && !isCreator);
            const totalPrice = plan.price * months;

            return (
              <div key={plan.id} style={{
                background:   "var(--tc-card, #1e293b)",
                border:       `2px solid ${plan.popular ? plan.color : "var(--tc-border, rgba(255,255,255,0.08))"}`,
                borderRadius: 16,
                padding:      "24px",
                position:     "relative",
                transition:   "transform 0.2s",
              }}>
                {plan.popular && (
                  <div style={{
                    position:     "absolute",
                    top:          -12,
                    left:         "50%",
                    transform:    "translateX(-50%)",
                    background:   "#F5A623",
                    color:        "#1A1D2E",
                    fontSize:     11,
                    fontWeight:   800,
                    padding:      "4px 16px",
                    borderRadius: 9999,
                    whiteSpace:   "nowrap",
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: plan.color }}>
                    {plan.label}
                  </h2>
                  {plan.price > 0 ? (
                    <div>
                      <span style={{ fontSize: 32, fontWeight: 900 }}>{totalPrice} XRP</span>
                      <span style={{ fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}> / {months} mo</span>
                      <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginTop: 2 }}>
                        {plan.price} XRP/month
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 32, fontWeight: 900 }}>Free</span>
                  )}
                </div>

                <ul style={{ padding: 0, margin: "0 0 20px", listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--tc-text-secondary, #94a3b8)" }}>
                      <span style={{ color: plan.price === 0 ? "var(--tc-text-muted)" : "#22c55e", flexShrink: 0 }}>
                        {plan.price === 0 ? "·" : "✓"}
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !plan.disabled && !isActive && handleUpgrade(plan)}
                  disabled={plan.disabled || isActive}
                  style={{
                    width:        "100%",
                    padding:      "11px",
                    background:   isActive ? "rgba(34,197,94,0.15)" : plan.price === 0 ? "var(--tc-bg-input, #252840)" : `linear-gradient(135deg, ${plan.color}, ${plan.color}CC)`,
                    color:        isActive ? "#22c55e" : plan.price === 0 ? "var(--tc-text-muted)" : "#fff",
                    border:       isActive ? "1px solid rgba(34,197,94,0.3)" : "none",
                    borderRadius: 10,
                    fontWeight:   700,
                    fontSize:     14,
                    cursor:       plan.disabled || isActive ? "default" : "pointer",
                    opacity:      plan.disabled ? 0.6 : 1,
                  }}
                >
                  {isActive ? "✓ Current plan" : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* XRPL proof section */}
        <div style={{
          marginTop:    32,
          padding:      "20px",
          background:   "rgba(108,99,255,0.06)",
          border:       "1px solid rgba(108,99,255,0.2)",
          borderRadius: 14,
          textAlign:    "center",
        }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>🔗 Verified on XRPL</h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--tc-text-muted, #64748b)", maxWidth: 480, marginInline: "auto" }}>
            Every premium subscription mints an NFT on the XRP Ledger as immutable proof of membership.
            Payments settle in under 5 seconds with near-zero fees.
          </p>
        </div>
      </div>
    </Layout>
  );
}
