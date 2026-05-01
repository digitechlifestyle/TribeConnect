/**
 * TribeConnect — Header / Topbar
 *
 * No RainbowKit. No MetaMask.
 * Connect button opens the WalletModal (Xaman QR or WalletConnect).
 */
import Link        from "next/link";
import { useWeb3 } from "../../contexts/Web3Context";
import { truncateAddress } from "../../lib/xrplClient";

export default function Header({ theme, setTheme }) {
  const {
    isConnected,
    xrplAddress,
    evmAddress,
    walletType,
    xrplBalance,
    isPro,
    isCreator,
    profile,
    openModal,
    disconnect,
  } = useWeb3();

  const displayAddress = xrplAddress
    ? truncateAddress(xrplAddress)
    : evmAddress
    ? truncateAddress(evmAddress)
    : null;

  const walletLabel = walletType === "xaman" ? "Xaman" : walletType === "walletconnect" ? "WC" : null;

  return (
    <header style={{
      position:     "sticky",
      top:          0,
      zIndex:       100,
      background:   "var(--tc-bg-topbar, #141622)",
      borderBottom: "1px solid var(--tc-border, rgba(255,255,255,0.08))",
      boxShadow:    "0 1px 3px rgba(0,0,0,.12)",
    }}>
      <div style={{
        display:     "flex",
        alignItems:  "center",
        gap:         12,
        height:      "var(--tc-topbar-h, 64px)",
        padding:     "0 20px",
      }}>
        {/* Brand */}
        <Link href="/" style={{
          display:        "flex",
          alignItems:     "center",
          gap:            8,
          fontWeight:     800,
          fontSize:       18,
          color:          "var(--tc-text-primary, #E8ECF4)",
          textDecoration: "none",
          flexShrink:     0,
        }}>
          <div style={{
            width:           34,
            height:          34,
            borderRadius:    10,
            flexShrink:      0,
            background:      "linear-gradient(135deg,#6C63FF,#9C6FFF)",
            color:           "#fff",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            fontSize:        16,
            fontWeight:      900,
          }}>T</div>
          <span style={{ display: "none" }} className="tc-brand-text-lg">TribeConnect</span>
          <span>TribeConnect</span>
        </Link>

        {/* Search bar (only when connected) */}
        {isConnected && (
          <div style={{ flex: 1, maxWidth: 480, margin: "0 auto" }}>
            <div style={{
              position:   "relative",
              display:    "flex",
              alignItems: "center",
              background: "var(--tc-bg-input, #252840)",
              borderRadius: 9999,
              border:     "1px solid transparent",
            }}>
              <span style={{
                position: "absolute",
                left:     14,
                color:    "var(--tc-text-muted, #64748b)",
                fontSize: 13,
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search TribeConnect…"
                style={{
                  width:      "100%",
                  padding:    "9px 16px 9px 38px",
                  background: "transparent",
                  border:     "none",
                  outline:    "none",
                  fontFamily: "var(--tc-font, Inter, sans-serif)",
                  fontSize:   14,
                  color:      "var(--tc-text-primary, #E8ECF4)",
                }}
              />
            </div>
          </div>
        )}

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          {/* Theme toggle */}
          <button
            onClick={setTheme}
            title="Toggle theme"
            style={{
              background:     "none",
              border:         "none",
              cursor:         "pointer",
              width:          36,
              height:         36,
              borderRadius:   "50%",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              color:          "var(--tc-text-secondary, #94a3b8)",
              fontSize:       16,
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Wallet connect / account button */}
          {!isConnected ? (
            <button onClick={openModal} style={btnStyle}>
              Connect Wallet
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Premium badges */}
              {isCreator && (
                <span style={creatorBadge}>✦ Creator</span>
              )}
              {isPro && !isCreator && (
                <span style={proBadge}>Pro</span>
              )}

              {/* Wallet chip */}
              <div style={walletChipStyle}>
                <span style={walletDotStyle(walletType)} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tc-text-primary, #E8ECF4)" }}>
                  {displayAddress}
                </span>
                {walletLabel && (
                  <span style={{ fontSize: 10, opacity: 0.5, color: "var(--tc-text-secondary)" }}>
                    {walletLabel}
                  </span>
                )}
              </div>

              {/* XRP balance */}
              {xrplAddress && (
                <span style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)" }}>
                  {Number(xrplBalance).toFixed(2)} XRP
                </span>
              )}

              {/* Disconnect */}
              <button onClick={disconnect} title="Disconnect" style={disconnectBtnStyle}>
                ⏏
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const btnStyle = {
  padding:      "9px 18px",
  background:   "#6C63FF",
  color:        "#fff",
  border:       "none",
  borderRadius: 9999,
  fontWeight:   600,
  fontSize:     14,
  cursor:       "pointer",
};

const walletChipStyle = {
  display:      "flex",
  alignItems:   "center",
  gap:          6,
  padding:      "6px 12px",
  background:   "var(--tc-bg-input, #252840)",
  borderRadius: 9999,
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.1))",
};

const walletDotStyle = (type) => ({
  width:        8,
  height:       8,
  borderRadius: "50%",
  background:   type === "xaman" ? "#6C63FF" : type === "walletconnect" ? "#3b82f6" : "#94a3b8",
  flexShrink:   0,
});

const disconnectBtnStyle = {
  background:   "transparent",
  border:       "none",
  cursor:       "pointer",
  fontSize:     16,
  opacity:      0.5,
  padding:      "4px 6px",
  color:        "inherit",
};

const creatorBadge = {
  background:   "linear-gradient(135deg,#F5A623,#FFD700)",
  color:        "#1A1D2E",
  fontSize:     11,
  fontWeight:   700,
  padding:      "3px 10px",
  borderRadius: 9999,
  whiteSpace:   "nowrap",
};

const proBadge = {
  background:   "rgba(108,99,255,0.15)",
  color:        "#6C63FF",
  fontSize:     11,
  fontWeight:   700,
  padding:      "3px 10px",
  borderRadius: 9999,
};
