/** @notice library imports */
import fs from "fs";
import path from "path";
import { generateKeyPairSync } from "crypto";

/// Generating key pair
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

/// Check if certs folder available
const folders = fs.readdirSync(process.cwd());
if (!folders.includes("certs")) {
  /// Create one folder
  fs.mkdirSync(path.resolve(process.cwd(), "certs"));
}

/// Write keys
fs.writeFileSync(path.resolve(process.cwd(), "certs/public.pem"), publicKey);
fs.writeFileSync(path.resolve(process.cwd(), "certs/private.pem"), privateKey);
