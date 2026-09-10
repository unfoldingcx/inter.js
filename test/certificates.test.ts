import { describe, expect, test } from "bun:test";
import { inspectCertificate } from "../src/core/tls.ts";
import { InterClient } from "../src/index.ts";
import { MockTransport } from "../src/testing.ts";
import type { Logger } from "../src/core/logger.ts";
import { CERT_EXPIRED, CERT_LONG, CERT_SOON } from "./fixtures/certificates.ts";

/** Collects log records so assertions can look at what the client reported. */
function recordingLogger(): { logger: Logger; records: { level: string; message: string; fields?: Record<string, unknown> }[] } {
  const records: { level: string; message: string; fields?: Record<string, unknown> }[] = [];
  const push = (level: string) => (message: string, fields?: Record<string, unknown>) => {
    records.push({ level, message, fields });
  };
  return { logger: { debug: push("debug"), info: push("info"), warn: push("warn"), error: push("error") }, records };
}

describe("inspectCertificate", () => {
  test("reads the validity window of a PEM certificate", () => {
    const info = inspectCertificate(CERT_LONG);
    expect(info).toBeDefined();
    expect(info!.notAfter.getTime()).toBeGreaterThan(info!.notBefore.getTime());
    expect(info!.expired).toBe(false);
    expect(info!.daysUntilExpiry).toBeGreaterThan(3000);
    expect(info!.serialNumber).toMatch(/^[0-9a-f]+$/);
  });

  test("reports an expired certificate", () => {
    const info = inspectCertificate(CERT_EXPIRED);
    expect(info!.expired).toBe(true);
    expect(info!.daysUntilExpiry).toBeLessThan(0);
    expect(info!.notAfter.toISOString().slice(0, 10)).toBe("2020-01-02");
  });

  test("counts down to expiry", () => {
    const info = inspectCertificate(CERT_SOON);
    expect(info!.daysUntilExpiry).toBeLessThanOrEqual(5);
    expect(info!.expired).toBe(false);
  });

  test("accepts raw bytes as well as text", () => {
    const bytes = new TextEncoder().encode(CERT_LONG);
    expect(inspectCertificate(bytes)?.notAfter).toEqual(inspectCertificate(CERT_LONG)!.notAfter);
  });

  test("evaluates expiry against a supplied clock", () => {
    const future = new Date(Date.now() + 20 * 86_400_000);
    expect(inspectCertificate(CERT_SOON, future)!.expired).toBe(true);
  });
});

describe("client certificate warnings", () => {
  test("warns when the certificate is close to expiring", async () => {
    const { logger, records } = recordingLogger();
    const inter = new InterClient({
      clientId: "a",
      clientSecret: "b",
      certificate: CERT_SOON,
      privateKey: "-----BEGIN PRIVATE KEY-----\nAA\n-----END PRIVATE KEY-----",
      transport: new MockTransport(),
      logger,
    });

    await inter.ready();

    const warning = records.find((r) => r.level === "warn");
    expect(warning?.message).toContain("expires soon");
    expect(warning?.fields?.daysUntilExpiry).toBeLessThanOrEqual(5);
    expect(inter.certificate?.expired).toBe(false);
  });

  test("logs an error when the certificate has already expired", async () => {
    const { logger, records } = recordingLogger();
    const inter = new InterClient({
      clientId: "a",
      clientSecret: "b",
      certificate: CERT_EXPIRED,
      privateKey: "-----BEGIN PRIVATE KEY-----\nAA\n-----END PRIVATE KEY-----",
      transport: new MockTransport(),
      logger,
    });

    await inter.ready();

    expect(records.find((r) => r.level === "error")?.message).toContain("has expired");
  });

  test("stays quiet for a certificate with plenty of life left", async () => {
    const { logger, records } = recordingLogger();
    const inter = new InterClient({
      clientId: "a",
      clientSecret: "b",
      certificate: CERT_LONG,
      privateKey: "-----BEGIN PRIVATE KEY-----\nAA\n-----END PRIVATE KEY-----",
      transport: new MockTransport(),
      logger,
    });

    await inter.ready();

    expect(records.filter((r) => r.level === "warn" || r.level === "error")).toHaveLength(0);
    expect(inter.certificate?.daysUntilExpiry).toBeGreaterThan(3000);
  });

  test("can be switched off", async () => {
    const { logger, records } = recordingLogger();
    const inter = new InterClient({
      clientId: "a",
      clientSecret: "b",
      certificate: CERT_EXPIRED,
      privateKey: "-----BEGIN PRIVATE KEY-----\nAA\n-----END PRIVATE KEY-----",
      transport: new MockTransport(),
      certificateExpiryWarningDays: 0,
      logger,
    });

    await inter.ready();

    expect(records.filter((r) => r.level === "warn" || r.level === "error")).toHaveLength(0);
  });
});
