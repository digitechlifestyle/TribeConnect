/**
 * TribeConnect — Short Video Feed (Reels / TikTok-style)
 *
 * Fullscreen vertical scroll. Each video autoplays when centred in viewport.
 * Viewers can Like, Comment, Share, Tip XRP, and Mint the video as an NFT.
 *
 * XRP incentives:
 *  • Creator earns XRP tips instantly via Xaman
 *  • Top-liked video each hour earns a bonus from the Rewards pool
 *  • Minting a video as an NFT costs 1 XRP (burned as proof-of-creation)
 */
import { useState, useRef, useEffect, useCallback } from "react";
import Layout    from "../components/Layout/Layout";
import TipButton from "../components/Rewards/TipButton";
import { useWeb3 } from "../contexts/Web3Context";
import { truncateAddress } from "../lib/xrplClient";
import Link from "next/link";

// ── Demo video data ────────────────────────────────────────────────────
const DEMO_VIDEOS = [
  {
    id: 1,
    author: "rAlice1xrpl",
    name: "Alice",
    caption: "Built my first dApp on XRPL EVM in 48 hours 🚀 Full tutorial dropping tomorrow! #XRPL #Web3 #BuildInPublic",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/seed/v1/400/700",
    likes: 14200,
    comments: 843,
    shares: 2100,
    tips: "47.5 XRP",
    music: "🎵 Original Sound — Alice",
    verified: true,
    creator: true,
  },
  {
    id: 2,
    author: "rBob2xrpl",
    name: "Bob",
    caption: "XRP payment confirmed in 3.4 seconds with basically zero fees. This is why I left Ethereum 😤 #XRP #Crypto",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    thumbnail: "https://picsum.photos/seed/v2/400/700",
    likes: 8700,
    comments: 421,
    shares: 990,
    tips: "12.2 XRP",
    music: "🎵 Trending Beat",
    verified: false,
    creator: false,
  },
  {
    id: 3,
    author: "rCarol3xrpl",
    name: "Carol ✦",
    caption: "Minting my digital art as an NFT on XRPL — costs less than a coffee ☕ and settles instantly 🎨 #NFT #XRPLNFTs",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/seed/v3/400/700",
    likes: 32400,
    comments: 1820,
    shares: 5400,
    tips: "118.8 XRP",
    music: "🎵 Lofi Chill — Carol",
    verified: true,
    creator: true,
  },
];

// ── Single video card ──────────────────────────────────────────────────
function VideoCard({ video, isActive }) {
  const videoRef  = useRef(null);
  const [liked,   setLiked]   = useState(false);
  const [likes,   setLikes]   = useState(video.likes);
  const [muted,   setMuted]   = useState(true);
  const [paused,  setPaused]  = useState(false);
  const { isConnected, openModal } = useWeb3();

  // Auto-play / pause based on visibility
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) { v.play().catch(() => {}); }
    else           { v.pause(); v.currentTime = 0; }
  }, [isActive]);

  function handleLike() {
    if (!isConnected) { openModal(); return; }
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPaused(false); }
    else           { v.pause(); setPaused(true); }
  }

  return (
    <div style={{
      position:       "relative",
      width:          "100%",
      height:         "100vh",
      maxHeight:      "100vh",
      background:     "#000",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      scrollSnapAlign:"start",
      flexShrink:     0,
    }}>
      {/* Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        loop
        muted={muted}
        playsInline
        onClick={togglePlay}
        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
      />

      {/* Pause overlay */}
      {paused && (
        <div onClick={togglePlay} style={{
          position:       "absolute",
          top:            "50%",
          left:           "50%",
          transform:      "translate(-50%,-50%)",
          background:     "rgba(0,0,0,0.5)",
          borderRadius:   "50%",
          width:          72,
          height:         72,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       32,
          cursor:         "pointer",
        }}>▶</div>
      )}

      {/* Bottom caption */}
      <div style={{
        position:   "absolute",
        bottom:     90,
        left:       16,
        right:      80,
        color:      "#fff",
        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Link href={`/profile/${video.author}`} style={{ fontWeight: 700, fontSize: 15, color: "#fff", textDecoration: "none" }}>
            @{video.name}
          </Link>
          {video.verified && <span style={{ fontSize: 13, color: "#6C63FF" }}>✓</span>}
          {video.creator && <span style={{ fontSize: 10, padding: "2px 6px", background: "linear-gradient(135deg,#F5A623,#FFD700)", borderRadius: 9999, color: "#1A1D2E", fontWeight: 800 }}>✦</span>}
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.5 }}>{video.caption}</p>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{video.music}</p>
      </div>

      {/* Right action bar */}
      <div style={{
        position:      "absolute",
        right:         12,
        bottom:        100,
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           20,
      }}>
        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg,#6C63FF,#9C6FFF)",
            border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 18,
          }}>{video.name[0]}</div>
          <div style={{
            position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
            width: 20, height: 20, borderRadius: "50%",
            background: "#6C63FF", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800,
          }}>+</div>
        </div>

        {/* Like */}
        <ActionBtn icon={liked ? "❤️" : "🤍"} label={fmtNum(likes)} onClick={handleLike} color={liked ? "#ef4444" : "#fff"} />

        {/* Comment */}
        <ActionBtn icon="💬" label={fmtNum(video.comments)} onClick={() => {}} />

        {/* Share */}
        <ActionBtn icon="↗️" label={fmtNum(video.shares)} onClick={() => {}} />

        {/* XRP Tip */}
        <TipButton recipientAddress={video.author} recipientName={video.name} compact />

        {/* Mint as NFT */}
        <ActionBtn icon="🎨" label="Mint" onClick={() => {}} />

        {/* Mute */}
        <ActionBtn icon={muted ? "🔇" : "🔊"} label="" onClick={() => setMuted(m => !m)} />
      </div>

      {/* Tips earned badge */}
      <div style={{
        position:     "absolute",
        top:          16,
        right:        16,
        background:   "rgba(0,0,0,0.6)",
        borderRadius: 20,
        padding:      "4px 12px",
        fontSize:     12,
        fontWeight:   700,
        color:        "#F5A623",
      }}>
        💰 {video.tips} earned
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick, color = "#fff" }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      color,
    }}>
      <span style={{ fontSize: 28, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}>{icon}</span>
      {label && <span style={{ fontSize: 11, fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>{label}</span>}
    </button>
  );
}

function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function VideoPage({ theme, setTheme }) {
  const containerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const { isConnected, openModal } = useWeb3();

  // IntersectionObserver — track which video is centred
  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll("[data-video-card]");
    if (!cards?.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            setActiveIdx(Number(e.target.dataset.idx));
          }
        });
      },
      { threshold: 0.6 }
    );

    cards.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <Layout title="Videos" theme={theme} setTheme={setTheme}>
      {/* Full-screen vertical scroll container */}
      <div
        ref={containerRef}
        style={{
          height:             "calc(100vh - var(--tc-topbar-h, 64px))",
          overflowY:          "scroll",
          scrollSnapType:     "y mandatory",
          scrollBehavior:     "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {DEMO_VIDEOS.map((video, idx) => (
          <div key={video.id} data-video-card data-idx={idx}>
            <VideoCard video={video} isActive={activeIdx === idx} />
          </div>
        ))}
      </div>

      {/* Upload FAB */}
      {isConnected && (
        <button
          onClick={() => {}}
          style={{
            position:     "fixed",
            bottom:       24,
            left:         "calc(var(--tc-sidebar-w, 260px) + 24px)",
            zIndex:       300,
            background:   "linear-gradient(135deg,#6C63FF,#9C6FFF)",
            color:        "#fff",
            border:       "none",
            borderRadius: 9999,
            padding:      "12px 24px",
            fontWeight:   700,
            fontSize:     14,
            cursor:       "pointer",
            boxShadow:    "0 4px 20px rgba(108,99,255,0.5)",
            display:      "flex",
            alignItems:   "center",
            gap:          8,
          }}
        >
          ＋ Upload Video
        </button>
      )}
    </Layout>
  );
}
