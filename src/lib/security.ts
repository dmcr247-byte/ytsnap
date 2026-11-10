import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ytsnap-super-secure-jwt-secret-key-production-ready-2026";

export const ADMIN_COOKIE_NAME = "ytsnap_admin_session";

export interface AdminPayload {
  id: string;
  email: string;
  role: string;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + "ytsnap-salt").digest("hex").slice(0, 16);
}

// SSRF Protection: Checks if URL is external and not resolving to private/loopback/cloud metadata IP ranges
export function isSafePublicUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Disallow localhost and common local domain names
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host.endsWith(".localhost")
    ) {
      return false;
    }

    // Check for IPv4 private ranges and loopback
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = host.match(ipv4Regex);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);

      // 127.0.0.0/8 (Loopback)
      if (octet1 === 127) return false;
      // 10.0.0.0/8 (Private)
      if (octet1 === 10) return false;
      // 172.16.0.0/12 (Private)
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
      // 192.168.0.0/16 (Private)
      if (octet1 === 192 && octet2 === 168) return false;
      // 169.254.0.0/16 (Link-local & AWS/GCP metadata)
      if (octet1 === 169 && octet2 === 254) return false;
      // 0.0.0.0
      if (octet1 === 0) return false;
    }

    // Check for IPv6 localhost
    if (host === "::1" || host === "[::1]") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// In-Memory Rate Limiter
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

// Clean up expired buckets periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((bucket, key) => {
      if (now > bucket.resetAt) {
        rateLimitStore.delete(key);
      }
    });
  }, 60000);
}

export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  let bucket = rateLimitStore.get(key);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(key, bucket);
    return { success: true, remaining: limit - 1, reset: bucket.resetAt };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { success: false, remaining: 0, reset: bucket.resetAt };
  }

  return { success: true, remaining: limit - bucket.count, reset: bucket.resetAt };
}
