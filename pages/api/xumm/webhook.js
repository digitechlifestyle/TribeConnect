/**
 * POST /api/xumm/webhook
 *
 * Xaman webhook receiver — Xaman POSTs here when a payload is resolved.
 * Configure this URL in https://apps.xumm.dev → Webhooks.
 *
 * We verify the webhook body hash and, on sign-in payloads, mint a JWT
 * and store it in an httpOnly cookie so the browser session is established.
 */
import { XummSdk } from "xumm-sdk";
import { signJwt }  from "../../../lib/jwt";

const xumm = new XummSdk(
  process.env.XUMM_API_KEY,
  process.env.XUMM_API_SECRET
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    // Xaman sends JSON body with meta + payloadResponse
    const { meta, payloadResponse } = req.body;

    if (!meta?.payload_uuidv4) {
      return res.status(400).json({ error: "Invalid webhook body" });
    }

    // Fetch full payload to verify and get account
    const payload = await xumm.payload.get(meta.payload_uuidv4);
    if (!payload) return res.status(404).json({ error: "Payload not found" });

    const { signed, resolved } = payload.meta;
    const account = payload.response?.account;

    // For sign-in payloads — issue session JWT via cookie
    if (
      payload.payload?.tx_type === "SignIn" &&
      signed &&
      account
    ) {
      const token = signJwt({ address: account, walletType: "xaman" });

      res.setHeader(
        "Set-Cookie",
        `tc-session=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${
          process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`
      );
    }

    return res.status(200).json({ ok: true, signed, account: account || null });
  } catch (err) {
    console.error("[xumm/webhook]", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
