/**
 * TribeConnect — Left Sidebar
 * No MetaMask / RainbowKit references.
 * Shows Xaman address + XRPL balance; links to all main routes.
 */
import Link        from "next/link";
import { useRouter } from "next/router";
import { useWeb3 } from "../../contexts/Web3Context";
import { truncateAddress } from "../../lib/xrplClient";

const navItems = [
  { href: "/",         emoji: "🏠", label: "Home" },
  { href: "/profile",  emoji: "👤", label: "Profile" },
  { href: "/users",    emoji: "👥", label: "People" },
  { href: "/messages", emoji: "✉️",  label: "Messages" },
  { href: "/groups",   emoji: "🏘️",  label: "Groups" },
  { href: "/premium",  emoji: "👑",  label: "Premium" },
];

export default function Sidebar() {
  const router = useRouter();
  const {
    xrplAddress,
    evmAddress,
    walletType,
    xrplBalance,
    isConnected,
    isPro,
    isCreator,
    profile,
    openModal,
    disconnect,
  } = useWeb3();

  const address     = xrplAddress || evmAddress;
  const name        = profile?.name || (address ? truncateAddress(address) : "Not connected");
  const initial     = name[0]?.toUpperCase() || "T";
  const profileHref = xrplAddress ? `/profile/${xrplAddress}` : evmAddress ? `/profile/${evmAddress}` : "#";

  return (
    <nav style={{
      position:      "fixed",
      top:           0,
      left:          0,
      bottom:        0,
      width:         "var(--tc-sidebar-w, 260px)",
      background:    "var(--tc-bg-sidebar, #141622)",
      borderRight:   "1px solid var(--tc-border, rgba(255,255,255,0.08))",
      display:       "flex",
      flexDirection: "column",
      overflowY:     "auto",
      zIndex:        200,
      padding:       "20px 0 12px",
    }}>

      {/* Brand */}
      <div style={{ padding: "0 16px 20px", marginBottom: 4 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   10,
            background:     "linear-gradient(135deg,#6C63FF,#9C6FFF)",
            color:          "#fff",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontWeight:     900,
            fontSize:       18,
            flexShrink:     0,
          }}>T</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "var(--tc-text-primary, #E8ECF4)" }}>
            TribeConnect
          </span>
        </Link>
      </div>

      {/* Profile mini-card */}
      {isConnected ? (
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          12,
          padding:      "12px 16px",
          marginBottom: 8,
          borderTop:    "1px solid var(--tc-border, rgba(255,255,255,0.08))",
          borderBottom: "1px solid var(--tc-border, rgba(255,255,255,0.08))",
        }}>
          <Link href={profileHref} style={{ flexShrink: 0 }}>
            <div style={{
              width:          44,
              height:         44,
              borderRadius:   "50%",
              background:     "var(--tc-purple, #6C63FF)",
              color:          "#fff",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontWeight:     700,
              fontSize:       18,
            }}>{initial}</div>
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize:      14,
              fontWeight:    600,
              color:         "var(--tc-text-primary, #E8ECF4)",
              display:       "flex",
              alignItems:    "center",
              gap:           4,
              overflow:      "hidden",
              textOverflow:  "ellipsis",
              whiteSpace:    "nowrap",
            }}>
              {name}
              {profile?.verified && <span style={{ color: "#6C63FF" }}>✓</span>}
            </div>
            <div style={{
              fontSize:     12,
              color:        "var(--tc-text-muted, #64748b)",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}>
              {walletType === "xaman" && xrplAddress
                ? `${Number(xrplBalance).toFixed(2)} XRP`
                : truncateAddress(address)
              }
            </div>
          </div>

          {/* Wallet type badge */}
          <span style={{
            marginLeft:   "auto",
            fontSize:     10,
            fontWeight:   700,
            padding:      "2px 8px",
            borderRadius: 9999,
            background:   walletType === "xaman" ? "rgba(108,99,255,0.2)" : "rgba(59,130,246,0.2)",
            color:        walletType === "xaman" ? "#6C63FF" : "#3b82f6",
            flexShrink:   0,
          }}>
            {walletType === "xaman" ? "Xaman" : "WC"}
          </span>
        </div>
      ) : (
        <div style={{ padding: "0 16px 16px" }}>
          <button onClick={openModal} style={{
            width:        "100%",
            padding:      "10px",
            background:   "#6C63FF",
            color:        "#fff",
            border:       "none",
            borderRadius: 10,
            fontWeight:   600,
            fontSize:     14,
            cursor:       "pointer",
          }}>
            Connect Wallet
          </button>
        </div>
      )}

      {/* Nav links */}
      <ul style={{ padding: "4px 8px", listStyle: "none", margin: 0 }}>
        {navItems.map(({ href, emoji, label }) => {
          const active = href === "/"
            ? router.pathname === "/"
            : router.pathname.startsWith(href);
          return (
            <li key={href} style={{ marginBottom: 2 }}>
              <Link href={href} style={{
                display:        "flex",
                alignItems:     "center",
                gap:            12,
                padding:        "10px 12px",
                borderRadius:   8,
                color:          active ? "var(--tc-purple, #6C63FF)" : "var(--tc-text-secondary, #94a3b8)",
                background:     active ? "rgba(108,99,255,0.12)" : "transparent",
                fontWeight:     500,
                fontSize:       14,
                textDecoration: "none",
                transition:     "background 0.2s, color 0.2s",
              }}>
                <span style={{ width: 20, textAlign: "center", fontSize: 16 }}>{emoji}</span>
                {label}
              </Link>
            </li>
          );
        })}

        {isCreator && (
          <li style={{ marginBottom: 2 }}>
            <Link href="/creator" style={{
              display:        "flex",
              alignItems:     "center",
              gap:            12,
              padding:        "10px 12px",
              borderRadius:   8,
              color:          router.pathname === "/creator" ? "#D4891A" : "var(--tc-text-secondary, #94a3b8)",
              background:     router.pathname === "/creator" ? "rgba(245,166,35,0.12)" : "transparent",
              fontWeight:     500,
              fontSize:       14,
              textDecoration: "none",
            }}>
              <span style={{ width: 20, textAlign: "center", fontSize: 16 }}>🎬</span>
              Creator Studio
            </Link>
          </li>
        )}
      </ul>

      {/* Upgrade card */}
      {isConnected && !isPro && (
        <div style={{
          margin:     "12px",
          padding:    "16px",
          background: "linear-gradient(135deg,#6C63FF,#9C6FFF)",
          borderRadius: 12,
          color:      "#fff",
          textAlign:  "center",
        }}>
          <div style={{ fontSize: 24, marginBottom: 8, color: "#F5A623" }}>👑</div>
          <p style={{ fontSize: 13, margin: "0 0 12px", opacity: 0.9 }}>
            Go ad-free + unlock creator tools
          </p>
          <Link href="/premium" style={{
            display:        "inline-block",
            background:     "linear-gradient(135deg,#F5A623,#FFD700)",
            color:          "#1A1D2E",
            padding:        "6px 16px",
            borderRadius:   9999,
            fontSize:       13,
            fontWeight:     700,
            textDecoration: "none",
          }}>
            Upgrade
          </Link>
        </div>
      )}

      {isCreator && (
        <div style={{
          margin:       "0 12px 12px",
          padding:      "8px 16px",
          background:   "linear-gradient(135deg,#F5A623,#FFD700)",
          borderRadius: 9999,
          textAlign:    "center",
          color:        "#1A1D2E",
          fontWeight:   700,
          fontSize:     13,
        }}>
          ✦ Creator Member
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: "auto",
        padding:   "8px 16px",
        fontSize:  11,
        color:     "var(--tc-text-muted, #64748b)",
      }}>
        {isConnected && (
          <button onClick={disconnect} style={{
            background:   "transparent",
            border:       "1px solid var(--tc-border, rgba(255,255,255,0.1))",
            color:        "var(--tc-text-muted, #64748b)",
            borderRadius: 8,
            padding:      "6px 12px",
            cursor:       "pointer",
            fontSize:     12,
            width:        "100%",
            marginBottom: 10,
          }}>
            Disconnect
          </button>
        )}
        <div>
          <Link href="/privacy" style={{ color: "inherit" }}>Privacy</Link>
          {" · "}
          <Link href="/terms" style={{ color: "inherit" }}>Terms</Link>
        </div>
        <p style={{ margin: "4px 0 0" }}>© {new Date().getFullYear()} TribeConnect</p>
        <p style={{ margin: "2px 0 0", fontSize: 10 }}>Powered by XRP Ledger ✕</p>
      </div>
    </nav>
  );
}
