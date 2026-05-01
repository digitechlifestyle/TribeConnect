/**
 * TribeConnect — Tribe Spaces (Audio Rooms)
 * Clubhouse/Twitter Spaces-style live audio rooms.
 * Hosts can charge XRP entry or keep rooms free.
 * Guests can tip speakers via Xaman.
 */
import { useState, useEffect } from "react";
import Layout   from "../components/Layout/Layout";
import { useWeb3 } from "../contexts/Web3Context";

const SPACES = [
  { id: 1, title: "XRPL Developer AMA — Ask Anything!",   host: "Alice", speakers: ["Bob","Carol"], listeners: 847,  live: true,  paid: false, topic: "🛠 Tech" },
  { id: 2, title: "XRP Price & Market Outlook Q3 2026",    host: "Dave",  speakers: ["Eve"],         listeners: 1243, live: true,  paid: false, topic: "📈 Markets" },
  { id: 3, title: "NFT Creators Roundtable — XRPL NFTs",  host: "Carol", speakers: ["Frank","Alice"],listeners: 392,  live: true,  paid: true,  price: "1 XRP", topic: "🎨 NFTs" },
  { id: 4, title: "Crypto & Coffee — Morning Edition",     host: "Grace", speakers: [],              listeners: 58,   live: true,  paid: false, topic: "☕ Casual" },
  { id: 5, title: "TribeConnect Product Roadmap Reveal",   host: "TC",    speakers: ["Alice","Bob"], listeners: 2840, live: false, scheduled: "Tomorrow 3PM", topic: "📣 Platform" },
];

function SpeakerAvatar({ name, isSpeaking }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width:        56,
        height:       56,
        borderRadius: "50%",
        background:   "linear-gradient(135deg,#6C63FF,#9C6FFF)",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        color:        "#fff",
        fontWeight:   800,
        fontSize:     20,
        border:       isSpeaking ? "3px solid #22c55e" : "3px solid transparent",
        boxShadow:    isSpeaking ? "0 0 0 2px rgba(34,197,94,0.4)" : "none",
        transition:   "all 0.3s",
      }}>
        {name[0].toUpperCase()}
      </div>
      <span style={{ fontSize: 11, color: "var(--tc-text-secondary, #94a3b8)", textAlign: "center", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
        {isSpeaking && " 🎙"}
      </span>
    </div>
  );
}

function SpaceRoom({ space, onLeave }) {
  const { isConnected, xamanSendTx, xrplAddress, openModal } = useWeb3();
  const [speaking,   setSpeaking]   = useState("Alice");
  const [handRaised, setHandRaised] = useState(false);
  const [muted,      setMuted]      = useState(true);
  const [listeners,  setListeners]  = useState(space.listeners);

  useEffect(() => {
    const speakers = [space.host, ...space.speakers];
    let i = 0;
    const t = setInterval(() => { setSpeaking(speakers[i++ % speakers.length]); }, 4000);
    const t2 = setInterval(() => setListeners(n => n + Math.floor(Math.random() * 4) - 1), 5000);
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);

  const allSpeakers = [space.host, ...space.speakers];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
      <button onClick={onLeave} style={{ background: "transparent", border: "none", color: "var(--tc-text-muted, #64748b)", cursor: "pointer", marginBottom: 16, fontSize: 13 }}>← Back to Spaces</button>

      <div style={{ background: "var(--tc-card, #1e293b)", borderRadius: 20, padding: 28, border: "1px solid var(--tc-border, rgba(255,255,255,0.08))" }}>
        {/* Room header */}
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--tc-border, rgba(255,255,255,0.08))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 6, display: "block" }}>🔴 LIVE SPACE</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", lineHeight: 1.3 }}>{space.title}</h2>
              <div style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>
                <span>👁 {listeners.toLocaleString()} listening</span>
                <span>•</span>
                <span>🎙 {allSpeakers.length} speakers</span>
              </div>
            </div>
            <button onClick={onLeave} style={{ background: "#ef4444", border: "none", color: "#fff", borderRadius: 9999, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Leave</button>
          </div>
        </div>

        {/* Speakers */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--tc-text-muted, #64748b)", marginBottom: 16 }}>Speakers</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {allSpeakers.map(s => <SpeakerAvatar key={s} name={s} isSpeaking={speaking === s} />)}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
          <CtrlBtn icon={muted ? "🔇" : "🎙"} label={muted ? "Unmute" : "Mute"} onClick={() => setMuted(m => !m)} color={muted ? undefined : "#22c55e"} />
          <CtrlBtn icon={handRaised ? "✋" : "🤚"} label="Raise Hand" onClick={() => setHandRaised(h => !h)} color={handRaised ? "#F5A623" : undefined} />
          <CtrlBtn icon="💸" label="Tip Speaker" onClick={async () => {
            if (!isConnected) { openModal(); return; }
            const p = await xamanSendTx({
              TransactionType: "Payment", Account: xrplAddress,
              Destination: "rAlice1xrpl", Amount: "1000000",
              Memos: [{ Memo: { MemoType: "74633A746970", MemoData: "7370616365" } }],
            });
            if (p?.deepLink) window.open(p.deepLink, "_blank");
          }} />
          <CtrlBtn icon="🔗" label="Share" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
}

function CtrlBtn({ icon, label, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      gap:            4,
      padding:        "12px 16px",
      background:     color ? `${color}22` : "var(--tc-bg-input, #252840)",
      border:         `1px solid ${color || "var(--tc-border, rgba(255,255,255,0.1))"}`,
      borderRadius:   12,
      cursor:         "pointer",
      color:          color || "var(--tc-text-primary, #E8ECF4)",
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}

export default function SpacesPage({ theme, setTheme }) {
  const { isConnected, openModal } = useWeb3();
  const [activeSpace, setActiveSpace] = useState(null);

  if (activeSpace) {
    return (
      <Layout title="Spaces" theme={theme} setTheme={setTheme}>
        <SpaceRoom space={activeSpace} onLeave={() => setActiveSpace(null)} />
      </Layout>
    );
  }

  return (
    <Layout title="Tribe Spaces" theme={theme} setTheme={setTheme}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>🎙 Tribe Spaces</h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>Live audio rooms — tip speakers with XRP</p>
          </div>
          <button
            onClick={() => isConnected ? {} : openModal()}
            style={{ padding: "10px 20px", background: "#6C63FF", color: "#fff", border: "none", borderRadius: 9999, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            + Start a Space
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SPACES.map(space => (
            <div
              key={space.id}
              onClick={() => space.live && setActiveSpace(space)}
              style={{
                background:   "var(--tc-card, #1e293b)",
                border:       `1px solid ${space.live ? "rgba(108,99,255,0.2)" : "var(--tc-border, rgba(255,255,255,0.08))"}`,
                borderRadius: 14,
                padding:      "18px 20px",
                cursor:       space.live ? "pointer" : "default",
                display:      "flex",
                gap:          16,
                alignItems:   "center",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {space.live
                    ? <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", background: "#ef4444", color: "#fff", borderRadius: 6 }}>🔴 LIVE</span>
                    : <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", background: "rgba(108,99,255,0.2)", color: "#6C63FF", borderRadius: 6 }}>📅 {space.scheduled}</span>
                  }
                  <span style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)" }}>{space.topic}</span>
                  {space.paid && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: "rgba(245,166,35,0.2)", color: "#F5A623", borderRadius: 6 }}>💰 {space.price} entry</span>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "var(--tc-text-primary, #E8ECF4)" }}>{space.title}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--tc-text-muted, #64748b)" }}>
                  <span>Host: {space.host}</span>
                  {space.speakers.length > 0 && <span>🎙 {[space.host,...space.speakers].join(", ")}</span>}
                  <span>👁 {space.listeners.toLocaleString()}</span>
                </div>
              </div>
              {space.live && (
                <button onClick={e => { e.stopPropagation(); setActiveSpace(space); }} style={{ padding: "9px 18px", background: "#6C63FF", border: "none", borderRadius: 9999, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
                  Join
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
