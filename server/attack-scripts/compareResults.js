// server/attack-scripts/compareResults.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function compareResults() {
  const userDataPath = path.resolve(__dirname, "user_data_to_encrypt.csv");
  const bruteResPath = path.resolve(__dirname, "bruteforce_results.csv");
  const outputPath = path.resolve(__dirname, "compareResults_report.csv");

  // Verificăm existența fișierelor
  for (const p of [userDataPath, bruteResPath]) {
    if (!fs.existsSync(p)) {
      throw new Error(`❌ Fișier inexistent: ${p}`);
    }
  }

  // --- Parse user data ---
  const users = {};
  const userLines = fs
    .readFileSync(userDataPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);
  userLines.shift(); // skip header
  for (const line of userLines) {
    const parts = line.split(",");
    const username = parts[0];
    const originalPassword = parts[1];
    const method = parts[2];
    let encryption_key = parts.slice(3).join(",");
    encryption_key = encryption_key.replace(/^"|"$/g, "").replace(/""/g, '"');
    users[username] = { originalPassword, method, encryption_key };
  }

  // --- Parse brute-force results ---
  const bruteLines = fs
    .readFileSync(bruteResPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);
  bruteLines.shift(); // skip header

  let nMatch = 0,
    nTotal = 0;
  const lines = [
    "username,method,originalPassword,crackedPassword,encryption_key",
  ];

  for (const line of bruteLines) {
    const cols = line.split(",");
    const username = cols[0];
    const method = cols[1];
    const crackedPassword = cols[4];
    const u = users[username];
    if (!u) continue;

    nTotal++;
    if (u.originalPassword.toLowerCase() === crackedPassword.toLowerCase()) {
      nMatch++;
    } else {
      const ek = u.encryption_key.replace(/"/g, '""');
      lines.push(
        `${username},${method},${u.originalPassword},${crackedPassword},"${ek}"`
      );
    }
  }

  lines.push(`\n# Potriviri (case-insensitive): ${nMatch} / ${nTotal}`);
  fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");
  console.log(
    `✅ Raport comparare salvat în ${outputPath} (Potriviri: ${nMatch}/${nTotal})`
  );

  return "compareResults_report.csv";
}
