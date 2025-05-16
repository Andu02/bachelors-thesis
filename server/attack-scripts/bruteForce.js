// server/attack-scripts/bruteForce.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcrypt";

// Importă funcțiile de ENCRYPT
import { encrypt as encryptCaesar } from "../crypto-methods/caesar.js";
import { encrypt as encryptHill } from "../crypto-methods/hill.js";
import { encrypt as encryptAffine } from "../crypto-methods/affine.js";
import { encrypt as encryptECB } from "../crypto-methods/ecb.js";
import { encrypt as encryptCBC } from "../crypto-methods/cbc.js";

// Încarcă dictionary-ul
const dictPath = path.resolve(
  path.dirname(import.meta.url.replace("file://", "")),
  "100k-most-used-passwords-NCSC.txt"
);
const DICT = fs.existsSync(dictPath)
  ? fs.readFileSync(dictPath, "utf8").split(/\r?\n/).filter(Boolean)
  : [];
console.log(`✅ Loaded dictionary with ${DICT.length} entries`);

// Helper SHA-256 (salt+parola)
function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// Unde stă users_dump.csv (argument sau implicit)
const scriptsDir = path.dirname(import.meta.url.replace("file://", ""));
const dumpFile = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(scriptsDir, "users_dump.csv");

if (!fs.existsSync(dumpFile)) {
  console.error(`❌ Nu găsesc fișierul ${dumpFile}.`);
  process.exit(1);
}

// Citim CSV-ul pe linii
const raw = fs.readFileSync(dumpFile, "utf8");
const lines = raw.split(/\r?\n/).filter(Boolean);
console.log(`✅ Loaded ${lines.length - 1} entries from dump`);

// Pregătim output CSV
const resultsPath = path.resolve(scriptsDir, "bruteforce_results.csv");
const outStream = fs.createWriteStream(resultsPath, { flags: "w" });
outStream.write("username,method,attempts,time_seconds,cracked_password\n");

(async () => {
  console.log("🚀 Starting attack…");

  for (let i = 1; i < lines.length; i++) {
    // 1) split și refacem encryption_key corect
    const cols = lines[i].split(",");
    const username = cols[0];
    const storedPassword = cols[1];
    const method = cols[2];
    let rawKey = cols
      .slice(3)
      .join(",")
      .replace(/^"|"$/g, "") // eliminăm ghilimelele externe
      .replace(/""/g, '"'); // scăpăm ghilimelele duplicate

    // 2) Parsăm cheia în funcție de metodă
    let keyParam;
    try {
      if (method === "hill" || method === "affine") {
        keyParam = JSON.parse(rawKey);
      } else if (method === "ecb" || method === "cbc") {
        keyParam = Buffer.from(rawKey, "hex");
      } else {
        keyParam = rawKey; // Caesar: string numeric, sha256: salt text, bcrypt: cost factor
      }
    } catch (e) {
      console.error(
        `⚠️ Nu pot parsa cheia pentru ${username} (${method}): ${e.message}`
      );
      continue;
    }

    // 3) Alegem dacă trebuie UPPERCASE doar pentru letter-ciphers
    const isLetterCipher = ["caesar", "hill", "affine"].includes(method);

    // 4) Brute-force
    let cracked = false,
      password = "",
      attempts = 0;
    const t0 = Date.now();
    try {
      switch (method) {
        case "caesar":
          for (const cand of DICT) {
            attempts++;
            const txt = isLetterCipher ? cand.toUpperCase() : cand;
            if (encryptCaesar(txt, parseInt(keyParam, 10)) === storedPassword) {
              cracked = true;
              password = cand;
              break;
            }
          }
          break;
        case "hill":
          for (const cand of DICT) {
            attempts++;
            const txt = isLetterCipher ? cand.toUpperCase() : cand;
            if (encryptHill(txt, keyParam) === storedPassword) {
              cracked = true;
              password = cand;
              break;
            }
          }
          break;
        case "affine":
          for (const cand of DICT) {
            attempts++;
            const txt = isLetterCipher ? cand.toUpperCase() : cand;
            if (encryptAffine(txt, keyParam.a, keyParam.b) === storedPassword) {
              cracked = true;
              password = cand;
              break;
            }
          }
          break;
        case "ecb":
          for (const cand of DICT) {
            attempts++;
            // ** fără uppercase aici! **
            if (encryptECB(cand, keyParam) === storedPassword) {
              cracked = true;
              password = cand;
              break;
            }
          }
          break;
        case "cbc":
          for (const cand of DICT) {
            attempts++;
            if (encryptCBC(cand, keyParam) === storedPassword) {
              cracked = true;
              password = cand;
              break;
            }
          }
          break;
        case "sha256":
          for (const cand of DICT) {
            attempts++;
            if (sha256(keyParam + cand) === storedPassword) {
              cracked = true;
              password = cand;
              break;
            }
          }
          break;
        case "bcrypt":
          for (const cand of DICT) {
            attempts++;
            if (await bcrypt.compare(cand, storedPassword)) {
              cracked = true;
              password = cand;
              break;
            }
            if (attempts > 1_000_000) break; // evitem blocajul complet
          }
          break;
        default:
          console.warn(`⚠️ Metodă necunoscută: ${method}`);
      }
    } catch (e) {
      console.error(`❌ Eroare la metoda ${method} pentru ${username}:`, e);
    }
    const t1 = Date.now();
    const dt = ((t1 - t0) / 1000).toFixed(2);
    const out = `${username},${method},${attempts},${dt},${
      cracked ? password : "*"
    }`;
    console.log(out);
    outStream.write(out + "\n");
  }

  outStream.end(() => console.log(`🎉 Results saved to ${resultsPath}`));
})();
