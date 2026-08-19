import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "ggr-super-secret-casino-jwt-token-key-2026";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function generateToken(payload: { userId: string; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
  } catch (e) {
    return null;
  }
}
