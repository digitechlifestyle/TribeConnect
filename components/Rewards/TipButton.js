/**
 * TipButton — XRP micro-tip any creator instantly via Xaman.
 *
 * Props:
 *   recipientAddress {string}  — XRPL r-address of the creator
 *   recipientName    {string}
 *   compact          {bool}    — icon-only mode for video overlay
 */
import { useState } from "react";
import { useWeb3 }   from "../../contexts/Web3Context";
import { useXrpPrice } from "../../lib/useXrpPrice";

// USD tip amounts — drops calculated at live rate at send time
const TIP_OPTIONS = [
  { usd: 0.50,  emoji: "☕" },
  { usd: 1,     emoji: "🌟" },
  { usd: 5,     emoji: "🔥" },
  { usd: 10,    emoji: "💎" },
];

export default function TipButton({ recipientAddress, recipientName, compact = false }) {
  const { isConnected, xrplAddress, xamanSendTx, openModal } = useWeb3();
  const { usdToDrops, usdToXrp, xrpPrice } = useXrpPrice();
  const [open,    setOpen]    = useState(false);
  const [tipping, setTipping] = useState(false);
  const [payload, setPayload] = useState(null);
  const [sent,    setSent]    = useState(false);

  async function handleTip(usd) {
    if (!isConnected) { openModal(); return; }
    setTipping(true);
    const drops  = usdToDrops(usd);
    const xrpAmt = usdToXrp(usd);
    try {
      const tx = {
        TransactionType: "Payment",
        Account:          xrplAddress,
        Destination:      recipientAddress,
        Amount:           drops,
        Memos: [{
          Memo: {
            MemoType: Buffer.from("tc:tip", "utf8").toString("hex").toUpperCase(),
            MemoData: Buffer.from(`tip:${recipientName}`, "utf8").toString("hex").toUpperCase(),
          },
        }],
      };
      const p = await xamanSendTx(tx, { identifier: "tc-tip", instruction: `Tip ${recipientName} $${usd} (${xrpAmt} XRP)` });
      setPayload(p);
      if (p?.deepLink) window.open(p.deepLink, "_blank");
      setSent(true);
      setTimeout(() => { setSent(false); setOpen(false); setPayload(null); }, 3000);
    } finally {
      setTipping(false);
    }
  }

  if (compact) {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
        >
          <span style={{ fontSize: 28, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}>💸</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>Tip</span>
        </button>

        {open && (
          <div style={{
            position:     "absolute",
            right:        44,
            bottom:       0,
            background:   "rgba(15,17,23,0.95)",
            borderRadius: 12,
            padding:      "10px",
            display:      "flex",
            flexDirection:"column",
            gap:          6,
            minWidth:     120,
            border:       "1px solid rgba(255,255,255,0.1)",
            boxShadow:    "0 8px 24px rgba(0,0,0,0.5)",
            zIndex:       100,
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Tip in USD (paid in XRP)</div>
            {TIP_OPTIONS.map(o => (
              <button key={o.usd} onClick={() => handleTip(o.usd)} disabled={tipping} style={{
                padding:      "8px 12px",
                background:   "rgba(108,99,255,0.2)",
                border:       "1px solid rgba(108,99,255,0.3)",
                borderRadius: 8,
                color:        "#fff",
                fontSize:     13,
                fontWeight:   700,
                cursor:       "pointer",
                textAlign:    "left",
              }}>
                {o.emoji} ${o.usd}
              </button>
            ))}
            {sent && <div style={{ color: "#22c55e", fontSize: 12, textAlign: "center", padding: "4px 0" }}>✓ Tip sent!</div>}
          </div>
        )}
      </div>
    );
  }

  // Full inline mode
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{
          display:      "flex",
          alignItems:   "center",
          gap:          6,
          padding:      "7px 14px",
          background:   "rgba(245,166,35,0.12)",
          border:       "1px solid rgba(245,166,35,0.3)",
          borderRadius: 9999,
          color:        "#F5A623",
          fontWeight:   700,
          fontSize:     13,
          cursor:       "pointer",
        }}>
          💸 Tip XRP
        </button>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TIP_OPTIONS.map(o => (
            <button key={o.usd} onClick={() => handleTip(o.usd)} disabled={tipping} style={{
              padding:      "6px 12px",
              background:   "#F5A623",
              border:       "none",
              borderRadius: 9999,
              color:        "#1A1D2E",
              fontWeight:   700,
              fontSize:     12,
              cursor:       "pointer",
            }}>
              {o.emoji} ${o.usd}
            </button>
          ))}
          <button onClick={() => setOpen(false)} style={{ padding: "6px 10px", background: "transparent", border: "1px solid var(--tc-border, rgba(255,255,255,0.1))", borderRadius: 9999, cursor: "pointer", fontSize: 12, color: "var(--tc-text-muted)" }}>✕</button>
          {sent && <span style={{ color: "#22c55e", fontSize: 12, alignSelf: "center" }}>✓ Sent!</span>}
        </div>
      )}
    </div>
  );
}
