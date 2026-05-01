/**
 * WalletModal — wallet selection overlay
 *
 * Two options:
 *   1. Xaman (XUMM)  — native XRPL, shows QR code
 *   2. WalletConnect — XRPL EVM Sidechain, opens WC modal
 *
 * No MetaMask. No RainbowKit.
 *
 * Props:
 *   isOpen     {bool}
 *   onClose    {fn}
 *   onConnected({address, walletType, evmAddress?}) {fn}
 */
import { useState, useEffect } from "react";
import { useConnect }          from "wagmi";
import XamanQR                 from "./XamanQR";

const VIEWS = { SELECT: "select", XAMAN: "xaman", WC: "wc" };

export default function WalletModal({ isOpen, onClose, onConnected }) {
  const [view, setView]   = useState(VIEWS.SELECT);
  const { connect, connectors, isPending } = useConnect({
    mutation: {
      onSuccess(data) {
        onConnected?.({
          address:    null,          // XRPL address unknown from EVM connector
          evmAddress: data.accounts?.[0] ?? null,
          walletType: "walletconnect",
        });
        onClose?.();
      },
    },
  });

  // Reset view when modal closes
  useEffect(() => {
    if (!isOpen) setView(VIEWS.SELECT);
  }, [isOpen]);

  if (!isOpen) return null;

  // WalletConnect connector (wagmi)
  const wcConnector = connectors.find((c) => c.id === "walletConnect" || c.type === "walletConnect");

  function handleXamanSuccess(address) {
    onConnected?.({ address, walletType: "xaman", evmAddress: null });
    onClose?.();
  }

  function handleWCConnect() {
    if (wcConnector) {
      connect({ connector: wcConnector });
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div style={styles.modal} role="dialog" aria-modal="true" aria-label="Connect wallet">
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.title}>
            {view === VIEWS.SELECT && "Connect Wallet"}
            {view === VIEWS.XAMAN  && "Scan with Xaman"}
            {view === VIEWS.WC     && "WalletConnect"}
          </span>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* ── Wallet selection ──────────────────────────────────── */}
          {view === VIEWS.SELECT && (
            <div style={styles.optionList}>
              {/* Xaman */}
              <button style={styles.optionBtn} onClick={() => setView(VIEWS.XAMAN)}>
                <img
                  src="https://xaman.app/assets/xaman-logo.png"
                  alt=""
                  style={styles.walletLogo}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div style={styles.optionInfo}>
                  <span style={styles.optionName}>Xaman</span>
                  <span style={styles.optionDesc}>Native XRP Ledger · mobile QR</span>
                </div>
                <span style={styles.badge}>Recommended</span>
              </button>

              {/* WalletConnect */}
              <button
                style={styles.optionBtn}
                onClick={handleWCConnect}
                disabled={isPending || !wcConnector}
              >
                <img
                  src="https://avatars.githubusercontent.com/u/37784886?s=200"
                  alt=""
                  style={styles.walletLogo}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div style={styles.optionInfo}>
                  <span style={styles.optionName}>WalletConnect</span>
                  <span style={styles.optionDesc}>XRPL EVM Sidechain · smart contracts</span>
                </div>
                {isPending && <div style={styles.miniSpinner} />}
              </button>

              <p style={styles.disclaimer}>
                By connecting you agree to our{" "}
                <a href="/terms" style={styles.link}>Terms of Service</a>.
              </p>
            </div>
          )}

          {/* ── Xaman QR ─────────────────────────────────────────── */}
          {view === VIEWS.XAMAN && (
            <>
              <button style={styles.backBtn} onClick={() => setView(VIEWS.SELECT)}>
                ← Back
              </button>
              <XamanQR
                onSuccess={handleXamanSuccess}
                onError={() => setView(VIEWS.SELECT)}
                onCancel={() => setView(VIEWS.SELECT)}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const styles = {
  backdrop: {
    position:   "fixed",
    inset:      0,
    background: "rgba(0,0,0,0.55)",
    zIndex:     999,
  },
  modal: {
    position:     "fixed",
    top:          "50%",
    left:         "50%",
    transform:    "translate(-50%, -50%)",
    zIndex:       1000,
    background:   "var(--tc-card, #1e293b)",
    color:        "var(--tc-text, #f1f5f9)",
    borderRadius: "16px",
    width:        "min(420px, 94vw)",
    boxShadow:    "0 24px 60px rgba(0,0,0,0.4)",
    overflow:     "hidden",
  },
  header: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "20px 24px 16px",
    borderBottom:   "1px solid var(--tc-border, rgba(255,255,255,0.08))",
  },
  title: {
    fontSize:   "18px",
    fontWeight: 700,
  },
  closeBtn: {
    background: "transparent",
    border:     "none",
    color:      "inherit",
    fontSize:   "18px",
    cursor:     "pointer",
    lineHeight: 1,
    opacity:    0.6,
  },
  body: {
    padding: "20px 24px 24px",
  },
  optionList: {
    display:       "flex",
    flexDirection: "column",
    gap:           "12px",
  },
  optionBtn: {
    display:        "flex",
    alignItems:     "center",
    gap:            "14px",
    padding:        "14px 16px",
    background:     "var(--tc-bg-alt, rgba(255,255,255,0.04))",
    border:         "1px solid var(--tc-border, rgba(255,255,255,0.1))",
    borderRadius:   "12px",
    cursor:         "pointer",
    color:          "inherit",
    textAlign:      "left",
    transition:     "border-color 0.2s",
    width:          "100%",
  },
  walletLogo: {
    width:        "40px",
    height:       "40px",
    borderRadius: "8px",
    objectFit:    "cover",
    flexShrink:   0,
  },
  optionInfo: {
    display:       "flex",
    flexDirection: "column",
    gap:           "2px",
    flex:          1,
    minWidth:      0,
  },
  optionName: {
    fontWeight: 600,
    fontSize:   "15px",
  },
  optionDesc: {
    fontSize: "12px",
    opacity:  0.6,
  },
  badge: {
    fontSize:     "11px",
    fontWeight:   600,
    color:        "#6C63FF",
    background:   "rgba(108,99,255,0.15)",
    padding:      "3px 8px",
    borderRadius: "20px",
    whiteSpace:   "nowrap",
    flexShrink:   0,
  },
  miniSpinner: {
    width:          "18px",
    height:         "18px",
    border:         "2px solid #e2e8f0",
    borderTopColor: "#6C63FF",
    borderRadius:   "50%",
    animation:      "spin 0.8s linear infinite",
    flexShrink:     0,
  },
  disclaimer: {
    fontSize:  "12px",
    opacity:   0.5,
    margin:    "4px 0 0",
    textAlign: "center",
  },
  link: {
    color: "#6C63FF",
  },
  backBtn: {
    background:  "transparent",
    border:      "none",
    color:       "inherit",
    cursor:      "pointer",
    fontSize:    "13px",
    opacity:     0.6,
    padding:     "0 0 12px",
    display:     "block",
  },
};
