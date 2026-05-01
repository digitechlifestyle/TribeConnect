/**
 * GET /api/xumm/status?uuid=<payload-uuid>
 *
 * Polls a Xaman payload for sign status.
 * Returns { resolved, signed, account } once the user approves.
 * Called by the client when it cannot use WebSocket directly.
 */
import { XummSdk } from "xumm-sdk";

const xumm = new XummSdk(
  process.env.XUMM_API_KEY,
  process.env.XUMM_API_SECRET
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uuid } = req.query;
  if (!uuid) return res.status(400).json({ error: "uuid required" });

  try {
    const payload = await xumm.payload.get(uuid);
    if (!payload) return res.status(404).json({ error: "Payload not found" });

    const meta = payload.meta;
    return res.status(200).json({
      resolved: meta.resolved,
      signed:   meta.signed,
      expired:  meta.expired,
      rejected: meta.cancelled || !meta.signed && meta.resolved,
      account:  payload.response?.account || null,
    });
  } catch (err) {
    console.error("[xumm/status]", err);
    return res.status(500).json({ error: "Failed to fetch payload status" });
  }
}
