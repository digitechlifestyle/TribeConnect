/**
 * TribeConnect — Earn XRP Hub
 *
 * TikTok-style creator incentive engine. Users earn XRP for genuine activity:
 *   • Daily login streak  — 0.1 XRP/day (7-day bonus: 1 XRP)
 *   • Post goes viral     — bonus from Rewards pool (top 10 daily)
 *   • Referrals           — 2 XRP per invited user who stays 30+ days
 *   • Watch-to-earn       — 0.001 XRP per verified video view (anti-bot)
 *   • Creator milestones  — 5 XRP when you hit 100 / 500 / 1K subscribers
 *   • Challenges          — weekly community challenges with XRP prize pools
 *
 * All distributions are on-chain via TribeConnectRewards.sol (XRPL EVM).
 */
import { useState }   from "react";
import Layout         from "../components/Layout/Layout";
import { useWeb3 }    from "../contexts/Web3Context";

// ── Demo earn data ─────────────────────────────────────────────────────
const ACTIVITIES = [
  { id: "streak",    icon: "🔥", title: "Daily Streak",      desc: "Log in every day",                reward: "0.1 XRP/day",     status: "active",  streak: 6,  nextBonus: "1 XRP tomorrow (7-day)" },
  { id: "viral",     icon: "📈", title: "Viral Content",     desc: "Top 10 posts earn daily pool",    reward: "Up to 50 XRP",    status: "pending", progress: 68 },
  { id: "referral",  icon: "👥", title: "Refer a Friend",    desc: "2 XRP per active referral",       reward: "2 XRP each",      status: "active",  refs: 3, earned: "6 XRP" },
  { id: "watch",     icon: "▶️", title: "Watch & Earn",      desc: "Watch verified creator videos",   reward: "0.001 XRP/view",  status: "active",  views: 412, earned: "0.41 XRP" },
  { id: "milestone", icon: "🏆", title: "Creator Milestone", desc: "Hit subscriber goals",            reward: "5 XRP each",      status: "locked",  next: "100 subscribers" },
  { id: "challenge", icon: "⚡", title: "Weekly Challenge",  desc: "#XRPLBuildWeek — best XRPL demo",reward: "500 XRP pool",    status: "active",  ends: "3d 14h", entries: 87 },
];

const LEADERBOARD = [
  { rank: 1, name: "Carol ✦",  earned: "1,204 XRP", avatar: "C", creator: true  },
  { rank: 2, name: "Alice ✓",  earned: "847 XRP",   avatar: "A", creator: true  },
  { rank: 3, name: "Frank",    earned: "503 XRP",   avatar: "F", creator: false },
  { rank: 4, name: "You",      earned: "47 XRP",    avatar: "J", creator: false, isYou: true },
  { rank: 5, name: "Eve ✓",    earned: "38 XRP",    avatar: "E", creator: false },
];

// ── Activity card ──────────────────────────────────────────────────────
function ActivityCard({ a, onClaim }) {
  const statusColor = { active: "#22c55e", pending: "#F5A623", locked: "#64748b" }[a.status];
  const statusLabel = { active: "Active", pending: "In Progress", locked: "Locked" }[a.status];

  return (
    <div style={{
      background:   "var(--tc-card, #1e293b)",
      border:       `1px solid ${a.status === "active" ? "rgba(34,197,94,0.2)" : "var(--tc-border, rgba(255,255,255,0.08))"}`,
      borderRadius: 14,
      padding:      "18px",
      display:      "flex",
      gap:          16,
      alignItems:   "flex-start",
    }}>
      <div style={{ fontSize: 36, flexShrink: 0, lineHeight: 1 }}>{a.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{a.title}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: `${statusColor}22`, color: statusColor }}>
            {statusLabel}
          </span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>{a.desc}</p>

        {/* Streak display */}
        {a.streak && (
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: i < a.streak ? "#F5A623" : "var(--tc-bg-input, #252840)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                {i < a.streak ? "🔥" : ""}
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {a.progress && (
          <div style={{ height: 6, background: "var(--tc-bg-input, #252840)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${a.progress}%`, background: "linear-gradient(90deg,#6C63FF,#9C6FFF)", borderRadius: 3 }} />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#F5A623" }}>{a.reward}</span>
            {a.earned && <span style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginLeft: 8 }}>({a.earned} earned)</span>}
            {a.nextBonus && <div style={{ fontSize: 11, color: "#22c55e", marginTop: 2 }}>🎁 {a.nextBonus}</div>}
            {a.ends && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}>⏰ Ends in {a.ends} · {a.entries} entries</div>}
            {a.next && <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)", marginTop: 2 }}>Next: {a.next}</div>}
          </div>

          {a.status === "active" && (
            <button onClick={() => onClaim(a)} style={{
              padding:      "7px 16px",
              background:   a.id === "streak" ? "#22c55e" : "#6C63FF",
              color:        "#fff",
              border:       "none",
              borderRadius: 9999,
              fontWeight:   700,
              fontSize:     13,
              cursor:       "pointer",
              whiteSpace:   "nowrap",
            }}>
              {a.id === "streak" ? "Claim Today" : a.id === "referral" ? "Invite Friends" : a.id === "challenge" ? "Enter Challenge" : "View"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function EarnPage({ theme, setTheme }) {
  const { isConnected, xrplBalance, openModal, xamanSendTx } = useWeb3();
  const [claiming, setClaiming] = useState(null);
  const [claimed,  setClaimed]  = useState(new Set());

  async function handleClaim(activity) {
    if (!isConnected) { openModal(); return; }
    setClaiming(activity.id);
    // In production: call rewards smart contract or API
    await new Promise(r => setTimeout(r, 1500));
    setClaimed(s => new Set(s).add(activity.id));
    setClaiming(null);
  }

  return (
    <Layout title="Earn XRP" theme={theme} setTheme={setTheme}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>

        {/* Hero banner */}
        <div style={{
          background:   "linear-gradient(135deg,#6C63FF 0%,#9C6FFF 40%,#F5A623 100%)",
          borderRadius: 20,
          padding:      "28px 32px",
          marginBottom: 28,
          color:        "#fff",
          position:     "relative",
          overflow:     "hidden",
        }}>
          <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: 0.15, lineHeight: 1 }}>💰</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>Earn XRP by being yourself</h1>
          <p style={{ margin: "0 0 20px", opacity: 0.9, fontSize: 15, lineHeight: 1.6 }}>
            Post, watch, refer, go live — every action earns real XRP, paid directly to your wallet.
            No points. No vouchers. Real XRP, on-chain, instantly.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 20px", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{isConnected ? Number(xrplBalance).toFixed(2) : "—"} XRP</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Your balance</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 20px", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>47 XRP</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Earned this month</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 20px", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>3 XRP</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Claimable now</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
          {/* Activities */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--tc-text-muted, #64748b)" }}>Ways to Earn</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ACTIVITIES.map(a => (
                <ActivityCard
                  key={a.id}
                  a={claimed.has(a.id) ? { ...a, status: "locked", desc: "✓ Claimed today — come back tomorrow!" } : a}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ position: "sticky", top: 80 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--tc-text-muted, #64748b)" }}>🏆 Top Earners</h2>
            <div style={{ background: "var(--tc-card, #1e293b)", border: "1px solid var(--tc-border, rgba(255,255,255,0.08))", borderRadius: 14, overflow: "hidden" }}>
              {LEADERBOARD.map(p => (
                <div key={p.rank} style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         12,
                  padding:     "12px 16px",
                  borderBottom:"1px solid var(--tc-border, rgba(255,255,255,0.06))",
                  background:  p.isYou ? "rgba(108,99,255,0.08)" : "transparent",
                }}>
                  <span style={{ fontSize: p.rank <= 3 ? 20 : 14, fontWeight: 800, width: 28, textAlign: "center", color: ["#F5A623","#94a3b8","#CD7F32"][p.rank-1] || "var(--tc-text-muted)" }}>
                    {p.rank <= 3 ? ["🥇","🥈","🥉"][p.rank-1] : `#${p.rank}`}
                  </span>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.isYou ? "#6C63FF" : "linear-gradient(135deg,#6C63FF,#9C6FFF)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{p.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: p.isYou ? 800 : 600, color: p.isYou ? "#6C63FF" : "var(--tc-text-primary, #E8ECF4)" }}>{p.name}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F5A623", whiteSpace: "nowrap" }}>{p.earned}</div>
                </div>
              ))}
            </div>

            {/* Referral link */}
            <div style={{ marginTop: 16, background: "var(--tc-card, #1e293b)", border: "1px solid var(--tc-border, rgba(255,255,255,0.08))", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>👥 Your Referral Link</div>
              <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginBottom: 10 }}>Earn 2 XRP per friend who joins and stays active</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, padding: "8px 10px", background: "var(--tc-bg-input, #252840)", borderRadius: 8, fontSize: 12, color: "var(--tc-text-muted, #64748b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  tribeconnect.app/join?ref=youraddr
                </div>
                <button style={{ padding: "8px 12px", background: "#6C63FF", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Copy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
