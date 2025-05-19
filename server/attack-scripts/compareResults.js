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
  const userDataPath = path.resolve(
    __dirname,
    "../../public/reports/user_data_to_encrypt.csv"
  );
  const bruteResPath = path.resolve(
    __dirname,
    "../../public/reports/bruteforce_results.csv"
  );

  // Verificare fișiere existență
  for (const p of [userDataPath, bruteResPath]) {
    if (!fs.existsSync(p)) throw new Error(`❌ Fișier inexistent: ${p}`);
  }

  // Parse user data
  const users = {};
  const userLines = fs
    .readFileSync(userDataPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);
  userLines.shift();
  for (const line of userLines) {
    const parts = line.split(",");
    const username = parts[0];
    const originalPassword = parts[1];
    const method = parts[2];
    let encryption_key = parts.slice(3).join(",");
    encryption_key = encryption_key.replace(/^"|"$/g, "").replace(/""/g, '"');
    users[username] = { originalPassword, method, encryption_key };
  }

  // Parse brute-force results
  const bruteLines = fs
    .readFileSync(bruteResPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);
  bruteLines.shift();

  let nMatch = 0,
    nTotal = 0;
  const lines = [
    [
      "username",
      "method",
      "originalPassword",
      "crackedPassword",
      "encryption_key",
    ],
  ];

  for (const line of bruteLines) {
    const cols = line.split(",");
    const username = cols[0];
    const method = cols[1];
    let crackedPassword = cols[4];
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
    if (u.originalPassword.toLowerCase() === crackedPassword.toLowerCase()) {
      nMatch++;
    } else {
      lines.push([
        username,
        method,
        u.originalPassword,
        crackedPassword,
        u.encryption_key.replace(/"/g, '""'),
      ]);
    }
  }

  lines.push([]);
  lines.push([`# Potriviri (case-insensitive): ${nMatch} / ${nTotal}`]);

  const { reportName, reportPath } = getReportPath("compareResults_report");
  writeCsv(reportPath, lines);
  console.log(`✅ Raport comparare salvat în ${reportPath}`);
  return reportName;
}
