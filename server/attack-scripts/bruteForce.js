// ============================
// Importuri necesare
// ============================
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { encrypt as encryptCaesar } from "../crypto-methods/caesar.js";
import { encrypt as encryptHill } from "../crypto-methods/hill.js";
import { encrypt as encryptAffine } from "../crypto-methods/affine.js";
import { encrypt as encryptECB } from "../crypto-methods/ecb.js";
import { encrypt as encryptCBC } from "../crypto-methods/cbc.js";
import { getReportPath } from "../utils/utils.js";

// ============================
// Setare __dirname
// ============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================
// Încarcă dicționarul din public/reports
// ============================
const dictPath = path.resolve(
  __dirname,
  "../../public/reports",
  "100k-most-used-passwords-NCSC.txt"
);
const DICT = fs.readFileSync(dictPath, "utf-8").split(/\r?\n/).filter(Boolean);
const DICT_LETTERS = DICT.filter((w) => /^[A-Za-z]+$/.test(w));
const sha256 = (txt) => crypto.createHash("sha256").update(txt).digest("hex");

// ============================
// Funcția principală de bruteforce
// ============================
export default async function bruteForce(dumpFile = "users_dump.csv") {
  // Path către CSV-ul de dump
  const dumpPath = path.resolve(__dirname, "../../public/reports", dumpFile);
  if (!fs.existsSync(dumpPath)) {
    throw new Error(`Fișier dump inexistent: ${dumpPath}`);
  }

  // Citește și filtrează liniile
  const lines = fs
    .readFileSync(dumpPath, "utf-8")
    .split(/\r?\n/)
    .filter(Boolean);
  const total = lines.length - 1;

  // Creează fișierul de raport
  const { reportName, reportPath } = getReportPath("bruteforce_results");
  const out = fs.createWriteStream(reportPath, { flags: "w" });
  out.write("username,method,attempts,time_seconds,cracked_password\n");

  // Parcurge fiecare utilizator
  for (let i = 1; i <= total; i++) {
    let [username, stored, method, ...rest] = lines[i].split(",");

    // Curățare ghilimele din CSV
    stored = stored.replace(/^"|"$/g, "").trim();
    method = method.replace(/^"|"$/g, "").trim();

    // Extrage parametrul cheie
    const rawKey = rest.join(",").replace(/^"|"$/g, "").replace(/""/g, '"');

    // Alege dicționarul potrivit
    const isLetter = ["caesar", "hill", "affine"].includes(method);
    const passwordDictionary = isLetter ? DICT_LETTERS : DICT;

    // Parsează parametrul de cheie pentru Hill/Affine
    let keyParam = rawKey;
    if (["hill", "affine"].includes(method)) {
      try {
        keyParam = JSON.parse(rawKey);
      } catch {}
    }

    // Bruteforce
    let cracked = false,
      password = "",
      attempts = 0;
    const t0 = Date.now();

    if (method !== "bcrypt") {
      for (const candidatePassword of passwordDictionary) {
        attempts++;
        // Normalizează candidatul: uppercase pentru cifruri pe litere
        const txt = isLetter
          ? candidatePassword.toUpperCase()
          : candidatePassword;

        // Generează criptarea
        let encryptedPassword;
        switch (method) {
          case "caesar":
            encryptedPassword = encryptCaesar(txt, parseInt(keyParam, 10));
            break;
          case "hill":
            encryptedPassword = encryptHill(txt, keyParam);
            break;
          case "affine":
            encryptedPassword = encryptAffine(txt, keyParam.a, keyParam.b);
            break;
          case "ecb":
            encryptedPassword = encryptECB(txt, keyParam);
            break;
          case "cbc":
            encryptedPassword = encryptCBC(txt, keyParam);
            break;
          case "sha256":
            encryptedPassword = sha256(keyParam + candidatePassword);
            break;
        }

        // Verifică potrivirea
        if (encryptedPassword === stored) {
          cracked = true;
          password = candidatePassword;
          break;
        }
      }
    }

    // Timp de rulare
    const duration = ((Date.now() - t0) / 1000).toFixed(2);

    // Scrie în raport
    out.write(
      `${username},${method},${attempts},${duration},${
        cracked ? password : "*"
      }\n`
    );
  }

  out.end();
  console.log(`Bruteforce complet, raport la: ${reportPath}`);
  return reportName;
}
