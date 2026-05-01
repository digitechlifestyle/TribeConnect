/**
 * TribeConnect — Home / Feed
 *
 * Shows:
 *  • Post composer (creates EVM post + optionally anchors CID on XRPL)
 *  • Paginated post feed from smart contract
 *  • Right sidebar: People / Groups suggestions, ads (skipped for premium)
 *
 * XRPL operations: post CID anchored via Xaman tx memo
 * EVM operations:  createPost(), likePost() via WalletConnect
 */
import { useState, useEffect } from "react";
import Layout                  from "../components/Layout/Layout";
import { useWeb3 }             from "../contexts/Web3Context";
import { truncateAddress }     from "../lib/xrplClient";
import Link                    from "next/link";

// ── Placeholder data (replace with contract reads) ───────────────────────
const DEMO_POSTS = [
  {
    id: 1,
    author: "rXRPLAddr1…User",
    name:   "Alice",
    time:   "2 min ago",
    body:   "Just bridged XRP to the EVM sidechain for the first time — under 5 seconds and almost no fees. The future is here! 🚀 #XRPL #TribeConnect",
    likes:  24,
    comments: 5,
    liked:  false,
  },
  {
    id: 2,
    author: "rXRPLAddr2…User",
    name:   "Bob",
    time:   "18 min ago",
    body:   "Anyone else using Xaman for daily XRP payments? The QR sign-in is so smooth. No seed phrases in the browser ever again. 🔐",
    likes:  41,
    comments: 12,
    liked:  true,
  },
  {
    id: 3,
    author: "rXRPLAddr3…User",
    name:   "Creator Carol",
    badge:  "creator",
    time:   "1 h ago",
    body:   "🎬 New exclusive tutorial for my subscribers: building NFT verification badges on XRPL. Subscribe to unlock on my creator page!",
    likes:  107,
    comments: 33,
    liked:  false,
    exclusive: true,
  },
];

// ── Post Composer ─────────────────────────────────────────────────────────
function PostComposer({ onPost }) {
  const { isConnected, xrplAddress, createPost, anchorPost, openModal } = useWeb3();
  const [body,        setBody]        = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [anchorXRPL,  setAnchorXRPL]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    if (!isConnected) { openModal(); return; }

    setSubmitting(true);
    try {
      // For demo: create post on EVM (stub CID)
      const mockCid = "Qm" + Math.random().toString(36).slice(2, 20);
      const mockId  = Date.now();

      await createPost("text", body, mockCid, false);

      // Optionally anchor on native XRPL via Xaman
      if (anchorXRPL && xrplAddress) {
        const payload = await anchorPost(mockCid, String(mockId));
        if (payload?.deepLink) window.open(payload.deepLink, "_blank");
      }

      setBody("");
      onPost?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={composerStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={avatarCircle}>{xrplAddress ? xrplAddress[1] : "?"}</div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={isConnected ? "What's on your mind?" : "Connect your wallet to post…"}
          disabled={!isConnected}
          rows={3}
          style={{
            flex:       1,
            resize:     "vertical",
            minHeight:  "80px",
            padding:    "12px",
            background: "var(--tc-bg-input, #252840)",
            border:     "1px solid var(--tc-border, rgba(255,255,255,0.1))",
            borderRadius: 10,
            color:      "var(--tc-text-primary, #E8ECF4)",
            fontFamily: "var(--tc-font, Inter, sans-serif)",
            fontSize:   14,
            outline:    "none",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        {/* Anchor toggle */}
        {xrplAddress && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tc-text-muted, #64748b)", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={anchorXRPL}
              onChange={e => setAnchorXRPL(e.target.checked)}
              style={{ accentColor: "#6C63FF" }}
            />
            Anchor on XRPL (immutable proof)
          </label>
        )}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <span style={{ fontSize: 12, color: "var(--tc-text-muted)", alignSelf: "center" }}>
            {body.length}/500
          </span>
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            style={{
              padding:      "9px 20px",
              background:   "#6C63FF",
              color:        "#fff",
              border:       "none",
              borderRadius: 9999,
              fontWeight:   600,
              fontSize:     14,
              cursor:       submitting || !body.trim() ? "not-allowed" : "pointer",
              opacity:      submitting || !body.trim() ? 0.6 : 1,
            }}
          >
            {submitting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────
function PostCard({ post }) {
  const { likePost, isConnected, openModal } = useWeb3();
  const [liked,  setLiked]  = useState(post.liked);
  const [likes,  setLikes]  = useState(post.likes);

  function handleLike() {
    if (!isConnected) { openModal(); return; }
    if (liked) { setLiked(false); setLikes(l => l - 1); }
    else        { setLiked(true);  setLikes(l => l + 1); likePost(post.id); }
  }

  return (
    <article style={postCardStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ ...avatarCircle, flexShrink: 0 }}>
          {post.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href={`/profile/${post.author}`} style={{ fontSize: 14, fontWeight: 600, color: "var(--tc-text-primary, #E8ECF4)", textDecoration: "none" }}>
              {post.name}
            </Link>
            {post.badge === "creator" && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 9999, background: "linear-gradient(135deg,#F5A623,#FFD700)", color: "#1A1D2E" }}>
                ✦ Creator
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)" }}>
            {truncateAddress(post.author)} · {post.time}
          </div>
        </div>
      </div>

      {/* Body */}
      {post.exclusive ? (
        <div style={{ padding: "16px", background: "rgba(108,99,255,0.08)", borderRadius: 10, textAlign: "center", border: "1px dashed rgba(108,99,255,0.3)" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--tc-text-secondary, #94a3b8)" }}>
            {post.body.slice(0, 80)}…
          </p>
          <Link href={`/profile/${post.author}`} style={{ display: "inline-block", marginTop: 12, padding: "7px 16px", background: "#6C63FF", color: "#fff", borderRadius: 9999, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Subscribe to unlock
          </Link>
        </div>
      ) : (
        <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.7, color: "var(--tc-text-primary, #E8ECF4)" }}>
          {post.body}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 20, paddingTop: 10, borderTop: "1px solid var(--tc-border, rgba(255,255,255,0.06))" }}>
        <button onClick={handleLike} style={{ ...actionBtnStyle, color: liked ? "#ef4444" : "var(--tc-text-muted, #64748b)" }}>
          {liked ? "❤️" : "🤍"} {likes}
        </button>
        <button style={actionBtnStyle}>
          💬 {post.comments}
        </button>
        <button style={actionBtnStyle}>
          🔗 Share
        </button>
      </div>
    </article>
  );
}

// ── Right Sidebar Widget ──────────────────────────────────────────────────
function RightWidget() {
  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* People you may know */}
      <div style={widgetCard}>
        <h3 style={widgetTitle}>People you may know</h3>
        {["Dave", "Eve", "Frank"].map(n => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ ...avatarCircle, width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>{n[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tc-text-primary, #E8ECF4)" }}>{n}</div>
              <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)" }}>3 mutual friends</div>
            </div>
            <button style={{ padding: "4px 12px", background: "rgba(108,99,255,0.15)", color: "#6C63FF", border: "none", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Follow</button>
          </div>
        ))}
      </div>

      {/* XRPL info chip */}
      <div style={{ ...widgetCard, background: "linear-gradient(135deg,rgba(108,99,255,0.1),rgba(156,111,255,0.05))", border: "1px solid rgba(108,99,255,0.2)" }}>
        <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", lineHeight: 1.6 }}>
          🔗 <strong>All posts anchored on XRPL</strong><br/>
          Immutable on-chain proof via transaction memos.<br/>
          3–5s finality · near-zero fees
        </div>
      </div>
    </aside>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function FeedPage({ theme, setTheme }) {
  const { isConnected, authLoading, openModal } = useWeb3();
  const [posts,  setPosts]  = useState(DEMO_POSTS);
  const [refresh, setRefresh] = useState(0);

  if (authLoading) {
    return (
      <Layout title="Home" theme={theme} setTheme={setTheme}>
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 20px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⟳</div>
            <p style={{ color: "var(--tc-text-muted, #64748b)" }}>Loading…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isConnected) {
    return (
      <Layout title="Welcome" theme={theme} setTheme={setTheme}>
        <div style={{ maxWidth: 520, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🌐</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Welcome to TribeConnect</h1>
          <p style={{ fontSize: 16, color: "var(--tc-text-muted, #64748b)", marginBottom: 32, lineHeight: 1.7 }}>
            A decentralised social platform built on the <strong>XRP Ledger</strong>.
            Sign in with Xaman or WalletConnect to get started.
          </p>
          <button onClick={openModal} style={{
            padding:      "14px 36px",
            background:   "linear-gradient(135deg,#6C63FF,#9C6FFF)",
            color:        "#fff",
            border:       "none",
            borderRadius: 9999,
            fontWeight:   700,
            fontSize:     16,
            cursor:       "pointer",
            boxShadow:    "0 4px 20px rgba(108,99,255,0.35)",
          }}>
            Connect Wallet
          </button>
          <p style={{ marginTop: 24, fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>
            Supports Xaman (native XRPL) and WalletConnect (XRPL EVM)
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Home" theme={theme} setTheme={setTheme}>
      <div style={{
        display:       "grid",
        gridTemplateColumns: "minmax(0,1fr) 300px",
        gap:           24,
        maxWidth:      900,
        margin:        "0 auto",
        padding:       "24px 20px",
      }}>
        {/* Feed column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PostComposer onPost={() => setRefresh(r => r + 1)} />
          {posts.map(p => <PostCard key={p.id} post={p} />)}
        </div>

        {/* Right widgets */}
        <RightWidget />
      </div>
    </Layout>
  );
}

// ── Shared styles ────────────────────────────────────────────────────────
const composerStyle = {
  background:   "var(--tc-card, #1e293b)",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
  borderRadius: 14,
  padding:      "16px",
};

const postCardStyle = {
  background:   "var(--tc-card, #1e293b)",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
  borderRadius: 14,
  padding:      "18px",
};

const avatarCircle = {
  width:          44,
  height:         44,
  borderRadius:   "50%",
  background:     "linear-gradient(135deg,#6C63FF,#9C6FFF)",
  color:          "#fff",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  fontWeight:     700,
  fontSize:       18,
};

const actionBtnStyle = {
  display:    "flex",
  alignItems: "center",
  gap:        5,
  background: "none",
  border:     "none",
  cursor:     "pointer",
  fontSize:   13,
  color:      "var(--tc-text-muted, #64748b)",
  padding:    "4px 8px",
  borderRadius: 8,
};

const widgetCard = {
  background:   "var(--tc-card, #1e293b)",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
  borderRadius: 14,
  padding:      "16px",
};

const widgetTitle = {
  fontSize:     13,
  fontWeight:   700,
  color:        "var(--tc-text-muted, #64748b)",
  marginBottom: 14,
  textTransform:"uppercase",
  letterSpacing:"0.05em",
  margin:       "0 0 14px",
};
