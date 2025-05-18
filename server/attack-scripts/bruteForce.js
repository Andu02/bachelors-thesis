// server/attack-scripts/bruteForce.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { encrypt as encryptCaesar } from "../crypto-methods/caesar.js";
import { encrypt as encryptHill } from "../crypto-methods/hill.js";
import { encrypt as encryptAffine } from "../crypto-methods/affine.js";
import { encrypt as encryptECB } from "../crypto-methods/ecb.js";
import { encrypt as encryptCBC } from "../crypto-methods/cbc.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const scriptsDir = dirname(__filename);

const dictPath = path.resolve(scriptsDir, "100k-most-used-passwords-NCSC.txt");
const DICT = fs.readFileSync(dictPath, "utf-8").split(/\r?\n/).filter(Boolean);
const DICT_LETTERS = DICT.filter((w) => /^[A-Za-z]+$/.test(w));
const sha256 = (txt) => crypto.createHash("sha256").update(txt).digest("hex");

/**
 * Încearcă bruteforce pe dumpFile și returnează raportul.
 * @param {string} dumpFile  numele CSV-ului de dump
 * @returns {Promise<string>} numele fișierului de raport bruteforce: "bruteforce_results.csv"
 */
export default async function bruteForce(dumpFile = "users_dump.csv") {
  const dumpPath = path.resolve(scriptsDir, dumpFile);
  if (!fs.existsSync(dumpPath)) {
    throw new Error(`Fișier dump inexistent: ${dumpPath}`);
  }

  const lines = fs
    .readFileSync(dumpPath, "utf-8")
    .split(/\r?\n/)
    .filter(Boolean);
  const total = lines.length - 1;
  const reportName = "bruteforce_results.csv";
  const reportPath = path.resolve(scriptsDir, reportName);
  const out = fs.createWriteStream(reportPath, { flags: "w" });
  out.write("username,method,attempts,time_seconds,cracked_password\n");

  for (let i = 1; i <= total; i++) {
    const [username, stored, method, ...rest] = lines[i].split(",");
    const rawKey = rest.join(",").replace(/^"|"$/g, "").replace(/""/g, '"');
    const isLetter = ["caesar", "hill", "affine"].includes(method);
    const dictToTry = isLetter ? DICT_LETTERS : DICT;
    let keyParam = rawKey;
    if (["hill", "affine"].includes(method)) {
      try {
        keyParam = JSON.parse(rawKey);
      } catch {}
    }

    let cracked = false,
      password = "",
      attempts = 0;
    const t0 = Date.now();
    if (method !== "bcrypt") {
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

  out.end();
  console.log(`✅ Bruteforce complet, raport la: ${reportPath}`);
  return reportName;
}
