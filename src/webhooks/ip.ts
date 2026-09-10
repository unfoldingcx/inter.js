/**
 * Source-address checks for callbacks.
 *
 * Banco Inter publishes the addresses its callbacks originate from. Matching
 * against them is a cheap first filter, but it is **not** authentication: the
 * real guarantee is the client certificate Inter presents, which
 * `verifyWebhookRequest` checks.
 *
 * @see https://developers.inter.co/docs/webhooks/como-config-webhooks
 */

/**
 * Networks Banco Inter sends callbacks from, as published in the webhook guide.
 *
 * Inter changes this list from time to time; re-check the guide before relying
 * on it as a hard block, and prefer certificate verification as the control.
 */
export const INTER_WEBHOOK_IP_RANGES: readonly string[] = [
  "64.215.22.0/24",
  "104.129.194.0/23",
  "136.226.48.0/23",
  "136.226.50.0/23",
  "136.226.52.0/23",
  "136.226.62.0/23",
  "136.226.68.0/23",
  "136.226.76.0/23",
  "136.226.78.0/23",
  "136.226.80.0/23",
  "136.226.82.8/23",
  "136.226.84.0/23",
  "136.226.86.0/23",
  "147.161.128.0/23",
  "165.225.8.0/23",
  "165.225.48.0/24",
  "165.225.214.0/23",
  "170.85.16.0/23",
  "170.85.18.0/23",
  "170.85.20.0/23",
  "170.85.22.0/23",
  "170.85.24.0/23",
  "18.228.100.224/32",
  "18.228.201.125/32",
  "18.228.215.112/32",
  "18.230.107.120/32",
  "54.232.234.54/32",
  "54.232.254.1/32",
  "3.12.176.222/32",
  "3.23.203.130/32",
  "18.116.227.76/32",
  "18.205.74.21/32",
  "18.228.121.118/32",
  "18.229.39.213/32",
  "34.232.74.103/32",
  "50.17.40.204/32",
  "52.70.125.130/32",
  "54.94.20.106/32",
  "54.197.240.47/32",
  "54.242.121.186/32",
];

/** Parses dotted-quad IPv4 into a 32-bit unsigned integer. */
function ipv4ToInt(address: string): number | undefined {
  const parts = address.trim().split(".");
  if (parts.length !== 4) return undefined;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return undefined;
    const octet = Number(part);
    if (octet > 255) return undefined;
    value = (value << 8) | octet;
  }
  return value >>> 0;
}

/** Strips an IPv4-mapped IPv6 prefix, so `::ffff:1.2.3.4` becomes `1.2.3.4`. */
function normalizeAddress(address: string): string {
  const trimmed = address.trim();
  const mapped = trimmed.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  return mapped ? mapped[1]! : trimmed;
}

/**
 * `true` when an IPv4 address falls inside a CIDR block.
 *
 * @example ipInCidr("136.226.48.7", "136.226.48.0/23") // => true
 */
export function ipInCidr(address: string, cidr: string): boolean {
  const [network, bitsRaw] = cidr.split("/");
  if (!network) return false;
  const bits = bitsRaw === undefined ? 32 : Number(bitsRaw);
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;

  const addressInt = ipv4ToInt(normalizeAddress(address));
  const networkInt = ipv4ToInt(network);
  if (addressInt === undefined || networkInt === undefined) return false;

  if (bits === 0) return true;
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return (addressInt & mask) === (networkInt & mask);
}

/**
 * `true` when the address is one Banco Inter publishes for callbacks.
 *
 * Behind a load balancer, read the client address from `X-Forwarded-For`'s
 * left-most entry — and only trust that header if your proxy sets it itself.
 *
 * @param address IPv4 address, optionally IPv4-mapped IPv6.
 * @param ranges Overrides the built-in list.
 */
export function isInterWebhookIp(address: string, ranges: readonly string[] = INTER_WEBHOOK_IP_RANGES): boolean {
  return ranges.some((cidr) => ipInCidr(address, cidr));
}
