/**
 * TribeConnect — Live Streaming Hub
 *
 * Creators go live, viewers send XRP gifts in real time.
 * Each live room has a live gift ticker and leaderboard.
 *
 * Gift tiers (XRP):
 *   🌹 Rose      0.1 XRP
 *   💎 Diamond   1   XRP
 *   🚀 Rocket    5   XRP
 *   👑 Crown     10  XRP
 *   🌊 Wave      50  XRP
 */
import { useState, useEffect, useRef } from "react";
import Layout    from "../components/Layout/Layout";
import { useWeb3 } from "../contexts/Web3Context";

// ── Demo live rooms ────────────────────────────────────────────────────
const LIVE_ROOMS = [
  { id: 1, host: "rAlice1xrpl", name: "Alice", title: "Building an XRPL DApp LIVE 🔴", viewers: 1843, gifts: "847 XRP", verified: true, creator: true,  thumbnail: "https://picsum.photos/seed/live1/400/220" },
  { id: 2, host: "rBob2xrpl",   name: "Bob",   title: "XRP Trading & Market Analysis", viewers: 622,  gifts: "203 XRP", verified: false, creator: false, thumbnail: "https://picsum.photos/seed/live2/400/220" },
  { id: 3, host: "rCarol3xrpl", name: "Carol", title: "NFT Art Creation — XRPL Minting", viewers: 2940, gifts: "1,204 XRP", verified: true, creator: true,  thumbnail: "https://picsum.photos/seed/live3/400/220" },
  { id: 4, host: "rDave4xrpl",  name: "Dave",  title: "Crypto Q&A — Ask Me Anything!", viewers: 384,  gifts: "91 XRP",  verified: false, creator: false, thumbnail: "https://picsum.photos/seed/live4/400/220" },
];

const GIFTS = [
  { emoji: "🌹", name: "Rose",    drops: 100_000,   xrp: "0.1" },
  { emoji: "💎", name: "Diamond", drops: 1_000_000,  xrp: "1" },
  { emoji: "🚀", name: "Rocket",  drops: 5_000_000,  xrp: "5" },
  { emoji: "👑", name: "Crown",   drops: 10_000_000, xrp: "10" },
  { emoji: "🌊", name: "Wave",    drops: 50_000_000, xrp: "50" },
];

// ── Live Room View ─────────────────────────────────────────────────────
function LiveRoom({ room, onBack }) {
  const { isConnected, xrplAddress, xamanSendTx, openModal } = useWeb3();
  const [chat,     setChat]     = useState([
    { id: 1, user: "Eve",   msg: "Let's gooo!! 🔥", gift: null },
    { id: 2, user: "Frank", msg: "Great content as always!", gift: "🌹" },
    { id: 3, user: "Grace", msg: "Sent a Crown! 👑", gift: "👑" },
    { id: 4, user: "Dave",  msg: "How do I get started with XRPL?", gift: null },
    { id: 5, user: "Iris",  msg: "Watching from London 🇬🇧", gift: null },
  ]);
  const [msgInput,  setMsgInput]  = useState("");
  const [gifting,   setGifting]   = useState(false);
  const [giftAnim,  setGiftAnim]  = useState(null);
  const [viewers,   setViewers]   = useState(room.viewers);
  const chatEnd = useRef(null);

  // Simulated viewer tick
  useEffect(() => {
    const t = setInterval(() => setViewers(v => v + Math.floor(Math.random() * 5) - 2), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  function sendChat(e) {
    e.preventDefault();
    if (!msgInput.trim()) return;
    if (!isConnected) { openModal(); return; }
    setChat(c => [...c, { id: Date.now(), user: "You", msg: msgInput, gift: null }]);
    setMsgInput("");
  }

  async function sendGift(gift) {
    if (!isConnected) { openModal(); return; }
    setGifting(true);
    try {
      const tx = {
        TransactionType: "Payment",
        Account:          xrplAddress,
        Destination:      room.host,
        Amount:           String(gift.drops),
        Memos: [{ Memo: {
          MemoType: Buffer.from("tc:gift","utf8").toString("hex").toUpperCase(),
          MemoData: Buffer.from(gift.name,"utf8").toString("hex").toUpperCase(),
        }}],
      };
      const p = await xamanSendTx(tx, { identifier: "tc-gift", instruction: `Send ${gift.emoji} ${gift.name} (${gift.xrp} XRP) to ${room.name}` });
      if (p?.deepLink) window.open(p.deepLink, "_blank");
      setGiftAnim(gift.emoji);
      setChat(c => [...c, { id: Date.now(), user: "You", msg: `Sent a ${gift.name}!`, gift: gift.emoji }]);
      setTimeout(() => setGiftAnim(null), 3000);
    } finally {
      setGifting(false);
    }
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - var(--tc-topbar-h,64px))", overflow: "hidden", background: "#000" }}>
      {/* Video area */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <img src={room.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />

        {/* Live badge + viewers */}
        <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ background: "#ef4444", color: "#fff", padding: "3px 10px", borderRadius: 6, fontWeight: 800, fontSize: 13, letterSpacing: "0.05em" }}>🔴 LIVE</span>
          <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", padding: "3px 10px", borderRadius: 6, fontSize: 13 }}>👁 {viewers.toLocaleString()}</span>
          <span style={{ background: "rgba(245,166,35,0.9)", color: "#1A1D2E", padding: "3px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>💰 {room.gifts}</span>
        </div>

        {/* Host info */}
        <div style={{ position: "absolute", bottom: 20, left: 16, color: "#fff" }}>
          <button onClick={onBack} style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", marginBottom: 8, fontSize: 13 }}>← Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#9C6FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff", border: "2px solid #fff" }}>{room.name[0]}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{room.name} {room.verified && "✓"}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{room.title}</div>
            </div>
          </div>
        </div>

        {/* Gift animation */}
        {giftAnim && (
          <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 80, animation: "giftPop 2s ease-out forwards", pointerEvents: "none", zIndex: 100 }}>
            {giftAnim}
          </div>
        )}
      </div>

      {/* Chat panel */}
      <div style={{
        width:         340,
        flexShrink:    0,
        background:    "var(--tc-card, #1e293b)",
        borderLeft:    "1px solid var(--tc-border, rgba(255,255,255,0.08))",
        display:       "flex",
        flexDirection: "column",
      }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--tc-border, rgba(255,255,255,0.08))", fontWeight: 700, fontSize: 14 }}>
          💬 Live Chat
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {chat.map(m => (
            <div key={m.id} style={{ fontSize: 13, lineHeight: 1.5 }}>
              {m.gift && <span style={{ marginRight: 4 }}>{m.gift}</span>}
              <strong style={{ color: m.gift ? "#F5A623" : "#6C63FF" }}>{m.user}: </strong>
              <span style={{ color: "var(--tc-text-secondary, #94a3b8)" }}>{m.msg}</span>
            </div>
          ))}
          <div ref={chatEnd} />
        </div>

        {/* Gift bar */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid var(--tc-border, rgba(255,255,255,0.08))", display: "flex", gap: 6, overflowX: "auto" }}>
          {GIFTS.map(g => (
            <button key={g.name} onClick={() => sendGift(g)} disabled={gifting} title={`${g.name} — ${g.xrp} XRP`} style={{
              flexShrink:   0,
              display:      "flex",
              flexDirection:"column",
              alignItems:   "center",
              padding:      "8px 10px",
              background:   "rgba(245,166,35,0.1)",
              border:       "1px solid rgba(245,166,35,0.3)",
              borderRadius: 10,
              cursor:       "pointer",
              gap:          2,
            }}>
              <span style={{ fontSize: 22 }}>{g.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#F5A623" }}>{g.xrp} XRP</span>
            </button>
          ))}
        </div>

        {/* Chat input */}
        <form onSubmit={sendChat} style={{ padding: "10px 12px", borderTop: "1px solid var(--tc-border, rgba(255,255,255,0.08))", display: "flex", gap: 8 }}>
          <input
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
            placeholder={isConnected ? "Say something…" : "Connect to chat"}
            disabled={!isConnected}
            style={{ flex: 1, padding: "8px 12px", background: "var(--tc-bg-input, #252840)", border: "1px solid var(--tc-border, rgba(255,255,255,0.1))", borderRadius: 20, color: "var(--tc-text-primary, #E8ECF4)", fontSize: 13, outline: "none", fontFamily: "var(--tc-font, Inter, sans-serif)" }}
          />
          <button type="submit" style={{ padding: "8px 14px", background: "#6C63FF", border: "none", borderRadius: 20, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>→</button>
        </form>
      </div>

      <style>{`@keyframes giftPop { 0%{opacity:1;transform:translate(-50%,-50%) scale(0.5)} 50%{opacity:1;transform:translate(-50%,-80%) scale(1.2)} 100%{opacity:0;transform:translate(-50%,-120%) scale(1)} }`}</style>
    </div>
  );
}

// ── Room card ──────────────────────────────────────────────────────────
function RoomCard({ room, onJoin }) {
  return (
    <div onClick={() => onJoin(room)} style={{ cursor: "pointer", borderRadius: 14, overflow: "hidden", background: "var(--tc-card, #1e293b)", border: "1px solid var(--tc-border, rgba(255,255,255,0.08))", transition: "transform 0.2s" }}>
      <div style={{ position: "relative" }}>
        <img src={room.thumbnail} alt={room.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
        <span style={{ position: "absolute", top: 10, left: 10, background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: 6, fontWeight: 800, fontSize: 12 }}>🔴 LIVE</span>
        <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", color: "#fff", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>👁 {room.viewers.toLocaleString()}</span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#9C6FFF)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>{room.name[0]}</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{room.name} {room.verified && "✓"}</span>
          {room.creator && <span style={{ fontSize: 10, padding: "2px 6px", background: "linear-gradient(135deg,#F5A623,#FFD700)", borderRadius: 9999, color: "#1A1D2E", fontWeight: 800 }}>✦</span>}
        </div>
        <div style={{ fontSize: 13, color: "var(--tc-text-primary, #E8ECF4)", fontWeight: 600, marginBottom: 6 }}>{room.title}</div>
        <div style={{ fontSize: 12, color: "#F5A623", fontWeight: 700 }}>💰 {room.gifts} gifted</div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function LivePage({ theme, setTheme }) {
  const { isConnected, openModal } = useWeb3();
  const [activeRoom, setActiveRoom] = useState(null);

  if (activeRoom) {
    return (
      <Layout title="Live" theme={theme} setTheme={setTheme}>
        <LiveRoom room={activeRoom} onBack={() => setActiveRoom(null)} />
      </Layout>
    );
  }

  return (
    <Layout title="Live" theme={theme} setTheme={setTheme}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>🔴 Live Now</h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--tc-text-muted, #64748b)" }}>Send XRP gifts to creators in real time</p>
          </div>
          <button
            onClick={() => isConnected ? alert("Live streaming coming — integrate with your WebRTC provider") : openModal()}
            style={{ padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 9999, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            🔴 Go Live
          </button>
        </div>

        {/* Gift stats banner */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, padding: "16px", background: "linear-gradient(135deg,rgba(108,99,255,0.1),rgba(245,166,35,0.05))", borderRadius: 14, border: "1px solid rgba(108,99,255,0.2)", flexWrap: "wrap" }}>
          {[["💰", "2,345 XRP", "Gifted today"],["👁", "5,789", "Live viewers"],["🔴", "4", "Live rooms"],["🏆", "Carol", "Top earner"]].map(([icon, val, lbl]) => (
            <div key={lbl} style={{ flex: 1, minWidth: 120, textAlign: "center" }}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#6C63FF" }}>{val}</div>
              <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)" }}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {LIVE_ROOMS.map(room => (
            <RoomCard key={room.id} room={room} onJoin={setActiveRoom} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
