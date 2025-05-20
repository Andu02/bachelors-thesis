// server/attack-scripts/compareResults.js

// ============================
// Importuri necesare
// ============================
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getReportPath, writeCsv } from "../utils/utils.js";

// ============================
// Setare __dirname
// ============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================
// Funcția principală de comparare
// ============================
export default function compareResults() {
  // Căi fixe către fișierele CSV
  const userDataPath = path.resolve(
    __dirname,
    "../../public/reports/user_data_to_encrypt.csv"
  );
  const bruteResPath = path.resolve(
    __dirname,
    "../../public/reports/bruteforce_results.csv"
  );

  // Verificare existență fișiere
  for (const p of [userDataPath, bruteResPath]) {
    if (!fs.existsSync(p)) throw new Error(`❌ Fișier inexistent: ${p}`);
  }

  // ============================
  // Parse user data
  // ============================
  const users = {};
  const userLines = fs
    .readFileSync(userDataPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);
  userLines.shift(); // skip header

  for (const line of userLines) {
    // splităm simplu, apoi curățăm ghilimelele
    const parts = line.split(",").map((p) => p.replace(/^"+|"+$/g, ""));
    const username = parts[0];
    const originalPassword = parts[1];
    const method = parts[2];
    const encryption_key = parts.slice(3).join(","); // oricâte virgule ar avea
    users[username] = { originalPassword, method, encryption_key };
  }

  // ============================
  // Parse brute-force results
  // ============================
  const bruteLines = fs
    .readFileSync(bruteResPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);
  bruteLines.shift(); // skip header

  let nMatch = 0,
    nTotal = 0;
  const outputLines = [
    [
      "username",
      "method",
      "originalPassword",
      "crackedPassword",
      "encryption_key",
    ],
  ];

  for (const line of bruteLines) {
    const cols = line.split(",").map((p) => p.replace(/^"+|"+$/g, ""));
    const username = cols[0];
    const method = cols[1];
    // parola spartă poate fi în coloana 4 sau 5, după cum apare în CSV
    let crackedPassword = cols[4] || cols[3] || "";
    const u = users[username];
    if (!u) continue;

    // Estimare pentru metode nereversibile
    if (crackedPassword === "*") {
      if (method === "bcrypt") {
        const rounds = parseInt(u.encryption_key, 10) || 10;
        const estimatedYears = Math.pow(2, rounds - 10) * 100;
        crackedPassword = `~${estimatedYears} ani`;
      } else if (method === "sha256") {
        crackedPassword = "nereversibil";
      }
    }

    nTotal++;
    // comparăm case-insensitive
    if (
      u.originalPassword.trim().toLowerCase() ===
      crackedPassword.trim().toLowerCase()
    ) {
      nMatch++;
    } else {
      outputLines.push([
        username,
        method,
        u.originalPassword,
        crackedPassword,
        u.encryption_key.replace(/"/g, '""'),
      ]);
    }
  }

  // Adăugăm statistica de potriviri
  outputLines.push([]);
  outputLines.push([`# Potriviri (case-insensitive): ${nMatch} / ${nTotal}`]);

  // Scrie raportul final
  const { reportName, reportPath } = getReportPath("compareResults_report");
  writeCsv(reportPath, outputLines);
  console.log(`✅ Raport comparare salvat în ${reportPath}`);
  return reportName;
}
