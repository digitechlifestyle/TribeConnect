import axios from "axios";

const PINATA_API_KEY    = process.env.NEXT_PUBLIC_PINATA_API_KEY    || "";
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "";
const PINATA_JWT        = process.env.NEXT_PUBLIC_PINATA_JWT        || "";
const IPFS_GATEWAY      = process.env.NEXT_PUBLIC_IPFS_GATEWAY      || "https://gateway.pinata.cloud/ipfs/";

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file
 * @param {string} name  — display name for Pinata pin
 * @returns {Promise<string>} IPFS CID
 */
export async function uploadFileToPinata(file, name = "tribeconnect-media") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name, keyvalues: { app: "TribeConnect" } })
  );
  formData.append(
    "pinataOptions",
    JSON.stringify({ cidVersion: 1 })
  );

  const headers = PINATA_JWT
    ? { Authorization: `Bearer ${PINATA_JWT}` }
    : {
        pinata_api_key:        PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      };

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    { headers, maxContentLength: Infinity, maxBodyLength: Infinity }
  );
  return res.data.IpfsHash;
}

/**
 * Upload a JSON object to IPFS via Pinata (e.g. profile metadata)
 * @param {object} json
 * @param {string} name
 * @returns {Promise<string>} IPFS CID
 */
export async function uploadJSONToPinata(json, name = "tribeconnect-metadata") {
  const headers = PINATA_JWT
    ? { Authorization: `Bearer ${PINATA_JWT}`, "Content-Type": "application/json" }
    : {
        pinata_api_key:        PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
        "Content-Type": "application/json",
      };

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    { pinataContent: json, pinataMetadata: { name } },
    { headers }
  );
  return res.data.IpfsHash;
}

/**
 * Convert an IPFS CID to a gateway URL
 */
export function cidToUrl(cid) {
  if (!cid) return null;
  if (cid.startsWith("http")) return cid;
  return `${IPFS_GATEWAY}${cid}`;
}
