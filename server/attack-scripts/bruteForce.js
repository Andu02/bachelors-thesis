// server/attack-scripts/bruteForce.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcrypt";

// Import metode de decriptare
import { decrypt as decryptCaesar } from "../crypto-methods/caesar.js";
import { decrypt as decryptHill } from "../crypto-methods/hill.js";
import { decrypt as decryptAffine } from "../crypto-methods/affine.js";
import { decrypt as decryptECB } from "../crypto-methods/ecb.js";
import { decrypt as decryptCBC } from "../crypto-methods/cbc.js";

// Dicționar
const dictPath = path.resolve("attack-scripts", "wordlist.txt");
let DICT = [];
if (fs.existsSync(dictPath)) {
  DICT = fs.readFileSync(dictPath, "utf8").split(/\r?\n/).filter(Boolean);
  console.log(`✅ Dictionary loaded (${DICT.length} entries)`);
} else {
  console.warn("⚠️ Dicționarul nu a fost găsit.");
}

// SHA-256 helper
function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// CSV input
const dumpPath = path.resolve("attack-scripts", "users_dump.csv");
if (!fs.existsSync(dumpPath)) {
  console.error("❌ Fișierul users_dump.csv nu există.");
  process.exit(1);
}
const lines = fs.readFileSync(dumpPath, "utf8").split(/\r?\n/).filter(Boolean);

// Atac
(async () => {
  console.log("username,method,attempts,time_seconds,cracked_password");

  for (const line of lines) {
    const [username, passwordHash, method, rawKey] = line.split(",");
    let cracked = false;
    let password = "*";
    let attempts = 0;
    const t0 = Date.now();

    try {
      switch (method) {
        case "caesar":
          for (let key = 1; key < 26 && !cracked; key++) {
            attempts++;
            const result = decryptCaesar(passwordHash, key);
            if (result) {
              cracked = true;
              password = result;
            }
          }
          break;

        case "hill":
          attempts++;
          const hillMatrix = JSON.parse(rawKey);
          password = decryptHill(passwordHash, hillMatrix);
          cracked = true;
          break;

        case "affine":
          attempts++;
          const { a, b } = JSON.parse(rawKey);
          password = decryptAffine(passwordHash, a, b);
          cracked = true;
          break;

        case "ecb":
          attempts++;
          const keyECB = Buffer.from(rawKey, "hex");
          const encryptedBufferECB = Buffer.from(passwordHash, "hex");
          password = decryptECB(encryptedBufferECB, keyECB);
          cracked = true;
          break;

        case "cbc":
          attempts++;
          const buffer = Buffer.from(passwordHash, "hex");
          const keyCBC = Buffer.from(rawKey, "hex");
          const iv = buffer.slice(0, 16);
          const ct = buffer.slice(16);
          password = decryptCBC(ct, keyCBC, iv);
          cracked = true;
          break;

        case "sha256":
          for (const pw of DICT) {
            attempts++;
            if (sha256(rawKey + pw) === passwordHash) {
              cracked = true;
              password = pw;
              break;
            }
          }
          break;

        case "bcrypt":
          for (const pw of DICT) {
            attempts++;
            if (await bcrypt.compare(pw, passwordHash)) {
              cracked = true;
              password = pw;
              break;
            }
          }
          break;

        default:
          console.warn(`❓ Metodă necunoscută: ${method}`);
          break;
      }
    } catch (e) {
      console.error(
        `Eroare la metoda ${method} pentru ${username}: ${e.message}`
      );
    }

    const t1 = Date.now();
    const time = ((t1 - t0) / 1000).toFixed(2);
    console.log(`${username},${method},${attempts},${time},${password}`);
  }
})();
