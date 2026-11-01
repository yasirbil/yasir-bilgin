#!/usr/bin/env node
// Encrypts the Kalbin Zümrüt Tepeleri JSON for the password-gated search page.
// The plaintext JSON must NEVER be committed; keep it outside the repo.
//
// Usage (from repo root):
//   KZT_PASSWORD='yeni-şifre' node .github/scripts/encrypt_kzt.mjs /path/to/kzt.json
//
// Output: hizmet/hizmet-vision-and-resources/kalbin-zumrut-tepeleri.enc.json
// Format: gzip(JSON) → AES-256-GCM, key = PBKDF2-SHA256(password, salt, ITER).
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { webcrypto as crypto } from "node:crypto";

const ITER = 310000;
const src = process.argv[2];
const password = process.env.KZT_PASSWORD;
if (!src || !password) {
  console.error("Usage: KZT_PASSWORD='...' node .github/scripts/encrypt_kzt.mjs /path/to/kzt.json");
  process.exit(1);
}
const plain = gzipSync(readFileSync(src));
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password.normalize("NFC")), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
const b64 = (u) => Buffer.from(u).toString("base64");
const out = "hizmet/hizmet-vision-and-resources/kalbin-zumrut-tepeleri.enc.json";
writeFileSync(out, JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
console.log(`Wrote ${out} (${(ct.length / 1024).toFixed(0)} KB ciphertext)`);
