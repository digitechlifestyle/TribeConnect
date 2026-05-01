/**
 * TribeConnect — JWT helpers
 * Server-side only — never import from client components.
 */
import jwt from "jsonwebtoken";

const SECRET  = process.env.JWT_SECRET || "change-me-in-production";
const EXPIRES = "7d";

/** Sign a new JWT containing the given payload object */
export function signJwt(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

/** Verify and decode a JWT. Returns the payload or null on failure. */
export function verifyJwt(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (_) {
    return null;
  }
}
