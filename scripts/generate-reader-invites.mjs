#!/usr/bin/env node
/**
 * Generate REAL 10-tester one-use invite secrets locally. Do not commit output.
 *
 * Usage: node scripts/generate-reader-invites.mjs
 * Shares one invite per reader; Vercel preview env receives ONLY SHA-256 hashes.
 * This file generates credentials only, it does not configure Vercel or call APIs.
 */
import { randomBytes, createHash } from "node:crypto";

const count = 10;
const rows = Array.from({ length: count }, (_, i) => {
  const token = randomBytes(27).toString("base64url");
  return { number: i + 1, token, hash: createHash("sha256").update(token).digest("hex") };
});
process.stdout.write("\nNOAH 10 TESTER ACCESS CODES — CONFIDENTIAL; NEVER PASTE INTO CHAT OR GITHUB\n");
for (const row of rows) process.stdout.write(
  `Tester ${String(row.number).padStart(2, "0")}: ${row.token}\n`
);
process.stdout.write("\nPreview-only env variable (store server-side, not in git):\n");
process.stdout.write("NOAH_READER_LAB_INVITE_HASHES=" + rows.map(row => row.hash).join(",") + "\n\n");
process.stdout.write("Codes are NOT stored by this script. Save them privately before closing this terminal.\n");
process.stdout.write("To revoke an invite, remove its hash from the preview environment and redeploy the preview.\n");
