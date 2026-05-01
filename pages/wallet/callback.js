/**
 * /wallet/callback
 * Xaman deep-link return URL.
 * Xaman redirects here after a mobile sign. We show a "return to app" prompt.
 */
import { useEffect, useState } from "react";
import { useRouter }           from "next/router";

export default function WalletCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const { uuid } = router.query;
    if (!uuid) { setStatus("no-uuid"); return; }

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res  = await fetch(`/api/xumm/status?uuid=${uuid}`);
        const data = await res.json();

        if (data.signed && data.account) {
          clearInterval(interval);
          // Persist session
          await fetch("/api/auth/session", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ address: data.account, walletType: "xaman", uuid }),
          });
          setStatus("signed");
          setTimeout(() => router.replace("/"), 2000);
        } else if (data.expired || data.rejected || attempts > 20) {
          clearInterval(interval);
          setStatus("failed");
        }
      } catch (_) {}
    }, 1500);

    return () => clearInterval(interval);
  }, [router.query]);

  const msgs = {
    checking: { icon: "⏳", title: "Checking signature…",   sub:  "Please wait" },
    signed:   { icon: "✅", title: "Signed in!",             sub:  "Redirecting to feed…" },
    failed:   { icon: "❌", title: "Sign-in failed",         sub:  "Please try again" },
    "no-uuid":{ icon: "⚠️", title: "Invalid callback URL",  sub:  "No payload UUID found" },
  };

  const m = msgs[status] || msgs.checking;

  return (
    <div style={{
      minHeight:      "100vh",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      background:     "#0F1117",
      color:          "#E8ECF4",
      fontFamily:     "Inter, sans-serif",
      gap:            16,
      padding:        20,
      textAlign:      "center",
    }}>
      <div style={{ fontSize: 56 }}>{m.icon}</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{m.title}</h1>
      <p style={{ color: "#64748b", margin: 0 }}>{m.sub}</p>
      {status === "failed" && (
        <a href="/" style={{ marginTop: 12, padding: "10px 24px", background: "#6C63FF", color: "#fff", borderRadius: 9999, textDecoration: "none", fontWeight: 600 }}>
          Back to Home
        </a>
      )}
    </div>
  );
}
