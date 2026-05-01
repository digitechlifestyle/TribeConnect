/**
 * TribeConnect — People / Discover Users
 */
import { useState }   from "react";
import Layout         from "../components/Layout/Layout";
import { useWeb3 }    from "../contexts/Web3Context";
import { truncateAddress } from "../lib/xrplClient";
import Link           from "next/link";

const DEMO_USERS = [
  { address: "rAlice1xrplUser111", name: "Alice",  bio: "XRPL developer & DeFi enthusiast", nfts: 12, verified: true,  creator: true  },
  { address: "rBob2xrplUser2222",  name: "Bob",    bio: "Building on the XRP Ledger since 2018", nfts: 7, verified: true,  creator: false },
  { address: "rCarol3xrplUser33",  name: "Carol",  bio: "Digital artist minting NFTs on XRPL", nfts: 34, verified: false, creator: true  },
  { address: "rDave4xrplUser444",  name: "Dave",   bio: "Xaman power user | XRP hodler",      nfts: 3, verified: false, creator: false },
  { address: "rEve5xrplUserEve5",  name: "Eve",    bio: "Smart contracts on XRPL EVM Sidechain", nfts: 8, verified: true,  creator: false },
  { address: "rFrank6xrplUser66",  name: "Frank",  bio: "Content creator | 12K subscribers",  nfts: 21, verified: true,  creator: true  },
];

export default function UsersPage({ theme, setTheme }) {
  const { isConnected, followUser, openModal } = useWeb3();
  const [following, setFollowing] = useState(new Set());
  const [search,    setSearch]    = useState("");

  async function handleFollow(address) {
    if (!isConnected) { openModal(); return; }
    setFollowing(s => {
      const next = new Set(s);
      if (next.has(address)) next.delete(address);
      else next.add(address);
      return next;
    });
    await followUser(address).catch(console.error);
  }

  const filtered = DEMO_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.bio.toLowerCase().includes(search.toLowerCase()) ||
    u.address.includes(search)
  );

  return (
    <Layout title="People" theme={theme} setTheme={setTheme}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>People</h1>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 24, position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--tc-text-muted, #64748b)" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or XRPL address…"
            style={{
              width:        "100%",
              padding:      "12px 14px 12px 42px",
              background:   "var(--tc-card, #1e293b)",
              border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
              borderRadius: 10,
              color:        "var(--tc-text-primary, #E8ECF4)",
              fontFamily:   "var(--tc-font, Inter, sans-serif)",
              fontSize:     14,
              outline:      "none",
              boxSizing:    "border-box",
            }}
          />
        </div>

        {/* User grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {filtered.map(user => {
            const isFollowing = following.has(user.address);
            return (
              <div key={user.address} style={{
                background:   "var(--tc-card, #1e293b)",
                border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
                borderRadius: 14,
                padding:      "20px",
                textAlign:    "center",
              }}>
                {/* Avatar */}
                <Link href={`/profile/${user.address}`}>
                  <div style={{
                    width:          60,
                    height:         60,
                    borderRadius:   "50%",
                    background:     "linear-gradient(135deg,#6C63FF,#9C6FFF)",
                    color:          "#fff",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontWeight:     700,
                    fontSize:       22,
                    margin:         "0 auto 12px",
                    cursor:         "pointer",
                  }}>
                    {user.name[0]}
                  </div>
                </Link>

                {/* Name + badges */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                  <Link href={`/profile/${user.address}`} style={{ fontSize: 15, fontWeight: 700, color: "var(--tc-text-primary, #E8ECF4)", textDecoration: "none" }}>
                    {user.name}
                  </Link>
                  {user.verified && <span style={{ fontSize: 14, color: "#6C63FF" }}>✓</span>}
                  {user.creator && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 9999, background: "linear-gradient(135deg,#F5A623,#FFD700)", color: "#1A1D2E" }}>✦</span>}
                </div>

                <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)", marginBottom: 8 }}>
                  {truncateAddress(user.address)}
                </div>

                <p style={{ fontSize: 12, color: "var(--tc-text-secondary, #94a3b8)", margin: "0 0 14px", lineHeight: 1.5 }}>
                  {user.bio}
                </p>

                <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)", marginBottom: 14 }}>
                  🖼️ {user.nfts} NFTs
                </div>

                <button
                  onClick={() => handleFollow(user.address)}
                  style={{
                    width:        "100%",
                    padding:      "8px",
                    background:   isFollowing ? "rgba(34,197,94,0.1)" : "#6C63FF",
                    color:        isFollowing ? "#22c55e" : "#fff",
                    border:       isFollowing ? "1px solid rgba(34,197,94,0.3)" : "none",
                    borderRadius: 9999,
                    fontWeight:   600,
                    fontSize:     13,
                    cursor:       "pointer",
                  }}
                >
                  {isFollowing ? "✓ Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
