/**
 * AdBanner — TribeConnect native advertising unit
 *
 * Three formats:
 *   "feed"     — inline sponsored post card (between feed items)
 *   "sidebar"  — right-rail 300×250 banner
 *   "video"    — overlay strip on video feed
 *
 * Monetisation model:
 *   • Free users see all ad formats
 *   • Pro/Creator users see sidebar only (less intrusive)
 *   • Revenue tracked per impression/click (future: on-chain via TC token)
 *
 * Props:
 *   format   "feed" | "sidebar" | "video"
 *   slot     number  (1, 2, 3 … allows A/B rotation)
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useWeb3 } from "../../contexts/Web3Context";

// Demo ad inventory — replace with real ad server / Google Ad Manager calls
const AD_INVENTORY = {
  feed: [
    {
      id:       "f1",
      brand:    "CryptoExchange Pro",
      tagline:  "Trade XRP with 0% fees this month",
      cta:      "Start Trading →",
      href:     "https://example.com/exchange",
      img:      "https://picsum.photos/seed/ad1/600/200",
      badge:    "Sponsored",
    },
    {
      id:       "f2",
      brand:    "NFT Creator Tools",
      tagline:  "Mint, list and sell your NFTs on XRPL in 60 seconds",
      cta:      "Try Free →",
      href:     "https://example.com/nft",
      img:      "https://picsum.photos/seed/ad2/600/200",
      badge:    "Promoted",
    },
    {
      id:       "f3",
      brand:    "TribeConnect Ads",
      tagline:  "Reach 50,000+ crypto-native users. Advertise with us.",
      cta:      "Get Started →",
      href:     "/advertise",
      img:      null,
      badge:    "Ad",
      selfPromo: true,
    },
  ],
  sidebar: [
    {
      id:       "s1",
      brand:    "Xaman Wallet",
      tagline:  "The safest way to hold XRP",
      sub:      "4M+ users worldwide",
      cta:      "Download Free",
      href:     "https://xaman.app",
      img:      "https://picsum.photos/seed/ads1/300/150",
    },
    {
      id:       "s2",
      brand:    "XRPL Foundation",
      tagline:  "Build on the fastest blockchain",
      sub:      "Grants available for developers",
      cta:      "Apply Now",
      href:     "https://xrpl.org",
      img:      "https://picsum.photos/seed/ads2/300/150",
    },
    {
      id:       "s3",
      brand:    "Advertise Here",
      tagline:  "Reach TribeConnect's creator community",
      sub:      "From $50/week · XRP payments accepted",
      cta:      "Contact Us",
      href:     "/advertise",
      img:      null,
      selfPromo: true,
    },
  ],
  video: [
    {
      id:   "v1",
      text: "Sponsored · CryptoExchange Pro — Trade XRP with 0% fees",
      cta:  "Learn More",
      href: "https://example.com",
    },
    {
      id:   "v2",
      text: "Promoted · Xaman Wallet — Secure your XRP today",
      cta:  "Get App",
      href: "https://xaman.app",
    },
  ],
};

// Track impression (stub — hook up to analytics/ad-server in production)
function trackImpression(adId, format) {
  if (typeof window !== "undefined") {
    console.debug("[TC Ads] impression:", adId, format);
  }
}

function trackClick(adId, format) {
  if (typeof window !== "undefined") {
    console.debug("[TC Ads] click:", adId, format);
  }
}

export default function AdBanner({ format = "feed", slot = 0 }) {
  const { isPro } = useWeb3();
  const [dismissed, setDismissed] = useState(false);

  const inventory = AD_INVENTORY[format] || AD_INVENTORY.feed;
  const ad        = inventory[slot % inventory.length];

  useEffect(() => {
    if (ad) trackImpression(ad.id, format);
  }, [ad, format]);

  // Pro/Creator users: skip feed ads (sidebar only)
  if (isPro && format === "feed") return null;
  if (dismissed) return null;
  if (!ad) return null;

  // ── Feed ad ────────────────────────────────────────────────────────────
  if (format === "feed") {
    return (
      <div style={{
        background:   "var(--tc-card, #1e293b)",
        border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
        borderRadius: 14,
        overflow:     "hidden",
        marginBottom: 12,
        position:     "relative",
      }}>
        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss ad"
          style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.4)", border: "none", color: "#fff", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
        >✕</button>

        {ad.img && (
          <img src={ad.img} alt={ad.brand} style={{ width: "100%", height: 140, objectFit: "cover" }} />
        )}

        <div style={{ padding: "14px 16px", background: ad.selfPromo ? "linear-gradient(135deg,rgba(108,99,255,0.1),rgba(156,111,255,0.05))" : undefined }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.08)", color: "var(--tc-text-muted, #64748b)" }}>
              {ad.badge || "Sponsored"}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tc-text-primary, #E8ECF4)" }}>{ad.brand}</span>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--tc-text-secondary, #94a3b8)", lineHeight: 1.5 }}>
            {ad.tagline}
          </p>
          <a
            href={ad.href}
            target={ad.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={() => trackClick(ad.id, format)}
            style={{ display: "inline-block", padding: "8px 18px", background: "#6C63FF", color: "#fff", borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: "none" }}
          >
            {ad.cta}
          </a>
        </div>
      </div>
    );
  }

  // ── Sidebar ad ─────────────────────────────────────────────────────────
  if (format === "sidebar") {
    return (
      <div style={{
        background:   "var(--tc-card, #1e293b)",
        border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
        borderRadius: 12,
        overflow:     "hidden",
        position:     "relative",
      }}>
        <div style={{ position: "absolute", top: 6, right: 6, fontSize: 9, color: "var(--tc-text-muted, #64748b)", background: "rgba(0,0,0,0.3)", padding: "1px 6px", borderRadius: 3 }}>AD</div>

        {ad.img && (
          <img src={ad.img} alt={ad.brand} style={{ width: "100%", height: 120, objectFit: "cover" }} />
        )}
        {!ad.img && (
          <div style={{ height: 80, background: "linear-gradient(135deg,#6C63FF22,#9C6FFF22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📣</div>
        )}

        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: "var(--tc-text-primary, #E8ECF4)" }}>{ad.brand}</div>
          <div style={{ fontSize: 12, color: "var(--tc-text-secondary, #94a3b8)", marginBottom: 4, lineHeight: 1.4 }}>{ad.tagline}</div>
          {ad.sub && <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)", marginBottom: 10 }}>{ad.sub}</div>}
          <a
            href={ad.href}
            target={ad.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={() => trackClick(ad.id, format)}
            style={{ display: "block", padding: "7px", background: ad.selfPromo ? "linear-gradient(135deg,#6C63FF,#9C6FFF)" : "rgba(108,99,255,0.15)", color: ad.selfPromo ? "#fff" : "#6C63FF", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}
          >
            {ad.cta}
          </a>
        </div>
      </div>
    );
  }

  // ── Video overlay strip ────────────────────────────────────────────────
  if (format === "video") {
    return (
      <div style={{
        position:    "absolute",
        bottom:      80,
        left:        12,
        right:       70,
        background:  "rgba(0,0,0,0.7)",
        borderRadius: 10,
        padding:     "8px 12px",
        display:     "flex",
        alignItems:  "center",
        justifyContent: "space-between",
        gap:         10,
        backdropFilter: "blur(4px)",
        zIndex:      10,
      }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", flex: 1 }}>{ad.text}</span>
        <a
          href={ad.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(ad.id, format)}
          style={{ fontSize: 11, fontWeight: 700, color: "#6C63FF", background: "rgba(108,99,255,0.2)", padding: "4px 10px", borderRadius: 6, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          {ad.cta}
        </a>
        <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
      </div>
    );
  }

  return null;
}
