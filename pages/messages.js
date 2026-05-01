/**
 * TribeConnect — Direct Messages
 * EVM smart-contract DMs via sendDirectMessage()
 */
import { useState }   from "react";
import Layout         from "../components/Layout/Layout";
import { useWeb3 }    from "../contexts/Web3Context";
import { truncateAddress } from "../lib/xrplClient";

const DEMO_THREADS = [
  { id: 1, name: "Alice",   address: "rAlice…",  preview: "Hey! Love the new posts 🔥",       time: "2m",  unread: 2 },
  { id: 2, name: "Bob",     address: "rBob…",    preview: "Did you see the XRPL update?",     time: "1h",  unread: 0 },
  { id: 3, name: "Carol",   address: "rCarol…",  preview: "Your exclusive content is amazing", time: "3h",  unread: 1 },
  { id: 4, name: "Dave",    address: "rDave…",   preview: "Thanks for following back!",        time: "1d",  unread: 0 },
];

const DEMO_MESSAGES = [
  { id: 1, from: "them", text: "Hey! Love the new posts 🔥", time: "2:14 PM" },
  { id: 2, from: "me",   text: "Thanks! Really enjoying building on XRPL.", time: "2:16 PM" },
  { id: 3, from: "them", text: "The Xaman wallet integration is super smooth. No MetaMask headaches!", time: "2:18 PM" },
];

export default function MessagesPage({ theme, setTheme }) {
  const { isConnected, sendDM, xrplAddress, openModal } = useWeb3();
  const [activeThread, setActiveThread] = useState(DEMO_THREADS[0]);
  const [messages,     setMessages]     = useState(DEMO_MESSAGES);
  const [input,        setInput]        = useState("");
  const [sending,      setSending]      = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;
    setSending(true);
    try {
      await sendDM(activeThread.address, input);
      setMessages(m => [...m, { id: Date.now(), from: "me", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      setInput("");
    } finally {
      setSending(false);
    }
  }

  if (!isConnected) {
    return (
      <Layout title="Messages" theme={theme} setTheme={setTheme}>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 style={{ margin: "0 0 12px" }}>Direct Messages</h2>
          <p style={{ color: "var(--tc-text-muted, #64748b)", marginBottom: 24 }}>Connect your wallet to view messages.</p>
          <button onClick={openModal} style={purpleBtn}>Connect Wallet</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Messages" theme={theme} setTheme={setTheme}>
      <div style={{ display: "flex", height: "calc(100vh - var(--tc-topbar-h, 64px))", overflow: "hidden" }}>

        {/* Thread list */}
        <div style={{
          width:        300,
          flexShrink:   0,
          borderRight:  "1px solid var(--tc-border, rgba(255,255,255,0.08))",
          overflowY:    "auto",
          display:      "flex",
          flexDirection:"column",
        }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--tc-border, rgba(255,255,255,0.08))" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Messages</h2>
          </div>

          {DEMO_THREADS.map(thread => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        12,
                padding:    "12px 16px",
                background: activeThread?.id === thread.id ? "rgba(108,99,255,0.1)" : "transparent",
                border:     "none",
                borderLeft: activeThread?.id === thread.id ? "3px solid #6C63FF" : "3px solid transparent",
                cursor:     "pointer",
                textAlign:  "left",
                width:      "100%",
                color:      "inherit",
              }}
            >
              <div style={{ ...avatarCircle, width: 42, height: 42, fontSize: 16, flexShrink: 0 }}>
                {thread.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--tc-text-primary, #E8ECF4)" }}>{thread.name}</span>
                  <span style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)" }}>{thread.time}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--tc-text-muted, #64748b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {thread.preview}
                </div>
              </div>
              {thread.unread > 0 && (
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#6C63FF", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {thread.unread}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Chat window */}
        {activeThread ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Chat header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--tc-border, rgba(255,255,255,0.08))", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ ...avatarCircle, width: 38, height: 38, fontSize: 15 }}>{activeThread.name[0]}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{activeThread.name}</div>
                <div style={{ fontSize: 11, color: "var(--tc-text-muted, #64748b)" }}>{truncateAddress(activeThread.address)}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display:       "flex",
                  justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth:     "70%",
                    padding:      "10px 14px",
                    borderRadius: msg.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background:   msg.from === "me" ? "#6C63FF" : "var(--tc-card, #1e293b)",
                    color:        msg.from === "me" ? "#fff" : "var(--tc-text-primary, #E8ECF4)",
                    border:       msg.from === "me" ? "none" : "1px solid var(--tc-border, rgba(255,255,255,0.08))",
                    fontSize:     14,
                    lineHeight:   1.5,
                  }}>
                    {msg.text}
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: "right" }}>{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{
              padding:     "14px 20px",
              borderTop:   "1px solid var(--tc-border, rgba(255,255,255,0.08))",
              display:     "flex",
              gap:         10,
              alignItems:  "center",
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message…"
                style={{
                  flex:       1,
                  padding:    "10px 16px",
                  background: "var(--tc-bg-input, #252840)",
                  border:     "1px solid var(--tc-border, rgba(255,255,255,0.1))",
                  borderRadius: 9999,
                  color:      "var(--tc-text-primary, #E8ECF4)",
                  fontFamily: "var(--tc-font, Inter, sans-serif)",
                  fontSize:   14,
                  outline:    "none",
                }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                style={{
                  padding:      "10px 20px",
                  background:   "#6C63FF",
                  color:        "#fff",
                  border:       "none",
                  borderRadius: 9999,
                  fontWeight:   600,
                  cursor:       sending || !input.trim() ? "not-allowed" : "pointer",
                  opacity:      sending || !input.trim() ? 0.6 : 1,
                  fontSize:     14,
                }}
              >
                {sending ? "…" : "Send"}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tc-text-muted, #64748b)" }}>
            Select a conversation
          </div>
        )}
      </div>
    </Layout>
  );
}

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

const purpleBtn = {
  padding:      "12px 28px",
  background:   "#6C63FF",
  color:        "#fff",
  border:       "none",
  borderRadius: 9999,
  fontWeight:   700,
  fontSize:     15,
  cursor:       "pointer",
};
