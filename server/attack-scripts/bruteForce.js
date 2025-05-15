// server/attack-scripts/bruteForce.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcrypt";

// Importă funcțiile pentru toate metodele de criptare
import { decryptCaesar } from "../crypto-methods/caesar.js";
import { decryptVigenere } from "../crypto-methods/vigenere.js";
import { decryptHill } from "../crypto-methods/hill.js";
import { decryptAffine } from "../crypto-methods/affine.js";
import { decryptECB } from "../crypto-methods/ecb.js";
import { decryptCBC } from "../crypto-methods/cbc.js";

// Calea către lista de parole
const dictPath = path.resolve(
  path.dirname(import.meta.url.replace("file://", "")),
  "100k-most-used-passwords-NCSC.txt"
);
let DICT = [];
if (fs.existsSync(dictPath)) {
  DICT = fs.readFileSync(dictPath, "utf8").split(/\r?\n/).filter(Boolean);
  console.log(`Loaded dictionary with ${DICT.length} entries`);
}

// Helper SHA-256
function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// Calea către dump-ul cu hash-uri
const scriptsDir = path.dirname(import.meta.url.replace("file://", ""));
const dumpFile = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(scriptsDir, "users_dump.txt");

if (!fs.existsSync(dumpFile)) {
  console.error(`Nu găsesc fișierul ${dumpFile}.`);
  console.error(
    `Utilizare: node server/attack-scripts/bruteForceTest.js <users_dump.txt>`
  );
  process.exit(1);
}

const lines = fs.readFileSync(dumpFile, "utf8").split(/\r?\n/).filter(Boolean);

(async () => {
  console.log(`Starting attack on ${lines.length} entries…`);
  console.log("username,method,attempts,time_seconds,cracked_password");

  for (const line of lines) {
    const [, username, hash, method, encryption_key] = line.split(",");

    let cracked = false;
    let password = "";
    let attempts = 0;
    const t0 = Date.now();

    try {
      switch (method) {
        case "caesar":
          for (let shift = 1; shift < 26 && !cracked; shift++) {
            attempts++;
            const cand = decryptCaesar(hash, shift);
            if (cand) {
              cracked = true;
              password = cand;
            }
          }
          break;

        case "vigenere":
          attempts++;
          const candVig = decryptVigenere(hash, "KEY");
          if (candVig) {
            cracked = true;
            password = candVig;
          }
          break;

        case "hill":
          attempts++;
          const matrix = JSON.parse(encryption_key);
          password = decryptHill(hash, matrix);
          cracked = true;
          break;

        case "affine":
          attempts++;
          const { a, b } = JSON.parse(encryption_key);
          password = decryptAffine(hash, a, b);
          cracked = true;
          break;

        case "ecb":
          attempts++;
          const ecbKey = Buffer.from(encryption_key, "hex");
          password = decryptECB(Buffer.from(hash, "hex"), ecbKey);
          cracked = true;
          break;

        case "cbc":
          const data = Buffer.from(hash, "hex");
          const cbcKey = Buffer.from(encryption_key, "hex");
          const iv = data.slice(0, 16);
          const ct = data.slice(16);
          password = decryptCBC(ct, cbcKey, iv);
          cracked = true;
          attempts++;
          break;

        case "sha256":
          for (const pw of DICT) {
            attempts++;
            if (sha256(encryption_key + pw) === hash) {
              cracked = true;
              password = pw;
              break;
            }
          }
          break;

        case "bcrypt":
          for (const pw of DICT) {
            attempts++;
            if (attempts > 1_000_000) break;
            if (await bcrypt.compare(pw, hash)) {
              cracked = true;
              password = pw;
              break;
            }
          }
          break;

        default:
          console.warn(`Metodă necunoscută: ${method}`);
          break;
      }
    } catch (e) {
      console.error(
        `Eroare la metoda ${method} pentru ${username}:`,
        e.message
      );
    }

    const t1 = Date.now();
    const timeSeconds = ((t1 - t0) / 1000).toFixed(2);
    console.log(
      `${username},${method},${attempts},${timeSeconds},${
        cracked ? password : "*"
      }`
    );
  }
})();
