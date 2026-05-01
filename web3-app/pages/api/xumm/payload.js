/**
 * POST /api/xumm/payload
 *
 * Generic Xaman payload creator — used for payments, NFT mints, etc.
 * Body: { txjson, options?, custom_meta? }
 *
 * Returns same shape as /api/xumm/signin:
 *   { uuid, qrUrl, wsUrl, deepLink }
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

  const { txjson, options = {}, custom_meta = {} } = req.body || {};
  if (!txjson) return res.status(400).json({ error: "txjson required" });

  try {
    const payload = await xumm.payload.create({
      txjson,
      options: {
        submit: true,           // submit to XRPL after signing
        expire: 10,             // 10 minutes
        ...options,
      },
      custom_meta: {
        identifier: "tribeconnect-tx",
        ...custom_meta,
      },
    });

    return res.status(200).json({
      uuid:     payload.uuid,
      qrUrl:    payload.refs.qr_png,
      wsUrl:    payload.refs.websocket_status,
      deepLink: payload.next.always,
    });
  } catch (err) {
    console.error("[xumm/payload]", err);
    return res.status(500).json({ error: "Failed to create payload" });
  }
}
