// server/attack-scripts/bruteForce.js
import fs from "fs";
import path from "path";
import crypto from "crypto";

import { encrypt as encryptCaesar } from "../crypto-methods/caesar.js";
import { encrypt as encryptHill } from "../crypto-methods/hill.js";
import { encrypt as encryptAffine } from "../crypto-methods/affine.js";
import { encrypt as encryptECB } from "../crypto-methods/ecb.js";
import { encrypt as encryptCBC } from "../crypto-methods/cbc.js";

// --- Încarcă dicționarul ---
const dictPath = path.resolve(
  path.dirname(import.meta.url.replace("file://", "")),
  "100k-most-used-passwords-NCSC.txt"
);
const DICT = fs.readFileSync(dictPath, "utf8").split(/\r?\n/).filter(Boolean);
const DICT_LETTERS = DICT.filter((w) => /^[A-Za-z]+$/.test(w));
const sha256 = (txt) => crypto.createHash("sha256").update(txt).digest("hex");

// --- Încarcă dump-ul ---
const scriptsDir = path.dirname(import.meta.url.replace("file://", ""));
const dumpFile = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(scriptsDir, "users_dump.csv");
if (!fs.existsSync(dumpFile)) {
  console.error(`❌ Fișier dump inexistent: ${dumpFile}`);
  process.exit(1);
}
const lines = fs.readFileSync(dumpFile, "utf8").split(/\r?\n/).filter(Boolean);
const total = lines.length - 1;
console.log(`✅ Loaded ${total} entries from dump\n`);

// --- Pregătim output-ul ---
const outPath = path.resolve(scriptsDir, "bruteforce_results.csv");
const out = fs.createWriteStream(outPath, { flags: "w" });
out.write("username,method,attempts,time_seconds,cracked_password\n");

let totalBcryptUsers = 0;

// Progress bar helper
function renderProgress(done, total) {
  const width = 40;
  const pct = done / total;
  const filled = Math.round(pct * width);
  const bar = "█".repeat(filled) + "-".repeat(width - filled);
  process.stdout.write(
    `\rProgress: [${bar}] ${(pct * 100).toFixed(1)}% (${done}/${total})`
  );
}

(async () => {
  for (let i = 1; i <= total; i++) {
    renderProgress(i - 1, total);

    const [username, stored, method, ...rest] = lines[i].split(",");
    const rawKey = rest.join(",").replace(/^"|"$/g, "").replace(/""/g, '"');

    const isLetter = ["caesar", "hill", "affine"].includes(method);
    const dictToTry = isLetter ? DICT_LETTERS : DICT;

    let keyParam = rawKey;
    if (["hill", "affine"].includes(method)) {
      try {
        keyParam = JSON.parse(rawKey);
      } catch {
        keyParam = rawKey;
      }
    }

    let cracked = false,
      password = "",
      attempts = 0;
    const t0 = Date.now();

    if (method === "bcrypt") {
      totalBcryptUsers++;
      // saltăm bruteforce-ul efectiv
    } else {
      for (const cand of dictToTry) {
        attempts++;
        const txt = isLetter ? cand.toUpperCase() : cand;
        let enc;
        switch (method) {
          case "caesar":
            enc = encryptCaesar(txt, parseInt(keyParam, 10));
            break;
          case "hill":
            enc = encryptHill(txt, keyParam);
            break;
          case "affine":
            enc = encryptAffine(txt, keyParam.a, keyParam.b);
            break;
          case "ecb":
            enc = encryptECB(txt, keyParam);
            break;
          case "cbc":
            enc = encryptCBC(txt, keyParam);
            break;
          case "sha256":
            enc = sha256(keyParam + cand);
            break;
        }
        if (enc === stored) {
          cracked = true;
          password = cand;
          break;
        }
      }
    }

    const duration = ((Date.now() - t0) / 1000).toFixed(2);
    out.write(
      `${username},${method},${attempts},${duration},${
        cracked ? password : "*"
      }\n`
    );
  }

  // finish progress bar
  renderProgress(total, total);
  process.stdout.write("\n\n");

  out.end();
  console.log(`🎉 Results saved to ${outPath}`);

  if (totalBcryptUsers > 0) {
    const candidates = DICT.length;
    const avgMs = 100; // ~100ms per bcrypt.compare
    const totalMs = totalBcryptUsers * candidates * avgMs;
    const totalSec = totalMs / 1000;
    const days = Math.floor(totalSec / 86400);
    const rem = totalSec % 86400;
    const hours = Math.floor(rem / 3600);
    const rem2 = rem % 3600;
    const minutes = Math.floor(rem2 / 60);
    const seconds = Math.floor(rem2 % 60);
    console.log(
      `⚠️ Estimated bcrypt brute-force time for ` +
        `${totalBcryptUsers} users: ` +
        `${days}d ${hours}h ${minutes}m ${seconds}s`
    );
  }
})();
