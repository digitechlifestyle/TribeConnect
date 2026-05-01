/**
 * XamanQR — displays the XUMM/Xaman QR code and polls for sign completion.
 *
 * Props:
 *   onSuccess(address)  — called when the user approves in Xaman
 *   onError(err)        — called on failure / expiry
 *   onCancel()          — called when the user clicks "Cancel"
 */
import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";

const POLL_INTERVAL = 2500; // ms

export default function XamanQR({ onSuccess, onError, onCancel }) {
  const [state, setState]     = useState("loading"); // loading | ready | signed | expired | error
  const [deepLink, setDeepLink] = useState(null);
  const [qrUrl, setQrUrl]     = useState(null);
  const [uuid, setUuid]       = useState(null);
  const pollRef               = useRef(null);

  // Create sign-in payload on mount
  useEffect(() => {
    let cancelled = false;

    async function createPayload() {
      try {
        const res  = await fetch("/api/xumm/signin", { method: "POST" });
        if (!res.ok) throw new Error("Failed to create Xaman payload");
        const data = await res.json();
        if (cancelled) return;
        setQrUrl(data.qrUrl);
        setDeepLink(data.deepLink);
        setUuid(data.uuid);
        setState("ready");
      } catch (e) {
        if (!cancelled) {
          setState("error");
          onError?.(e);
        }
      }
    }

    createPayload();
    return () => { cancelled = true; };
  }, []);

  // Poll for resolution once we have a uuid
  useEffect(() => {
    if (!uuid || state !== "ready") return;

    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/xumm/status?uuid=${uuid}`);
        const data = await res.json();

        if (data.signed && data.account) {
          clearInterval(pollRef.current);
          setState("signed");
          // Persist JWT session server-side
          await fetch("/api/auth/session", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ address: data.account, walletType: "xaman", uuid }),
          });
          onSuccess?.(data.account);
        } else if (data.expired || data.rejected) {
          clearInterval(pollRef.current);
          setState("expired");
          onError?.(new Error("Xaman sign-in expired or rejected"));
        }
      } catch (_) {}
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [uuid, state]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {state === "loading" && (
        <div style={styles.placeholder}>
          <div style={styles.spinner} />
          <p style={styles.hint}>Generating QR code…</p>
        </div>
      )}

      {state === "ready" && qrUrl && (
        <>
          <div style={styles.qrWrapper}>
            {/* Use the Xaman-hosted QR PNG for best compatibility */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Xaman QR code" style={styles.qrImage} />
          </div>
          <p style={styles.hint}>
            Open <strong>Xaman</strong> and scan to sign in
          </p>
          <a href={deepLink} style={styles.deepLinkBtn} target="_blank" rel="noopener noreferrer">
            Open in Xaman app
          </a>
          <button onClick={onCancel} style={styles.cancelBtn}>
            Cancel
          </button>
        </>
      )}

      {state === "signed" && (
        <div style={styles.success}>
          <span style={styles.checkIcon}>✓</span>
          <p style={styles.hint}>Signed in successfully!</p>
        </div>
      )}

      {(state === "expired" || state === "error") && (
        <div style={styles.errorBox}>
          <p style={styles.errorText}>
            {state === "expired"
              ? "QR code expired. Please try again."
              : "Something went wrong. Please try again."}
          </p>
          <button onClick={onCancel} style={styles.cancelBtn}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

// ── Inline styles (zero extra deps) ────────────────────────────────────
const styles = {
  container: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    gap:            "16px",
    padding:        "8px",
  },
  placeholder: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    gap:           "12px",
    height:        "200px",
    justifyContent:"center",
  },
  spinner: {
    width:  "36px",
    height: "36px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#6C63FF",
    borderRadius:   "50%",
    animation:      "spin 0.8s linear infinite",
  },
  qrWrapper: {
    padding:      "12px",
    background:   "#fff",
    borderRadius: "12px",
    boxShadow:    "0 2px 12px rgba(0,0,0,0.12)",
  },
  qrImage: {
    width:  "200px",
    height: "200px",
    display:"block",
  },
  hint: {
    margin:    0,
    fontSize:  "14px",
    color:     "#64748b",
    textAlign: "center",
  },
  deepLinkBtn: {
    display:        "inline-block",
    padding:        "10px 20px",
    background:     "#6C63FF",
    color:          "#fff",
    borderRadius:   "8px",
    textDecoration: "none",
    fontSize:       "14px",
    fontWeight:     600,
  },
  cancelBtn: {
    background:   "transparent",
    border:       "1px solid #e2e8f0",
    borderRadius: "8px",
    padding:      "8px 20px",
    cursor:       "pointer",
    fontSize:     "13px",
    color:        "#64748b",
  },
  success: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    gap:            "8px",
    padding:        "24px",
  },
  checkIcon: {
    fontSize:        "48px",
    color:           "#22c55e",
    lineHeight:       1,
  },
  errorBox: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    gap:            "12px",
    padding:        "24px",
  },
  errorText: {
    color:     "#ef4444",
    fontSize:  "14px",
    textAlign: "center",
    margin:    0,
  },
};
