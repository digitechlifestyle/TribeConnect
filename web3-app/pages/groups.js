/**
 * TribeConnect — Groups
 * Create and join groups stored on XRPL EVM Sidechain smart contract.
 */
import { useState }   from "react";
import Layout         from "../components/Layout/Layout";
import { useWeb3 }    from "../contexts/Web3Context";

const DEMO_GROUPS = [
  { id: 1, name: "XRPL Developers",    members: 1243, desc: "Building on XRP Ledger — tips, tools, and tutorials.",    emoji: "⚡", joined: true  },
  { id: 2, name: "Xaman Users",        members: 892,  desc: "Everything about the Xaman wallet and XUMM ecosystem.",   emoji: "📱", joined: false },
  { id: 3, name: "DeFi on XRPL",       members: 534,  desc: "Decentralised finance innovations on the XRP Ledger.",    emoji: "🏦", joined: true  },
  { id: 4, name: "NFT Creators Hub",   members: 2104, desc: "Mint, trade and discuss XRPL NFTs.",                      emoji: "🎨", joined: false },
  { id: 5, name: "TribeConnect OGs",   members: 318,  desc: "Early adopters of the TribeConnect platform.",            emoji: "🔥", joined: true  },
  { id: 6, name: "XRPL EVM Builders",  members: 211,  desc: "Smart contract development on the XRPL EVM Sidechain.",  emoji: "🛠️", joined: false },
];

export default function GroupsPage({ theme, setTheme }) {
  const { isConnected, createGroup, joinGroup, openModal } = useWeb3();
  const [groups,       setGroups]       = useState(DEMO_GROUPS);
  const [showCreate,   setShowCreate]   = useState(false);
  const [form,         setForm]         = useState({ name: "", desc: "" });
  const [creating,     setCreating]     = useState(false);
  const [search,       setSearch]       = useState("");

  async function handleJoin(group) {
    if (!isConnected) { openModal(); return; }
    setGroups(gs => gs.map(g => g.id === group.id ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g));
    await joinGroup(group.id).catch(console.error);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!isConnected) { openModal(); return; }
    setCreating(true);
    try {
      await createGroup(form.name, form.desc, "");
      setGroups(gs => [{
        id:      Date.now(),
        name:    form.name,
        members: 1,
        desc:    form.desc,
        emoji:   "✨",
        joined:  true,
      }, ...gs]);
      setForm({ name: "", desc: "" });
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  }

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Groups" theme={theme} setTheme={setTheme}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Groups</h1>
          <button
            onClick={() => isConnected ? setShowCreate(s => !s) : openModal()}
            style={purpleBtn}
          >
            + Create Group
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} style={{ ...card, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>New Group</h3>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Group name"
              style={inputStyle}
            />
            <textarea
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Description (optional)"
              rows={2}
              style={{ ...inputStyle, resize: "none", marginTop: 10 }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button type="submit" disabled={creating || !form.name.trim()} style={{ ...purpleBtn, opacity: creating ? 0.7 : 1 }}>
                {creating ? "Creating…" : "Create Group"}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} style={outlineBtn}>Cancel</button>
            </div>
          </form>
        )}

        {/* Search */}
        <div style={{ marginBottom: 20, position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--tc-text-muted, #64748b)" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search groups…"
            style={{ ...inputStyle, paddingLeft: 40 }}
          />
        </div>

        {/* Group grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {filtered.map(group => (
            <div key={group.id} style={card}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width:          52,
                  height:         52,
                  borderRadius:   12,
                  background:     "linear-gradient(135deg,rgba(108,99,255,0.2),rgba(156,111,255,0.1))",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       26,
                  flexShrink:     0,
                  border:         "1px solid rgba(108,99,255,0.2)",
                }}>
                  {group.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--tc-text-primary, #E8ECF4)" }}>{group.name}</div>
                  <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", marginTop: 2 }}>
                    {group.members.toLocaleString()} members
                  </div>
                </div>
              </div>

              <p style={{ margin: "12px 0", fontSize: 13, color: "var(--tc-text-secondary, #94a3b8)", lineHeight: 1.5 }}>
                {group.desc}
              </p>

              <button
                onClick={() => handleJoin(group)}
                style={group.joined ? { ...outlineBtn, width: "100%", color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" } : { ...purpleBtn, width: "100%" }}
              >
                {group.joined ? "✓ Joined" : "Join Group"}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--tc-text-muted, #64748b)" }}>
            No groups found for "{search}"
          </div>
        )}
      </div>
    </Layout>
  );
}

const card = {
  background:   "var(--tc-card, #1e293b)",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.08))",
  borderRadius: 14,
  padding:      "18px",
};

const purpleBtn = {
  padding:      "9px 18px",
  background:   "#6C63FF",
  color:        "#fff",
  border:       "none",
  borderRadius: 9999,
  fontWeight:   600,
  fontSize:     13,
  cursor:       "pointer",
};

const outlineBtn = {
  padding:      "9px 18px",
  background:   "transparent",
  color:        "var(--tc-text-primary, #E8ECF4)",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.2))",
  borderRadius: 9999,
  fontWeight:   600,
  fontSize:     13,
  cursor:       "pointer",
};

const inputStyle = {
  width:        "100%",
  padding:      "10px 14px",
  background:   "var(--tc-bg-input, #252840)",
  border:       "1px solid var(--tc-border, rgba(255,255,255,0.1))",
  borderRadius: 10,
  color:        "var(--tc-text-primary, #E8ECF4)",
  fontFamily:   "var(--tc-font, Inter, sans-serif)",
  fontSize:     14,
  outline:      "none",
  boxSizing:    "border-box",
};
