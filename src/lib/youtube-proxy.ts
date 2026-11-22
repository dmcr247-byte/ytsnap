import { ProxyAgent, fetch as undiciFetch } from "undici";
import fs from "fs";
import path from "path";

// 100% Free Verified Webshare Proxies
export const DEFAULT_PROXIES = [
  "http://kmyglkum:yjymuvjpxgct@64.137.10.153:5803",
  "http://kmyglkum:yjymuvjpxgct@104.164.49.38:7693",
  "http://kmyglkum:yjymuvjpxgct@23.26.71.145:5628",
  "http://kmyglkum:yjymuvjpxgct@45.38.107.97:6014",
];

const agentCache = new Map<string, ProxyAgent>();

/**
 * Returns a pool of available proxy URLs from environment variables,
 * proxies.txt file, or default verified list.
 */
export function getProxyList(): string[] {
  const proxies: string[] = [];

  // 1. From environment variables
  const envProxyStr =
    process.env.YOUTUBE_PROXIES ||
    process.env.YOUTUBE_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.HTTPS_PROXY;

  if (envProxyStr) {
    const list = envProxyStr
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter(Boolean);
    for (const p of list) {
      const full = p.startsWith("http://") || p.startsWith("https://") ? p : `http://${p}`;
      if (!proxies.includes(full)) proxies.push(full);
    }
  }

  // 2. From proxies.txt if exists on disk
  try {
    const pPath = path.join(process.cwd(), "proxies.txt");
    if (fs.existsSync(pPath)) {
      const lines = fs
        .readFileSync(pPath, "utf8")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      for (const line of lines) {
        const full = line.startsWith("http://") || line.startsWith("https://") ? line : `http://${line}`;
        if (!proxies.includes(full)) proxies.push(full);
      }
    }
  } catch {
    // Ignore in edge/serverless runtimes where fs might be limited
  }

  // 3. Fallback to default verified Webshare proxies
  for (const def of DEFAULT_PROXIES) {
    if (!proxies.includes(def)) proxies.push(def);
  }

  return proxies;
}

/**
 * Returns a random proxy URL from the pool.
 */
export function getRandomProxy(): string {
  const list = getProxyList();
  if (list.length === 0) return DEFAULT_PROXIES[0];
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Resolves the matching proxy for a given URL.
 * YouTube's videoplayback URLs include an "&ip=X.X.X.X" parameter that must match the fetching proxy.
 */
export function getProxyForUrl(url: string | URL): string {
  try {
    const urlObj = typeof url === "string" ? new URL(url) : url;
    const boundIp = urlObj.searchParams.get("ip");
    if (boundIp) {
      const list = getProxyList();
      const match = list.find((p) => p.includes(boundIp));
      if (match) return match;
    }
  } catch {
    // ignore
  }
  return getRandomProxy();
}

/**
 * Returns a cached ProxyAgent instance for the given proxy URL (or random proxy).
 */
export function getProxyAgent(proxyUrl?: string): ProxyAgent {
  const targetUrl = proxyUrl || getRandomProxy();
  let agent = agentCache.get(targetUrl);
  if (!agent) {
    agent = new ProxyAgent(targetUrl);
    agentCache.set(targetUrl, agent);
  }
  return agent;
}

/**
 * Creates a custom fetch wrapper using undici with ProxyAgent.
 * Fully compatible with @distube/ytdl-core.
 */
export function createProxyFetch(preferredProxyUrl?: string) {
  const agent = getProxyAgent(preferredProxyUrl);
  return (url: string | URL | any, init?: any) => {
    return undiciFetch(url, {
      ...init,
      dispatcher: agent,
    });
  };
}

/**
 * Fetches an external URL (e.g. googlevideo.com CDN) through the matching residential proxy.
 */
export async function fetchWithProxy(
  url: string | URL | any,
  init: any = {},
  preferredProxyUrl?: string
) {
  const targetProxy = preferredProxyUrl || getProxyForUrl(url);
  const agent = getProxyAgent(targetProxy);
  return undiciFetch(url, {
    ...init,
    dispatcher: agent,
  });
}
