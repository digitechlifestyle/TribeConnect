/**
 * POST /api/xumm/signin
 *
 * Creates a Xaman (XUMM) sign-in payload and returns:
 *   - uuid      — payload UUID (for polling)
 *   - qrUrl     — PNG QR code URL to display
 *   - wsUrl     — WebSocket URL for real-time confirmation
 *   - deepLink  — Xaman deep-link for mobile
 */
import { XummSdk } from "xumm-sdk";

const xumm = new XummSdk(
  process.env.XUMM_API_KEY,
  process.env.XUMM_API_SECRET
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: "SignIn",
      },
      options: {
        submit:    false,
        expire:    5,            // 5 minutes to scan
        return_url: {
          app: process.env.NEXT_PUBLIC_APP_URL + "/wallet/callback",
          web: process.env.NEXT_PUBLIC_APP_URL + "/wallet/callback",
        },
      },
      custom_meta: {
        identifier: "tribeconnect-signin",
        instruction: "Sign in to TribeConnect",
        blob: { platform: "tribeconnect" },
      },
    });

    return res.status(200).json({
      uuid:     payload.uuid,
      qrUrl:    payload.refs.qr_png,
      wsUrl:    payload.refs.websocket_status,
      deepLink: payload.next.always,
    });
  } catch (err) {
    console.error("[xumm/signin]", err);
    return res.status(500).json({ error: "Failed to create sign-in payload" });
  }
}
