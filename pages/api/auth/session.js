/**
 * GET  /api/auth/session  — Returns current session { address, walletType } or 401
 * POST /api/auth/session  — Issues a JWT for a verified XRPL address (called after
 *                           client-side Xaman WS confirmation)
 * DELETE /api/auth/session — Clears the session cookie (sign-out)
 */
import { signJwt, verifyJwt } from "../../../lib/jwt";

const COOKIE_NAME = "tc-session";
const COOKIE_OPTS = (maxAge) =>
  `${COOKIE_NAME}=${maxAge ? "" : "deleted"}; HttpOnly; Path=/; Max-Age=${maxAge ?? 0}; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;

export default async function handler(req, res) {
  // ── GET — return current session ──────────────────────────────────────
  if (req.method === "GET") {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = verifyJwt(token);
    if (!decoded) return res.status(401).json({ error: "Invalid or expired session" });

    return res.status(200).json({
      address:    decoded.address,
      walletType: decoded.walletType || "xaman",
      iat:        decoded.iat,
      exp:        decoded.exp,
    });
  }

  // ── POST — create session after client confirms Xaman sign-in ─────────
  if (req.method === "POST") {
    const { address, walletType, uuid } = req.body || {};
    if (!address) return res.status(400).json({ error: "address required" });

    // Validate the uuid payload was actually signed (extra safety)
    if (uuid) {
      try {
        const { XummSdk } = await import("xumm-sdk");
        const xumm    = new XummSdk(process.env.XUMM_API_KEY, process.env.XUMM_API_SECRET);
        const payload = await xumm.payload.get(uuid);
        const ok      = payload?.meta?.signed && payload?.response?.account === address;
        if (!ok) return res.status(403).json({ error: "Payload not signed by this account" });
      } catch (e) {
        console.error("[auth/session POST]", e);
        return res.status(500).json({ error: "Could not verify payload" });
      }
    }

    const token = signJwt({ address, walletType: walletType || "xaman" });
    res.setHeader("Set-Cookie", COOKIE_OPTS(60 * 60 * 24 * 7) + `; Max-Age=${60 * 60 * 24 * 7}`);
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    return res.status(200).json({ ok: true, address });
  }

  // ── DELETE — sign out ─────────────────────────────────────────────────
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
